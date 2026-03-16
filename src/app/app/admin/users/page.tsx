"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";

import { useAdminData } from "@/components/admin/useAdminData";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  formatDateTime,
  roleBadgeClass,
  safeAdminErrorMessage,
  sortAdminUsers,
  updateAdminUserRole,
  type AdminMetrics,
  type AdminUserRow,
} from "@/lib/admin";
import type { AppRole } from "@/types";

const defaultMetrics: AdminMetrics = {
  total_users: 0,
  total_admins: 0,
  verified_users: 0,
  active_last_30d: 0,
};
const emptyUsers: AdminUserRow[] = [];

export default function AdminUsersPage() {
  const { data, loading, error, refresh } = useAdminData();
  const [query, setQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const users = data?.users ?? emptyUsers;
  const metrics = data?.metrics ?? defaultMetrics;
  const currentUserId = data?.current_user_id ?? "";

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = sortAdminUsers(users);

    if (!normalizedQuery) {
      return sorted;
    }

    return sorted.filter((user) => {
      const email = user.email?.toLowerCase() ?? "";
      return email.includes(normalizedQuery);
    });
  }, [users, query]);

  async function handleRoleChange(targetUserId: string, nextRole: AppRole) {
    setUpdatingUserId(targetUserId);
    setActionError("");
    setActionMessage("");

    try {
      await updateAdminUserRole(targetUserId, nextRole);
      setActionMessage("Role atualizada com sucesso.");
      await refresh();
    } catch (updateError) {
      setActionError(safeAdminErrorMessage(updateError));
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Administração de usuários"
        description="Lista operacional de contas com controle de role administrativa."
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

      <Panel>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Usuários</p>
            <p className="mt-2 text-2xl font-semibold text-lv-text">{loading ? "..." : metrics.total_users}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Admins</p>
            <p className="mt-2 text-2xl font-semibold text-lv-text">{loading ? "..." : metrics.total_admins}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Verificados</p>
            <p className="mt-2 text-2xl font-semibold text-lv-text">{loading ? "..." : metrics.verified_users}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Filtrados</p>
            <p className="mt-2 text-2xl font-semibold text-lv-text">{filteredUsers.length}</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-lv-text">Usuários da plataforma</h3>
            <p className="mt-1 text-xs text-lv-textMuted">
              Promova ou rebaixe usuários para controlar acesso ao módulo administrativo.
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
          <p className="mt-4 text-sm text-lv-textMuted">Carregando usuários...</p>
        ) : error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="mt-4 text-sm text-lv-textMuted">Nenhum usuário encontrado para o filtro informado.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[960px] w-full text-sm">
              <thead className="text-left text-lv-textMuted">
                <tr>
                  <th className="px-2 py-3">E-mail</th>
                  <th className="px-2 py-3">Role</th>
                  <th className="px-2 py-3">Criado em</th>
                  <th className="px-2 py-3">Confirmado em</th>
                  <th className="px-2 py-3">Último login</th>
                  <th className="px-2 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lv-border/60">
                {filteredUsers.map((user) => {
                  const isSelf = user.user_id === currentUserId;
                  const nextRole: AppRole = user.role === "admin" ? "user" : "admin";
                  const actionLabel = user.role === "admin" ? "Remover admin" : "Promover admin";

                  return (
                    <tr key={user.user_id}>
                      <td className="px-2 py-3 text-lv-text">{user.email ?? "-"}</td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${roleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-lv-textMuted">{formatDateTime(user.created_at)}</td>
                      <td className="px-2 py-3 text-lv-textMuted">{formatDateTime(user.email_confirmed_at)}</td>
                      <td className="px-2 py-3 text-lv-textMuted">{formatDateTime(user.last_sign_in_at)}</td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          disabled={isSelf || updatingUserId === user.user_id}
                          onClick={() => void handleRoleChange(user.user_id, nextRole)}
                          className="rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-1.5 text-xs text-lv-textMuted transition hover:border-white/30 hover:text-lv-text disabled:cursor-not-allowed disabled:opacity-55"
                          title={isSelf ? "Você não pode alterar sua própria role." : actionLabel}
                        >
                          {updatingUserId === user.user_id ? "Atualizando..." : actionLabel}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {actionMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {actionMessage}
          </p>
        ) : null}

        {actionError ? (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {actionError}
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
