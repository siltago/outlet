import type { Product } from "@/types/product";

// Espelha a lógica da view pública planejada no Supabase (vw_catalogo_publico):
// disponibilidade é derivada de modalidade_venda + controle_estoque + quantidade_atual,
// nunca de um campo "status" solto no produto.
export type AvailabilityState = "pronta_entrega" | "sob_encomenda" | "ambos" | "indisponivel";

export interface Availability {
  state: AvailabilityState;
  label: string;
  prontaEntrega: boolean;
  encomenda: boolean;
}

export function getAvailability(product: Product): Availability {
  const temEstoque =
    product.controleEstoque === "quantidade" && (product.quantidadeAtual ?? 0) > 0;

  const prontaEntrega =
    (product.modalidadeVenda === "pronta_entrega" || product.modalidadeVenda === "ambos") &&
    temEstoque;

  const encomenda =
    product.modalidadeVenda === "sob_encomenda" || product.modalidadeVenda === "ambos";

  if (prontaEntrega && encomenda) {
    return { state: "ambos", label: "Pronta entrega ou encomenda", prontaEntrega, encomenda };
  }
  if (prontaEntrega) {
    return { state: "pronta_entrega", label: "Pronta entrega", prontaEntrega, encomenda };
  }
  if (encomenda) {
    return { state: "sob_encomenda", label: "Sob encomenda", prontaEntrega, encomenda };
  }
  return { state: "indisponivel", label: "Temporariamente indisponível", prontaEntrega, encomenda };
}
