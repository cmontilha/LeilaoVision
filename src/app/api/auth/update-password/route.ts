import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { buildRateLimitKey, consumeRateLimit, isSameOriginRequest } from "@/lib/api/security";
import { ValidationError, ensureObject, ensureRequiredString } from "@/lib/api/validation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return fail("Origem da requisição não permitida.", 403);
  }

  const rate = consumeRateLimit(buildRateLimitKey(request, "auth:update-password"), 20, 60_000);
  if (!rate.allowed) {
    return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
  }

  try {
    const body = ensureObject(await request.json());
    const password = ensureRequiredString(body.password, "password");

    if (password.length < 6) {
      return fail("A senha deve ter pelo menos 6 caracteres.", 422);
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return fail(
        "Sessão inválida ou expirada para redefinir senha. Solicite um novo link.",
        401,
        userError?.message,
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return fail("Não foi possível redefinir a senha.", 400, updateError.message);
    }

    return ok({ updated: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return fail(error.message, 422);
    }

    return fail("Erro interno ao redefinir senha.", 500, String(error));
  }
}
