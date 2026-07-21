"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/(protected)/produtos/actions";

export function DeleteProductButton({ productId, nome }: { productId: string; nome: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Excluir o produto "${nome}"? Essa ação não pode ser desfeita.`)) return;

    startTransition(async () => {
      setError(null);
      const result = await deleteProductAction(productId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-gray-600 transition-colors hover:text-brand-red disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Excluir
      </button>
      {error && (
        <p role="alert" className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
