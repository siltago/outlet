import type { Metadata } from "next";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Outlet Premium Sorocaba pelo WhatsApp.",
};

export default function ContatoPage() {
  return (
    <section className="py-14">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold text-brand-black sm:text-3xl">Fale com a gente</h1>
        <p className="max-w-lg text-sm text-brand-gray-600">
          Atendimento direto pelo WhatsApp para tirar dúvidas, confirmar disponibilidade
          de pronta entrega ou fazer encomendas.
        </p>

        <Button
          href={buildWhatsAppUrl(buildGenericInterestMessage())}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="lg"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Falar no WhatsApp
        </Button>

        <div className="mt-6 grid w-full max-w-lg gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-2 rounded-brand border border-brand-gray-200 p-5">
            <MapPin className="h-6 w-6 text-brand-black" aria-hidden="true" />
            <p className="text-sm font-semibold text-brand-black">Sorocaba - SP</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-brand border border-brand-gray-200 p-5">
            <Clock className="h-6 w-6 text-brand-black" aria-hidden="true" />
            <p className="text-sm font-semibold text-brand-black">Atendimento combinado pelo WhatsApp</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
