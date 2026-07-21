// Tipos escritos à mão a partir de supabase/migrations/20260720191129_catalog_admin.sql.
// Quando houver um projeto Supabase acessível, regenere com:
//   npx supabase gen types typescript --local > types/database.ts
//   npx supabase gen types typescript --project-id <ref> > types/database.ts

export type ModalidadeVenda = "pronta_entrega" | "sob_encomenda" | "ambos";
export type ControleEstoque = "quantidade" | "sem_controle";

export interface Database {
  // Necessário para o supabase-js (postgrest-js) inferir corretamente os
  // tipos de insert/update — sem isso, os métodos caem em `never`.
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string | null;
          papel: "admin";
          criado_em: string;
        };
        Insert: {
          id: string;
          nome?: string | null;
          papel?: "admin";
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string | null;
          papel?: "admin";
          criado_em?: string;
        };
        Relationships: [];
      };
      categorias: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          ordem: number;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          ordem?: number;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          ordem?: number;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      produtos: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string;
          categoria_id: string;
          modalidade_venda: ModalidadeVenda;
          controle_estoque: ControleEstoque;
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
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          descricao?: string;
          categoria_id: string;
          modalidade_venda: ModalidadeVenda;
          controle_estoque: ControleEstoque;
          quantidade_atual?: number | null;
          quantidade_reservada?: number;
          quantidade_minima?: number | null;
          preco_custo?: number | null;
          preco_venda: number;
          ativo?: boolean;
          publicado?: boolean;
          destaque?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          descricao?: string;
          categoria_id?: string;
          modalidade_venda?: ModalidadeVenda;
          controle_estoque?: ControleEstoque;
          quantidade_atual?: number | null;
          quantidade_reservada?: number;
          quantidade_minima?: number | null;
          preco_custo?: number | null;
          preco_venda?: number;
          ativo?: boolean;
          publicado?: boolean;
          destaque?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
        ];
      };
      produto_fotos: {
        Row: {
          id: string;
          produto_id: string;
          cor_id: string | null;
          caminho: string;
          ordem: number;
          criado_em: string;
        };
        Insert: {
          id?: string;
          produto_id: string;
          cor_id?: string | null;
          caminho: string;
          ordem?: number;
          criado_em?: string;
        };
        Update: {
          id?: string;
          produto_id?: string;
          cor_id?: string | null;
          caminho?: string;
          ordem?: number;
          criado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "produto_fotos_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "produto_fotos_cor_id_fkey";
            columns: ["cor_id"];
            isOneToOne: false;
            referencedRelation: "produto_cores";
            referencedColumns: ["id"];
          },
        ];
      };
      produto_cores: {
        Row: {
          id: string;
          produto_id: string;
          nome: string;
          preco_custo: number | null;
          preco_venda: number;
          quantidade_atual: number | null;
          quantidade_minima: number | null;
          quantidade_reservada: number;
          ordem: number;
          criado_em: string;
        };
        Insert: {
          id?: string;
          produto_id: string;
          nome: string;
          preco_custo?: number | null;
          preco_venda: number;
          quantidade_atual?: number | null;
          quantidade_minima?: number | null;
          quantidade_reservada?: number;
          ordem?: number;
          criado_em?: string;
        };
        Update: {
          id?: string;
          produto_id?: string;
          nome?: string;
          preco_custo?: number | null;
          preco_venda?: number;
          quantidade_atual?: number | null;
          quantidade_minima?: number | null;
          quantidade_reservada?: number;
          ordem?: number;
          criado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "produto_cores_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      vw_catalogo_publico: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string;
          categoria_id: string;
          categoria_nome: string;
          categoria_slug: string;
          modalidade_venda: ModalidadeVenda;
          controle_estoque: ControleEstoque;
          quantidade_disponivel: number | null;
          preco_venda: number;
          tem_cores: boolean;
          destaque: boolean;
          criado_em: string;
          atualizado_em: string;
          fotos: string[];
        };
        Relationships: [];
      };
      vw_produto_cores_publico: {
        Row: {
          id: string;
          produto_id: string;
          nome: string;
          preco_venda: number;
          quantidade_disponivel: number | null;
          ordem: number;
          fotos: string[];
        };
        Relationships: [];
      };
    };
    Functions: {
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
