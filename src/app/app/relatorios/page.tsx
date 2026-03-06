"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Trash2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useResource } from "@/lib/hooks/useResource";
import { formatDate, toCurrency, toPercent } from "@/lib/utils";
import type { DashboardData, Report } from "@/types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function toIsoOrNull(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function buildCsv(metrics: { label: string; value: string }[], reports: Report[]): string {
  const lines = ["Indicador,Valor", ...metrics.map((metric) => `${metric.label},${metric.value}`), "", "Relatórios", "Nome,Período,ROI Médio,Taxa de Sucesso,Capital Investido,Descartados"];

  reports.forEach((report) => {
    lines.push(
      [
        report.name,
        `${formatDate(report.period_start)} - ${formatDate(report.period_end)}`,
        String(report.avg_roi ?? 0),
        String(report.success_rate ?? 0),
        String(report.invested_capital ?? 0),
        String(report.discarded_properties ?? 0),
      ].join(","),
    );
  });

  return lines.join("\n");
}

export default function ReportsPage() {
  const reports = useResource<Report>("/api/reports");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [form, setForm] = useState({
    name: "Relatório de investimento",
    period_start: "",
    period_end: "",
  });

  useEffect(() => {
    async function loadDashboard() {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      if (!response.ok) return;

      const payload = await response.json();
      setDashboard(payload.data as DashboardData);
    }

    void loadDashboard();
  }, []);

  const summary = useMemo(() => {
    if (!dashboard) {
      return {
        avgRoi: 0,
        successRate: 0,
        investedCapital: 0,
        discarded: 0,
      };
    }

    const avgRoi = average(dashboard.average_roi.map((item) => item.value));
    const successRate = average(dashboard.success_rate.map((item) => item.value));
    const investedCapital = dashboard.metrics.invested_capital;
    const discarded =
      dashboard.metrics.total_properties - dashboard.metrics.ready_for_bid - dashboard.metrics.won_properties;

    return {
      avgRoi,
      successRate,
      investedCapital,
      discarded: discarded > 0 ? discarded : 0,
    };
  }, [dashboard]);

  const metricRows = [
    { label: "ROI médio", value: toPercent(summary.avgRoi) },
    { label: "Taxa de sucesso", value: toPercent(summary.successRate) },
    { label: "Capital investido", value: toCurrency(summary.investedCapital) },
    { label: "Imóveis descartados", value: String(summary.discarded) },
  ];

  async function createReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await reports.create({
      name: form.name,
      period_start: toIsoOrNull(form.period_start),
      period_end: toIsoOrNull(form.period_end),
      avg_roi: summary.avgRoi,
      success_rate: summary.successRate,
      invested_capital: summary.investedCapital,
      discarded_properties: summary.discarded,
    });
  }

  function exportCsv() {
    const csv = buildCsv(metricRows, reports.data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-leilaovision-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const popup = window.open("", "_blank");
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Relatório LeilãoVision</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Relatório de Investimento - LeilãoVision</h1>
          <p>Gerado em ${new Date().toLocaleString("pt-BR")}</p>
          <table>
            <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
            <tbody>
              ${metricRows.map((row) => `<tr><td>${row.label}</td><td>${row.value}</td></tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Relatórios"
        description="Geração e exportação de indicadores de desempenho do investimento."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              type="button"
              onClick={exportPdf}
              className="inline-flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted"
            >
              <FileText size={15} />
              PDF
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricRows.map((metric) => (
          <Panel key={metric.label}>
            <p className="text-xs text-lv-textMuted">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-lv-text">{metric.value}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Salvar novo relatório</h3>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={createReport}>
          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nome do relatório"
            required
          />
          <input
            type="date"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.period_start}
            onChange={(event) => setForm((prev) => ({ ...prev, period_start: event.target.value }))}
          />
          <input
            type="date"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.period_end}
            onChange={(event) => setForm((prev) => ({ ...prev, period_end: event.target.value }))}
          />
          <button className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]">
            Salvar relatório
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle title="Relatórios gerados" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Nome</th>
                <th className="px-2 py-3">Período</th>
                <th className="px-2 py-3">ROI médio</th>
                <th className="px-2 py-3">Taxa de sucesso</th>
                <th className="px-2 py-3">Capital investido</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {reports.data.map((report) => (
                <tr key={report.id}>
                  <td className="px-2 py-3 text-lv-text">{report.name}</td>
                  <td className="px-2 py-3 text-lv-textMuted">
                    {formatDate(report.period_start)} - {formatDate(report.period_end)}
                  </td>
                  <td className="px-2 py-3 text-lv-textMuted">{toPercent(report.avg_roi)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{toPercent(report.success_rate)}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{toCurrency(report.invested_capital)}</td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                      onClick={() => void reports.remove(report.id)}
                    >
                      <Trash2 size={14} />
                    </button>
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
