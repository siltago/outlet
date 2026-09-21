import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/admin";

const INVITE_TTL_DAYS = 7;

export interface TeamMember {
  id: string;
  nome: string | null;
  email: string | null;
  criadoEm: string;
}

export interface PendingInvite {
  id: string;
  criadoEm: string;
  expiraEm: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createInvite(createdBy: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await createServiceClient()
    .from("convites_admin")
    .insert({ token_hash: hashToken(token), criado_por: createdBy, expira_em: expiraEm });
  if (error) throw new Error("Não foi possível criar o convite.");

  return token;
}

export async function listPendingInvites(): Promise<PendingInvite[]> {
  const { data, error } = await createServiceClient()
    .from("convites_admin")
    .select("id, criado_em, expira_em")
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .order("criado_em", { ascending: false });
  if (error) throw new Error("Não foi possível listar os convites.");

  return (data ?? []).map((row) => ({
    id: row.id as string,
    criadoEm: row.criado_em as string,
    expiraEm: row.expira_em as string,
  }));
}

export async function revokeInvite(id: string): Promise<void> {
  const { error } = await createServiceClient()
    .from("convites_admin")
    .delete()
    .eq("id", id)
    .is("usado_em", null);
  if (error) throw new Error("Não foi possível revogar o convite.");
}

export async function isInviteValid(token: string): Promise<boolean> {
  const { data } = await createServiceClient()
    .from("convites_admin")
    .select("id")
    .eq("token_hash", hashToken(token))
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .maybeSingle();
  return Boolean(data);
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const supabase = createServiceClient();
  const [{ data: profiles, error }, { data: users }] = await Promise.all([
    supabase.from("profiles").select("id, nome, criado_em").order("criado_em"),
    supabase.auth.admin.listUsers({ perPage: 200 }),
  ]);
  if (error) throw new Error("Não foi possível listar a equipe.");

  const emails = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? null]));
  return (profiles ?? []).map((p) => ({
    id: p.id as string,
    nome: (p.nome as string | null) ?? null,
    email: emails.get(p.id as string) ?? null,
    criadoEm: p.criado_em as string,
  }));
}

export async function removeTeamMember(id: string): Promise<void> {
  // Apagar o usuário do Auth remove o profile em cascata e derruba o acesso.
  const { error } = await createServiceClient().auth.admin.deleteUser(id);
  if (error) throw new Error("Não foi possível remover o acesso.");
}

/**
 * Consome o convite (uso único, atômico) e cria a conta já confirmada com o
 * profile de staff. Se qualquer etapa falhar, o convite é devolvido.
 */
export async function acceptInvite(
  token: string,
  input: { nome: string; email: string; password: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createServiceClient();

  const { data: claimed } = await supabase
    .from("convites_admin")
    .update({ usado_em: new Date().toISOString() })
    .eq("token_hash", hashToken(token))
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .select("id")
    .maybeSingle();

  if (!claimed) return { ok: false, error: "Convite inválido, expirado ou já utilizado." };

  const release = () =>
    supabase.from("convites_admin").update({ usado_em: null, usado_por: null }).eq("id", claimed.id);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    await release();
    const already = createError?.message.toLowerCase().includes("already");
    return {
      ok: false,
      error: already ? "Este e-mail já possui uma conta." : "Não foi possível criar a conta.",
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: created.user.id, nome: input.nome });

  if (profileError) {
    await supabase.auth.admin.deleteUser(created.user.id);
    await release();
    return { ok: false, error: "Não foi possível liberar o acesso. Tente novamente." };
  }

  await supabase.from("convites_admin").update({ usado_por: created.user.id }).eq("id", claimed.id);
  return { ok: true };
}
