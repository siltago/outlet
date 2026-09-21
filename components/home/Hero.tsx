import Image from "next/image";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-black">
      <Image
        src="/images/brand/hero-city.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center opacity-70"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-black via-brand-black/80 to-brand-black/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-brand-black to-transparent"
        aria-hidden="true"
      />

      <Container className="relative py-20 md:py-32">
        <div className="flex max-w-2xl flex-col gap-6">
          <span className="eyebrow text-brand-gray-400">
            DSTRKT RAW · Sorocaba, SP · Est. 2026
          </span>
          <h1 className="display text-4xl leading-[1.05] text-brand-white sm:text-5xl md:text-6xl">
            Mais que produtos.
            <br />
            <span className="text-brand-red">Cultura.</span>
          </h1>
          <div className="h-px w-16 bg-brand-white" aria-hidden="true" />
          <p className="eyebrow max-w-md !text-xs leading-loose !tracking-[0.2em] text-brand-gray-400">
            Moda, tech, fragrâncias e lifestyle com estética premium e atitude urbana.
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
      </Container>
    </section>
  );
}
