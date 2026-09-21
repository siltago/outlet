"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import { createInvite, removeTeamMember, revokeInvite } from "@/lib/admin/team";

export interface InviteState {
  error: string | null;
  path: string | null;
}

export async function createInviteAction(): Promise<InviteState> {
  const staff = await requireStaff();

  try {
    const token = await createInvite(staff.id);
    revalidatePath("/admin/equipe");
    return { error: null, path: `/admin/convite/${token}` };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Não foi possível criar o convite.",
      path: null,
    };
  }
}

export async function revokeInviteAction(id: string): Promise<{ error: string | null }> {
  await requireStaff();
  try {
    await revokeInvite(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível revogar o convite." };
  }
  revalidatePath("/admin/equipe");
  return { error: null };
}

export async function removeMemberAction(id: string): Promise<{ error: string | null }> {
  const staff = await requireStaff();
  if (staff.id === id) return { error: "Você não pode remover o próprio acesso." };

  try {
    await removeTeamMember(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível remover o acesso." };
  }
  revalidatePath("/admin/equipe");
  return { error: null };
}
