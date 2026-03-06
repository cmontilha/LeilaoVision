import { NextRequest } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/api/response";
import { ensureObject, ensureRequiredString, ValidationError } from "@/lib/api/validation";

export async function POST(request: NextRequest) {
  try {
    const body = ensureObject(await request.json());
    const accessToken = ensureRequiredString(body.access_token, "access_token", 4000);
    const refreshToken = ensureRequiredString(body.refresh_token, "refresh_token", 4000);

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return fail("Falha ao persistir sessão.", 400, error.message);
    }

    return ok({ session: data.session, user: data.user });
  } catch (error) {
    if (error instanceof ValidationError) {
      return fail(error.message, 422);
    }

    return fail("Erro interno ao salvar sessão.", 500, String(error));
  }
}

export async function DELETE() {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return fail("Falha ao encerrar sessão.", 400, error.message);
  }

  return ok({ signedOut: true });
}
