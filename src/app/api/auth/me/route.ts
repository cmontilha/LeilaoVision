import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { buildRateLimitKey, consumeRateLimit } from "@/lib/api/security";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const rate = consumeRateLimit(buildRateLimitKey(request, "auth:me", auth.user.id), 180, 60_000);
  if (!rate.allowed) {
    return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
  }

  return ok({
    user: {
      id: auth.user.id,
      email: auth.user.email ?? null,
    },
    role: auth.role,
  });
}
