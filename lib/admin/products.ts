import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { buildProductPhotoUrl } from "@/lib/supabase/storage";
import type { ProductFormValues } from "@/lib/validation/product";
import type {
  AdminCategoria,
  AdminCor,
  AdminProduct,
  AdminProductDetail,
  AdminProductPhoto,
  DashboardStats,
  ProductListFilters,
} from "@/types/admin";

const PRODUTO_SELECT =
  "id, nome, slug, descricao, categoria_id, modalidade_venda, controle_estoque, " +
  "quantidade_atual, quantidade_reservada, quantidade_minima, preco_custo, preco_venda, " +
  "ativo, publicado, destaque, criado_em, atualizado_em, " +
  "categoria:categorias(nome, slug), fotos:produto_fotos(id, caminho, ordem, cor_id), " +
  "cores:produto_cores(id, nome, preco_venda, quantidade_atual, quantidade_minima, ordem)";

type ProdutoJoinedRow = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  categoria_id: string;
  modalidade_venda: AdminProduct["modalidadeVenda"];
  controle_estoque: AdminProduct["controleEstoque"];
  quantidade_atual: number | null;
  quantidade_reservada: number;
  quantidade_minima: number | null;
  preco_custo: number | null;
  preco_venda: number;
  ativo: boolean;
  publicado: boolean;
  destaque: boolean;
  criado_em: string;
  atualizado_em: string;
  categoria: { nome: string; slug: string } | null;
  fotos: { id: string; caminho: string; ordem: number; cor_id: string | null }[] | null;
  cores:
    | {
        id: string;
        nome: string;
        preco_venda: number;
        quantidade_atual: number | null;
        quantidade_minima: number | null;
        ordem: number;
      }[]
    | null;
};

function mapFoto(foto: { id: string; caminho: string; ordem: number }): AdminProductPhoto {
  return { id: foto.id, caminho: foto.caminho, url: buildProductPhotoUrl(foto.caminho), ordem: foto.ordem };
}

function mapProduct(row: ProdutoJoinedRow): AdminProduct {
  // Fotos "gerais" (sem cor) definem a miniatura na listagem; se o produto só
  // tiver fotos por cor, usa a primeira delas como fallback.
  const gerais = (row.fotos ?? []).filter((f) => f.cor_id === null).sort((a, b) => a.ordem - b.ordem);
  const todas = [...(row.fotos ?? [])].sort((a, b) => a.ordem - b.ordem);
  const capa = gerais[0] ?? todas[0];

  return {
    id: row.id,
    nome: row.nome,
    slug: row.slug,
    descricao: row.descricao,
    categoriaId: row.categoria_id,
    categoriaNome: row.categoria?.nome ?? "",
    categoriaSlug: row.categoria?.slug ?? "",
    modalidadeVenda: row.modalidade_venda,
    controleEstoque: row.controle_estoque,
    quantidadeAtual: row.quantidade_atual,
    quantidadeReservada: row.quantidade_reservada,
    quantidadeMinima: row.quantidade_minima,
    precoCusto: row.preco_custo === null ? null : Number(row.preco_custo),
    precoVenda: Number(row.preco_venda),
    ativo: row.ativo,
    publicado: row.publicado,
    destaque: row.destaque,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    fotoPrincipal: capa ? buildProductPhotoUrl(capa.caminho) : null,
  };
}

