-- Etapa 2: catálogo administrável (categorias, produtos, fotos, auth admin).
-- Não inclui vendas, clientes, reservas ou financeiro.

-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.modalidade_venda as enum ('pronta_entrega', 'sob_encomenda', 'ambos');
create type public.controle_estoque as enum ('quantidade', 'sem_controle');

-- ============================================================================
-- TABELAS
-- ============================================================================

-- Equipe autorizada a acessar o painel administrativo. Uma linha aqui é o que
-- transforma um usuário do Supabase Auth em "staff" — criada manualmente pelo
-- painel do Supabase (ver instruções de deploy).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  papel text not null default 'admin' check (papel in ('admin')),
  criado_em timestamptz not null default now()
);

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem int not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text not null default '',
  categoria_id uuid not null references public.categorias (id) on delete restrict,
  modalidade_venda public.modalidade_venda not null,
  controle_estoque public.controle_estoque not null,
  quantidade_atual int,
  quantidade_reservada int not null default 0,
  quantidade_minima int,
  preco_custo numeric(12, 2),
  preco_venda numeric(12, 2) not null,
  ativo boolean not null default true,
  publicado boolean not null default false,
  destaque boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint chk_preco_venda_nao_negativo check (preco_venda >= 0),
  constraint chk_preco_custo_nao_negativo check (preco_custo is null or preco_custo >= 0),

  -- sob_encomenda nunca controla quantidade (não faz sentido reservar estoque
  -- de algo que ainda não existe no depósito).
  constraint chk_sob_encomenda_sem_controle check (
    modalidade_venda <> 'sob_encomenda' or controle_estoque = 'sem_controle'
  ),

  -- pronta_entrega e ambos exigem controle de quantidade.
  constraint chk_pronta_entrega_exige_quantidade check (
    modalidade_venda = 'sob_encomenda' or controle_estoque = 'quantidade'
  ),

  -- sem_controle nunca guarda números de estoque.
  constraint chk_sem_controle_quantidades_null check (
    controle_estoque <> 'sem_controle'
    or (quantidade_atual is null and quantidade_minima is null)
  ),

  -- controle por quantidade sempre guarda números de estoque.
  constraint chk_quantidade_exige_valores check (
    controle_estoque <> 'quantidade'
    or (quantidade_atual is not null and quantidade_minima is not null)
  ),

  constraint chk_quantidades_nao_negativas check (
    (quantidade_atual is null or quantidade_atual >= 0)
    and (quantidade_minima is null or quantidade_minima >= 0)
    and quantidade_reservada >= 0
  ),

  constraint chk_reservada_nao_supera_atual check (
    quantidade_atual is null or quantidade_reservada <= quantidade_atual
  )
);

create table public.produto_fotos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  caminho text not null,
  ordem int not null default 0,
  criado_em timestamptz not null default now(),

  unique (produto_id, ordem)
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

create index idx_produtos_categoria_id on public.produtos (categoria_id);
create index idx_produtos_publicado_ativo on public.produtos (publicado, ativo);
create index idx_produtos_destaque on public.produtos (destaque) where destaque = true;
create index idx_produto_fotos_produto_id on public.produto_fotos (produto_id, ordem);
create index idx_categorias_slug on public.categorias (slug);

-- ============================================================================
-- atualizado_em automático
-- ============================================================================

create function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_categorias_atualizado_em
  before update on public.categorias
  for each row execute function public.set_atualizado_em();

create trigger trg_produtos_atualizado_em
  before update on public.produtos
  for each row execute function public.set_atualizado_em();

-- ============================================================================
-- Helper de autorização: existe linha em profiles para o usuário autenticado?
-- security definer para não depender de policy de select em profiles (evita
-- recursão) e para não expor a tabela inteira via RLS mais permissiva.
-- ============================================================================

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- ============================================================================
-- VIEW PÚBLICA DO CATÁLOGO
-- Nunca expõe preco_custo, quantidade_reservada, quantidade_minima ou
-- qualquer outro dado interno. security_invoker = false (padrão): a view
-- roda com o privilégio de quem a criou, contornando a RLS das tabelas base
-- de forma controlada — é o único caminho de leitura pública dos produtos.
-- ============================================================================

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
    when p.controle_estoque = 'quantidade'
      then greatest(p.quantidade_atual - p.quantidade_reservada, 0)
    else null
  end as quantidade_disponivel,
  p.preco_venda,
  p.destaque,
  p.criado_em,
  p.atualizado_em,
  coalesce(
    (
      select array_agg(f.caminho order by f.ordem)
      from public.produto_fotos f
      where f.produto_id = p.id
    ),
    '{}'
  ) as fotos
from public.produtos p
join public.categorias c on c.id = p.categoria_id
where p.ativo = true and p.publicado = true;

grant select on public.vw_catalogo_publico to anon, authenticated;

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_fotos enable row level security;

-- profiles: cada usuário só enxerga a própria linha. Nenhuma policy de
-- insert/update/delete é criada de propósito — a promoção a staff só
-- acontece manualmente pelo painel do Supabase ou com a service role,
-- nunca pelo próprio usuário autenticado.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- categorias: leitura pública (não há dado sensível), escrita só para staff.
create policy "categorias_select_public"
  on public.categorias for select
  to anon, authenticated
  using (true);

create policy "categorias_insert_staff"
  on public.categorias for insert
  to authenticated
  with check (public.is_staff());

create policy "categorias_update_staff"
  on public.categorias for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "categorias_delete_staff"
  on public.categorias for delete
  to authenticated
  using (public.is_staff());

-- produtos: acesso direto à tabela é só para staff (dados internos como
-- preco_custo moram aqui). O público lê via vw_catalogo_publico.
create policy "produtos_select_staff"
  on public.produtos for select
  to authenticated
  using (public.is_staff());

create policy "produtos_insert_staff"
  on public.produtos for insert
  to authenticated
  with check (public.is_staff());

create policy "produtos_update_staff"
  on public.produtos for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "produtos_delete_staff"
  on public.produtos for delete
  to authenticated
  using (public.is_staff());

-- produto_fotos: mesmo padrão de produtos; as fotos públicas chegam via o
-- array "fotos" da view, resolvido para URL pública do bucket no client.
create policy "produto_fotos_select_staff"
  on public.produto_fotos for select
  to authenticated
  using (public.is_staff());

create policy "produto_fotos_insert_staff"
  on public.produto_fotos for insert
  to authenticated
  with check (public.is_staff());

create policy "produto_fotos_update_staff"
  on public.produto_fotos for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "produto_fotos_delete_staff"
  on public.produto_fotos for delete
  to authenticated
  using (public.is_staff());

-- ============================================================================
-- STORAGE: bucket de fotos de produto
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produto-fotos',
  'produto-fotos',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/webp']
);

-- Bucket público: leitura via getPublicUrl não passa pela RLS abaixo (é o
-- comportamento padrão do Storage para buckets públicos). A policy de select
-- fica como defesa em profundidade para acesso autenticado/assinado.
create policy "produto_fotos_bucket_select_staff"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'produto-fotos');

create policy "produto_fotos_bucket_insert_staff"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produto-fotos');

create policy "produto_fotos_bucket_update_staff"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produto-fotos');

create policy "produto_fotos_bucket_delete_staff"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produto-fotos');
