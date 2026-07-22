-- Ícone escolhido pelo admin ao criar a categoria (chave de um catálogo fixo
-- no app, ver lib/category-icons.tsx — não é upload de imagem).
alter table public.categorias
  add column icone text;

-- Preenche as categorias já existentes com um ícone razoável, para não ficar
-- em branco no site enquanto o admin não edita.
update public.categorias set icone = case slug
  when 'smartphones' then 'smartphone'
  when 'relogios' then 'smartwatch'
  when 'fones' then 'fone'
  when 'perfumes' then 'perfume'
  when 'tenis' then 'tenis'
  when 'acessorios' then 'acessorio'
  else 'outro'
end
where icone is null;
