"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/admin/(protected)/produtos/actions";
import { ColorManager } from "@/components/admin/ColorManager";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { formatPriceInput, parsePriceInput } from "@/lib/format";
import type { AdminCategoria, AdminProductDetail } from "@/types/admin";
import type { ModalidadeVenda } from "@/types/database";

const initialState: ProductFormState = { error: null };

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

const MARGEM_VENDA_PADRAO = 0.15;

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm text-brand-red">
      {message}
    </p>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-brand-black">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-brand-gray-300 text-brand-red focus:ring-brand-red"
      />
      {label}
    </label>
  );
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

interface ProductFormProps {
  categorias: AdminCategoria[];
  produto?: AdminProductDetail;
}

export function ProductForm({ categorias, produto }: ProductFormProps) {
  const isEdit = Boolean(produto);
  const action = isEdit ? updateProductAction.bind(null, produto!.id) : createProductAction;
  const [state, formAction] = useActionState(action, initialState);

  const [nome, setNome] = useState(produto?.nome ?? "");
  const [slug, setSlug] = useState(produto?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [modalidade, setModalidade] = useState<ModalidadeVenda>(
    produto?.modalidadeVenda ?? "pronta_entrega",
  );
  const [precoCusto, setPrecoCusto] = useState(
    produto?.precoCusto !== null && produto?.precoCusto !== undefined
      ? formatPriceInput(produto.precoCusto)
      : "",
  );
  const [precoVenda, setPrecoVenda] = useState(
    produto?.precoVenda !== undefined ? formatPriceInput(produto.precoVenda) : "",
  );
  const [vendaTouched, setVendaTouched] = useState(isEdit);

  const controleEstoque = modalidade === "sob_encomenda" ? "sem_controle" : "quantidade";
  const showQuantidade = controleEstoque === "quantidade";

  function handleNomeChange(value: string) {
    setNome(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  // Sugere o preço de venda com margem fixa de 15% sobre o custo, até o
  // usuário editar o campo manualmente (então para de sobrescrever).
  function handleCustoChange(value: string) {
    setPrecoCusto(value);
    if (vendaTouched) return;

    const custo = parsePriceInput(value);
    setPrecoVenda(custo === null ? "" : formatPriceInput(custo * (1 + MARGEM_VENDA_PADRAO)));
  }

  return (
    <>
      <form action={formAction} className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-brand-black">Nome</span>
            <input
              name="nome"
              required
              value={nome}
              onChange={(event) => handleNomeChange(event.target.value)}
              className={INPUT_CLASS}
            />
            {state.fieldErrors?.nome && <FieldError message={state.fieldErrors.nome} />}
          </label>
  
          <label className="flex flex-col gap-1.5 sm:col-span-2">
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
            />
            {state.fieldErrors?.slug && <FieldError message={state.fieldErrors.slug} />}
          </label>
  
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-brand-black">Descrição</span>
            <textarea
              name="descricao"
              rows={4}
              defaultValue={produto?.descricao ?? ""}
              className={INPUT_CLASS}
            />
            <span className="text-xs text-brand-gray-600">
              Use <code>**texto**</code> para negrito e <code>&gt;texto&lt;</code> para destaque
              (caixinha cinza) na página do produto — dá pra combinar, ex:{" "}
              <code>&gt;**texto**&lt;</code>.
            </span>
          </label>
  
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-black">Categoria</span>
            <select
              name="categoriaId"
              required
              defaultValue={produto?.categoriaId ?? ""}
              className={INPUT_CLASS}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            {state.fieldErrors?.categoriaId && <FieldError message={state.fieldErrors.categoriaId} />}
          </label>
  
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-black">Modalidade de venda</span>
            <select
              name="modalidadeVenda"
              required
              value={modalidade}
              onChange={(event) => setModalidade(event.target.value as ModalidadeVenda)}
              className={INPUT_CLASS}
            >
              <option value="pronta_entrega">Pronta entrega</option>
              <option value="sob_encomenda">Sob encomenda</option>
              <option value="ambos">Pronta entrega e encomenda</option>
            </select>
          </label>
  
          <input type="hidden" name="controleEstoque" value={controleEstoque} />
  
          {showQuantidade && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-brand-black">Quantidade atual</span>
                <input
                  type="number"
                  name="quantidadeAtual"
                  min={0}
                  required
                  defaultValue={produto?.quantidadeAtual ?? 0}
                  className={INPUT_CLASS}
                />
                {state.fieldErrors?.quantidadeAtual && (
                  <FieldError message={state.fieldErrors.quantidadeAtual} />
                )}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-brand-black">Quantidade mínima</span>
                <input
                  type="number"
                  name="quantidadeMinima"
                  min={0}
                  required
                  defaultValue={produto?.quantidadeMinima ?? 1}
                  className={INPUT_CLASS}
                />
                {state.fieldErrors?.quantidadeMinima && (
                  <FieldError message={state.fieldErrors.quantidadeMinima} />
                )}
              </label>
            </>
          )}
  
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-black">Preço de custo (interno)</span>
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
  
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-black">Preço de venda</span>
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
            <span className="text-xs text-brand-gray-600">
              Sugerido automaticamente com 15% de margem sobre o custo — edite se quiser outro valor.
            </span>
            {state.fieldErrors?.precoVenda && <FieldError message={state.fieldErrors.precoVenda} />}
          </label>
        </div>
  
        <div className="flex flex-wrap gap-6">
          <CheckboxField name="ativo" label="Ativo" defaultChecked={produto?.ativo ?? true} />
          <CheckboxField
            name="publicado"
            label="Publicado no site"
            defaultChecked={produto?.publicado ?? false}
          />
          <CheckboxField
            name="destaque"
            label="Destaque na home"
            defaultChecked={produto?.destaque ?? false}
          />
        </div>
  
        {state.error && <FieldError message={state.error} />}
  
        <div className="flex gap-3">
          <SubmitButton label={isEdit ? "Salvar alterações" : "Cadastrar produto"} />
        </div>
      </form>

      {/*
        Cores e fotos ficam fora do <form> do produto de propósito: cada uma
        já tem seu próprio <form>/Server Action (ColorManager, PhotoManager),
        e HTML não permite <form> aninhado — isso causava o erro "A React
        form was unexpectedly submitted" no navegador.
      */}
      {isEdit && produto ? (
        <div className="mt-6 flex flex-col gap-3 border-t border-brand-gray-200 pt-6">
          <div>
            <h2 className="text-sm font-semibold text-brand-black">Cores</h2>
            <p className="text-xs text-brand-gray-600">
              Opcional. Cada cor tem preço de venda, estoque e fotos próprios — o custo é o mesmo
              do produto (definido acima). O cliente escolhe a cor na página do produto.
            </p>
          </div>
          <ColorManager
            productId={produto.id}
            controleEstoque={controleEstoque}
            cores={produto.cores}
            custoProduto={produto.precoCusto}
          />
        </div>
      ) : null}

      {isEdit && produto ? (
        <div className="mt-6 flex flex-col gap-2 border-t border-brand-gray-200 pt-6">
          <div>
            <h2 className="text-sm font-semibold text-brand-black">Fotos gerais</h2>
            <p className="text-xs text-brand-gray-600">
              Usadas quando o produto não tem cores cadastradas (ou como reserva).
            </p>
          </div>
          <PhotoManager productId={produto.id} photos={produto.fotos} />
        </div>
      ) : (
        <p className="mt-6 rounded-brand border border-brand-gray-200 bg-brand-gray-50 px-3 py-2 text-sm text-brand-gray-600">
          Salve o produto para poder cadastrar cores e enviar fotos.
        </p>
      )}
    </>
  );
}
