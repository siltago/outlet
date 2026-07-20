import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login administrativo",
};

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;

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
            <h1 className="text-lg font-bold text-brand-white">Painel administrativo</h1>
            <p className="text-sm text-brand-gray-400">Outlet Premium Sorocaba</p>
          </div>
        </div>

        <LoginForm redirectTo={redirectTo ?? "/admin"} />
      </div>
    </div>
  );
}
