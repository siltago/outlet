import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { categories } from "@/data/categories";
import { SITE_TAGLINE } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-line bg-brand-black text-brand-white">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div className="flex flex-col gap-5">
          <Image
            src="/images/brand/logo-dstrkt-raw-white.png"
            alt="DSTRKT RAW"
            width={900}
            height={417}
            className="h-auto w-40 object-contain"
          />
          <p className="eyebrow max-w-xs leading-relaxed text-brand-gray-400">{SITE_TAGLINE}</p>
          <p className="max-w-xs text-sm text-brand-gray-400">
            Moda, tech, fragrâncias e lifestyle com estética premium e atitude urbana —
            pronta entrega ou sob encomenda.
          </p>
        </div>

        <div>
          <h2 className="eyebrow mb-5 text-brand-white">Categorias</h2>
          <ul className="flex flex-col gap-2.5">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/catalogo/${category.slug}`}
                  className="text-sm text-brand-gray-400 transition-colors hover:text-brand-white"
                >
                  {category.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="eyebrow text-brand-white">Contato</h2>
          <a
            href={buildWhatsAppUrl(buildGenericInterestMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand-gray-400 transition-colors hover:text-brand-white"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Falar no WhatsApp
          </a>
          <span className="inline-flex items-center gap-2 text-sm text-brand-gray-400">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Sorocaba, SP
          </span>
          <span className="eyebrow text-brand-gray-600">23.5019° S · 47.4526° W</span>
        </div>
      </Container>

      <div className="border-t border-brand-line py-5">
        <Container className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="eyebrow text-brand-gray-400">DSTRKT RAW · Est. 2026</p>
          <p className="eyebrow text-brand-gray-600">© {year} Todos os direitos reservados</p>
        </Container>
      </div>
    </footer>
  );
}
