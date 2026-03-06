-- LeilaoVision initial schema

create extension if not exists pgcrypto;

create type property_status as enum (
  'analyzing',
  'approved',
  'rejected',
  'ready_for_bid',
  'bid_submitted',
  'won'
);

create type auction_type as enum ('judicial', 'extrajudicial', 'bank');
create type bid_status as enum ('planned', 'submitted', 'lost', 'won');
create type task_priority as enum ('low', 'medium', 'high');
create type document_type as enum ('edital', 'matricula', 'processo', 'fotos', 'relatorio');
create type task_status as enum ('pending', 'in_progress', 'done', 'late');
create type contact_type as enum ('advogado', 'corretor', 'engenheiro', 'despachante', 'cartorio');
create type post_auction_status as enum (
  'pagamento_pendente',
  'pagamento_realizado',
  'regularizacao',
  'reforma',
  'pronto_para_venda',
  'vendido'
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  auctioneer text not null,
  platform text,
  auction_type auction_type not null,
  first_auction_at timestamptz not null,
  second_auction_at timestamptz,
  commission_percent numeric(8,2) not null default 0,
  payment_terms text,
  notice_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  auction_id uuid references public.auctions(id) on delete set null,
  address text not null,
  city text not null,
  state text not null,
  property_type text not null,
  size_sqm numeric(10,2),
  occupied boolean not null default false,
  market_value numeric(14,2),
  min_bid numeric(14,2),
  renovation_cost numeric(14,2),
  status property_status not null default 'analyzing',
  watchlist boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  market_value numeric(14,2) not null,
  max_bid numeric(14,2) not null,
  estimated_sale_value numeric(14,2) not null,
  renovation_cost numeric(14,2) not null default 0,
  legal_cost numeric(14,2) not null default 0,
  itbi_cost numeric(14,2) not null default 0,
  registration_cost numeric(14,2) not null default 0,
  eviction_cost numeric(14,2) not null default 0,
  estimated_profit numeric(14,2) not null default 0,
  roi_percent numeric(8,2) not null default 0,
  safety_margin numeric(8,2) not null default 0,
  break_even_value numeric(14,2) not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  auction_id uuid not null references public.auctions(id) on delete cascade,
  max_bid numeric(14,2) not null,
  placed_bid numeric(14,2),
  status bid_status not null default 'planned',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  type document_type not null,
  file_name text not null,
  storage_path text not null,
  file_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  due_date timestamptz not null,
  priority task_priority not null default 'medium',
  status task_status not null default 'pending',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type contact_type not null,
  name text not null,
  role text,
  company text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  period_start timestamptz,
  period_end timestamptz,
  avg_roi numeric(8,2),
  success_rate numeric(8,2),
  invested_capital numeric(14,2),
  discarded_properties integer,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.post_auction (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  bid_id uuid references public.bids(id) on delete set null,
  status post_auction_status not null default 'pagamento_pendente',
  payment_amount numeric(14,2),
  auctioneer_commission numeric(14,2),
  registry_status text,
  eviction_status text,
  renovation_notes text,
  resale_value numeric(14,2),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists auctions_user_id_idx on public.auctions(user_id);
create index if not exists properties_user_id_idx on public.properties(user_id);
create index if not exists properties_status_idx on public.properties(status);
create index if not exists bids_user_id_idx on public.bids(user_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists post_auction_user_id_idx on public.post_auction(user_id);

create trigger set_updated_at_auctions
before update on public.auctions
for each row execute function public.handle_updated_at();

create trigger set_updated_at_properties
before update on public.properties
for each row execute function public.handle_updated_at();

create trigger set_updated_at_analysis
before update on public.analysis
for each row execute function public.handle_updated_at();

create trigger set_updated_at_bids
before update on public.bids
for each row execute function public.handle_updated_at();

create trigger set_updated_at_documents
before update on public.documents
for each row execute function public.handle_updated_at();

create trigger set_updated_at_tasks
before update on public.tasks
for each row execute function public.handle_updated_at();

create trigger set_updated_at_contacts
before update on public.contacts
for each row execute function public.handle_updated_at();

create trigger set_updated_at_reports
before update on public.reports
for each row execute function public.handle_updated_at();

create trigger set_updated_at_post_auction
before update on public.post_auction
for each row execute function public.handle_updated_at();

alter table public.properties enable row level security;
alter table public.auctions enable row level security;
alter table public.analysis enable row level security;
alter table public.bids enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.contacts enable row level security;
alter table public.reports enable row level security;
alter table public.post_auction enable row level security;

create policy "properties_select_own"
on public.properties
for select
using (auth.uid() = user_id);

create policy "properties_insert_own"
on public.properties
for insert
with check (auth.uid() = user_id);

create policy "properties_update_own"
on public.properties
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "properties_delete_own"
on public.properties
for delete
using (auth.uid() = user_id);

create policy "auctions_select_own"
on public.auctions
for select
using (auth.uid() = user_id);

create policy "auctions_insert_own"
on public.auctions
for insert
with check (auth.uid() = user_id);

create policy "auctions_update_own"
on public.auctions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "auctions_delete_own"
on public.auctions
for delete
using (auth.uid() = user_id);

create policy "analysis_select_own"
on public.analysis
for select
using (auth.uid() = user_id);

create policy "analysis_insert_own"
on public.analysis
for insert
with check (auth.uid() = user_id);

create policy "analysis_update_own"
on public.analysis
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "analysis_delete_own"
on public.analysis
for delete
using (auth.uid() = user_id);

create policy "bids_select_own"
on public.bids
for select
using (auth.uid() = user_id);

create policy "bids_insert_own"
on public.bids
for insert
with check (auth.uid() = user_id);

create policy "bids_update_own"
on public.bids
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "bids_delete_own"
on public.bids
for delete
using (auth.uid() = user_id);

create policy "documents_select_own"
on public.documents
for select
using (auth.uid() = user_id);

create policy "documents_insert_own"
on public.documents
for insert
with check (auth.uid() = user_id);

create policy "documents_update_own"
on public.documents
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "documents_delete_own"
on public.documents
for delete
using (auth.uid() = user_id);

create policy "tasks_select_own"
on public.tasks
for select
using (auth.uid() = user_id);

create policy "tasks_insert_own"
on public.tasks
for insert
with check (auth.uid() = user_id);

create policy "tasks_update_own"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tasks_delete_own"
on public.tasks
for delete
using (auth.uid() = user_id);

create policy "contacts_select_own"
on public.contacts
for select
using (auth.uid() = user_id);

create policy "contacts_insert_own"
on public.contacts
for insert
with check (auth.uid() = user_id);

create policy "contacts_update_own"
on public.contacts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "contacts_delete_own"
on public.contacts
for delete
using (auth.uid() = user_id);

create policy "reports_select_own"
on public.reports
for select
using (auth.uid() = user_id);

create policy "reports_insert_own"
on public.reports
for insert
with check (auth.uid() = user_id);

create policy "reports_update_own"
on public.reports
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "reports_delete_own"
on public.reports
for delete
using (auth.uid() = user_id);

create policy "post_auction_select_own"
on public.post_auction
for select
using (auth.uid() = user_id);

create policy "post_auction_insert_own"
on public.post_auction
for insert
with check (auth.uid() = user_id);

create policy "post_auction_update_own"
on public.post_auction
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "post_auction_delete_own"
on public.post_auction
for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "documents_storage_select_own"
on storage.objects
for select
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "documents_storage_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "documents_storage_update_own"
on storage.objects
for update
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "documents_storage_delete_own"
on storage.objects
for delete
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);
