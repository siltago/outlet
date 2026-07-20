import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface StaffProfile {
  id: string;
  nome: string | null;
  email: string | null;
  papel: "admin";
}

/**
 * Usuário autenticado (Supabase Auth), sem verificar se é staff. `cache()`
 * garante uma única consulta por requisição mesmo chamada em vários lugares.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Só retorna algo se o usuário autenticado também tiver uma linha em
 * `profiles` — é essa linha que autoriza acesso ao painel administrativo.
 * Toda página e Server Action do /admin deve chamar isto (ou `requireStaff`)
 * de novo, mesmo que o proxy já tenha checado a sessão.
 */
export const getStaffProfile = cache(async (): Promise<StaffProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome, papel")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return { ...profile, email: user.email ?? null };
});

/** Lança se não houver staff autenticado. Use em Server Actions e páginas admin. */
export async function requireStaff(): Promise<StaffProfile> {
  const profile = await getStaffProfile();
  if (!profile) {
    throw new Error("Não autorizado.");
  }
  return profile;
}
