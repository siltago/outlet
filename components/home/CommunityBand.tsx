import { Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/constants";

export function CommunityBand() {
  return (
    <section className="border-y border-brand-gray-200 bg-brand-gray-50 py-12">
      <Container className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-brand bg-brand-black text-brand-white">
          <Users className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold text-brand-black sm:text-3xl">
          Entre na nossa comunidade do WhatsApp
        </h2>
        <p className="max-w-xl text-brand-gray-600">
          Novidades, chegadas de produtos e promoções em primeira mão, direto no seu WhatsApp.
        </p>
        <Button href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" variant="primary" size="lg">
          <Users className="h-4 w-4" aria-hidden="true" />
          Entrar na comunidade
        </Button>
      </Container>
    </section>
  );
}
