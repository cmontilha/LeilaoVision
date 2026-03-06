"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useResource } from "@/lib/hooks/useResource";
import { calculateFinancialAnalysis } from "@/lib/financial/calculations";
import { formatDate, toCurrency, toPercent } from "@/lib/utils";
import type { Property, PropertyAnalysis } from "@/types";

function numeric(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AnalysisPage() {
  const analysis = useResource<PropertyAnalysis>("/api/analysis");
  const properties = useResource<Property>("/api/properties");

  const [form, setForm] = useState({
    property_id: "",
    market_value: "0",
    max_bid: "0",
    estimated_sale_value: "0",
    renovation_cost: "0",
    legal_cost: "0",
    itbi_cost: "0",
    registration_cost: "0",
    eviction_cost: "0",
  });

  const calc = useMemo(() => {
    return calculateFinancialAnalysis({
      marketValue: numeric(form.market_value),
      maxBid: numeric(form.max_bid),
      estimatedSaleValue: numeric(form.estimated_sale_value),
      renovationCost: numeric(form.renovation_cost),
      legalCost: numeric(form.legal_cost),
      itbiCost: numeric(form.itbi_cost),
      registrationCost: numeric(form.registration_cost),
      evictionCost: numeric(form.eviction_cost),
    });
  }, [form]);

  const chartData = [
    { label: "Total de custo", value: calc.totalCost },
    { label: "Venda estimada", value: numeric(form.estimated_sale_value) },
    { label: "Lucro", value: calc.estimatedProfit },
  ];

  async function saveAnalysis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await analysis.create({
      property_id: form.property_id || null,
      market_value: numeric(form.market_value),
      max_bid: numeric(form.max_bid),
      estimated_sale_value: numeric(form.estimated_sale_value),
      renovation_cost: numeric(form.renovation_cost),
      legal_cost: numeric(form.legal_cost),
      itbi_cost: numeric(form.itbi_cost),
      registration_cost: numeric(form.registration_cost),
      eviction_cost: numeric(form.eviction_cost),
    });
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Análise Financeira"
        description="Calcule automaticamente lucro estimado, ROI, margem de segurança e break even."
      />

      <Panel>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={saveAnalysis}>
          <select
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.property_id}
            onChange={(event) => setForm((prev) => ({ ...prev, property_id: event.target.value }))}
          >
            <option value="">Selecionar imóvel (opcional)</option>
            {properties.data.map((property) => (
              <option key={property.id} value={property.id}>
                {property.address}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.market_value}
            onChange={(event) => setForm((prev) => ({ ...prev, market_value: event.target.value }))}
            placeholder="Valor de mercado"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.max_bid}
            onChange={(event) => setForm((prev) => ({ ...prev, max_bid: event.target.value }))}
            placeholder="Lance máximo"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.estimated_sale_value}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, estimated_sale_value: event.target.value }))
            }
            placeholder="Valor estimado de venda"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.renovation_cost}
            onChange={(event) => setForm((prev) => ({ ...prev, renovation_cost: event.target.value }))}
            placeholder="Custo de reforma"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.legal_cost}
            onChange={(event) => setForm((prev) => ({ ...prev, legal_cost: event.target.value }))}
            placeholder="Custo jurídico"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.itbi_cost}
            onChange={(event) => setForm((prev) => ({ ...prev, itbi_cost: event.target.value }))}
            placeholder="ITBI"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.registration_cost}
            onChange={(event) => setForm((prev) => ({ ...prev, registration_cost: event.target.value }))}
            placeholder="Registro"
          />
          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.eviction_cost}
            onChange={(event) => setForm((prev) => ({ ...prev, eviction_cost: event.target.value }))}
            placeholder="Desocupação"
          />

          <button className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]">
            Salvar análise
          </button>
        </form>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <p className="text-xs text-lv-textMuted">Lucro estimado</p>
          <p className="mt-2 text-2xl font-semibold text-lv-text">{toCurrency(calc.estimatedProfit)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-lv-textMuted">ROI</p>
          <p className="mt-2 text-2xl font-semibold text-lv-text">{toPercent(calc.roiPercent)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-lv-textMuted">Margem de segurança</p>
          <p className="mt-2 text-2xl font-semibold text-lv-text">{toPercent(calc.safetyMargin)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-lv-textMuted">Break even</p>
          <p className="mt-2 text-2xl font-semibold text-lv-text">{toCurrency(calc.breakEvenValue)}</p>
        </Panel>
      </div>

      <Panel>
        <h3 className="mb-3 text-sm font-semibold text-lv-text">Gráfico de rentabilidade</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(230,230,230,0.12)" />
              <XAxis dataKey="label" stroke="#C7C7C2" fontSize={11} />
              <YAxis stroke="#C7C7C2" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#141416",
                  border: "1px solid rgba(230,230,230,0.2)",
                  borderRadius: 12,
                }}
                formatter={(value: number) => toCurrency(value)}
              />
              <Bar dataKey="value" fill="#FFC107" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <SectionTitle title="Análises salvas" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Data</th>
                <th className="px-2 py-3">Lance máximo</th>
                <th className="px-2 py-3">Venda estimada</th>
                <th className="px-2 py-3">Lucro</th>
                <th className="px-2 py-3">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {analysis.data.map((item) => (
                <tr key={item.id}>
                  <td className="px-2 py-3 text-lv-textMuted">{formatDate(item.created_at)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(item.max_bid)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(item.estimated_sale_value)}</td>
                  <td className="px-2 py-3 text-lv-text">{toCurrency(item.estimated_profit)}</td>
                  <td className="px-2 py-3 text-lv-text">{toPercent(item.roi_percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
