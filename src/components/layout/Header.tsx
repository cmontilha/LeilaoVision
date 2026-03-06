"use client";

import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

function getFirstName(value: string): string {
  const normalized = value.replace(/[._-]+/g, " ").trim();
  const [first] = normalized.split(/\s+/);
  if (!first) {
    return "Investidor";
  }

  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>("Investidor");
  const [email, setEmail] = useState<string>("investidor@leilaovision.com");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) {
        return;
      }

      if (user.email) {
        setEmail(user.email);
      }

      const metadata = user.user_metadata;
      const metadataName =
        (typeof metadata?.first_name === "string" && metadata.first_name) ||
        (typeof metadata?.full_name === "string" && metadata.full_name) ||
        (typeof metadata?.name === "string" && metadata.name) ||
        user.email?.split("@")[0] ||
        "Investidor";

      setFirstName(getFirstName(metadataName));
    });

    function onClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/set-session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0B0C]/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="rounded-lg border border-white/15 bg-white/5 p-2 text-white/85 transition hover:border-[#FFC107]/35 hover:text-[#FFC107] md:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-xs font-semibold uppercase tracking-[0.18em] text-lv-textMuted">LeilãoVision</h1>
            <p className="text-lg font-semibold text-white">Painel de Investimentos</p>
          </div>
        </div>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white transition hover:border-[#FFC107]/35"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FFC107]/40 bg-[#FFC107] text-xs font-semibold text-[#111111]">
              {firstName.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-[140px] truncate text-lv-textMuted sm:block">{firstName}</span>
            <ChevronDown size={16} className="text-lv-textMuted" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/15 bg-[#141416] p-1 shadow-neon">
              <div className="px-3 py-2 text-xs text-lv-textMuted">{email}</div>
              <Link
                href="/app/dashboard"
                className="block rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
              >
                Perfil
              </Link>
              <Link
                href="/app/dashboard"
                className="block rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
              >
                Configurações
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/12"
              >
                Sair
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
