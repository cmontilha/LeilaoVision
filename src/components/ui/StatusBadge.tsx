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
        tone === "default" && "border-white/20 bg-white/5 text-[#F5F5F2]",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
        tone === "warning" && "border-[#FFC107]/40 bg-[#FFC107]/20 text-[#F5F5F2]",
        tone === "danger" && "border-red-500/30 bg-red-500/15 text-red-200",
      )}
    >
      {label}
    </span>
  );
}
