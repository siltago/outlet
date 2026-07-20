"use client";

import { AlertTriangle } from "lucide-react";

export default function AdminRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-brand-black px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-brand-red" aria-hidden="true" />
      <p className="font-semibold text-brand-white">Painel administrativo indisponível</p>
      <p className="max-w-sm text-sm text-brand-gray-400">{error.message}</p>
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
