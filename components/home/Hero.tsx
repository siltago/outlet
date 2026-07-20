import Image from "next/image";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="bg-brand-black">
      <Container className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-16">
        <div className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center rounded-brand bg-brand-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red">
            Sorocaba e região
          </span>
          <h1 className="text-3xl font-extrabold leading-tight text-brand-white sm:text-4xl md:text-5xl">
            Outlet Premium Sorocaba
          </h1>
          <p className="max-w-md text-base text-brand-gray-400 sm:text-lg">
            Produtos selecionados de oportunidade: smartphones, relógios, fones,
            perfumes, tênis e acessórios. Peças com pronta entrega e outras sob
            encomenda, direto pelo WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/catalogo" variant="primary" size="lg">
              Ver catálogo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              href={buildWhatsAppUrl(buildGenericInterestMessage())}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline-light"
              size="lg"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Image
            src="/images/logo-outlet-premium.png"
            alt="Outlet Premium Sorocaba"
            width={420}
            height={420}
            priority
            className="h-56 w-56 object-contain sm:h-72 sm:w-72 md:h-80 md:w-80"
          />
        </div>
      </Container>
    </section>
  );
}
