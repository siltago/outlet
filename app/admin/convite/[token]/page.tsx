import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InviteSignupForm } from "@/components/admin/InviteSignupForm";
import { isInviteValid } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Convite para o painel",
  robots: { index: false },
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const valid = await isInviteValid(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/images/brand/mark-white.png"
            alt="DSTRKT RAW"
            width={96}
            height={96}
            priority
            className="h-auto w-24 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-brand-white">Você foi convidado</h1>
            <p className="text-sm text-brand-gray-400">Crie seu acesso ao painel DSTRKT RAW</p>
          </div>
        </div>

        {valid ? (
          <InviteSignupForm token={token} />
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <p className="rounded-brand border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
              Este convite é inválido, expirou ou já foi utilizado. Peça um novo link a quem te convidou.
            </p>
            <Link
              href="/admin/login"
              className="text-sm font-medium text-brand-gray-400 hover:text-brand-white"
            >
              Ir para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
