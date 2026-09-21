import type { Metadata } from "next";
import { TeamManager } from "@/components/admin/TeamManager";
import { requireStaff } from "@/lib/auth/session";
import { listPendingInvites, listTeamMembers } from "@/lib/admin/team";

export const metadata: Metadata = {
  title: "Equipe",
};

export default async function EquipePage() {
  const staff = await requireStaff();
  const [members, invites] = await Promise.all([listTeamMembers(), listPendingInvites()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">Equipe</h1>
        <p className="text-sm text-brand-gray-600">
          Convide pessoas para o painel. Cada convite é um link de uso único, válido por 7 dias.
        </p>
      </div>

      <TeamManager members={members} invites={invites} currentUserId={staff.id} />
    </div>
  );
}
