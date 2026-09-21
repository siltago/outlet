"use server";

import { redirect } from "next/navigation";
import { acceptInvite } from "@/lib/admin/team";
import { createClient } from "@/lib/supabase/server";

export interface InviteSignupState {
  error: string | null;
}

export async function acceptInviteAction(
  token: string,
  _prevState: InviteSignupState,
  formData: FormData,
): Promise<InviteSignupState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!nome || !email || !password) return { error: "Preencha todos os campos." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== confirmPassword) return { error: "As senhas não coincidem." };

  const result = await acceptInvite(token, { nome, email, password });
  if (!result.ok) return { error: result.error };

  // Conta criada: já entra logado no painel.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  redirect(error ? "/admin/login" : "/admin");
}
