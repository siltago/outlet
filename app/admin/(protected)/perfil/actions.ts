"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface ProfileFormState {
  error: string | null;
  success: boolean;
}

export async function updateNameAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const staff = await requireStaff();

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe seu nome.", success: false };
  if (nome.length > 80) return { error: "O nome pode ter no máximo 80 caracteres.", success: false };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ nome }).eq("id", staff.id);
  if (error) return { error: "Não foi possível salvar o nome.", success: false };

  revalidatePath("/admin", "layout");
  return { error: null, success: true };
}

export async function changePasswordAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const staff = await requireStaff();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword) {
    return { error: "Preencha a senha atual e a nova senha.", success: false };
  }
  if (newPassword.length < 8) {
    return { error: "A nova senha precisa ter pelo menos 8 caracteres.", success: false };
  }
  if (newPassword !== confirmPassword) {
    return { error: "As senhas não coincidem.", success: false };
  }
  if (!staff.email) return { error: "Conta sem e-mail cadastrado.", success: false };

  const supabase = await createClient();

  // Confirma que quem está trocando a senha sabe a atual (sessão esquecida aberta).
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: staff.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Senha atual incorreta.", success: false };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Não foi possível alterar a senha.", success: false };

  return { error: null, success: true };
}
