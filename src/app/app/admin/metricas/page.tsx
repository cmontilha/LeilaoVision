"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, BarChart3, RefreshCw, TrendingUp, UserCheck, Users } from "lucide-react";

import { useAdminData } from "@/components/admin/useAdminData";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { computeGrowthMetrics, computeStatusMetrics, type AdminMetrics, type AdminUserRow } from "@/lib/admin";

const defaultMetrics: AdminMetrics = {
  total_users: 0,
  total_admins: 0,
  verified_users: 0,
  active_last_30d: 0,
};
const emptyUsers: AdminUserRow[] = [];

function toPercent(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return (part / total) * 100;
}

function growthDeltaLabel(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "Nova tração" : "Sem variação";
  }

  const delta = ((current - previous) / previous) * 100;
  const signal = delta >= 0 ? "+" : "";
  return `${signal}${delta.toFixed(1)}% vs período anterior`;
}

function progressColor(value: number): string {
  if (value >= 70) {
    return "bg-emerald-400";
  }

  if (value >= 40) {
    return "bg-[#FFC107]";
  }

  return "bg-red-400";
}

export default function AdminMetricsPage() {
  const { data, loading, error, refresh } = useAdminData();
  const users = data?.users ?? emptyUsers;
  const metrics = data?.metrics ?? defaultMetrics;
  const growth = useMemo(() => computeGrowthMetrics(users), [users]);
  const status = useMemo(() => computeStatusMetrics(users), [users]);

  const verifiedRate = toPercent(metrics.verified_users, metrics.total_users);
  const activeRate = toPercent(metrics.active_last_30d, metrics.total_users);
  const adminRate = toPercent(metrics.total_admins, metrics.total_users);
  const activeWeekRate = toPercent(status.online_now + status.active_today + status.active_week, metrics.total_users);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Métricas administrativas"
        description="Crescimento, qualidade de base e saúde operacional dos usuários."
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
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Novos em 7 dias</p>
            <TrendingUp size={16} className="text-emerald-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : growth.new_users_7d}</p>
          <p className="mt-1 text-xs text-lv-textMuted">
            {growthDeltaLabel(growth.new_users_7d, growth.new_users_prev_7d)}
          </p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Novos em 30 dias</p>
            <BarChart3 size={16} className="text-sky-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : growth.new_users_30d}</p>
          <p className="mt-1 text-xs text-lv-textMuted">
            {growthDeltaLabel(growth.new_users_30d, growth.new_users_prev_30d)}
          </p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Total de usuários</p>
            <Users size={16} className="text-[#FFC107]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : growth.new_users_total}</p>
          <p className="mt-1 text-xs text-lv-textMuted">Volume total da base ativa e histórica</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">E-mails verificados</p>
            <UserCheck size={16} className="text-emerald-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : metrics.verified_users}</p>
          <p className="mt-1 text-xs text-lv-textMuted">Taxa de validação cadastral da plataforma</p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="text-sm font-semibold text-lv-text">Qualidade da base</h3>
          <p className="mt-1 text-xs text-lv-textMuted">
            Indicadores para medir maturidade de onboarding e recorrência de login.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-lv-textMuted">
                <span>Taxa de verificação de e-mail</span>
                <span>{verifiedRate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-lv-panelMuted">
                <div
                  className={`h-2 rounded-full ${progressColor(verifiedRate)}`}
                  style={{ width: `${Math.min(verifiedRate, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-lv-textMuted">
                <span>Ativos em 30 dias</span>
                <span>{activeRate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-lv-panelMuted">
                <div
                  className={`h-2 rounded-full ${progressColor(activeRate)}`}
                  style={{ width: `${Math.min(activeRate, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-lv-textMuted">
                <span>Ativos na semana</span>
                <span>{activeWeekRate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-lv-panelMuted">
                <div
                  className={`h-2 rounded-full ${progressColor(activeWeekRate)}`}
                  style={{ width: `${Math.min(activeWeekRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-sm font-semibold text-lv-text">Composição de acesso</h3>
          <p className="mt-1 text-xs text-lv-textMuted">Distribuição de privilégios administrativos na base.</p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Admins</p>
              <p className="mt-1 text-xl font-semibold text-lv-text">{metrics.total_admins}</p>
              <p className="text-xs text-lv-textMuted">{adminRate.toFixed(1)}% da base total</p>
            </div>

            <div className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Usuários padrão</p>
              <p className="mt-1 text-xl font-semibold text-lv-text">{Math.max(metrics.total_users - metrics.total_admins, 0)}</p>
              <p className="text-xs text-lv-textMuted">{Math.max(100 - adminRate, 0).toFixed(1)}% da base total</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
