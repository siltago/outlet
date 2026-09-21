-- Banners do carrossel da página inicial. Leitura pública só dos ativos;
-- escrita restrita a staff. Cada banner tem uma imagem para desktop e,
-- opcionalmente, outra para celular (senão a de desktop é recortada).

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  imagem_caminho text not null,
  imagem_mobile_caminho text,
  link text check (link is null or char_length(link) <= 500),
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create index banners_ordem_idx on public.banners (ordem, criado_em);

alter table public.banners enable row level security;

create policy "banners_select_public"
  on public.banners for select
  to anon, authenticated
  using (ativo);

create policy "banners_select_staff"
  on public.banners for select
  to authenticated
  using (public.is_staff());

create policy "banners_insert_staff"
  on public.banners for insert
  to authenticated
  with check (public.is_staff());

create policy "banners_update_staff"
  on public.banners for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "banners_delete_staff"
  on public.banners for delete
  to authenticated
  using (public.is_staff());

grant select on public.banners to anon, authenticated;
grant insert, update, delete on public.banners to authenticated;

-- ============================================================================
-- STORAGE: bucket de imagens dos banners (público; escrita só staff)
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banners',
  'banners',
  true,
  8388608, -- 8MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
);

create policy "banners_bucket_select_staff"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'banners' and public.is_staff());

create policy "banners_bucket_insert_staff"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'banners' and public.is_staff());

create policy "banners_bucket_update_staff"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'banners' and public.is_staff());

create policy "banners_bucket_delete_staff"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'banners' and public.is_staff());
