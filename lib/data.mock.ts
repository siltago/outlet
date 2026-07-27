import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Category, Marca, Product, ProductWithCategory } from "@/types/product";

// Fallback de desenvolvimento: mesma interface de `lib/data.ts`, mas lendo os
// mocks em `data/`. Usado só quando as variáveis do Supabase não estão
// configuradas em ambiente de desenvolvimento (ver `lib/data.ts`).
//
// Não há mock de marcas ainda — produtos mock ficam sem marca (campo opcional).

function withCategory(product: Product): ProductWithCategory {
  const categoria = categories.find((c) => c.slug === product.categoriaSlug);
  if (!categoria) {
    throw new Error(`Categoria não encontrada para o produto ${product.slug}`);
  }
  return { ...product, categoria, marca: null };
}

function isPublished(product: Product): boolean {
  return product.ativo && product.publicado;
}

export async function getCategories(): Promise<Category[]> {
  return [...categories].sort((a, b) => a.ordem - b.ordem);
}

export async function getMarcas(): Promise<Marca[]> {
  return [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(): Promise<ProductWithCategory[]> {
  return products.filter(isPublished).map(withCategory);
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<ProductWithCategory[]> {
  const all = await getProducts();
  return all.filter((p) => p.categoriaSlug === categorySlug);
}

export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const all = await getProducts();
  return all.filter((p) => p.destaque);
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const product = products.find((p) => p.slug === slug && isPublished(p));
  return product ? withCategory(product) : null;
}

export async function getRelatedProducts(
  product: ProductWithCategory,
  limit = 4,
): Promise<ProductWithCategory[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.categoriaSlug === product.categoriaSlug && p.id !== product.id)
    .slice(0, limit);
}
