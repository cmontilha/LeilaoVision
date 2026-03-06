import {
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
  Target,
} from "lucide-react";

export const APP_NAV_GROUPS = [
  { key: "painel", label: "" },
  { key: "oportunidades", label: "Oportunidades" },
  { key: "financeiro", label: "Simulação financeira" },
  { key: "operacao", label: "Operação" },
  { key: "rede", label: "Rede de apoio" },
  { key: "relatorios", label: "Relatórios" },
] as const;

export type AppNavGroupKey = (typeof APP_NAV_GROUPS)[number]["key"];

export const APP_NAV_ITEMS = [
  { label: "Painel", href: "/app/dashboard", icon: Home, group: "painel" as AppNavGroupKey },
  { label: "Imóveis", href: "/app/imoveis", icon: Building2, group: "oportunidades" as AppNavGroupKey },
  { label: "Leilões", href: "/app/leiloes", icon: Gavel, group: "oportunidades" as AppNavGroupKey },
  { label: "Análise", href: "/app/analise", icon: LineChart, group: "financeiro" as AppNavGroupKey },
  { label: "Documentos", href: "/app/documentos", icon: FileText, group: "operacao" as AppNavGroupKey },
  {
    label: "Checklist de Diligência",
    href: "/app/checklist",
    icon: ListChecks,
    group: "operacao" as AppNavGroupKey,
  },
  {
    label: "Tarefas e Prazos",
    href: "/app/tarefas",
    icon: ClipboardCheck,
    group: "operacao" as AppNavGroupKey,
  },
  { label: "Lances", href: "/app/lances", icon: Target, group: "operacao" as AppNavGroupKey },
  { label: "Pós-Leilão", href: "/app/pos-leilao", icon: Landmark, group: "operacao" as AppNavGroupKey },
  { label: "Contatos", href: "/app/contatos", icon: Contact, group: "rede" as AppNavGroupKey },
  { label: "Relatórios", href: "/app/relatorios", icon: BarChart3, group: "relatorios" as AppNavGroupKey },
] as const;
