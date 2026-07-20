-- Seed de desenvolvimento: categorias iniciais (mesmas do mock anterior).
insert into public.categorias (nome, slug, ordem) values
  ('Smartphones', 'smartphones', 1),
  ('Relógios', 'relogios', 2),
  ('Fones', 'fones', 3),
  ('Perfumes', 'perfumes', 4),
  ('Tênis', 'tenis', 5),
  ('Acessórios', 'acessorios', 6)
on conflict (slug) do nothing;
