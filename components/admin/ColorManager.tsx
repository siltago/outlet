"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import {
  createCorAction,
  deleteCorAction,
  updateCorAction,
  type CorFormState,
} from "@/app/admin/(protected)/produtos/actions";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { formatPriceInput, parsePriceInput } from "@/lib/format";
import type { AdminCor } from "@/types/admin";
import type { ControleEstoque } from "@/types/database";

const initialState: CorFormState = { error: null };
const MARGEM_VENDA_PADRAO = 0.15;

const INPUT_CLASS =
  "w-full rounded-brand border border-brand-gray-200 bg-brand-white px-3 py-2 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none";

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-xs text-brand-red">
      {message}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-brand bg-brand-red px-4 py-2 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
    >
      {pending ? "Salvando..." : label}
    </button>
  );
}

interface CorDefaults {
  nome: string;
  precoCusto: number | null;
  precoVenda: number;
  quantidadeAtual: number | null;
  quantidadeMinima: number | null;
}

function CorFields({
  state,
  controleEstoque,
  defaults,
}: {
  state: CorFormState;
  controleEstoque: ControleEstoque;
  defaults?: CorDefaults;
}) {
  const [precoCusto, setPrecoCusto] = useState(
    defaults?.precoCusto !== null && defaults?.precoCusto !== undefined
      ? formatPriceInput(defaults.precoCusto)
      : "",
  );
  const [precoVenda, setPrecoVenda] = useState(
    defaults?.precoVenda !== undefined ? formatPriceInput(defaults.precoVenda) : "",
  );
  const [vendaTouched, setVendaTouched] = useState(Boolean(defaults));

  function handleCustoChange(value: string) {
    setPrecoCusto(value);
    if (vendaTouched) return;
    const custo = parsePriceInput(value);
    setPrecoVenda(custo === null ? "" : formatPriceInput(custo * (1 + MARGEM_VENDA_PADRAO)));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs font-medium text-brand-black">Nome da cor</span>
        <input
          name="nome"
          required
          defaultValue={defaults?.nome ?? ""}
          placeholder="Ex: Preto"
          className={INPUT_CLASS}
        />
        {state.fieldErrors?.nome && <FieldError message={state.fieldErrors.nome} />}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-brand-black">Preço de custo</span>
        <input
          type="text"
          inputMode="decimal"
          name="precoCusto"
          placeholder="0,00"
          value={precoCusto}
          onChange={(event) => handleCustoChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-brand-black">Preço de venda</span>
        <input
          type="text"
          inputMode="decimal"
          name="precoVenda"
          required
          placeholder="0,00"
          value={precoVenda}
          onChange={(event) => {
            setPrecoVenda(event.target.value);
            setVendaTouched(true);
          }}
          className={INPUT_CLASS}
        />
        {state.fieldErrors?.precoVenda && <FieldError message={state.fieldErrors.precoVenda} />}
      </label>

      {controleEstoque === "quantidade" && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-brand-black">Quantidade atual</span>
            <input
              type="number"
              name="quantidadeAtual"
              min={0}
              required
              defaultValue={defaults?.quantidadeAtual ?? 0}
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.quantidadeAtual && (
              <FieldError message={state.fieldErrors.quantidadeAtual} />
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-brand-black">Quantidade mínima</span>
            <input
              type="number"
              name="quantidadeMinima"
              min={0}
              required
              defaultValue={defaults?.quantidadeMinima ?? 1}
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.quantidadeMinima && (
              <FieldError message={state.fieldErrors.quantidadeMinima} />
            )}
          </label>
        </>
      )}
    </div>
  );
}

function NovaCorForm({
  productId,
  controleEstoque,
}: {
  productId: string;
  controleEstoque: ControleEstoque;
}) {
  const action = createCorAction.bind(null, productId, controleEstoque);
  const [state, formAction] = useActionState(action, initialState);

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
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-brand border border-dashed border-brand-gray-300 p-4"
    >
      <CorFields key={resetKey} state={state} controleEstoque={controleEstoque} />
      {state.error && <FieldError message={state.error} />}
      <div>
        <SubmitButton label="Adicionar cor" />
      </div>
    </form>
  );
}

function CorCard({
  cor,
  productId,
  controleEstoque,
}: {
  cor: AdminCor;
  productId: string;
  controleEstoque: ControleEstoque;
}) {
  const action = updateCorAction.bind(null, cor.id, productId, controleEstoque);
  const [state, formAction] = useActionState(action, initialState);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Remover a cor "${cor.nome}"? As fotos dela também serão apagadas.`)) return;

    startTransition(async () => {
      setDeleteError(null);
      const result = await deleteCorAction(cor.id, productId);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <div className="flex flex-col gap-4 rounded-brand border border-brand-gray-200 p-4">
      <form action={formAction} className="flex flex-col gap-3">
        <CorFields state={state} controleEstoque={controleEstoque} defaults={cor} />
        {state.error && <FieldError message={state.error} />}
        <div className="flex items-center gap-4">
          <SubmitButton label="Salvar cor" />
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-gray-600 transition-colors hover:text-brand-red disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Excluir cor
          </button>
        </div>
        {deleteError && <FieldError message={deleteError} />}
      </form>

      <div className="border-t border-brand-gray-200 pt-3">
        <h3 className="mb-2 text-xs font-semibold text-brand-black">Fotos desta cor</h3>
        <PhotoManager productId={productId} photos={cor.fotos} corId={cor.id} />
      </div>
    </div>
  );
}

export function ColorManager({
  productId,
  controleEstoque,
  cores,
}: {
  productId: string;
  controleEstoque: ControleEstoque;
  cores: AdminCor[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {cores.map((cor) => (
        <CorCard key={cor.id} cor={cor} productId={productId} controleEstoque={controleEstoque} />
      ))}
      <NovaCorForm productId={productId} controleEstoque={controleEstoque} />
    </div>
  );
}
