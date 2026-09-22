-- Convites para novos administradores. O admin gera um link de uso único; quem
-- recebe cadastra nome, e-mail e senha em /admin/convite/<token>. Só o hash do
-- token fica no banco (o link completo é exibido uma única vez, na criação).
--
-- RLS ligada e SEM policies de propósito: ninguém acessa esta tabela pela API
-- pública (anon/authenticated). Somente o servidor, com a service role, lê e
-- escreve aqui, sempre depois de checar staff (requireStaff) ou validar o token.

create table public.convites_admin (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  criado_por uuid references auth.users (id) on delete set null,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  usado_em timestamptz,
  usado_por uuid references auth.users (id) on delete set null
);

alter table public.convites_admin enable row level security;

revoke all on public.convites_admin from anon, authenticated;
grant all on public.convites_admin to service_role;
