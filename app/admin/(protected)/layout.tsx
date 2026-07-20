import { redirect } from "next/navigation";
import { getStaffProfile } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

// O painel depende de sessão (cookies) e de dados ao vivo do Supabase — nunca
// deve ser pré-renderizado estaticamente no build.
export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O proxy.ts já bloqueia visitantes anônimos, mas cada camada precisa
  // reverificar por conta própria — a checagem aqui é a autoridade real.
  const profile = await getStaffProfile();
  if (!profile) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-gray-50 md:flex-row">
      <AdminNav profile={profile} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
