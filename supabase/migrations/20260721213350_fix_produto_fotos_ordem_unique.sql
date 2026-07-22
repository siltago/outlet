-- A constraint unique(produto_id, ordem) foi criada antes de existir cores,
-- então bloqueava numeração repetida entre cores diferentes do mesmo produto
-- (cada cor recomeça a ordem das próprias fotos em 0). Troca por dois índices
-- únicos parciais: um para fotos gerais (sem cor) e outro por cor.

alter table public.produto_fotos drop constraint produto_fotos_produto_id_ordem_key;

create unique index produto_fotos_sem_cor_ordem_key
  on public.produto_fotos (produto_id, ordem)
  where cor_id is null;

create unique index produto_fotos_cor_id_ordem_key
  on public.produto_fotos (cor_id, ordem)
  where cor_id is not null;
