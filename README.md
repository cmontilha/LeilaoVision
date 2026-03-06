# LeilãoVision

SaaS web para análise e acompanhamento de leilões de imóveis.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript strict
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage, RLS)
- Recharts
- Lucide React
- @vercel/analytics

## Estrutura

- `src/app` - rotas e APIs (`/api/*`)
- `src/components` - componentes reutilizáveis
- `src/lib` - utilitários, Supabase, validações, cálculos financeiros
- `src/types` - domínio e tipos do banco
- `supabase/migrations` - migration SQL

## Configuração

1. Copie `.env.example` para `.env.local`.
2. Preencha as variáveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Rode a migration SQL em `supabase/migrations/202603050001_init_leilaovision.sql` no seu projeto Supabase.

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Módulos

- Dashboard
- Imóveis
- Leilões
- Análise
- Documentos
- Tarefas e Prazos
- Lances
- Pós-Leilão
- Contatos
- Relatórios

## Segurança

- Middleware protege `/app/*` e redireciona autenticação conforme estado da sessão.
- RLS habilitado em todas as tabelas com políticas por `user_id = auth.uid()`.
- Upload de documentos com políticas por pasta de usuário no Storage.
