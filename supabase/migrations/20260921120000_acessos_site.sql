-- Contagem de acessos ao site público (card do dashboard admin: últimos 30 dias).
-- Um registro por sessão de navegação; "visitante" é um id aleatório guardado no
-- navegador (sem dado pessoal). Qualquer um pode inserir, ninguém pode ler
-- direto: a leitura só acontece pela função abaixo, restrita a staff.

create table public.acessos_site (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  visitante text not null check (char_length(visitante) <= 64),
  caminho text not null check (char_length(caminho) <= 200)
);

create index acessos_site_criado_em_idx on public.acessos_site (criado_em);

alter table public.acessos_site enable row level security;

create policy "acessos_site_insert_public"
  on public.acessos_site for insert
  to anon, authenticated
  with check (true);

revoke all on public.acessos_site from anon, authenticated;
grant insert on public.acessos_site to anon, authenticated;

create function public.resumo_acessos_30d()
returns table (acessos bigint, visitantes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint, count(distinct visitante)::bigint
  from public.acessos_site
  where criado_em >= now() - interval '30 days'
    and public.is_staff();
$$;

revoke all on function public.resumo_acessos_30d() from public, anon;
grant execute on function public.resumo_acessos_30d() to authenticated;
