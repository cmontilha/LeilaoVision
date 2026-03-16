"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Shield, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import { SIDEBAR_STORAGE_KEY } from "@/lib/constants";
import { APP_NAV_GROUPS, APP_NAV_ITEMS, type AppNavGroupKey } from "@/lib/nav";
import type { AppRole } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

type AdminSidebarView = "admin" | "user";
const ADMIN_SIDEBAR_VIEW_KEY = "lv_admin_sidebar_view";

const groupTitleClass: Record<AppNavGroupKey, string> = {
  painel: "text-lv-textMuted",
  oportunidades: "text-amber-300",
  financeiro: "text-sky-300",
  operacao: "text-emerald-300",
  rede: "text-rose-300",
  relatorios: "text-orange-300",
  admin: "text-red-300",
};

export function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<AppRole>("user");
  const [adminView, setAdminView] = useState<AdminSidebarView>(pathname.startsWith("/app/admin") ? "admin" : "user");

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as { data?: { role?: AppRole } };

        if (!mounted || !response.ok) {
          return;
        }

        if (payload.data?.role === "admin") {
          setRole("admin");
          return;
        }

        setRole("user");
      } catch {
        if (mounted) {
          setRole("user");
        }
      }
    }

    void loadRole();

    return () => {
      mounted = false;
    };
  }, []);

  const isAdmin = role === "admin";
  const isAdminRoute = pathname.startsWith("/app/admin");

  useEffect(() => {
    if (!isAdmin) {
      setAdminView("user");
      return;
    }

    try {
      const storedView = localStorage.getItem(ADMIN_SIDEBAR_VIEW_KEY);
      if (storedView === "admin" || storedView === "user") {
        setAdminView(storedView);
        return;
      }
    } catch {
      // Ignora indisponibilidade do storage.
    }

    setAdminView(isAdminRoute ? "admin" : "user");
  }, [isAdmin, isAdminRoute]);

  useEffect(() => {
    if (!isAdmin || !isAdminRoute) {
      return;
    }

    setAdminView("admin");
  }, [isAdmin, isAdminRoute]);

  function handleAdminViewChange(nextView: AdminSidebarView) {
    setAdminView(nextView);
    try {
      localStorage.setItem(ADMIN_SIDEBAR_VIEW_KEY, nextView);
    } catch {
      // Ignora indisponibilidade do storage.
    }
  }

  const groupedItems = APP_NAV_GROUPS.map((group) => ({
    ...group,
    items: APP_NAV_ITEMS.filter((item) => {
      if (item.group !== group.key) {
        return false;
      }

      if (!isAdmin) {
        return !item.adminOnly;
      }

      if (adminView === "admin") {
        return item.adminOnly;
      }

      return !item.adminOnly;
    }),
  })).filter((group) => group.items.length > 0);

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
          "fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-[#141416] px-3 py-4 backdrop-blur transition-all duration-200",
          collapsed ? "w-[88px]" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 px-2 pb-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                <Image src="/brand/lv-logo.png" alt="Logo LeilãoVision" fill className="object-cover" sizes="40px" />
              </div>
              <div
                className={cn(
                  "min-w-0 overflow-hidden transition",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                )}
              >
                <p className="truncate text-lg font-semibold tracking-tight text-white">LeilãoVision</p>
                <p className="truncate text-xs text-lv-textMuted">Plataforma de Leilões</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white md:hidden"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="overflow-y-auto pr-1">
            {isAdmin ? (
              <div className={cn("mb-4 grid gap-2", collapsed ? "grid-cols-1" : "grid-cols-2")}>
                <button
                  type="button"
                  onClick={() => handleAdminViewChange("admin")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                    adminView === "admin"
                      ? "border-[#FFC107]/45 bg-[#FFC107]/14 text-white"
                      : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:text-white",
                  )}
                  aria-pressed={adminView === "admin"}
                >
                  <Shield size={16} className={cn(adminView === "admin" ? "text-[#FFC107]" : "text-white/85")} />
                  <span className={cn(collapsed ? "hidden" : "inline")}>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAdminViewChange("user")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                    adminView === "user"
                      ? "border-[#FFC107]/45 bg-[#FFC107]/14 text-white"
                      : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:text-white",
                  )}
                  aria-pressed={adminView === "user"}
                >
                  <User size={16} className={cn(adminView === "user" ? "text-[#FFC107]" : "text-white/85")} />
                  <span className={cn(collapsed ? "hidden" : "inline")}>User</span>
                </button>
              </div>
            ) : null}

            {groupedItems.map((group, index) => (
              <div key={group.key} className={cn(index === 0 ? "space-y-1" : "mt-4 space-y-1")}>
                {group.label ? (
                  <p
                    className={cn(
                      "px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                      groupTitleClass[group.key],
                      collapsed ? "hidden" : "block",
                    )}
                  >
                    {group.label}
                  </p>
                ) : null}

                {group.items.map((item) => {
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
                          ? "border-[#FFC107]/45 bg-[#FFC107]/14 text-white"
                          : "border-transparent text-white/80 hover:border-white/15 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          "shrink-0 transition",
                          active ? "text-[#FFC107]" : "text-white/85 group-hover:text-[#FFC107]",
                        )}
                      />
                      <span className={cn("whitespace-nowrap transition", collapsed ? "hidden" : "block")}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="mt-auto hidden pt-4 md:block">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 p-2 text-sm text-white/80 transition hover:border-[#FFC107]/45 hover:bg-[#FFC107] hover:text-black",
                collapsed ? "px-2" : "px-3",
              )}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <span className={cn("whitespace-nowrap", collapsed ? "hidden" : "inline")}>Recolher menu</span>
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
