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
    <Panel className="relative overflow-hidden border-white/15 bg-gradient-to-b from-lv-panel to-lv-panelMuted">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-lv-neon/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-lv-textMuted">{title}</p>
          <p className="mt-2 text-3xl font-bold text-lv-text">
            {currency ? toCurrency(value) : new Intl.NumberFormat("pt-BR").format(value)}
          </p>
        </div>
        <span className="rounded-lg border border-lv-neon/40 bg-lv-neon px-2.5 py-2 text-black">
          <Icon size={18} />
        </span>
      </div>
    </Panel>
  );
}
