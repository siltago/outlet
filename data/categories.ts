import type { Category } from "@/types/product";

// Mock temporário — futuramente substituído pela tabela `categorias` do Supabase.
export const categories: Category[] = [
  { id: "cat-smartphones", nome: "Smartphones", slug: "smartphones", ordem: 1 },
  { id: "cat-relogios", nome: "Relógios", slug: "relogios", ordem: 2 },
  { id: "cat-fones", nome: "Fones", slug: "fones", ordem: 3 },
  { id: "cat-perfumes", nome: "Perfumes", slug: "perfumes", ordem: 4 },
  { id: "cat-tenis", nome: "Tênis", slug: "tenis", ordem: 5 },
  { id: "cat-acessorios", nome: "Acessórios", slug: "acessorios", ordem: 6 },
];
