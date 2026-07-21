import type { ControleEstoque, ModalidadeVenda } from "@/types/database";

export interface AdminCategoria {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
}

export interface AdminProductPhoto {
  id: string;
  caminho: string;
  url: string;
  ordem: number;
}

export interface AdminCor {
  id: string;
  nome: string;
  precoCusto: number | null;
  precoVenda: number;
  quantidadeAtual: number | null;
  quantidadeMinima: number | null;
  ordem: number;
  fotos: AdminProductPhoto[];
}

export interface AdminProduct {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  categoriaId: string;
  categoriaNome: string;
  categoriaSlug: string;
  modalidadeVenda: ModalidadeVenda;
  controleEstoque: ControleEstoque;
  quantidadeAtual: number | null;
  quantidadeReservada: number;
  quantidadeMinima: number | null;
  precoCusto: number | null;
  precoVenda: number;
  ativo: boolean;
  publicado: boolean;
  destaque: boolean;
  criadoEm: string;
  atualizadoEm: string;
  fotoPrincipal: string | null;
}

export interface AdminProductDetail extends AdminProduct {
  fotos: AdminProductPhoto[];
  cores: AdminCor[];
}

export interface ProductListFilters {
  busca?: string;
  categoriaId?: string;
  modalidade?: ModalidadeVenda | "todas";
  ativo?: "todos" | "ativo" | "inativo";
  publicado?: "todos" | "publicado" | "rascunho";
}

export interface DashboardStats {
  ativos: number;
  publicados: number;
  prontaEntrega: number;
  sobEncomenda: number;
  estoqueBaixo: number;
  ultimos: AdminProduct[];
}
