"use client";

import Link from "next/link";
import { Menu, ChevronDown, Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Auction, Task } from "@/types";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const NOTIFICATION_SETTINGS_KEY = "lv_notification_settings";
const NOTIFICATION_SEEN_KEY = "lv_seen_notifications";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "danger" | "warning" | "info";
  timestamp: number;
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>("Investidor");
  const [email, setEmail] = useState<string>("investidor@leilaovision.com");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyAuctions, setNotifyAuctions] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadInAppNotifications = useCallback(
    async (markAsRead = false) => {
      setNotificationLoading(true);
      setNotificationError("");

      try {
        const [tasksResponse, auctionsResponse] = await Promise.all([
          fetch("/api/tasks", { cache: "no-store" }),
          fetch("/api/auctions", { cache: "no-store" }),
        ]);

        if (!tasksResponse.ok || !auctionsResponse.ok) {
          throw new Error("Falha ao carregar notificações.");
        }

        const tasksPayload = (await tasksResponse.json()) as { data?: Task[] };
        const auctionsPayload = (await auctionsResponse.json()) as { data?: Auction[] };
        const tasks = tasksPayload.data ?? [];
        const auctions = auctionsPayload.data ?? [];

        const now = Date.now();
        const within48h = now + 48 * 60 * 60 * 1000;
        const within24h = now + 24 * 60 * 60 * 1000;
        const nextItems: NotificationItem[] = [];

        if (notifyDeadlines) {
          tasks.forEach((task) => {
            if (task.status === "done") return;

            const dueAt = new Date(task.due_date).getTime();
            if (!Number.isFinite(dueAt)) return;

            if (dueAt < now) {
              nextItems.push({
                id: `task-overdue-${task.id}`,
                title: "Tarefa atrasada",
                description: `${task.name} • prazo ${formatDate(task.due_date)}`,
                href: "/app/tarefas",
                tone: "danger",
                timestamp: dueAt,
              });
              return;
            }

            if (dueAt <= within48h) {
              nextItems.push({
                id: `task-soon-${task.id}`,
                title: "Prazo próximo",
                description: `${task.name} • vence em ${formatDate(task.due_date)}`,
                href: "/app/tarefas",
                tone: "warning",
                timestamp: dueAt,
              });
            }
          });
        }

        if (notifyAuctions) {
          const pushAuctionNotification = (
            auction: Auction,
            dateValue: string | null,
            phaseLabel: "1ª praça" | "2ª praça",
          ) => {
            if (!dateValue) return;
            const auctionAt = new Date(dateValue).getTime();
            if (!Number.isFinite(auctionAt)) return;
            if (auctionAt < now || auctionAt > within24h) return;

            nextItems.push({
              id: `auction-${phaseLabel}-${auction.id}`,
              title: `${phaseLabel} em até 24h`,
              description: `${auction.auctioneer} • ${formatDate(dateValue)}`,
              href: "/app/leiloes",
              tone: "info",
              timestamp: auctionAt,
            });
          };

          auctions.forEach((auction) => {
            pushAuctionNotification(auction, auction.first_auction_at, "1ª praça");
            pushAuctionNotification(auction, auction.second_auction_at, "2ª praça");
          });
        }

        const sorted = nextItems.sort((a, b) => a.timestamp - b.timestamp).slice(0, 10);

        let seenIds: string[] = [];
        try {
          const rawSeen = localStorage.getItem(NOTIFICATION_SEEN_KEY);
          const parsed = rawSeen ? (JSON.parse(rawSeen) as unknown) : [];
          if (Array.isArray(parsed)) {
            seenIds = parsed.filter((item): item is string => typeof item === "string");
          }
        } catch {
          seenIds = [];
        }

        const seenSet = new Set(seenIds);
        const unread = sorted.filter((item) => !seenSet.has(item.id)).length;

        if (markAsRead) {
          sorted.forEach((item) => seenSet.add(item.id));
          localStorage.setItem(NOTIFICATION_SEEN_KEY, JSON.stringify([...seenSet]));
          setUnreadCount(0);
        } else {
          setUnreadCount(unread);
        }

        setNotificationItems(sorted);
      } catch {
        setNotificationError("Não foi possível carregar notificações agora.");
        setNotificationItems([]);
        setUnreadCount(0);
      } finally {
        setNotificationLoading(false);
      }
    },
    [notifyAuctions, notifyDeadlines],
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
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
    }

    const rawNotifications = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (rawNotifications) {
      try {
        const parsed = JSON.parse(rawNotifications) as {
          notifyEmail?: boolean;
          notifyDeadlines?: boolean;
          notifyAuctions?: boolean;
        };
        if (typeof parsed.notifyEmail === "boolean") setNotifyEmail(parsed.notifyEmail);
        if (typeof parsed.notifyDeadlines === "boolean") setNotifyDeadlines(parsed.notifyDeadlines);
        if (typeof parsed.notifyAuctions === "boolean") setNotifyAuctions(parsed.notifyAuctions);
      } catch {
        // Ignora conteúdo inválido.
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    function onProfileUpdated() {
      void loadUser();
    }

    function onClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    }

    window.addEventListener("lv-profile-updated", onProfileUpdated);
    window.addEventListener("click", onClickOutside);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("lv-profile-updated", onProfileUpdated);
      window.removeEventListener("click", onClickOutside);
    };
  }, []);

  useEffect(() => {
    void loadInAppNotifications(false);
  }, [loadInAppNotifications]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/set-session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  function saveNotificationSettings() {
    localStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify({ notifyEmail, notifyDeadlines, notifyAuctions }),
    );
    setNotificationMessage("Preferências de notificações salvas.");
    void loadInAppNotifications(false);
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

        <div ref={dropdownRef} className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const nextOpen = !notificationsOpen;
                setNotificationsOpen(nextOpen);
                setMenuOpen(false);
                setNotificationMessage("");
                if (nextOpen) {
                  void loadInAppNotifications(true);
                }
              }}
              className="relative rounded-xl border border-white/15 bg-[#141416] p-2.5 text-white transition hover:border-[#FFC107]/35 hover:text-[#FFC107]"
              aria-label="Notificações"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFC107] px-1 text-[10px] font-semibold text-black">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/15 bg-[#141416] p-3 shadow-neon">
                <p className="text-sm font-semibold text-white">Notificações</p>
                <p className="mt-1 text-xs text-lv-textMuted">Defina como deseja receber alertas da plataforma.</p>

                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(event) => setNotifyEmail(event.target.checked)}
                    />
                    Alertas por e-mail
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted">
                    <input
                      type="checkbox"
                      checked={notifyDeadlines}
                      onChange={(event) => setNotifyDeadlines(event.target.checked)}
                    />
                    Prazo próximo (tarefas)
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm text-lv-textMuted">
                    <input
                      type="checkbox"
                      checked={notifyAuctions}
                      onChange={(event) => setNotifyAuctions(event.target.checked)}
                    />
                    Leilões das próximas 24h
                  </label>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-lv-textMuted">Alertas in-app</p>
                  {notificationLoading ? (
                    <p className="mt-2 text-xs text-lv-textMuted">Carregando alertas...</p>
                  ) : notificationError ? (
                    <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {notificationError}
                    </p>
                  ) : notificationItems.length === 0 ? (
                    <p className="mt-2 text-xs text-lv-textMuted">Sem alertas no momento.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {notificationItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setNotificationsOpen(false)}
                          className="block rounded-lg border border-lv-border bg-lv-panelMuted px-3 py-2 transition hover:border-white/20"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-2 w-2 rounded-full ${
                                item.tone === "danger"
                                  ? "bg-red-400"
                                  : item.tone === "warning"
                                    ? "bg-amber-400"
                                    : "bg-sky-400"
                              }`}
                            />
                            <div>
                              <p className="text-xs font-medium text-white">{item.title}</p>
                              <p className="text-xs text-lv-textMuted">{item.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {notificationMessage ? (
                  <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                    {notificationMessage}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={saveNotificationSettings}
                  className="mt-3 w-full rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]"
                >
                  Salvar notificações
                </button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((current) => !current);
                setNotificationsOpen(false);
              }}
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
                  href="/app/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
                >
                  Perfil
                </Link>
                <Link
                  href="/app/configuracoes"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
                >
                  Configurações
                </Link>
                <Link
                  href="/app/ajuda"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
                >
                  Documentação / Ajuda
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
      </div>
    </header>
  );
}
