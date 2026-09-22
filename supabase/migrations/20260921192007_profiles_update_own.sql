-- Cada admin pode editar a própria linha em profiles (nome exibido no painel).
-- Continua sem policy de insert/delete: quem vira staff é decidido só pelo
-- servidor (convite) ou manualmente, nunca pelo próprio usuário.
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
