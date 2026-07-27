"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { AdminCategoria, AdminMarca } from "@/types/admin";

export function ProductFilters({
  categorias,
  marcas,
}: {
  categorias: AdminCategoria[];
  marcas: AdminMarca[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        type="search"
        defaultValue={searchParams.get("busca") ?? ""}
        onChange={(event) => updateParam("busca", event.target.value)}
        placeholder="Buscar por nome..."
        className="w-full rounded-brand border border-brand-gray-200 px-3 py-2 text-sm sm:w-56"
      />

      <select
        defaultValue={searchParams.get("categoria") ?? ""}
        onChange={(event) => updateParam("categoria", event.target.value)}
        className="rounded-brand border border-brand-gray-200 px-3 py-2 text-sm"
      >
        <option value="">Todas as categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("marca") ?? ""}
        onChange={(event) => updateParam("marca", event.target.value)}
        className="rounded-brand border border-brand-gray-200 px-3 py-2 text-sm"
      >
        <option value="">Todas as marcas</option>
        {marcas.map((marca) => (
          <option key={marca.id} value={marca.id}>
            {marca.nome}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("modalidade") ?? "todas"}
        onChange={(event) => updateParam("modalidade", event.target.value)}
        className="rounded-brand border border-brand-gray-200 px-3 py-2 text-sm"
      >
        <option value="todas">Todas as modalidades</option>
        <option value="pronta_entrega">Pronta entrega</option>
        <option value="sob_encomenda">Sob encomenda</option>
        <option value="ambos">Ambos</option>
      </select>

      <select
        defaultValue={searchParams.get("ativo") ?? "todos"}
        onChange={(event) => updateParam("ativo", event.target.value)}
        className="rounded-brand border border-brand-gray-200 px-3 py-2 text-sm"
      >
        <option value="todos">Ativos e inativos</option>
        <option value="ativo">Só ativos</option>
        <option value="inativo">Só inativos</option>
      </select>

      <select
        defaultValue={searchParams.get("publicado") ?? "todos"}
        onChange={(event) => updateParam("publicado", event.target.value)}
        className="rounded-brand border border-brand-gray-200 px-3 py-2 text-sm"
      >
        <option value="todos">Publicados e rascunhos</option>
        <option value="publicado">Só publicados</option>
        <option value="rascunho">Só rascunhos</option>
      </select>
    </div>
  );
}
