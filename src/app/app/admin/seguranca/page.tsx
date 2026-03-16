"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, LockKeyhole, RefreshCw, ShieldAlert, UserCheck, Users } from "lucide-react";

import { useAdminData } from "@/components/admin/useAdminData";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { computeStatusMetrics, type AdminMetrics, type AdminUserRow } from "@/lib/admin";

const defaultMetrics: AdminMetrics = {
  total_users: 0,
  total_admins: 0,
  verified_users: 0,
  active_last_30d: 0,
};
const emptyUsers: AdminUserRow[] = [];

function toPercent(part: number, total: number): string {
  if (total <= 0) {
    return "0.0%";
  }

  return `${((part / total) * 100).toFixed(1)}%`;
}

export default function AdminSecurityPage() {
  const { data, loading, error, refresh } = useAdminData();
  const users = data?.users ?? emptyUsers;
  const metrics = data?.metrics ?? defaultMetrics;
  const statusMetrics = useMemo(() => computeStatusMetrics(users), [users]);

  const unverifiedUsers = Math.max(metrics.total_users - metrics.verified_users, 0);
  const privilegedRate = toPercent(metrics.total_admins, metrics.total_users);
  const dormantRate = toPercent(statusMetrics.dormant, metrics.total_users);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Segurança administrativa"
        description="Visão de exposição operacional e próximos passos de hardening."
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Usuários sem verificação</p>
            <UserCheck size={16} className="text-red-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : unverifiedUsers}</p>
          <p className="mt-1 text-xs text-lv-textMuted">Priorize validação para reduzir risco de conta.</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Contas dormentes</p>
            <Users size={16} className="text-[#FFC107]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : statusMetrics.dormant}</p>
          <p className="mt-1 text-xs text-lv-textMuted">{dormantRate} da base sem atividade recente.</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Superfície privilegiada</p>
            <ShieldAlert size={16} className="text-sky-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : metrics.total_admins}</p>
          <p className="mt-1 text-xs text-lv-textMuted">{privilegedRate} da base com acesso administrativo.</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Ativos 30 dias</p>
            <LockKeyhole size={16} className="text-emerald-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : metrics.active_last_30d}</p>
          <p className="mt-1 text-xs text-lv-textMuted">Uso recente para calibrar lockout e notificações.</p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-sm font-semibold text-lv-text">Ações recomendadas</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-lv-textMuted">
            <li>Registrar trilha de auditoria para alterações de role e ações críticas.</li>
            <li>Implementar bloqueio temporário por múltiplas falhas de login/reset.</li>
            <li>Adicionar motivo e validade em bloqueio/desbloqueio de usuário.</li>
            <li>Centralizar alertas de abuso com webhook interno e canal de incidentes.</li>
          </ul>
        </Panel>

        <Panel>
          <h3 className="text-sm font-semibold text-lv-text">Atalhos operacionais</h3>
          <p className="mt-1 text-xs text-lv-textMuted">Acesse módulos para atuar rápido em risco e governança.</p>

          <div className="mt-4 grid gap-2">
            <Link
              href="/app/admin/users"
              className="rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted transition hover:border-white/30 hover:text-lv-text"
            >
              Gerenciar usuários e roles
            </Link>
            <Link
              href="/app/admin/status"
              className="rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted transition hover:border-white/30 hover:text-lv-text"
            >
              Revisar status de atividade
            </Link>
            <Link
              href="/app/admin/metricas"
              className="rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted transition hover:border-white/30 hover:text-lv-text"
            >
              Acompanhar crescimento e saúde da base
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
