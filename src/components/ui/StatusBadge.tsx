import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
}

export function StatusBadge({ label, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border-lv-border bg-lv-panelMuted text-lv-textMuted",
        tone === "success" && "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
        tone === "warning" && "border-amber-500/35 bg-amber-500/10 text-amber-300",
        tone === "danger" && "border-red-500/35 bg-red-500/10 text-red-300",
      )}
    >
      {label}
    </span>
  );
}
