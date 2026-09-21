"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line bg-brand-black/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setMenuOpen(false)}>
          <Image
            src="/images/brand/logo-dstrkt-raw-white.png"
            alt="DSTRKT RAW"
            width={900}
            height={417}
            priority
            className="h-10 w-auto object-contain md:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "eyebrow !text-xs transition-colors",
                isActive(link.href)
                  ? "text-brand-red"
                  : "text-brand-white hover:text-brand-red",
              )}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={buildWhatsAppUrl(buildGenericInterestMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 eyebrow rounded-brand bg-brand-red px-4 py-2.5 !text-xs text-brand-white transition-colors hover:bg-brand-red-dark"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Falar no WhatsApp
          </a>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-brand p-2 text-brand-white md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {menuOpen && (
        <div className="border-t border-brand-line bg-brand-black md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "eyebrow rounded-brand px-2 py-3 !text-sm",
                  isActive(link.href)
                    ? "text-brand-red"
                    : "text-brand-white hover:text-brand-red",
                )}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={buildWhatsAppUrl(buildGenericInterestMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-2 inline-flex items-center justify-center gap-2 rounded-brand bg-brand-red px-4 py-3 !text-xs text-brand-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          </Container>
        </div>
      )}
    </header>
  );
}