function mapProductDetail(row: ProdutoJoinedRow): AdminProductDetail {
  const fotos = row.fotos ?? [];
  const geraisOrdenadas = fotos
    .filter((f) => f.cor_id === null)
    .sort((a, b) => a.ordem - b.ordem)
    .map(mapFoto);

  const cores: AdminCor[] = [...(row.cores ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map((cor) => ({
      id: cor.id,
      nome: cor.nome,
      precoVenda: Number(cor.preco_venda),
      quantidadeAtual: cor.quantidade_atual,
      quantidadeMinima: cor.quantidade_minima,
      ordem: cor.ordem,
      fotos: fotos
        .filter((f) => f.cor_id === cor.id)
        .sort((a, b) => a.ordem - b.ordem)
        .map(mapFoto),
    }));

  return {
    ...mapProduct(row),
    fotos: geraisOrdenadas,
    cores,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: rows, error }] = await Promise.all([
    supabase.from("produtos").select(PRODUTO_SELECT).order("criado_em", { ascending: false }),
  ]);

  if (error || !rows) {
    throw new Error(error?.message ?? "Não foi possível carregar o dashboard.");
  }

  const produtos = (rows as unknown as ProdutoJoinedRow[]).map(mapProduct);

  return {
    ativos: produtos.filter((p) => p.ativo).length,
    publicados: produtos.filter((p) => p.publicado).length,
    prontaEntrega: produtos.filter(
      (p) => p.modalidadeVenda === "pronta_entrega" || p.modalidadeVenda === "ambos",
    ).length,
    sobEncomenda: produtos.filter(
      (p) => p.modalidadeVenda === "sob_encomenda" || p.modalidadeVenda === "ambos",
    ).length,
    estoqueBaixo: produtos.filter(
      (p) =>
        p.controleEstoque === "quantidade" &&
        p.quantidadeAtual !== null &&
        p.quantidadeMinima !== null &&
        p.quantidadeAtual <= p.quantidadeMinima,
    ).length,
    ultimos: produtos.slice(0, 5),
  };
}

export async function listCategoriasAdmin(): Promise<AdminCategoria[]> {
  await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, slug, ordem")
    .order("ordem", { ascending: true });

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível carregar categorias.");
  }

  return data;
}

export async function createCategoria(values: { nome: string; slug: string }): Promise<{ id: string }> {
  await requireStaff();
  const supabase = await createClient();

  const { count } = await supabase
    .from("categorias")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("categorias")
    .insert({ nome: values.nome, slug: values.slug, ordem: (count ?? 0) + 1 })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível criar a categoria.");
  }

  return { id: data.id };
}

export async function deleteCategoria(id: string): Promise<void> {
  await requireStaff();
  const supabase = await createClient();

  const { error } = await supabase.from("categorias").delete().eq("id", id);

  if (error) {
    // FK "on delete restrict" em produtos.categoria_id: categoria com produtos
    // vinculados não pode ser removida.
    if (error.code === "23503") {
      throw new Error("Essa categoria tem produtos vinculados e não pode ser removida.");
    }
    throw new Error(error.message);
  }
}

export interface CorValues {
  nome: string;
  precoVenda: number;
  quantidadeAtual: number | null;
  quantidadeMinima: number | null;
}

export async function createCor(productId: string, values: CorValues): Promise<{ id: string }> {
  await requireStaff();
  const supabase = await createClient();

  const { count } = await supabase
    .from("produto_cores")
    .select("id", { count: "exact", head: true })
    .eq("produto_id", productId);

  const { data, error } = await supabase
    .from("produto_cores")
    .insert({
      produto_id: productId,
      nome: values.nome,
      preco_venda: values.precoVenda,
      quantidade_atual: values.quantidadeAtual,
      quantidade_minima: values.quantidadeMinima,
      ordem: (count ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("Já existe uma cor com esse nome nesse produto.");
    }
    throw new Error(error?.message ?? "Não foi possível criar a cor.");
  }

  return { id: data.id };
}

export async function updateCor(corId: string, values: CorValues): Promise<void> {
  await requireStaff();
  const supabase = await createClient();

  const { error } = await supabase
    .from("produto_cores")
    .update({
      nome: values.nome,
      preco_venda: values.precoVenda,
      quantidade_atual: values.quantidadeAtual,
      quantidade_minima: values.quantidadeMinima,
    })
    .eq("id", corId);

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma cor com esse nome nesse produto.");
    }
    throw new Error(error.message);
  }
}

export async function deleteCor(corId: string): Promise<{ fotoCaminhos: string[] }> {
  await requireStaff();
  const supabase = await createClient();

  const { data: fotos } = await supabase
    .from("produto_fotos")
    .select("caminho")
    .eq("cor_id", corId);

  const { error } = await supabase.from("produto_cores").delete().eq("id", corId);

  if (error) {
    throw new Error(error.message);
  }

  return { fotoCaminhos: (fotos ?? []).map((foto) => foto.caminho) };
}

