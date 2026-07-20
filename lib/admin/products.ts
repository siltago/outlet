import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { buildProductPhotoUrl } from "@/lib/supabase/storage";
import type { ProductFormValues } from "@/lib/validation/product";
import type {
  AdminCategoria,
  AdminProduct,
  AdminProductDetail,
  DashboardStats,
  ProductListFilters,
} from "@/types/admin";

const PRODUTO_SELECT =
  "id, nome, slug, descricao, categoria_id, modalidade_venda, controle_estoque, " +
  "quantidade_atual, quantidade_reservada, quantidade_minima, preco_custo, preco_venda, " +
  "ativo, publicado, destaque, criado_em, atualizado_em, " +
  "categoria:categorias(nome, slug), fotos:produto_fotos(id, caminho, ordem)";

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
  fotos: { id: string; caminho: string; ordem: number }[] | null;
};

function mapProduct(row: ProdutoJoinedRow): AdminProduct {
  const fotosOrdenadas = [...(row.fotos ?? [])].sort((a, b) => a.ordem - b.ordem);
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
    fotoPrincipal: fotosOrdenadas[0] ? buildProductPhotoUrl(fotosOrdenadas[0].caminho) : null,
  };
}

function mapProductDetail(row: ProdutoJoinedRow): AdminProductDetail {
  const fotosOrdenadas = [...(row.fotos ?? [])].sort((a, b) => a.ordem - b.ordem);
  return {
    ...mapProduct(row),
    fotos: fotosOrdenadas.map((foto) => ({
      id: foto.id,
      caminho: foto.caminho,
      url: buildProductPhotoUrl(foto.caminho),
      ordem: foto.ordem,
    })),
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

export async function addProductPhoto(
  productId: string,
  caminho: string,
  ordem: number,
): Promise<void> {
  await requireStaff();
  const supabase = await createClient();

  const { error } = await supabase
    .from("produto_fotos")
    .insert({ produto_id: productId, caminho, ordem });

  if (error) {
    throw new Error(error.message);
  }
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

export async function getNextPhotoOrder(productId: string): Promise<number> {
  await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produto_fotos")
    .select("ordem")
    .eq("produto_id", productId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? data.ordem + 1 : 0;
}
