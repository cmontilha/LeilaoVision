"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, ArrowLeft, RefreshCw, Search } from "lucide-react";

import { useAdminData } from "@/components/admin/useAdminData";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  classifyUserActivity,
  computeStatusMetrics,
  formatDateTime,
  roleBadgeClass,
  sortAdminUsers,
  type AdminActivityKey,
  type AdminUserRow,
} from "@/lib/admin";

const statusOrder: Record<AdminActivityKey, number> = {
  online_now: 0,
  active_today: 1,
  active_week: 2,
  inactive: 3,
  dormant: 4,
};
const emptyUsers: AdminUserRow[] = [];

export default function AdminStatusPage() {
  const { data, loading, error, refresh } = useAdminData();
  const [query, setQuery] = useState("");
  const users = data?.users ?? emptyUsers;
  const statusMetrics = useMemo(() => computeStatusMetrics(users), [users]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortAdminUsers(users)
      .map((user) => ({
        user,
        activity: classifyUserActivity(user.last_sign_in_at),
      }))
      .filter(({ user }) => {
        if (!normalizedQuery) {
          return true;
        }

        const email = user.email?.toLowerCase() ?? "";
        return email.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const byStatus = statusOrder[a.activity.key] - statusOrder[b.activity.key];
        if (byStatus !== 0) {
          return byStatus;
        }

        return new Date(b.user.last_sign_in_at ?? 0).getTime() - new Date(a.user.last_sign_in_at ?? 0).getTime();
      });
  }, [users, query]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Status de usuários"
        description="Monitoramento de atividade recente para suporte e operação."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/app/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted transition hover:border-white/30 hover:text-lv-text"
            >
              <ArrowLeft size={14} />
              Painel
            </Link>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted transition hover:border-white/30 hover:text-lv-text"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>
        }
      />

      {error ? (
        <Panel>
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
        </Panel>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Online agora</p>
            <Activity size={16} className="text-emerald-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : statusMetrics.online_now}</p>
        </Panel>

        <Panel>
          <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Ativos hoje</p>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : statusMetrics.active_today}</p>
        </Panel>

        <Panel>
          <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Ativos na semana</p>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : statusMetrics.active_week}</p>
        </Panel>

        <Panel>
          <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Inativos até 30 dias</p>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : statusMetrics.inactive}</p>
        </Panel>

        <Panel>
          <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Dormentes</p>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : statusMetrics.dormant}</p>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-lv-text">Mapa de atividade</h3>
            <p className="mt-1 text-xs text-lv-textMuted">
              O status é calculado com base no último login registrado por conta.
            </p>
          </div>

          <label className="flex w-full items-center gap-2 rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-xs text-lv-textMuted sm:w-[280px]">
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por e-mail"
              className="w-full bg-transparent text-sm text-lv-text outline-none placeholder:text-lv-textMuted"
            />
          </label>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-lv-textMuted">Carregando status...</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-lv-textMuted">Nenhum usuário encontrado para o filtro informado.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[920px] w-full text-sm">
              <thead className="text-left text-lv-textMuted">
                <tr>
                  <th className="px-2 py-3">E-mail</th>
                  <th className="px-2 py-3">Role</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Último login</th>
                  <th className="px-2 py-3">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lv-border/60">
                {rows.map(({ user, activity }) => (
                  <tr key={user.user_id}>
                    <td className="px-2 py-3 text-lv-text">{user.email ?? "-"}</td>
                    <td className="px-2 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${roleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <StatusBadge label={activity.label} tone={activity.tone} />
                    </td>
                    <td className="px-2 py-3 text-lv-textMuted">{formatDateTime(user.last_sign_in_at)}</td>
                    <td className="px-2 py-3 text-lv-textMuted">{formatDateTime(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
