import { NextRequest } from "next/server";

import { requireApiAdmin } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/response";
import { buildRateLimitKey, consumeRateLimit, isSameOriginRequest } from "@/lib/api/security";
import { APP_ROLE } from "@/types";
import {
  ValidationError,
  ensureBoolean,
  ensureEnum,
  ensureObject,
  ensureOptionalString,
  ensureUuid,
} from "@/lib/api/validation";

interface AdminUserRow {
  user_id: string;
  email: string | null;
  role: "user" | "admin";
  is_active: boolean;
  deactivated_at: string | null;
  deactivated_reason: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
}

interface LegacyAdminUserRow {
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

function isMissingAdminRpc(errorMessage: string): boolean {
  const normalized = errorMessage.toLowerCase();

  return (
    normalized.includes("admin_list_users_v2") ||
    normalized.includes("admin_set_user_active") ||
    normalized.includes("admin_list_users") ||
    normalized.includes("admin_platform_metrics") ||
    normalized.includes("admin_set_user_role") ||
    (normalized.includes("function") && normalized.includes("does not exist"))
  );
}

function missingRpcResponse(message: string) {
  return fail(
    "Painel admin indisponível. Rode as migrations 202603160002_user_roles_admin.sql, 202603160003_admin_panel_rpc.sql, 202603160004_admin_user_profiles_sync.sql e 202603160005_admin_user_activation.sql no Supabase.",
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

  const rpcClient = auth.supabase as unknown as RpcCapable;

  const usersResult = await rpcClient.rpc<AdminUserRow[]>("admin_list_users_v2");
  if (usersResult.error) {
    if (!isMissingAdminRpc(usersResult.error.message)) {
      return fail("Não foi possível listar usuários.", 400, usersResult.error.message);
    }

    const legacyResult = await rpcClient.rpc<LegacyAdminUserRow[]>("admin_list_users");
    if (legacyResult.error) {
      if (isMissingAdminRpc(legacyResult.error.message)) {
        return missingRpcResponse(legacyResult.error.message);
      }

      return fail("Não foi possível listar usuários.", 400, legacyResult.error.message);
    }

    const mappedLegacyRows: AdminUserRow[] = (legacyResult.data ?? []).map((user) => ({
      ...user,
      is_active: true,
      deactivated_at: null,
      deactivated_reason: null,
    }));

    const metricsResult = await rpcClient.rpc<AdminMetrics>("admin_platform_metrics");
    if (metricsResult.error) {
      if (isMissingAdminRpc(metricsResult.error.message)) {
        return missingRpcResponse(metricsResult.error.message);
      }

      return fail("Não foi possível carregar métricas administrativas.", 400, metricsResult.error.message);
    }

    return ok({
      current_user_id: auth.user.id,
      users: mappedLegacyRows,
      metrics: (metricsResult.data ?? {
        total_users: 0,
        total_admins: 0,
        verified_users: 0,
        active_last_30d: 0,
      }) as AdminMetrics,
    });
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
    const action = ensureEnum(
      typeof body.action === "string" ? body.action : "role",
      ["role", "active"] as const,
      "action",
    );

    const rpcClient = auth.supabase as unknown as RpcCapable;
    if (action === "role") {
      const role = ensureEnum(body.role, APP_ROLE, "role");
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
    }

    const isActive = ensureBoolean(body.is_active, "is_active");
    const reason = ensureOptionalString(body.reason, "reason", 300);
    const { error } = await rpcClient.rpc("admin_set_user_active", {
      p_target_user_id: targetUserId,
      p_is_active: isActive,
      p_reason: reason,
    });

    if (error) {
      if (isMissingAdminRpc(error.message)) {
        return missingRpcResponse(error.message);
      }

      return fail("Não foi possível atualizar status do usuário.", 400, error.message);
    }

    return ok({ updated: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return fail(error.message, 422);
    }

    return fail("Erro interno ao atualizar role.", 500, String(error));
  }
}
