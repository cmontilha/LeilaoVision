"use client";

import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Gavel,
  HandCoins,
  Landmark,
  Target,
  TrendingUp,
} from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatDate } from "@/lib/utils";
import type { DashboardData } from "@/types";

const fallbackData: DashboardData = {
  metrics: {
    total_properties: 0,
    ready_for_bid: 0,
    weekly_auctions: 0,
    bids_submitted: 0,
    won_properties: 0,
    invested_capital: 0,
  },
  auctions_by_month: [],
  success_rate: [],
  average_roi: [],
  watchlist: [],
  upcoming_auctions: [],
  risk_alerts: [],
};

const propertyStatusLabel: Record<string, string> = {
  analyzing: "Analisando",
  approved: "Aprovado",
  rejected: "Rejeitado",
  ready_for_bid: "Pronto para lance",
  bid_submitted: "Lance realizado",
  won: "Arrematado",
};

export function DashboardView() {
  const [dashboard, setDashboard] = useState<DashboardData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Falha ao carregar o dashboard.");
          setLoading(false);
          return;
        }

        setDashboard(payload.data as DashboardData);
      } catch (requestError) {
        setError(String(requestError));
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Painel"
        description="Visão geral do pipeline de oportunidades em leilões imobiliários."
      />

      {error ? (
        <Panel className="border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</Panel>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Total de imóveis analisados"
          value={dashboard.metrics.total_properties}
          icon={Landmark}
        />
        <MetricCard
          title="Imóveis prontos para lance"
          value={dashboard.metrics.ready_for_bid}
          icon={Target}
        />
        <MetricCard title="Leilões nesta semana" value={dashboard.metrics.weekly_auctions} icon={Gavel} />
        <MetricCard title="Lances realizados" value={dashboard.metrics.bids_submitted} icon={HandCoins} />
        <MetricCard title="Imóveis arrematados" value={dashboard.metrics.won_properties} icon={TrendingUp} />
        <MetricCard
          title="Capital investido"
          value={dashboard.metrics.invested_capital}
          icon={CircleDollarSign}
          currency
        />
      </div>

      <DashboardCharts
        auctionsByMonth={dashboard.auctions_by_month}
        successRate={dashboard.success_rate}
        averageRoi={dashboard.average_roi}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <h3 className="text-sm font-semibold text-lv-text">Lista de acompanhamento de imóveis</h3>
          <div className="mt-3 space-y-2">
            {dashboard.watchlist.length === 0 ? (
              <p className="text-sm text-lv-textMuted">Nenhum imóvel em acompanhamento.</p>
            ) : (
              dashboard.watchlist.map((property) => (
                <div key={property.id} className="rounded-xl border border-lv-border bg-lv-panelMuted p-3">
                  <p className="text-sm font-medium text-lv-text">{property.address}</p>
                  <p className="mt-1 text-xs text-lv-textMuted">
                    {property.city}/{property.state}
                  </p>
                  <div className="mt-2">
                    <StatusBadge label={propertyStatusLabel[property.status] ?? property.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-sm font-semibold text-lv-text">Próximos leilões</h3>
          <div className="mt-3 space-y-2">
            {dashboard.upcoming_auctions.length === 0 ? (
              <p className="text-sm text-lv-textMuted">Sem leilões agendados.</p>
            ) : (
              dashboard.upcoming_auctions.map((auction) => (
                <div key={auction.id} className="rounded-xl border border-lv-border bg-lv-panelMuted p-3">
                  <p className="text-sm font-medium text-lv-text">{auction.auctioneer}</p>
                  <p className="mt-1 text-xs text-lv-textMuted">{formatDate(auction.first_auction_at)}</p>
                  <p className="mt-1 text-xs text-lv-textMuted">Comissão: {auction.commission_percent}%</p>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-sm font-semibold text-lv-text">Alertas de risco</h3>
          <div className="mt-3 space-y-2">
            {dashboard.risk_alerts.length === 0 ? (
              <p className="text-sm text-lv-textMuted">Sem alertas críticos.</p>
            ) : (
              dashboard.risk_alerts.map((task) => (
                <div key={task.id} className="rounded-xl border border-red-500/25 bg-red-500/5 p-3">
                  <p className="text-sm font-medium text-lv-text">{task.name}</p>
                  <p className="mt-1 text-xs text-red-300">Prazo: {formatDate(task.due_date)}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {loading ? (
        <p className="text-sm text-lv-textMuted">Atualizando dados do dashboard...</p>
      ) : null}
    </div>
  );
}
