// Tipos alinhados ao modelo de dados planejado para o Supabase (produtos/venda_itens).
// Nesta primeira versão os dados vêm de mocks locais (ver data/products.ts).

export type SaleModality = "pronta_entrega" | "sob_encomenda" | "ambos";

export type StockControl = "quantidade" | "sem_controle";

export interface Category {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  icone: string | null;
}

export interface Marca {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
}

export interface ProductColor {
  id: string;
  nome: string;
  precoVenda: number;
  quantidadeAtual: number | null;
  imagens: string[];
}

export interface Product {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  categoriaSlug: string;
  marcaSlug?: string | null;
  modalidadeVenda: SaleModality;
  controleEstoque: StockControl;
  quantidadeAtual: number | null;
  precoVenda: number;
  temCores?: boolean;
  cores?: ProductColor[];
  ativo: boolean;
  publicado: boolean;
  destaque: boolean;
  imagens: string[];
}

export interface ProductWithCategory extends Product {
  categoria: Category;
  marca: Marca | null;
}
