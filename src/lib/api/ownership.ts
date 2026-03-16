import type { PostgrestError } from "@supabase/supabase-js";

import type { Database } from "@/types";

interface ReferenceRule {
  field: string;
  table: keyof Database["public"]["Tables"];
}

interface ValidateOwnedReferencesParams {
  payload: Record<string, unknown>;
  userId: string;
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: unknown) => {
          eq: (column: string, value: unknown) => {
            maybeSingle: () => Promise<{ data: unknown; error: PostgrestError | null }>;
          };
        };
      };
    };
  };
  rules: ReferenceRule[];
}

export async function validateOwnedReferences({
  payload,
  userId,
  supabase,
  rules,
}: ValidateOwnedReferencesParams): Promise<string | null> {
  for (const rule of rules) {
    const value = payload[rule.field];
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value !== "string") {
      return `Campo ${rule.field} inválido.`;
    }

    const { data, error } = await supabase
      .from(rule.table)
      .select("id")
      .eq("id", value)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return "Não foi possível validar referência de ownership.";
    }

    if (!data) {
      return `Campo ${rule.field} referencia um registro inexistente ou sem acesso.`;
    }
  }

  return null;
}
