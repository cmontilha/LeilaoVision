import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { buildRateLimitKey, consumeRateLimit, isSafeInternalPath } from "@/lib/api/security";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const rate = consumeRateLimit(buildRateLimitKey(request, "auth:confirm"), 40, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas. Aguarde ${rate.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNextPath = searchParams.get("next");
  const nextPath = requestedNextPath && isSafeInternalPath(requestedNextPath)
    ? requestedNextPath
    : "/app/dashboard";

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(new URL("/login?error=confirm_failed", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
