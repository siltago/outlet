import type { Category } from "@/types/product";

// Mock temporário — futuramente substituído pela tabela `categorias` do Supabase.
export const categories: Category[] = [
  { id: "cat-smartphones", nome: "Smartphones", slug: "smartphones", ordem: 1, icone: "smartphone" },
  { id: "cat-relogios", nome: "Relógios", slug: "relogios", ordem: 2, icone: "smartwatch" },
  { id: "cat-fones", nome: "Fones", slug: "fones", ordem: 3, icone: "fone" },
  { id: "cat-perfumes", nome: "Perfumes", slug: "perfumes", ordem: 4, icone: "perfume" },
  { id: "cat-tenis", nome: "Tênis", slug: "tenis", ordem: 5, icone: "tenis" },
  { id: "cat-acessorios", nome: "Acessórios", slug: "acessorios", ordem: 6, icone: "acessorio" },
];
