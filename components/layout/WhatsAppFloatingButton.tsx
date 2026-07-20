import { MessageCircle } from "lucide-react";
import { buildGenericInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={buildWhatsAppUrl(buildGenericInterestMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-brand bg-brand-red text-brand-white shadow-md transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
