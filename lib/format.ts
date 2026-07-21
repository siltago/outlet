export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Campos de preço nos formulários do admin aceitam "99,90" (vírgula, formato
// brasileiro) digitado à mão.
export function parsePriceInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPriceInput(value: number): string {
  return value.toFixed(2).replace(".", ",");
}
