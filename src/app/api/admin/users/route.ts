import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { requireApiAdmin } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { buildRateLimitKey, consumeRateLimit, isSameOriginRequest } from "@/lib/api/security";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { APP_ROLE } from "@/types";
import { ValidationError, ensureEnum, ensureObject, ensureUuid } from "@/lib/api/validation";
import type { Database } from "@/types";

interface AdminUserRow {
  user_id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
}

interface AdminMetrics {
  total_users: number;
  total_admins: number;
  verified_users: number;
  active_last_30d: number;
}

interface RpcResult<T> {
  data: T | null;
  error: { message: string } | null;
}

interface RpcCapable {
  rpc: <T = unknown>(fn: string, args?: Record<string, unknown>) => Promise<RpcResult<T>>;
}

function createRpcClient(accessToken: string): RpcCapable {
  const { url, anonKey } = getSupabaseConfig();

  return createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }) as unknown as RpcCapable;
}

function isMissingAdminRpc(errorMessage: string): boolean {
  const normalized = errorMessage.toLowerCase();

  return (
    normalized.includes("admin_list_users") ||
    normalized.includes("admin_platform_metrics") ||
    normalized.includes("admin_set_user_role") ||
    (normalized.includes("function") && normalized.includes("does not exist"))
  );
}

function missingRpcResponse(message: string) {
  return fail(
    "Painel admin indisponível. Rode as migrations 202603160002_user_roles_admin.sql e 202603160003_admin_panel_rpc.sql no Supabase.",
    503,
    message,
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireApiAdmin();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const rate = consumeRateLimit(buildRateLimitKey(request, "admin:users:get", auth.user.id), 90, 60_000);
  if (!rate.allowed) {
    return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
  }

  const {
    data: { session },
  } = await auth.supabase.auth.getSession();

  if (!session?.access_token) {
    return fail("Sessão inválida para operações administrativas.", 401);
  }

  const rpcClient = createRpcClient(session.access_token);

  const usersResult = await rpcClient.rpc<AdminUserRow[]>("admin_list_users");
  if (usersResult.error) {
    if (isMissingAdminRpc(usersResult.error.message)) {
      return missingRpcResponse(usersResult.error.message);
    }

    return fail("Não foi possível listar usuários.", 400, usersResult.error.message);
  }

  const metricsResult = await rpcClient.rpc<AdminMetrics>("admin_platform_metrics");
  if (metricsResult.error) {
    if (isMissingAdminRpc(metricsResult.error.message)) {
      return missingRpcResponse(metricsResult.error.message);
    }

    return fail("Não foi possível carregar métricas administrativas.", 400, metricsResult.error.message);
  }

  return ok({
    current_user_id: auth.user.id,
    users: (usersResult.data ?? []) as AdminUserRow[],
    metrics: (metricsResult.data ?? {
      total_users: 0,
      total_admins: 0,
      verified_users: 0,
      active_last_30d: 0,
    }) as AdminMetrics,
  });
}

export async function PATCH(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return fail("Origem da requisição não permitida.", 403);
  }

  const auth = await requireApiAdmin();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const rate = consumeRateLimit(buildRateLimitKey(request, "admin:users:patch", auth.user.id), 45, 60_000);
  if (!rate.allowed) {
    return fail(`Muitas requisições. Aguarde ${rate.retryAfterSeconds}s.`, 429);
  }

  try {
    const body = ensureObject(await request.json());
    const targetUserId = ensureUuid(body.target_user_id, "target_user_id");
    const role = ensureEnum(body.role, APP_ROLE, "role");

    const {
      data: { session },
    } = await auth.supabase.auth.getSession();
    if (!session?.access_token) {
      return fail("Sessão inválida para operações administrativas.", 401);
    }

    const rpcClient = createRpcClient(session.access_token);

    const { error } = await rpcClient.rpc("admin_set_user_role", {
      p_target_user_id: targetUserId,
      p_new_role: role,
    });

    if (error) {
      if (isMissingAdminRpc(error.message)) {
        return missingRpcResponse(error.message);
      }

      return fail("Não foi possível atualizar a role do usuário.", 400, error.message);
    }

    return ok({ updated: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return fail(error.message, 422);
    }

    return fail("Erro interno ao atualizar role.", 500, String(error));
  }
}
