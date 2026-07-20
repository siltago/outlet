import { WHATSAPP_NUMBER } from "@/lib/constants";

type ContactModality = "pronta_entrega" | "sob_encomenda";

export function buildWhatsAppUrl(message: string): string {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${WHATSAPP_NUMBER}?${params.toString()}`;
}

export function buildGenericInterestMessage(): string {
  return "Olá! Vim pelo site da Outlet Premium Sorocaba e gostaria de mais informações.";
}

/**
 * Modalidade escolhida na hora do contato: para produtos "ambos", o cliente decide
 * na página do produto se quer pronta entrega ou encomenda, o que muda a mensagem.
 */
export function buildProductInterestMessage(
  productName: string,
  modality: ContactModality,
): string {
  if (modality === "sob_encomenda") {
    return `Olá! Quero encomendar o produto ${productName} da Outlet Premium Sorocaba.`;
  }
  return `Olá! Tenho interesse no produto ${productName} da Outlet Premium Sorocaba.`;
}
