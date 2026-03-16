import {
  Activity,
  BarChart3,
  Building2,
  ClipboardCheck,
  ListChecks,
  Contact,
  FileText,
  Gavel,
  Home,
  Landmark,
  LineChart,
  ShieldAlert,
  Shield,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const APP_NAV_GROUPS = [
  { key: "admin", label: "Administração" },
  { key: "painel", label: "" },
  { key: "oportunidades", label: "Oportunidades" },
  { key: "financeiro", label: "Simulação financeira" },
  { key: "operacao", label: "Operação" },
  { key: "rede", label: "Rede de apoio" },
  { key: "relatorios", label: "Relatórios" },
] as const;

export type AppNavGroupKey = (typeof APP_NAV_GROUPS)[number]["key"];

export interface AppNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: AppNavGroupKey;
  adminOnly?: boolean;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: "Painel", href: "/app/dashboard", icon: Home, group: "painel" },
  { label: "Imóveis", href: "/app/imoveis", icon: Building2, group: "oportunidades" },
  { label: "Leilões", href: "/app/leiloes", icon: Gavel, group: "oportunidades" },
  { label: "Análise", href: "/app/analise", icon: LineChart, group: "financeiro" },
  { label: "Documentos", href: "/app/documentos", icon: FileText, group: "operacao" },
  {
    label: "Checklist de Diligência",
    href: "/app/checklist",
    icon: ListChecks,
    group: "operacao",
  },
  {
    label: "Tarefas e Prazos",
    href: "/app/tarefas",
    icon: ClipboardCheck,
    group: "operacao",
  },
  { label: "Lances", href: "/app/lances", icon: Target, group: "operacao" },
  { label: "Pós-Leilão", href: "/app/pos-leilao", icon: Landmark, group: "operacao" },
  { label: "Contatos", href: "/app/contatos", icon: Contact, group: "rede" },
  { label: "Relatórios", href: "/app/relatorios", icon: BarChart3, group: "relatorios" },
  { label: "Painel do Admin", href: "/app/admin", icon: Shield, group: "admin", adminOnly: true },
  { label: "Usuários", href: "/app/admin/users", icon: Users, group: "admin", adminOnly: true },
  { label: "Métricas", href: "/app/admin/metricas", icon: BarChart3, group: "admin", adminOnly: true },
  { label: "Status", href: "/app/admin/status", icon: Activity, group: "admin", adminOnly: true },
  {
    label: "Segurança",
    href: "/app/admin/seguranca",
    icon: ShieldAlert,
    group: "admin",
    adminOnly: true,
  },
];
