import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface HelpSection {
  title: string;
  route: string;
  description: string;
  howToUse: string;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    title: "Painel",
    route: "/app/dashboard",
    description: "Visão executiva com KPIs, gráficos, alertas e próximos leilões.",
    howToUse: "Use como ponto inicial diário para priorizar oportunidades e prazos críticos.",
  },
  {
    title: "Imóveis",
    route: "/app/imoveis",
    description: "Cadastro e acompanhamento de imóveis em análise, com status e filtros.",
    howToUse: "Cadastre endereço, valores, status e URL de origem para manter cada oportunidade rastreável.",
  },
  {
    title: "Leilões",
    route: "/app/leiloes",
    description: "Gestão dos eventos de leilão, datas das praças, comissão e edital.",
    howToUse: "Registre os dados do evento e vincule ao imóvel para manter histórico e calendário atualizados.",
  },
  {
    title: "Análise",
    route: "/app/analise",
    description: "Simulação financeira com cálculo de lucro estimado, ROI, margem e break even.",
    howToUse: "Preencha custos e projeções antes do lance para validar viabilidade financeira.",
  },
  {
    title: "Documentos",
    route: "/app/documentos",
    description: "Armazenamento em pastas por tipo de documento, com upload e consulta por imóvel.",
    howToUse: "Mantenha edital, matrícula, processo, fotos e relatório organizados por oportunidade.",
  },
  {
    title: "Checklist de Diligência",
    route: "/app/checklist",
    description: "Checklist operacional, jurídico, financeiro e técnico antes de ofertar lance.",
    howToUse: "Marque os itens concluídos e personalize os seus próprios itens para padronizar a análise.",
  },
  {
    title: "Tarefas e Prazos",
    route: "/app/tarefas",
    description: "Controle de tarefas com data limite, prioridade e status de execução.",
    howToUse: "Centralize pendências por imóvel e acompanhe alertas de atraso e vencimento próximo.",
  },
  {
    title: "Lances",
    route: "/app/lances",
    description: "Plano de estratégia de lance com valor máximo e resultado de participação.",
    howToUse: "Defina teto de lance e registre resultados para analisar taxa de sucesso do processo.",
  },
  {
    title: "Pós-Leilão",
    route: "/app/pos-leilao",
    description: "Fluxo pós-arrematação: pagamento, regularização, reforma e revenda.",
    howToUse: "Acompanhe as etapas após ganhar o leilão para garantir execução completa do investimento.",
  },
  {
    title: "Contatos",
    route: "/app/contatos",
    description: "Rede de profissionais de apoio: jurídico, técnico, comercial e operacional.",
    howToUse: "Registre parceiros estratégicos e mantenha histórico de contatos para cada operação.",
  },
  {
    title: "Relatórios",
    route: "/app/relatorios",
    description: "Consolidação de métricas como ROI, capital investido e taxa de sucesso.",
    howToUse: "Use para revisar performance e exportar dados para tomada de decisão.",
  },
  {
    title: "Perfil",
    route: "/app/perfil",
    description: "Atualização de dados pessoais exibidos no sistema.",
    howToUse: "Mantenha seu nome completo atualizado para identificação consistente da conta.",
  },
  {
    title: "Configurações",
    route: "/app/configuracoes",
    description: "Gerenciamento de credenciais e segurança da conta.",
    howToUse: "Altere a senha informando a senha atual para reforçar segurança de acesso.",
  },
  {
    title: "Notificações (Header)",
    route: "/app/dashboard",
    description: "Central de alertas in-app para tarefas próximas/atrasadas e leilões em 24h.",
    howToUse: "Ajuste preferências e acompanhe alertas no ícone de sino no topo da aplicação.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Documentação / Ajuda"
        description="Guia completo do LeilãoVision, com explicação de cada seção da plataforma."
      />

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-lv-border bg-lv-panelMuted p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-lv-textMuted">Como usar o app</p>
            <h3 className="mt-1 text-base font-semibold text-lv-text">Fluxo recomendado de operação</h3>
            <p className="mt-1 text-sm text-lv-textMuted">
              Cadastre o imóvel, vincule ao leilão, faça a análise financeira, organize os documentos, valide o
              checklist e execute o plano de lance.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border border-[#FFC107]/40 bg-[#FFC107]/12 px-3 py-1 text-xs font-medium text-amber-200">
            <BookOpenText size={14} />
            Guia ativo
          </span>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {HELP_SECTIONS.map((section) => (
          <Panel key={section.title} className="h-full">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-lv-text">{section.title}</h3>
                <Link
                  href={section.route}
                  className="rounded-lg border border-lv-border bg-lv-panelMuted px-2.5 py-1 text-xs text-lv-textMuted transition hover:border-[#FFC107]/40 hover:text-[#FFC107]"
                >
                  Abrir seção
                </Link>
              </div>

              <p className="text-sm text-lv-textMuted">{section.description}</p>

              <div className="rounded-lg border border-lv-border/70 bg-lv-panelMuted px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-lv-textMuted">Como usar</p>
                <p className="mt-1 text-sm text-lv-text">{section.howToUse}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
