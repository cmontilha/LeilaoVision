"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { toCurrency } from "@/lib/utils";
import { BID_STATUS, type Auction, type Bid, type BidStatus, type Property } from "@/types";

const statusLabel: Record<BidStatus, string> = {
  planned: "Planejado",
  submitted: "Enviado",
  lost: "Perdido",
  won: "Arrematado",
};

function toneForStatus(status: BidStatus): "default" | "success" | "warning" | "danger" {
  if (status === "won") return "success";
  if (status === "lost") return "danger";
  if (status === "submitted") return "warning";
  return "default";
}

function toNullableNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function BidsPage() {
  const bids = useResource<Bid>("/api/bids");
  const properties = useResource<Property>("/api/properties");
  const auctions = useResource<Auction>("/api/auctions");

  const [form, setForm] = useState({
    property_id: "",
    auction_id: "",
    max_bid: "",
    placed_bid: "",
    status: "planned" as BidStatus,
  });

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    properties.data.forEach((property) => map.set(property.id, property.address));
    return map;
  }, [properties.data]);

  const auctionMap = useMemo(() => {
    const map = new Map<string, string>();
    auctions.data.forEach((auction) => map.set(auction.id, auction.auctioneer));
    return map;
  }, [auctions.data]);

  async function createBid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await bids.create({
      property_id: form.property_id || null,
      auction_id: form.auction_id || null,
      max_bid: Number(form.max_bid),
      placed_bid: toNullableNumber(form.placed_bid),
      status: form.status,
    });

    setForm({
      property_id: "",
      auction_id: "",
      max_bid: "",
      placed_bid: "",
      status: "planned",
    });
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Lances"
        description="Controle de estratégia de lances por imóvel e leilão."
      />

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Novo lance</h3>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={createBid}>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Imóvel
            <select
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.property_id}
              onChange={(event) => setForm((prev) => ({ ...prev, property_id: event.target.value }))}
              required
            >
              <option value="">Selecione o imóvel</option>
              {properties.data.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Leilão
            <select
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.auction_id}
              onChange={(event) => setForm((prev) => ({ ...prev, auction_id: event.target.value }))}
              required
            >
              <option value="">Selecione o leilão</option>
              {auctions.data.map((auction) => (
                <option key={auction.id} value={auction.id}>
                  {auction.auctioneer}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Lance máximo (R$)
            <input
              type="number"
              step="0.01"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.max_bid}
              onChange={(event) => setForm((prev) => ({ ...prev, max_bid: event.target.value }))}
              placeholder="Ex.: 240000"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Lance realizado (R$)
            <input
              type="number"
              step="0.01"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.placed_bid}
              onChange={(event) => setForm((prev) => ({ ...prev, placed_bid: event.target.value }))}
              placeholder="Ex.: 230000"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Status do lance
            <select
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as BidStatus }))
              }
            >
              {BID_STATUS.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </label>

          <button className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]">
            Salvar lance
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle title="Estratégia de lances" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Imóvel</th>
                <th className="px-2 py-3">Leilão</th>
                <th className="px-2 py-3">Lance máximo (R$)</th>
                <th className="px-2 py-3">Lance realizado (R$)</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {bids.data.map((bid) => (
                <tr key={bid.id}>
                  <td className="px-2 py-3 text-lv-text">{propertyMap.get(bid.property_id) ?? bid.property_id}</td>
                  <td className="px-2 py-3 text-lv-textMuted">
                    {auctionMap.get(bid.auction_id) ?? bid.auction_id}
                  </td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(bid.max_bid)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(bid.placed_bid)}</td>
                  <td className="px-2 py-3">
                    <select
                      value={bid.status}
                      onChange={(event) =>
                        void bids.update(bid.id, { status: event.target.value as BidStatus })
                      }
                      className="rounded-lg border border-lv-border bg-lv-panelMuted px-2 py-1 text-xs text-lv-text"
                    >
                      {BID_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge label={statusLabel[bid.status]} tone={toneForStatus(bid.status)} />
                      <button
                        type="button"
                        className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                        onClick={() => void bids.remove(bid.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
