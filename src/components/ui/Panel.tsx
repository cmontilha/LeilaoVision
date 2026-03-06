import { cn } from "@/lib/utils";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/15 bg-lv-panel/95 p-4 shadow-neon backdrop-blur sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