export async function listProducts(filters: ProductListFilters = {}): Promise<AdminProduct[]> {
  await requireStaff();
  const supabase = await createClient();

  let query = supabase.from("produtos").select(PRODUTO_SELECT);

  if (filters.busca) {
    query = query.ilike("nome", `%${filters.busca}%`);
  }
  if (filters.categoriaId) {
    query = query.eq("categoria_id", filters.categoriaId);
  }
  if (filters.modalidade && filters.modalidade !== "todas") {
    query = query.eq("modalidade_venda", filters.modalidade);
  }
  if (filters.ativo === "ativo") {
    query = query.eq("ativo", true);
  } else if (filters.ativo === "inativo") {
    query = query.eq("ativo", false);
  }
  if (filters.publicado === "publicado") {
    query = query.eq("publicado", true);
  } else if (filters.publicado === "rascunho") {
    query = query.eq("publicado", false);
  }

  const { data, error } = await query.order("criado_em", { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível carregar produtos.");
  }

  return (data as unknown as ProdutoJoinedRow[]).map(mapProduct);
}

export async function getProductById(id: string): Promise<AdminProductDetail | null> {
  await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produtos")
    .select(PRODUTO_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;

  return mapProductDetail(data as unknown as ProdutoJoinedRow);
}

function toInsertPayload(values: ProductFormValues) {
  return {
    nome: values.nome,
    slug: values.slug,
    descricao: values.descricao,
    categoria_id: values.categoriaId,
    modalidade_venda: values.modalidadeVenda,
    controle_estoque: values.controleEstoque,
    quantidade_atual: values.quantidadeAtual,
    quantidade_minima: values.quantidadeMinima,
    preco_custo: values.precoCusto,
    preco_venda: values.precoVenda,
    ativo: values.ativo,
    publicado: values.publicado,
    destaque: values.destaque,
  };
}

export async function createProduct(values: ProductFormValues): Promise<{ id: string }> {
  await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produtos")
    .insert(toInsertPayload(values))
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível criar o produto.");
  }

  return { id: data.id };
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<void> {
  await requireStaff();
  const supabase = await createClient();

  const { error } = await supabase.from("produtos").update(toInsertPayload(values)).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(id: string): Promise<{ fotoCaminhos: string[] }> {
  await requireStaff();
  const supabase = await createClient();

  const { data: fotos } = await supabase
    .from("produto_fotos")
    .select("caminho")
    .eq("produto_id", id);

  const { error } = await supabase.from("produtos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { fotoCaminhos: (fotos ?? []).map((foto) => foto.caminho) };
}

export async function addProductPhoto(
  productId: string,
  caminho: string,
  ordem: number,
  corId: string | null = null,
): Promise<{ id: string }> {
  await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produto_fotos")
    .insert({ produto_id: productId, cor_id: corId, caminho, ordem })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível salvar a foto.");
  }

  return { id: data.id };
}

export async function removeProductPhoto(photoId: string): Promise<{ caminho: string }> {
  await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produto_fotos")
    .delete()
    .eq("id", photoId)
    .select("caminho")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Não foi possível remover a foto.");
  }

  return { caminho: data.caminho };
}

export async function reorderProductPhotos(
  productId: string,
  orderedPhotoIds: string[],
): Promise<void> {
  await requireStaff();
  const supabase = await createClient();

  // Offset temporário evita colidir com a constraint unique(produto_id, ordem)
  // enquanto reordena em duas passadas.
  await Promise.all(
    orderedPhotoIds.map((photoId, index) =>
      supabase
        .from("produto_fotos")
        .update({ ordem: index + 1000 })
        .eq("id", photoId)
        .eq("produto_id", productId),
    ),
  );

  const results = await Promise.all(
    orderedPhotoIds.map((photoId, index) =>
      supabase
        .from("produto_fotos")
        .update({ ordem: index })
        .eq("id", photoId)
        .eq("produto_id", productId),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    throw new Error(failed.error.message);
  }
}

export async function getNextPhotoOrder(
  productId: string,
  corId: string | null = null,
): Promise<number> {
  await requireStaff();
  const supabase = await createClient();

  let query = supabase.from("produto_fotos").select("ordem").eq("produto_id", productId);
  query = corId === null ? query.is("cor_id", null) : query.eq("cor_id", corId);

  const { data, error } = await query.order("ordem", { ascending: false }).limit(1).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? data.ordem + 1 : 0;
}
