"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { formatDate } from "@/lib/utils";
import { AUCTION_TYPE, type Auction, type AuctionType, type Property } from "@/types";

const auctionTypeLabel: Record<AuctionType, string> = {
  judicial: "Judicial",
  extrajudicial: "Extrajudicial",
  bank: "Banco",
};

function toneForAuctionType(type: AuctionType): "default" | "success" | "warning" | "danger" {
  if (type === "judicial") return "danger";
  if (type === "extrajudicial") return "warning";
  return "success";
}

function toIsoOrNull(value: string): string | null {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T12:00:00.000Z`;
  }

  return new Date(value).toISOString();
}

export default function AuctionsPage() {
  const auctions = useResource<Auction>("/api/auctions");
  const propertiesResource = useResource<Property>("/api/properties");
  const { data: propertiesData, load: loadProperties } = propertiesResource;

  const [form, setForm] = useState({
    auctioneer: "",
    platform: "",
    auction_type: "judicial" as AuctionType,
    first_auction_at: "",
    second_auction_at: "",
    commission_percent: "",
    payment_terms: "",
    notice_url: "",
  });

  const associatedMap = useMemo(() => {
    const map = new Map<string, number>();
    propertiesData.forEach((property) => {
      if (property.auction_id) {
        map.set(property.auction_id, (map.get(property.auction_id) ?? 0) + 1);
      }
    });
    return map;
  }, [propertiesData]);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  async function createAuction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await auctions.create({
      auctioneer: form.auctioneer,
      platform: form.platform || null,
      auction_type: form.auction_type,
      first_auction_at: toIsoOrNull(form.first_auction_at),
      second_auction_at: toIsoOrNull(form.second_auction_at),
      commission_percent: Number(form.commission_percent),
      payment_terms: form.payment_terms || null,
      notice_url: form.notice_url || null,
    });

    setForm({
      auctioneer: "",
      platform: "",
      auction_type: "judicial",
      first_auction_at: "",
      second_auction_at: "",
      commission_percent: "",
      payment_terms: "",
      notice_url: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Leilões"
        description="Gestão de eventos, editais e histórico de mudanças dos leilões monitorados."
      />

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Novo evento de leilão</h3>
        <p className="mb-4 text-xs text-lv-textMuted">
          Preencha a data da 1ª praça obrigatoriamente no formato dia/mês/ano. A data da 2ª praça é opcional.
          Comissão é o percentual do leiloeiro (ex.: 5.00).
        </p>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={createAuction}>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Leiloeiro
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Nome do leiloeiro"
              value={form.auctioneer}
              onChange={(event) => setForm((prev) => ({ ...prev, auctioneer: event.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Plataforma
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Site ou plataforma"
              value={form.platform}
              onChange={(event) => setForm((prev) => ({ ...prev, platform: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Tipo de leilão
            <select
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.auction_type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, auction_type: event.target.value as AuctionType }))
              }
            >
              {AUCTION_TYPE.map((type) => (
                <option key={type} value={type}>
                  {auctionTypeLabel[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Comissão do leiloeiro (%)
            <input
              type="number"
              step="0.01"
              min="0"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Ex.: 5.00"
              value={form.commission_percent}
              onChange={(event) => setForm((prev) => ({ ...prev, commission_percent: event.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Data da 1ª praça
            <input
              type="date"
              lang="pt-BR"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.first_auction_at}
              onChange={(event) => setForm((prev) => ({ ...prev, first_auction_at: event.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Data da 2ª praça (opcional)
            <input
              type="date"
              lang="pt-BR"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              value={form.second_auction_at}
              onChange={(event) => setForm((prev) => ({ ...prev, second_auction_at: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Condições de pagamento
            <input
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="Ex.: à vista, parcelado, sinal"
              value={form.payment_terms}
              onChange={(event) => setForm((prev) => ({ ...prev, payment_terms: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-lv-textMuted">
            Link do edital
            <input
              type="url"
              className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-text"
              placeholder="https://..."
              value={form.notice_url}
              onChange={(event) => setForm((prev) => ({ ...prev, notice_url: event.target.value }))}
            />
          </label>
          <button className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]">
            Salvar leilão
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle
          title="Eventos cadastrados"
          description="Associe imóveis definindo o campo `auction_id` na página de Imóveis."
        />

        {auctions.error ? (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {auctions.error}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Leiloeiro</th>
                <th className="px-2 py-3">Tipo</th>
                <th className="px-2 py-3">1ª praça</th>
                <th className="px-2 py-3">2ª praça</th>
                <th className="px-2 py-3">Comissão</th>
                <th className="px-2 py-3">Imóveis</th>
                <th className="px-2 py-3">Histórico</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {auctions.data.map((auction) => (
                <tr key={auction.id}>
                  <td className="px-2 py-3 text-lv-text">{auction.auctioneer}</td>
                  <td className="px-2 py-3">
                    <StatusBadge
                      label={auctionTypeLabel[auction.auction_type]}
                      tone={toneForAuctionType(auction.auction_type)}
                    />
                  </td>
                  <td className="px-2 py-3 text-lv-textMuted">{formatDate(auction.first_auction_at)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{formatDate(auction.second_auction_at)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{auction.commission_percent}%</td>
                  <td className="px-2 py-3 text-lv-textMuted">{associatedMap.get(auction.id) ?? 0}</td>
                  <td className="px-2 py-3 text-lv-textMuted">Atualizado: {formatDate(auction.updated_at)}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      {auction.notice_url ? (
                        <a
                          href={auction.notice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-lv-border bg-lv-panelMuted p-2 text-lv-textMuted"
                          title="Visualizar edital"
                        >
                          <ExternalLink size={14} />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                        onClick={() => void auctions.remove(auction.id)}
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
