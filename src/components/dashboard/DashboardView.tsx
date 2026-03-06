"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CircleDollarSign,
  Gavel,
  HandCoins,
  Landmark,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatDate, toCurrency } from "@/lib/utils";
import type { DashboardData, Property } from "@/types";

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

function getEstimatedRoi(property: Property): number | null {
  if (!property.market_value || !property.min_bid || property.min_bid <= 0) {
    return null;
  }

  return ((property.market_value - property.min_bid) / property.min_bid) * 100;
}

function getRisk(property: Property): { label: string; className: string } {
  if (property.status === "rejected") {
    return { label: "Risco alto", className: "bg-red-400" };
  }

  if (property.status === "approved" || property.status === "ready_for_bid" || property.status === "won") {
    return { label: "Risco baixo", className: "bg-emerald-400" };
  }

  return { label: "Risco médio", className: "bg-[#FFC107]" };
}

export function DashboardView() {
  const [dashboard, setDashboard] = useState<DashboardData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auctionDateById = useMemo(() => {
    const map = new Map<string, string>();
    dashboard.upcoming_auctions.forEach((auction) => {
      map.set(auction.id, auction.first_auction_at);
    });

    return map;
  }, [dashboard.upcoming_auctions]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Falha ao carregar o painel.");
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
        description="Visão geral do funil de oportunidades em leilões imobiliários."
      />

      {error ? (
        <Panel className="border-red-500/30 bg-red-500/10 text-sm text-red-200">{error}</Panel>
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
        <MetricCard title="Leilões esta semana" value={dashboard.metrics.weekly_auctions} icon={Gavel} />
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
          <h3 className="text-sm font-semibold text-lv-text">Acompanhamento de imóveis</h3>
          <div className="mt-3 space-y-3">
            {dashboard.watchlist.length === 0 ? (
              <p className="text-sm text-lv-textMuted">Nenhum imóvel em acompanhamento.</p>
            ) : (
              dashboard.watchlist.map((property) => {
                const estimatedRoi = getEstimatedRoi(property);
                const risk = getRisk(property);
                const auctionDate = property.auction_id
                  ? auctionDateById.get(property.auction_id)
                  : null;

                return (
                  <div key={property.id} className="overflow-hidden rounded-2xl border border-white/12 bg-[#1D1D21]">
                    <div className="flex h-24 items-center justify-center bg-[linear-gradient(120deg,#232327_0%,#141416_75%)]">
                      <Building2 size={26} className="text-[#FFC107]" />
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="text-sm font-semibold text-white">{property.address}</p>
                      <p className="text-xs text-lv-textMuted">
                        {property.city}/{property.state}
                      </p>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-white/10 bg-black/15 px-2 py-1.5">
                          <p className="text-lv-textMuted">Data do leilão</p>
                          <p className="mt-0.5 text-white">{auctionDate ? formatDate(auctionDate) : "A definir"}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/15 px-2 py-1.5">
                          <p className="text-lv-textMuted">Lance atual</p>
                          <p className="mt-0.5 text-white">{toCurrency(property.min_bid)}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/15 px-2 py-1.5">
                          <p className="text-lv-textMuted">ROI estimado</p>
                          <p className="mt-0.5 text-white">
                            {estimatedRoi !== null ? `${estimatedRoi.toFixed(1)}%` : "-"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/15 px-2 py-1.5">
                          <p className="text-lv-textMuted">Status</p>
                          <p className="mt-0.5 text-white">
                            {propertyStatusLabel[property.status] ?? property.status}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-white/90">
                        <span className={`h-2.5 w-2.5 rounded-full ${risk.className}`} />
                        {risk.label}
                      </div>
                    </div>
                  </div>
                );
              })
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
                <div key={auction.id} className="rounded-xl border border-white/12 bg-[#1D1D21] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">{auction.auctioneer}</p>
                    <CalendarClock size={14} className="text-[#FFC107]" />
                  </div>
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
                <div key={task.id} className="rounded-xl border border-red-500/25 bg-red-500/8 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">{task.name}</p>
                    <ShieldAlert size={14} className="text-red-300" />
                  </div>
                  <p className="mt-1 text-xs text-red-200">Prazo: {formatDate(task.due_date)}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {loading ? <p className="text-sm text-lv-textMuted">Atualizando dados do painel...</p> : null}
    </div>
  );
}
