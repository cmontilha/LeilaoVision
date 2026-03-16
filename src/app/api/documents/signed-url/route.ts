import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { buildRateLimitKey, consumeRateLimit } from "@/lib/api/security";
import { ensureUuid, ValidationError } from "@/lib/api/validation";
import { DOCUMENT_BUCKET } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const rate = consumeRateLimit(
    buildRateLimitKey(request, "documents:signed-url", auth.user.id),
    240,
    60_000,
  );
  if (!rate.allowed) {
    return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
  }

  const rawId = request.nextUrl.searchParams.get("id");
  if (!rawId) {
    return fail("Parâmetro id é obrigatório.", 422);
  }

  try {
    const id = ensureUuid(rawId, "id");

    const { data: document, error: documentError } = await auth.supabase
      .from("documents")
      .select("id, storage_path")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (documentError) {
      return fail("Falha ao buscar documento.", 400, documentError.message);
    }

    const typedDocument = document as { id: string; storage_path: string | null } | null;

    if (!typedDocument || !typedDocument.storage_path) {
      return fail("Documento não encontrado.", 404);
    }

    const { data, error } = await auth.supabase.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(typedDocument.storage_path, 90);

    if (error || !data?.signedUrl) {
      return fail("Falha ao gerar URL assinada.", 400, error?.message);
    }

    return ok({ url: data.signedUrl });
  } catch (error) {
    if (error instanceof ValidationError) {
      return fail(error.message, 422);
    }

    return fail("Erro interno ao gerar URL assinada.", 500, String(error));
  }
}
