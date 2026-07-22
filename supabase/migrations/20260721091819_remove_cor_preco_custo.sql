-- O preço de custo não varia por cor na prática — é o mesmo produto, só o
-- preço de venda muda. Mantém o custo só em `produtos` (fonte única) e tira
-- a coluna redundante de `produto_cores`.

alter table public.produto_cores
  drop constraint if exists chk_cor_preco_custo_nao_negativo;

alter table public.produto_cores
  drop column if exists preco_custo;
