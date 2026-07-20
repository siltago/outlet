import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { buildProductPhotoUrl } from "@/lib/supabase/storage";
import * as mock from "@/lib/data.mock";
import type { Category, ProductWithCategory } from "@/types/product";
import type { Database } from "@/types/database";

// Camada de acesso a dados do catálogo público. Lê de `vw_catalogo_publico`
// (nunca expõe preco_custo, quantidade_reservada ou quantidade_minima) e da
// tabela `categorias`. Mantém a mesma interface usada pelas páginas —
// getProducts/getFeaturedProducts/getProductBySlug/getCategories — para que
// nenhuma página precise mudar.
//
// Em desenvolvimento, se as variáveis do Supabase estiverem ausentes, cai de
// volta para os mocks locais (aviso só no terminal). Em produção, a ausência
// delas lança um erro claro em `requireSupabaseEnv` (ver lib/supabase/config).

type CatalogRow = Database["public"]["Views"]["vw_catalogo_publico"]["Row"];

function warnMockFallback(reason: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[outlet-premium] catálogo usando mocks locais (${reason}).`);
  }
}

async function getPublicClient() {
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias em produção.",
      );
    }
    warnMockFallback("NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes");
    return null;
  }
  return createClient();
}

function mapRow(row: CatalogRow): ProductWithCategory {
  return {
    id: row.id,
    nome: row.nome,
    slug: row.slug,
    descricao: row.descricao,
    categoriaSlug: row.categoria_slug,
    modalidadeVenda: row.modalidade_venda,
    controleEstoque: row.controle_estoque,
    quantidadeAtual: row.quantidade_disponivel,
    precoVenda: Number(row.preco_venda),
    ativo: true,
    publicado: true,
    destaque: row.destaque,
    imagens: row.fotos.map(buildProductPhotoUrl),
    categoria: {
      id: row.categoria_id,
      nome: row.categoria_nome,
      slug: row.categoria_slug,
      ordem: 0,
    },
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await getPublicClient();
  if (!supabase) return mock.getCategories();

  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, slug, ordem")
    .order("ordem", { ascending: true });

  if (error || !data) {
    warnMockFallback(`erro ao consultar categorias (${error?.message ?? "sem dados"})`);
    return mock.getCategories();
  }

  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await getPublicClient();
  if (!supabase) return mock.getCategoryBySlug(slug);

  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, slug, ordem")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    warnMockFallback(`erro ao consultar categoria (${error.message})`);
    return mock.getCategoryBySlug(slug);
  }

  return data;
}

export async function getProducts(): Promise<ProductWithCategory[]> {
  const supabase = await getPublicClient();
  if (!supabase) return mock.getProducts();

  const { data, error } = await supabase
    .from("vw_catalogo_publico")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error || !data) {
    warnMockFallback(`erro ao consultar produtos (${error?.message ?? "sem dados"})`);
    return mock.getProducts();
  }

  return data.map(mapRow);
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<ProductWithCategory[]> {
  const supabase = await getPublicClient();
  if (!supabase) return mock.getProductsByCategory(categorySlug);

  const { data, error } = await supabase
    .from("vw_catalogo_publico")
    .select("*")
    .eq("categoria_slug", categorySlug)
    .order("criado_em", { ascending: false });

  if (error || !data) {
    warnMockFallback(`erro ao consultar produtos por categoria (${error?.message ?? "sem dados"})`);
    return mock.getProductsByCategory(categorySlug);
  }

  return data.map(mapRow);
}

export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const supabase = await getPublicClient();
  if (!supabase) return mock.getFeaturedProducts();

  const { data, error } = await supabase
    .from("vw_catalogo_publico")
    .select("*")
    .eq("destaque", true)
    .order("criado_em", { ascending: false });

  if (error || !data) {
    warnMockFallback(`erro ao consultar destaques (${error?.message ?? "sem dados"})`);
    return mock.getFeaturedProducts();
  }

  return data.map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const supabase = await getPublicClient();
  if (!supabase) return mock.getProductBySlug(slug);

  const { data, error } = await supabase
    .from("vw_catalogo_publico")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    warnMockFallback(`erro ao consultar produto (${error.message})`);
    return mock.getProductBySlug(slug);
  }

  return data ? mapRow(data) : null;
}

export async function getRelatedProducts(
  product: ProductWithCategory,
  limit = 4,
): Promise<ProductWithCategory[]> {
  const supabase = await getPublicClient();
  if (!supabase) return mock.getRelatedProducts(product, limit);

  const { data, error } = await supabase
    .from("vw_catalogo_publico")
    .select("*")
    .eq("categoria_slug", product.categoriaSlug)
    .neq("id", product.id)
    .order("criado_em", { ascending: false })
    .limit(limit);

  if (error || !data) {
    warnMockFallback(`erro ao consultar relacionados (${error?.message ?? "sem dados"})`);
    return mock.getRelatedProducts(product, limit);
  }

  return data.map(mapRow);
}
