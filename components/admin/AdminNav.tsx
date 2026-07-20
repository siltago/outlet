"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, Package, X } from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import { cn } from "@/lib/cn";
import type { StaffProfile } from "@/lib/auth/session";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-brand-red text-brand-white"
                : "text-brand-gray-400 hover:bg-brand-white/5 hover:text-brand-white",
            )}
          >
            <link.icon className="h-4 w-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBadge({ profile }: { profile: StaffProfile }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 text-xs">
      <span className="font-semibold text-brand-white">{profile.nome ?? "Equipe"}</span>
      <span className="truncate text-brand-gray-400">{profile.email}</span>
    </div>
  );
}

export function AdminNav({ profile }: { profile: StaffProfile }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-brand-gray-600/30 bg-brand-black md:flex">
        <div className="flex items-center gap-2 border-b border-brand-gray-600/30 px-4 py-4">
          <Image
            src="/images/logo-outlet-premium.png"
            alt="Outlet Premium Sorocaba"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
          />
          <span className="text-sm font-bold text-brand-white">Painel admin</span>
        </div>

        <div className="flex flex-1 flex-col justify-between px-3 py-4">
          <NavLinks pathname={pathname} />

          <div className="flex flex-col gap-2 border-t border-brand-gray-600/30 pt-3">
            <UserBadge profile={profile} />
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-semibold text-brand-gray-400 transition-colors hover:bg-brand-white/5 hover:text-brand-white"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Top bar mobile */}
      <div className="flex items-center justify-between border-b border-brand-gray-600/30 bg-brand-black px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo-outlet-premium.png"
            alt="Outlet Premium Sorocaba"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-sm font-bold text-brand-white">Painel admin</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-brand p-2 text-brand-white"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-brand-gray-600/30 bg-brand-black px-4 py-3 md:hidden">
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <div className="mt-3 flex flex-col gap-2 border-t border-brand-gray-600/30 pt-3">
            <UserBadge profile={profile} />
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-semibold text-brand-gray-400 hover:bg-brand-white/5 hover:text-brand-white"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
