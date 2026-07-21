import type { Metadata } from "next";
import Image from "next/image";
import { SignupForm } from "@/components/admin/SignupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar conta administrativa",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/images/logo-outlet-premium.png"
            alt="Outlet Premium Sorocaba"
            width={96}
            height={96}
            priority
            className="h-16 w-16 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-brand-white">Criar conta</h1>
            <p className="text-sm text-brand-gray-400">Outlet Premium Sorocaba</p>
          </div>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
