"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { toCurrency } from "@/lib/utils";
import {
  POST_AUCTION_STATUS,
  type Bid,
  type PostAuction,
  type PostAuctionStatus,
  type Property,
} from "@/types";

const statusLabel: Record<PostAuctionStatus, string> = {
  pagamento_pendente: "Pagamento pendente",
  pagamento_realizado: "Pagamento realizado",
  regularizacao: "Regularização",
  reforma: "Reforma",
  pronto_para_venda: "Pronto para venda",
  vendido: "Vendido",
};

function toneForStatus(status: PostAuctionStatus): "default" | "success" | "warning" | "danger" {
  if (status === "vendido") return "success";
  if (status === "pagamento_pendente") return "danger";
  if (status === "reforma" || status === "regularizacao") return "warning";
  return "default";
}

function toNullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function PostAuctionPage() {
  const postAuction = useResource<PostAuction>("/api/post-auction");
  const properties = useResource<Property>("/api/properties");
  const bids = useResource<Bid>("/api/bids");

  const [form, setForm] = useState({
    property_id: "",
    bid_id: "",
    status: "pagamento_pendente" as PostAuctionStatus,
    payment_amount: "",
    auctioneer_commission: "",
    registry_status: "",
    eviction_status: "",
    renovation_notes: "",
    resale_value: "",
  });

  const propertyMap = useMemo(() => {
    const map = new Map<string, string>();
    properties.data.forEach((property) => map.set(property.id, property.address));
    return map;
  }, [properties.data]);

  async function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await postAuction.create({
      property_id: form.property_id || null,
      bid_id: form.bid_id || null,
      status: form.status,
      payment_amount: toNullableNumber(form.payment_amount),
      auctioneer_commission: toNullableNumber(form.auctioneer_commission),
      registry_status: form.registry_status || null,
      eviction_status: form.eviction_status || null,
      renovation_notes: form.renovation_notes || null,
      resale_value: toNullableNumber(form.resale_value),
    });

    setForm({
      property_id: "",
      bid_id: "",
      status: "pagamento_pendente",
      payment_amount: "",
      auctioneer_commission: "",
      registry_status: "",
      eviction_status: "",
      renovation_notes: "",
      resale_value: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Pós-Leilão"
        description="Acompanhamento da etapa após arrematação: pagamento, regularização, reforma e revenda."
      />

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Novo fluxo pós-leilão</h3>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={createItem}>
          <select
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
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

          <select
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.bid_id}
            onChange={(event) => setForm((prev) => ({ ...prev, bid_id: event.target.value }))}
          >
            <option value="">Vincular lance (opcional)</option>
            {bids.data.map((bid) => (
              <option key={bid.id} value={bid.id}>
                {propertyMap.get(bid.property_id) ?? bid.property_id} - {toCurrency(bid.max_bid)}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.value as PostAuctionStatus }))
            }
          >
            {POST_AUCTION_STATUS.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.payment_amount}
            onChange={(event) => setForm((prev) => ({ ...prev, payment_amount: event.target.value }))}
            placeholder="Pagamento"
          />

          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.auctioneer_commission}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, auctioneer_commission: event.target.value }))
            }
            placeholder="Comissão leiloeiro"
          />

          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.registry_status}
            onChange={(event) => setForm((prev) => ({ ...prev, registry_status: event.target.value }))}
            placeholder="Registro em cartório"
          />
          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.eviction_status}
            onChange={(event) => setForm((prev) => ({ ...prev, eviction_status: event.target.value }))}
            placeholder="Desocupação"
          />
          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.renovation_notes}
            onChange={(event) => setForm((prev) => ({ ...prev, renovation_notes: event.target.value }))}
            placeholder="Notas da reforma"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.resale_value}
            onChange={(event) => setForm((prev) => ({ ...prev, resale_value: event.target.value }))}
            placeholder="Valor de revenda"
          />

          <button className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]">
            Salvar etapa
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle title="Funil pós-arrematação" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Imóvel</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Pagamento</th>
                <th className="px-2 py-3">Comissão</th>
                <th className="px-2 py-3">Revenda</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {postAuction.data.map((item) => (
                <tr key={item.id}>
                  <td className="px-2 py-3 text-lv-text">
                    {propertyMap.get(item.property_id) ?? item.property_id}
                  </td>
                  <td className="px-2 py-3">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        void postAuction.update(item.id, {
                          status: event.target.value as PostAuctionStatus,
                        })
                      }
                      className="rounded-lg border border-lv-border bg-lv-panelMuted px-2 py-1 text-xs"
                    >
                      {POST_AUCTION_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(item.payment_amount)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(item.auctioneer_commission)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(item.resale_value)}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge label={statusLabel[item.status]} tone={toneForStatus(item.status)} />
                      <button
                        type="button"
                        className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                        onClick={() => void postAuction.remove(item.id)}
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
