import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Contact,
  FileText,
  Gavel,
  Home,
  Landmark,
  LineChart,
  Target,
} from "lucide-react";

export const APP_NAV_ITEMS = [
  { label: "Painel", href: "/app/dashboard", icon: Home },
  { label: "Imóveis", href: "/app/imoveis", icon: Building2 },
  { label: "Leilões", href: "/app/leiloes", icon: Gavel },
  { label: "Análise", href: "/app/analise", icon: LineChart },
  { label: "Documentos", href: "/app/documentos", icon: FileText },
  { label: "Tarefas e Prazos", href: "/app/tarefas", icon: ClipboardCheck },
  { label: "Lances", href: "/app/lances", icon: Target },
  { label: "Pós-Leilão", href: "/app/pos-leilao", icon: Landmark },
  { label: "Contatos", href: "/app/contatos", icon: Contact },
  { label: "Relatórios", href: "/app/relatorios", icon: BarChart3 },
] as const;
