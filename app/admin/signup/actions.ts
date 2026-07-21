"use server";

import { createClient } from "@/lib/supabase/server";

export interface SignupState {
  error: string | null;
  success: boolean;
  userId: string | null;
}

export async function signup(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const code = String(formData.get("code") ?? "");

  const inviteCode = process.env.ADMIN_SIGNUP_CODE;

  if (!inviteCode) {
    return { error: "Cadastro desabilitado.", success: false, userId: null };
  }

  if (code !== inviteCode) {
    return { error: "Código de convite inválido.", success: false, userId: null };
  }

  if (!email || !password) {
    return { error: "Informe e-mail e senha.", success: false, userId: null };
  }

  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres.", success: false, userId: null };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem.", success: false, userId: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: "Não foi possível criar a conta. Tente novamente.", success: false, userId: null };
  }

  // A conta é criada no Supabase Auth, mas o acesso ao painel só é liberado
  // com uma linha em public.profiles — inserida manualmente (ver instruções
  // na tela de sucesso), nunca pelo próprio usuário. Mantém a mesma regra
  // de lib/auth/session.ts e da migration de RLS.
  return { error: null, success: true, userId: data.user?.id ?? null };
}
