import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { categories } from "@/data/categories";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-gray-600/30 bg-brand-black text-brand-white">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Image
            src="/images/logo-outlet-premium.png"
            alt="Outlet Premium Sorocaba"
            width={96}
            height={96}
            className="h-16 w-16 object-contain"
          />
          <p className="max-w-xs text-sm text-brand-gray-400">
            Produtos importados e de oportunidade em Sorocaba: smartphones, relógios,
            fones, perfumes, tênis e acessórios — pronta entrega ou sob encomenda.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-white">
            Categorias
          </h2>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/catalogo/${category.slug}`}
                  className="text-sm text-brand-gray-400 hover:text-brand-red"
                >
                  {category.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-white">
            Contato
          </h2>
          <a
            href={buildWhatsAppUrl(buildGenericInterestMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-brand-red"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Falar no WhatsApp
          </a>
          <span className="inline-flex items-center gap-2 text-sm text-brand-gray-400">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Sorocaba - SP
          </span>
        </div>
      </Container>

      <div className="border-t border-brand-gray-600/30 py-5">
        <Container>
          <p className="text-center text-xs text-brand-gray-400">
            © {year} Outlet Premium Sorocaba. Todos os direitos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
