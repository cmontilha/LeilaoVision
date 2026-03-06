import { type User } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import { fail } from "./response";

export async function requireApiUser(): Promise<
  | {
      user: User;
      supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;
      errorResponse?: undefined;
    }
  | { errorResponse: ReturnType<typeof fail>; user?: undefined; supabase?: undefined }
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

  return { user, supabase };
}
