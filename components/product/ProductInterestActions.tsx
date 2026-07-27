"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildProductInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import type { Availability } from "@/lib/availability";

type Modality = "pronta_entrega" | "sob_encomenda";

interface ProductInterestActionsProps {
  productName: string;
  productSlug: string;
  availability: Availability;
}

export function ProductInterestActions({
  productName,
  productSlug,
  availability,
}: ProductInterestActionsProps) {
  const defaultModality: Modality = availability.prontaEntrega ? "pronta_entrega" : "sob_encomenda";
  const [modality, setModality] = useState<Modality>(defaultModality);

  if (availability.state === "indisponivel") {
    return (
      <p className="rounded-brand border border-brand-gray-200 bg-brand-gray-50 px-4 py-3 text-sm text-brand-gray-600">
        Produto temporariamente indisponível. Fale conosco pelo WhatsApp para mais informações.
      </p>
    );
  }

  const showModalityChoice = availability.prontaEntrega && availability.encomenda;
  const message = buildProductInterestMessage(productName, modality, productSlug);
  const href = buildWhatsAppUrl(message);

  return (
    <div className="flex flex-col gap-4">
      {showModalityChoice && (
        <div className="flex gap-2" role="radiogroup" aria-label="Escolha a modalidade">
          <button
            type="button"
            role="radio"
            aria-checked={modality === "pronta_entrega"}
            onClick={() => setModality("pronta_entrega")}
            className={cn(
              "flex-1 rounded-brand border px-4 py-2.5 text-sm font-semibold transition-colors",
              modality === "pronta_entrega"
                ? "border-brand-red bg-brand-red text-brand-white"
                : "border-brand-gray-200 text-brand-black hover:border-brand-red",
            )}
          >
            Pronta entrega
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={modality === "sob_encomenda"}
            onClick={() => setModality("sob_encomenda")}
            className={cn(
              "flex-1 rounded-brand border px-4 py-2.5 text-sm font-semibold transition-colors",
              modality === "sob_encomenda"
                ? "border-brand-red bg-brand-red text-brand-white"
                : "border-brand-gray-200 text-brand-black hover:border-brand-red",
            )}
          >
            Sob encomenda
          </button>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-brand bg-brand-red px-6 py-3.5 text-base font-semibold text-brand-white transition-colors hover:bg-brand-red-dark"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        {modality === "sob_encomenda" ? "Encomendar pelo WhatsApp" : "Comprar pelo WhatsApp"}
      </a>
    </div>
  );
}
