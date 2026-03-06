"use client";

import { useEffect, useState } from "react";

import { SIDEBAR_STORAGE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { Header } from "./Header";
import { Sidebar, saveSidebarCollapsedState } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const value = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (value) {
        setCollapsed(JSON.parse(value));
      }
    } catch {
      setCollapsed(false);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      saveSidebarCollapsedState(next);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={toggleCollapsed}
      />

      <div
        className={cn(
          "min-h-screen transition-all duration-200",
          collapsed ? "md:ml-[88px]" : "md:ml-[280px]",
        )}
      >
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
