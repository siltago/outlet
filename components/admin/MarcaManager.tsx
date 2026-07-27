"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, Tag, Trash2 } from "lucide-react";
import {
  createMarcaAction,
  deleteMarcaAction,
  updateMarcaAction,
  type MarcaFormState,
} from "@/app/admin/(protected)/marcas/actions";
import type { AdminMarca } from "@/types/admin";

const initialState: MarcaFormState = { error: null };

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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-brand bg-brand-red px-5 py-2.5 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
    >
      {pending ? "Salvando..." : label}
    </button>
  );
}

interface MarcaDefaults {
  nome: string;
  slug: string;
}

function MarcaFields({ defaults }: { defaults?: MarcaDefaults }) {
  const [nome, setNome] = useState(defaults?.nome ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults));

  function handleNomeChange(value: string) {
    setNome(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-black">Nome</span>
        <input
          name="nome"
          required
          value={nome}
          onChange={(event) => handleNomeChange(event.target.value)}
          className={INPUT_CLASS}
          placeholder="Ex: Apple"
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
          placeholder="apple"
        />
      </label>

      <SubmitButton label={defaults ? "Salvar" : "Adicionar marca"} />
    </div>
  );
}

function NovaMarcaForm() {
  const [state, formAction] = useActionState(createMarcaAction, initialState);

  // Remonta os campos (limpando o formulário) depois de um cadastro bem
  // sucedido. Comparar durante a renderização evita um commit extra de efeito.
  const [handledState, setHandledState] = useState(state);
  const [resetKey, setResetKey] = useState(0);
  if (state !== handledState) {
    setHandledState(state);
    if (state.error === null) {
      setResetKey((key) => key + 1);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <MarcaFields key={resetKey} />
      {state.error && (
        <p role="alert" className="text-sm text-brand-red">
          {state.error}
        </p>
      )}
    </form>
  );
}

function MarcaRow({ marca }: { marca: AdminMarca }) {
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const action = updateMarcaAction.bind(null, marca.id);
  const [state, formAction] = useActionState(action, initialState);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.error === null) {
      setEditing(false);
    }
  }

  function handleDelete() {
    if (!confirm(`Remover a marca "${marca.nome}"? Produtos vinculados ficam sem marca.`)) return;
    startTransition(async () => {
      setError(null);
      const result = await deleteMarcaAction(marca.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setRemoved(true);
    });
  }

  if (removed) return null;

  if (editing) {
    return (
      <div className="flex flex-col gap-3 border-b border-brand-gray-200 py-4 last:border-b-0">
        <form action={formAction} className="flex flex-col gap-4">
          <MarcaFields defaults={marca} />
          <div className="flex items-center gap-4">
            {state.error && (
              <p role="alert" className="text-sm text-brand-red">
                {state.error}
              </p>
            )}
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm font-semibold text-brand-gray-600 hover:text-brand-black"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 border-b border-brand-gray-200 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand bg-brand-gray-50 text-brand-black">
            <Tag className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-black">{marca.nome}</p>
            <p className="text-xs text-brand-gray-600">{marca.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Editar marca ${marca.nome}`}
            className="inline-flex items-center justify-center rounded-brand p-2 text-brand-gray-600 transition-colors hover:bg-brand-gray-50 hover:text-brand-black"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            aria-label={`Remover marca ${marca.nome}`}
            className="inline-flex items-center justify-center rounded-brand p-2 text-brand-gray-600 transition-colors hover:bg-brand-red/10 hover:text-brand-red disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function MarcaManager({ marcas }: { marcas: AdminMarca[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-brand border border-brand-gray-200 bg-brand-white p-4 sm:p-6">
        <NovaMarcaForm />
      </div>

      <div className="rounded-brand border border-brand-gray-200 bg-brand-white p-4 sm:p-6">
        {marcas.length === 0 ? (
          <p className="text-sm text-brand-gray-600">Nenhuma marca cadastrada ainda.</p>
        ) : (
          marcas.map((marca) => <MarcaRow key={marca.id} marca={marca} />)
        )}
      </div>
    </div>
  );
}
