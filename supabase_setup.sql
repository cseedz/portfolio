-- Portfolio charlesgrenier.com — table du CMS
-- À coller dans le SQL Editor du dashboard Supabase (projet dvivafrldxzhkactsvve), une seule fois.

create table if not exists public.portfolio_cms (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_cms enable row level security;

-- Lecture publique (le site lit le contenu avec la clé anon)
drop policy if exists "portfolio_cms_public_read" on public.portfolio_cms;
create policy "portfolio_cms_public_read"
  on public.portfolio_cms for select
  using (true);

-- Écriture réservée au compte hello@charlesgrenier.com
drop policy if exists "portfolio_cms_owner_insert" on public.portfolio_cms;
create policy "portfolio_cms_owner_insert"
  on public.portfolio_cms for insert to authenticated
  with check (auth.jwt() ->> 'email' = 'hello@charlesgrenier.com');

drop policy if exists "portfolio_cms_owner_update" on public.portfolio_cms;
create policy "portfolio_cms_owner_update"
  on public.portfolio_cms for update to authenticated
  using (auth.jwt() ->> 'email' = 'hello@charlesgrenier.com')
  with check (auth.jwt() ->> 'email' = 'hello@charlesgrenier.com');
