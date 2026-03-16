import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

function withSecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com",
      ].join("; "),
    );
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { supabase, getResponse } = createSupabaseMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const redirectTo = user ? "/app/dashboard" : "/login";
    return withSecurityHeaders(NextResponse.redirect(new URL(redirectTo, request.url)), request);
  }

  const isProtectedRoute = pathname.startsWith("/app");
  const isAdminRoute = pathname.startsWith("/app/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isProtectedRoute && !user) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)), request);
  }

  if (isAuthRoute && user) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/app/dashboard", request.url)), request);
  }

  if (isAdminRoute && user) {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = (profile as { role?: string } | null)?.role;

    if (error || role !== "admin") {
      return withSecurityHeaders(NextResponse.redirect(new URL("/app/dashboard", request.url)), request);
    }
  }

  return withSecurityHeaders(getResponse(), request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
