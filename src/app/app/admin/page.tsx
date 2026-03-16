"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  LockKeyhole,
  RefreshCw,
  Shield,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

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

interface AdminQuickAction {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  highlights: string[];
  icon: LucideIcon;
}

export default function AdminPage() {
  const { data, loading, error, refresh } = useAdminData();
  const metrics = data?.metrics ?? defaultMetrics;
  const users = data?.users ?? emptyUsers;
  const growthMetrics = useMemo(() => computeGrowthMetrics(users), [users]);
  const statusMetrics = useMemo(() => computeStatusMetrics(users), [users]);

  const quickActions: AdminQuickAction[] = [
    {
      title: "Usuários",
      description: "Gerencie permissões e visualize a base completa de contas.",
      href: "/app/admin/users",
      buttonLabel: "Abrir usuários",
      icon: Users,
      highlights: [`Total: ${metrics.total_users}`, `Admins: ${metrics.total_admins}`],
    },
    {
      title: "Métricas",
      description: "Acompanhe crescimento de cadastro por semana, mês e volume total.",
      href: "/app/admin/metricas",
      buttonLabel: "Abrir métricas",
      icon: BarChart3,
      highlights: [`+7d: ${growthMetrics.new_users_7d}`, `+30d: ${growthMetrics.new_users_30d}`],
    },
    {
      title: "Status",
      description: "Monitore atividade recente para operação e suporte da plataforma.",
      href: "/app/admin/status",
      buttonLabel: "Abrir status",
      icon: Activity,
      highlights: [
        `Online agora: ${statusMetrics.online_now}`,
        `Ativos hoje: ${statusMetrics.active_today}`,
      ],
    },
    {
      title: "Segurança",
      description: "Checklist de hardening, risco operacional e controles administrativos.",
      href: "/app/admin/seguranca",
      buttonLabel: "Abrir segurança",
      icon: LockKeyhole,
      highlights: [`Verificados: ${metrics.verified_users}`, `Ativos 30d: ${metrics.active_last_30d}`],
    },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Painel do Admin"
        description="Visão operacional da base de usuários e controles de acesso."
        action={
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-4 py-2 text-sm text-lv-textMuted transition hover:border-white/30 hover:text-lv-text"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Usuários</p>
            <Users size={16} className="text-[#FFC107]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : metrics.total_users}</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Admins</p>
            <Shield size={16} className="text-red-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : metrics.total_admins}</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">E-mails verificados</p>
            <UserCheck size={16} className="text-emerald-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : metrics.verified_users}</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-lv-textMuted">Ativos em 30 dias</p>
            <Activity size={16} className="text-sky-300" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{loading ? "..." : metrics.active_last_30d}</p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {quickActions.map((card) => {
          const Icon = card.icon;

          return (
            <Panel key={card.href} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-lv-text">{card.title}</h3>
                  <p className="mt-1 text-xs text-lv-textMuted">{card.description}</p>
                </div>
                <Icon size={18} className="mt-0.5 text-[#FFC107]" />
              </div>

              <div className="mt-3 space-y-1 text-xs text-lv-textMuted">
                {card.highlights.map((highlight) => (
                  <p key={highlight}>{highlight}</p>
                ))}
              </div>

              <Link
                href={card.href}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-xs text-lv-textMuted transition hover:border-white/30 hover:text-lv-text"
              >
                {card.buttonLabel}
                <ArrowRight size={14} />
              </Link>
            </Panel>
          );
        })}
      </div>

      {error ? (
        <Panel>
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
        </Panel>
      ) : null}

      <Panel>
        <h3 className="text-sm font-semibold text-lv-text">Próximas melhorias recomendadas</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-lv-textMuted">
          <li>Auditoria administrativa com trilha de ações (quem alterou role e quando).</li>
          <li>Bloqueio/desbloqueio de usuário com motivo e validade.</li>
          <li>Painel de risco com tentativas de login, rate-limit e alertas de abuso.</li>
        </ul>
      </Panel>
    </div>
  );
}
