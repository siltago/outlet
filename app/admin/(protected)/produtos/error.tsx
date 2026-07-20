"use client";

import { AlertTriangle } from "lucide-react";

export default function ProdutosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-brand border border-dashed border-brand-gray-200 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-brand-red" aria-hidden="true" />
      <p className="font-semibold text-brand-black">Não foi possível carregar os produtos</p>
      <p className="max-w-sm text-sm text-brand-gray-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-brand bg-brand-red px-4 py-2 text-sm font-semibold text-brand-white hover:bg-brand-red-dark"
      >
        Tentar novamente
      </button>
    </div>
  );
}
