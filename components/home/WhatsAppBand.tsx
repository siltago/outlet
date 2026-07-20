import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppBand() {
  return (
    <section className="bg-brand-black py-12">
      <Container className="flex flex-col items-center gap-5 text-center">
        <h2 className="text-2xl font-bold text-brand-white sm:text-3xl">
          Não encontrou o que procurava?
        </h2>
        <p className="max-w-xl text-brand-gray-400">
          Fale com a gente pelo WhatsApp — podemos verificar disponibilidade e
          também produtos sob encomenda que ainda não estão no catálogo.
        </p>
        <Button
          href={buildWhatsAppUrl(buildGenericInterestMessage())}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="lg"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Falar no WhatsApp
        </Button>
      </Container>
    </section>
  );
}
