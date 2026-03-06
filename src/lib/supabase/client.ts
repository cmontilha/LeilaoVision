import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types";

import { getSupabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}
