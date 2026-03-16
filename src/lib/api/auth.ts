import { type User } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types";

import { fail } from "./response";

export async function requireApiUser(): Promise<
  | {
      user: User;
      role: AppRole;
      supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;
      errorResponse?: undefined;
    }
  | { errorResponse: ReturnType<typeof fail>; user?: undefined; role?: undefined; supabase?: undefined }
> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      errorResponse: fail("Não autenticado.", 401),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    const message = profileError.message.toLowerCase();
    if (message.includes("user_profiles") && message.includes("does not exist")) {
      return { user, role: "user", supabase };
    }

    return {
      errorResponse: fail("Falha ao validar perfil do usuário.", 500, profileError.message),
    };
  }

  const typedProfile = profile as { role: AppRole } | null;
  const role = typedProfile?.role ?? "user";
  return { user, role, supabase };
}

export async function requireApiAdmin(): Promise<
  | {
      user: User;
      role: "admin";
      supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;
      errorResponse?: undefined;
    }
  | { errorResponse: ReturnType<typeof fail>; user?: undefined; role?: undefined; supabase?: undefined }
> {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth;
  }

  if (auth.role !== "admin") {
    return {
      errorResponse: fail("Acesso negado.", 403),
    };
  }

  return {
    user: auth.user,
    role: "admin",
    supabase: auth.supabase,
  };
}
