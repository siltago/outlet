-- Banners passaram a usar um formato único (1920x720) para computador e
-- celular; a coluna de imagem separada para mobile nunca chegou a ser usada
-- em produção com dados reais.
alter table public.banners drop column imagem_mobile_caminho;
