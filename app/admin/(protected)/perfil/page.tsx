import type { Metadata } from "next";
import { ProfileForms } from "@/components/admin/ProfileForms";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Meu perfil",
};

export default async function PerfilPage() {
  const staff = await requireStaff();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">Meu perfil</h1>
        <p className="text-sm text-brand-gray-600">Edite seu nome e altere sua senha.</p>
      </div>

      <ProfileForms nome={staff.nome ?? ""} email={staff.email ?? ""} />
    </div>
  );
}
