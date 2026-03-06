"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { toCurrency } from "@/lib/utils";
import { PROPERTY_STATUS, type Property, type PropertyStatus } from "@/types";

const statusLabel: Record<PropertyStatus, string> = {
  analyzing: "Analisando",
  approved: "Aprovado",
  rejected: "Rejeitado",
  ready_for_bid: "Pronto para lance",
  bid_submitted: "Lance realizado",
  won: "Arrematado",
};

function toNullableNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toneForStatus(status: PropertyStatus): "default" | "success" | "warning" | "danger" {
  if (status === "won" || status === "approved") return "success";
  if (status === "ready_for_bid" || status === "bid_submitted") return "warning";
  if (status === "rejected") return "danger";
  return "default";
}

export default function PropertiesPage() {
  const {
    data: properties,
    loading: propertiesLoading,
    error: propertiesError,
    load: loadProperties,
    create: createPropertyRecord,
    update: updateProperty,
    remove: removeProperty,
  } = useResource<Property>("/api/properties", { autoLoad: false });
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [feedback, setFeedback] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Record<string, unknown>>({});

  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    property_type: "Apartamento",
    size_sqm: "",
    occupied: false,
    market_value: "",
    min_bid: "",
    renovation_cost: "",
    status: "analyzing" as PropertyStatus,
    watchlist: true,
    auction_id: "",
  });

  const cities = useMemo(() => {
    const set = new Set(properties.map((property) => property.city));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [properties]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (cityFilter) params.set("city", cityFilter);
    if (statusFilter) params.set("status", statusFilter);

    void loadProperties(params.toString());
  }, [search, cityFilter, statusFilter, loadProperties]);

  function startEdit(property: Property) {
    setEditingId(property.id);
    setEditingDraft({
      address: property.address,
      city: property.city,
      state: property.state,
      property_type: property.property_type,
      market_value: property.market_value,
      min_bid: property.min_bid,
      renovation_cost: property.renovation_cost,
      status: property.status,
      occupied: property.occupied,
    });
  }

  async function saveEdit(id: string) {
    await updateProperty(id, editingDraft);
    setEditingId(null);
    setEditingDraft({});
    setFeedback("Imóvel atualizado com sucesso.");
  }

  async function createProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    try {
      await createPropertyRecord({
        address: form.address,
        city: form.city,
        state: form.state,
        property_type: form.property_type,
        size_sqm: toNullableNumber(form.size_sqm),
        occupied: form.occupied,
        market_value: toNullableNumber(form.market_value),
        min_bid: toNullableNumber(form.min_bid),
        renovation_cost: toNullableNumber(form.renovation_cost),
        status: form.status,
        watchlist: form.watchlist,
        auction_id: form.auction_id || null,
      });

      setForm({
        address: "",
        city: "",
        state: "",
        property_type: "Apartamento",
        size_sqm: "",
        occupied: false,
        market_value: "",
        min_bid: "",
        renovation_cost: "",
        status: "analyzing",
        watchlist: true,
        auction_id: "",
      });

      setFeedback("Imóvel criado com sucesso.");
    } catch (error) {
      setFeedback(String(error));
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Imóveis"
        description="Gestão completa de imóveis analisados para oportunidades em leilão."
      />

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Novo imóvel</h3>
        <form onSubmit={createProperty} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Endereço"
            required
          />
          <input
            value={form.city}
            onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Cidade"
            required
          />
          <input
            value={form.state}
            onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value.toUpperCase() }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Estado (UF)"
            maxLength={2}
            required
          />
          <input
            value={form.property_type}
            onChange={(event) => setForm((prev) => ({ ...prev, property_type: event.target.value }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Tipo"
            required
          />
          <input
            value={form.size_sqm}
            onChange={(event) => setForm((prev) => ({ ...prev, size_sqm: event.target.value }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Metragem"
            type="number"
            step="0.01"
          />
          <input
            value={form.market_value}
            onChange={(event) => setForm((prev) => ({ ...prev, market_value: event.target.value }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Valor de mercado"
            type="number"
            step="0.01"
          />
          <input
            value={form.min_bid}
            onChange={(event) => setForm((prev) => ({ ...prev, min_bid: event.target.value }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Lance mínimo"
            type="number"
            step="0.01"
          />
          <input
            value={form.renovation_cost}
            onChange={(event) => setForm((prev) => ({ ...prev, renovation_cost: event.target.value }))}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Reforma estimada"
            type="number"
            step="0.01"
          />
          <select
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.value as PropertyStatus }))
            }
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
          >
            {PROPERTY_STATUS.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted">
            <input
              type="checkbox"
              checked={form.occupied}
              onChange={(event) => setForm((prev) => ({ ...prev, occupied: event.target.checked }))}
            />
            Ocupado
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted">
            <input
              type="checkbox"
              checked={form.watchlist}
              onChange={(event) => setForm((prev) => ({ ...prev, watchlist: event.target.checked }))}
            />
            Acompanhamento
          </label>
          <button className="rounded-xl border border-lv-neon/40 bg-lv-neon/10 px-4 py-2 text-sm font-medium text-lv-neon">
            Salvar imóvel
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle
          title="Tabela de imóveis"
          description="Busca por endereço, filtro por cidade e status, com edição inline."
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            placeholder="Buscar por endereço"
          />

          <select
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
          >
            <option value="">Todas as cidades</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            {PROPERTY_STATUS.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>
        </div>

        {feedback ? (
          <p className="mb-4 rounded-lg border border-lv-neon/30 bg-lv-neon/10 px-3 py-2 text-xs text-lv-neon">
            {feedback}
          </p>
        ) : null}

        {propertiesError ? (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {propertiesError}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Endereço</th>
                <th className="px-2 py-3">Cidade/UF</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Mercado</th>
                <th className="px-2 py-3">Lance mín.</th>
                <th className="px-2 py-3">Ocupado</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {properties.map((property) => {
                const editing = editingId === property.id;

                return (
                  <tr key={property.id} className="text-lv-textMuted">
                    <td className="px-2 py-3">
                      {editing ? (
                        <input
                          value={String(editingDraft.address ?? "")}
                          onChange={(event) =>
                            setEditingDraft((prev) => ({ ...prev, address: event.target.value }))
                          }
                          className="w-full rounded-lg border border-lv-border bg-lv-panelMuted px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-lv-text">{property.address}</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {editing ? (
                        <div className="flex gap-2">
                          <input
                            value={String(editingDraft.city ?? "")}
                            onChange={(event) =>
                              setEditingDraft((prev) => ({ ...prev, city: event.target.value }))
                            }
                            className="w-full rounded-lg border border-lv-border bg-lv-panelMuted px-2 py-1 text-sm"
                          />
                          <input
                            value={String(editingDraft.state ?? "")}
                            onChange={(event) =>
                              setEditingDraft((prev) => ({ ...prev, state: event.target.value.toUpperCase() }))
                            }
                            maxLength={2}
                            className="w-16 rounded-lg border border-lv-border bg-lv-panelMuted px-2 py-1 text-sm"
                          />
                        </div>
                      ) : (
                        <span>
                          {property.city}/{property.state}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {editing ? (
                        <select
                          value={String(editingDraft.status ?? property.status)}
                          onChange={(event) =>
                            setEditingDraft((prev) => ({
                              ...prev,
                              status: event.target.value as PropertyStatus,
                            }))
                          }
                          className="rounded-lg border border-lv-border bg-lv-panelMuted px-2 py-1 text-sm"
                        >
                          {PROPERTY_STATUS.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge
                          label={statusLabel[property.status]}
                          tone={toneForStatus(property.status)}
                        />
                      )}
                    </td>
                    <td className="px-2 py-3">{toCurrency(property.market_value)}</td>
                    <td className="px-2 py-3">{toCurrency(property.min_bid)}</td>
                    <td className="px-2 py-3">{property.occupied ? "Sim" : "Não"}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        {editing ? (
                          <>
                            <button
                              type="button"
                              className="rounded-lg border border-lv-neon/40 bg-lv-neon/10 p-2 text-lv-neon"
                              onClick={() => void saveEdit(property.id)}
                            >
                              <Save size={14} />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-lv-border bg-lv-panelMuted p-2 text-lv-textMuted"
                              onClick={() => {
                                setEditingId(null);
                                setEditingDraft({});
                              }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="rounded-lg border border-lv-border bg-lv-panelMuted p-2 text-lv-textMuted"
                            onClick={() => startEdit(property)}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                          onClick={() => void removeProperty(property.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {propertiesLoading ? <p className="mt-3 text-xs text-lv-textMuted">Carregando imóveis...</p> : null}
      </Panel>
    </div>
  );
}
