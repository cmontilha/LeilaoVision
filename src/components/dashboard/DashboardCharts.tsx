"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";

import type { DashboardPoint } from "@/types";

import { Panel } from "@/components/ui/Panel";

interface DashboardChartsProps {
  auctionsByMonth: DashboardPoint[];
  successRate: DashboardPoint[];
  averageRoi: DashboardPoint[];
}

export function DashboardCharts({
  auctionsByMonth,
  successRate,
  averageRoi,
}: DashboardChartsProps) {
  const gridColor = "rgba(230,230,230,0.12)";
  const axisColor = "#C7C7C2";
  const tooltipStyle = {
    background: "#141416",
    border: "1px solid rgba(230,230,230,0.2)",
    borderRadius: 12,
    color: "#FFFFFF",
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel>
        <h3 className="mb-3 text-sm font-semibold text-lv-text">Leilões por mês</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={auctionsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" stroke={axisColor} fontSize={11} />
              <YAxis stroke={axisColor} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#FFC107" fill="rgba(255,193,7,0.32)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-3 text-sm font-semibold text-lv-text">Taxa de sucesso (%)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={successRate}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" stroke={axisColor} fontSize={11} />
              <YAxis stroke={axisColor} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="#FFB300" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-3 text-sm font-semibold text-lv-text">ROI médio (%)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={averageRoi}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" stroke={axisColor} fontSize={11} />
              <YAxis stroke={axisColor} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="#F5F5F2" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
