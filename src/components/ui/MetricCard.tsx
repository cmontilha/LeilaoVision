import type { LucideIcon } from "lucide-react";

import { toCurrency } from "@/lib/utils";

import { Panel } from "./Panel";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  currency?: boolean;
}

export function MetricCard({ title, value, icon: Icon, currency }: MetricCardProps) {
  return (
    <Panel className="relative overflow-hidden border-lv-neon/25 bg-gradient-to-br from-lv-panel to-lv-panelMuted">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-lv-neon/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-lv-textMuted">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-lv-text">
            {currency ? toCurrency(value) : new Intl.NumberFormat("pt-BR").format(value)}
          </p>
        </div>
        <span className="rounded-lg border border-lv-neon/30 bg-lv-neon/10 p-2 text-lv-neon">
          <Icon size={18} />
        </span>
      </div>
    </Panel>
  );
}
