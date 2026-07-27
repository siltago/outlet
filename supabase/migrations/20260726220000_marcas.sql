-- Marca do produto: entidade própria (mesmo padrão de categorias), opcional
-- — produtos existentes ficam sem marca até serem editados. Filtrável no
-- catálogo público e no admin, igual categoria.

create table public.marcas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem int not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger trg_marcas_atualizado_em
  before update on public.marcas
  for each row execute function public.set_atualizado_em();

alter table public.produtos
  add column marca_id uuid references public.marcas (id) on delete set null;

create index idx_produtos_marca_id on public.produtos (marca_id);

-- ============================================================================
-- RLS: mesmo padrão de categorias — leitura pública, escrita só staff.
-- ============================================================================

alter table public.marcas enable row level security;

create policy "marcas_select_public"
  on public.marcas for select
  to anon, authenticated
  using (true);

create policy "marcas_insert_staff"
  on public.marcas for insert
  to authenticated
  with check (public.is_staff());

create policy "marcas_update_staff"
  on public.marcas for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "marcas_delete_staff"
  on public.marcas for delete
  to authenticated
  using (public.is_staff());

-- ============================================================================
-- Recria vw_catalogo_publico incluindo marca_id/marca_nome/marca_slug — resto
-- da view (cores, fotos, preço "a partir de") permanece igual.
-- ============================================================================

drop view public.vw_catalogo_publico;

create view public.vw_catalogo_publico
with (security_invoker = false)
as
select
  p.id,
  p.nome,
  p.slug,
  p.descricao,
  p.categoria_id,
  c.nome as categoria_nome,
  c.slug as categoria_slug,
  p.marca_id,
  m.nome as marca_nome,
  m.slug as marca_slug,
  p.modalidade_venda,
  p.controle_estoque,
  case
    when p.controle_estoque <> 'quantidade' then null
    when cores.tem_cores then coalesce(cores.quantidade_disponivel, 0)
    else greatest(p.quantidade_atual - p.quantidade_reservada, 0)
  end as quantidade_disponivel,
  coalesce(cores.menor_preco, p.preco_venda) as preco_venda,
  coalesce(cores.tem_cores, false) as tem_cores,
  p.destaque,
  p.criado_em,
  p.atualizado_em,
  coalesce(cores.fotos, capa.fotos, '{}') as fotos
from public.produtos p
join public.categorias c on c.id = p.categoria_id
left join public.marcas m on m.id = p.marca_id
left join lateral (
  select
    true as tem_cores,
    min(pc.preco_venda) as menor_preco,
    sum(greatest(coalesce(pc.quantidade_atual, 0) - pc.quantidade_reservada, 0)) as quantidade_disponivel,
    (
      select array_agg(pf.caminho order by pf.ordem)
      from public.produto_fotos pf
      where pf.cor_id = (
        select pc2.id from public.produto_cores pc2
        where pc2.produto_id = p.id
        order by pc2.ordem
        limit 1
      )
    ) as fotos
  from public.produto_cores pc
  where pc.produto_id = p.id
  group by pc.produto_id
) cores on true
left join lateral (
  select array_agg(pf.caminho order by pf.ordem) as fotos
  from public.produto_fotos pf
  where pf.produto_id = p.id and pf.cor_id is null
) capa on true
where p.ativo = true and p.publicado = true;

grant select on public.vw_catalogo_publico to anon, authenticated;
