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
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel>
        <h3 className="mb-3 text-sm font-semibold text-lv-text">Leilões por mês</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={auctionsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(141,165,200,0.15)" />
              <XAxis dataKey="label" stroke="#8da5c8" fontSize={11} />
              <YAxis stroke="#8da5c8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#0b1220",
                  border: "1px solid #1c2f4f",
                  borderRadius: 12,
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#37b7ff" fill="#37b7ff44" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-3 text-sm font-semibold text-lv-text">Taxa de sucesso (%)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={successRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(141,165,200,0.15)" />
              <XAxis dataKey="label" stroke="#8da5c8" fontSize={11} />
              <YAxis stroke="#8da5c8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#0b1220",
                  border: "1px solid #1c2f4f",
                  borderRadius: 12,
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-3 text-sm font-semibold text-lv-text">ROI médio (%)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={averageRoi}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(141,165,200,0.15)" />
              <XAxis dataKey="label" stroke="#8da5c8" fontSize={11} />
              <YAxis stroke="#8da5c8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#0b1220",
                  border: "1px solid #1c2f4f",
                  borderRadius: 12,
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#7fd7ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
