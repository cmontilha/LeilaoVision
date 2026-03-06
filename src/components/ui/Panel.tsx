import { cn } from "@/lib/utils";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-lv-border bg-lv-panel/90 p-4 shadow-[0_8px_30px_rgba(4,10,20,0.45)] backdrop-blur sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
