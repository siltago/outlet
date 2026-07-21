-- Cores/variações de produto: cada cor tem preço e estoque próprios; fotos
-- podem ser associadas a uma cor específica. Produtos sem nenhuma linha aqui
-- continuam funcionando exatamente como antes (preço/estoque no próprio
-- produto, fotos com cor_id null).

create table public.produto_cores (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  nome text not null,
  preco_custo numeric(12, 2),
  preco_venda numeric(12, 2) not null,
  quantidade_atual int,
  quantidade_minima int,
  quantidade_reservada int not null default 0,
  ordem int not null default 0,
  criado_em timestamptz not null default now(),

  constraint chk_cor_preco_venda_nao_negativo check (preco_venda >= 0),
  constraint chk_cor_preco_custo_nao_negativo check (preco_custo is null or preco_custo >= 0),
  constraint chk_cor_quantidades_nao_negativas check (
    (quantidade_atual is null or quantidade_atual >= 0)
    and (quantidade_minima is null or quantidade_minima >= 0)
    and quantidade_reservada >= 0
  ),
  constraint chk_cor_reservada_nao_supera_atual check (
    quantidade_atual is null or quantidade_reservada <= quantidade_atual
  ),

  unique (produto_id, nome)
);

create index idx_produto_cores_produto_id on public.produto_cores (produto_id, ordem);

alter table public.produto_fotos
  add column cor_id uuid references public.produto_cores (id) on delete cascade;

create index idx_produto_fotos_cor_id on public.produto_fotos (cor_id, ordem);

-- ============================================================================
-- RLS: mesmo padrão staff-only de produtos/produto_fotos. Leitura pública só
-- acontece através das views abaixo (security_invoker = false).
-- ============================================================================

alter table public.produto_cores enable row level security;

create policy "produto_cores_select_staff"
  on public.produto_cores for select
  to authenticated
  using (public.is_staff());

create policy "produto_cores_insert_staff"
  on public.produto_cores for insert
  to authenticated
  with check (public.is_staff());

create policy "produto_cores_update_staff"
  on public.produto_cores for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "produto_cores_delete_staff"
  on public.produto_cores for delete
  to authenticated
  using (public.is_staff());

-- ============================================================================
-- Recria vw_catalogo_publico considerando cores: quando o produto tem cores,
-- preço = menor preço entre elas ("a partir de"), estoque = soma das
-- quantidades disponíveis, foto de capa = primeira foto da primeira cor
-- (cai para as fotos gerais do produto se a cor ainda não tiver foto).
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

-- ============================================================================
-- View pública das cores de um produto — usada na página de produto para
-- montar o seletor de cor com preço/estoque/fotos de cada uma.
-- ============================================================================

create view public.vw_produto_cores_publico
with (security_invoker = false)
as
select
  pc.id,
  pc.produto_id,
  pc.nome,
  pc.preco_venda,
  case
    when p.controle_estoque = 'quantidade'
      then greatest(coalesce(pc.quantidade_atual, 0) - pc.quantidade_reservada, 0)
    else null
  end as quantidade_disponivel,
  pc.ordem,
  coalesce(
    (
      select array_agg(pf.caminho order by pf.ordem)
      from public.produto_fotos pf
      where pf.cor_id = pc.id
    ),
    '{}'
  ) as fotos
from public.produto_cores pc
join public.produtos p on p.id = pc.produto_id
where p.ativo = true and p.publicado = true;

grant select on public.vw_produto_cores_publico to anon, authenticated;
