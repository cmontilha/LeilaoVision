"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { SIDEBAR_STORAGE_KEY } from "@/lib/constants";
import { APP_NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
        role="button"
        tabIndex={-1}
        aria-label="Fechar menu"
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-lv-border bg-lv-panel/95 px-3 py-4 backdrop-blur transition-all duration-200",
          collapsed ? "w-[88px]" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 px-2 pb-4">
            <div
              className={cn(
                "overflow-hidden transition",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              <p className="text-lg font-semibold tracking-tight">LeilãoVision</p>
              <p className="text-xs text-lv-textMuted">CRM de Leilões</p>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg border border-lv-border bg-lv-panelMuted p-2 text-lv-textMuted transition hover:text-lv-neon md:hidden"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto">
            {APP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                    active
                      ? "border-lv-neon/40 bg-lv-neon/15 text-lv-neon"
                      : "border-transparent text-lv-textMuted hover:border-lv-border hover:bg-lv-panelMuted hover:text-lv-text",
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className={cn("whitespace-nowrap transition", collapsed ? "hidden" : "block")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden pt-4 md:block">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border border-lv-border bg-lv-panelMuted p-2 text-sm text-lv-textMuted transition hover:border-lv-neon/50 hover:text-lv-neon",
                collapsed ? "px-2" : "px-3",
              )}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <span className={cn("whitespace-nowrap", collapsed ? "hidden" : "inline")}>
                Recolher menu
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function saveSidebarCollapsedState(collapsed: boolean) {
  localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(collapsed));
}
