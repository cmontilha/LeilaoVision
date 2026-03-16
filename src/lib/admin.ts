import type { AppRole } from "@/types";

export interface AdminUserRow {
  user_id: string;
  email: string | null;
  role: AppRole;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
}

export interface AdminMetrics {
  total_users: number;
  total_admins: number;
  verified_users: number;
  active_last_30d: number;
}

export interface AdminPayload {
  current_user_id: string;
  users: AdminUserRow[];
  metrics: AdminMetrics;
}

export interface AdminGrowthMetrics {
  new_users_7d: number;
  new_users_30d: number;
  new_users_total: number;
  new_users_prev_7d: number;
  new_users_prev_30d: number;
}

export type AdminActivityKey = "online_now" | "active_today" | "active_week" | "inactive" | "dormant";

export interface AdminActivityStatus {
  key: AdminActivityKey;
  label: string;
  tone: "default" | "success" | "warning" | "danger";
}

export interface AdminStatusMetrics {
  online_now: number;
  active_today: number;
  active_week: number;
  inactive: number;
  dormant: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ONLINE_WINDOW_MS = 15 * 60 * 1000;

const defaultStatusMetrics: AdminStatusMetrics = {
  online_now: 0,
  active_today: 0,
  active_week: 0,
  inactive: 0,
  dormant: 0,
};

interface AdminApiResponse {
  data?: AdminPayload;
  error?: string;
}

interface AdminPatchResponse {
  error?: string;
}

function toTimestamp(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Não foi possível carregar dados administrativos.";
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchAdminPayload(signal?: AbortSignal): Promise<AdminPayload> {
  const response = await fetch("/api/admin/users", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  const payload = await parseJsonSafe<AdminApiResponse>(response);
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error ?? "Não foi possível carregar o painel administrativo.");
  }

  return payload.data;
}

export async function updateAdminUserRole(targetUserId: string, role: AppRole): Promise<void> {
  const response = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_user_id: targetUserId,
      role,
    }),
  });

  const payload = await parseJsonSafe<AdminPatchResponse>(response);
  if (!response.ok) {
    throw new Error(payload?.error ?? "Falha ao atualizar role do usuário.");
  }
}

export function computeGrowthMetrics(users: AdminUserRow[], now = Date.now()): AdminGrowthMetrics {
  let newUsers7d = 0;
  let newUsers30d = 0;
  let prevUsers7d = 0;
  let prevUsers30d = 0;

  for (const user of users) {
    const createdAt = toTimestamp(user.created_at);
    if (createdAt === null) {
      continue;
    }

    const ageMs = now - createdAt;
    if (ageMs < 0) {
      continue;
    }

    if (ageMs <= 7 * DAY_MS) {
      newUsers7d += 1;
    } else if (ageMs <= 14 * DAY_MS) {
      prevUsers7d += 1;
    }

    if (ageMs <= 30 * DAY_MS) {
      newUsers30d += 1;
    } else if (ageMs <= 60 * DAY_MS) {
      prevUsers30d += 1;
    }
  }

  return {
    new_users_7d: newUsers7d,
    new_users_30d: newUsers30d,
    new_users_total: users.length,
    new_users_prev_7d: prevUsers7d,
    new_users_prev_30d: prevUsers30d,
  };
}

export function classifyUserActivity(lastSignInAt: string | null, now = Date.now()): AdminActivityStatus {
  const lastSignIn = toTimestamp(lastSignInAt);
  if (lastSignIn === null || lastSignIn > now) {
    return {
      key: "dormant",
      label: "Nunca acessou",
      tone: "danger",
    };
  }

  const elapsedMs = now - lastSignIn;
  if (elapsedMs <= ONLINE_WINDOW_MS) {
    return {
      key: "online_now",
      label: "Online agora",
      tone: "success",
    };
  }

  if (elapsedMs <= DAY_MS) {
    return {
      key: "active_today",
      label: "Ativo hoje",
      tone: "success",
    };
  }

  if (elapsedMs <= 7 * DAY_MS) {
    return {
      key: "active_week",
      label: "Ativo na semana",
      tone: "warning",
    };
  }

  if (elapsedMs <= 30 * DAY_MS) {
    return {
      key: "inactive",
      label: "Inativo até 30 dias",
      tone: "default",
    };
  }

  return {
    key: "dormant",
    label: "Inativo há mais de 30 dias",
    tone: "danger",
  };
}

export function computeStatusMetrics(users: AdminUserRow[], now = Date.now()): AdminStatusMetrics {
  const result: AdminStatusMetrics = { ...defaultStatusMetrics };

  for (const user of users) {
    const status = classifyUserActivity(user.last_sign_in_at, now);
    result[status.key] += 1;
  }

  return result;
}

export function sortAdminUsers(users: AdminUserRow[]): AdminUserRow[] {
  return [...users].sort((a, b) => {
    if (a.role !== b.role) {
      return a.role === "admin" ? -1 : 1;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function formatDateTime(value: string | null | undefined): string {
  const timestamp = toTimestamp(value);
  if (timestamp === null) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(new Date(timestamp));
}

export function roleBadgeClass(role: AppRole): string {
  if (role === "admin") {
    return "border-red-500/35 bg-red-500/10 text-red-200";
  }

  return "border-lv-border bg-lv-panelMuted text-lv-textMuted";
}

export function safeAdminErrorMessage(error: unknown): string {
  return toErrorMessage(error);
}
