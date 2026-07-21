"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import {
  createCategoriaAction,
  deleteCategoriaAction,
  type CategoriaFormState,
} from "@/app/admin/(protected)/categorias/actions";
import type { AdminCategoria } from "@/types/admin";

const initialState: CategoriaFormState = { error: null };

const INPUT_CLASS =
  "w-full rounded-brand border border-brand-gray-200 bg-brand-white px-3 py-2.5 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-brand bg-brand-red px-5 py-2.5 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Adicionar categoria"}
    </button>
  );
}

function NovaCategoriaForm() {
  const [state, formAction] = useActionState(createCategoriaAction, initialState);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  // Limpa o formulário após um envio bem-sucedido. Comparar com o estado
  // anterior durante a renderização (em vez de useEffect) evita um commit
  // extra só para resetar os campos.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.error === null) {
      setNome("");
      setSlug("");
      setSlugTouched(false);
    }
  }

  function handleNomeChange(value: string) {
    setNome(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-black">Nome</span>
        <input
          name="nome"
          required
          value={nome}
          onChange={(event) => handleNomeChange(event.target.value)}
          className={INPUT_CLASS}
          placeholder="Ex: Bolsas"
        />
      </label>

      <label className="flex flex-1 flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-black">Slug</span>
        <input
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugTouched(true);
          }}
          className={INPUT_CLASS}
          placeholder="bolsas"
        />
      </label>

      <SubmitButton />

      {state.error && (
        <p role="alert" className="text-sm text-brand-red sm:basis-full">
          {state.error}
        </p>
      )}
    </form>
  );
}

function CategoriaRow({ categoria }: { categoria: AdminCategoria }) {
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Remover a categoria "${categoria.nome}"?`)) return;
    startTransition(async () => {
      setError(null);
      const result = await deleteCategoriaAction(categoria.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <div className="flex flex-col gap-1 border-b border-brand-gray-200 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-black">{categoria.nome}</p>
          <p className="text-xs text-brand-gray-600">{categoria.slug}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`Remover categoria ${categoria.nome}`}
          className="inline-flex items-center justify-center rounded-brand p-2 text-brand-gray-600 transition-colors hover:bg-brand-red/10 hover:text-brand-red disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function CategoriaManager({ categorias }: { categorias: AdminCategoria[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-brand border border-brand-gray-200 bg-brand-white p-4 sm:p-6">
        <NovaCategoriaForm />
      </div>

      <div className="rounded-brand border border-brand-gray-200 bg-brand-white p-4 sm:p-6">
        {categorias.length === 0 ? (
          <p className="text-sm text-brand-gray-600">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          categorias.map((categoria) => <CategoriaRow key={categoria.id} categoria={categoria} />)
        )}
      </div>
    </div>
  );
}
