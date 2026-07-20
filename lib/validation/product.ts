import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productFormSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome do produto.").max(160),
    slug: z
      .string()
      .trim()
      .min(2, "Informe o slug.")
      .max(160)
      .regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífens."),
    descricao: z.string().trim().max(4000).default(""),
    categoriaId: z.string().uuid("Selecione uma categoria."),
    modalidadeVenda: z.enum(["pronta_entrega", "sob_encomenda", "ambos"], {
      message: "Selecione a modalidade de venda.",
    }),
    controleEstoque: z.enum(["quantidade", "sem_controle"], {
      message: "Selecione o controle de estoque.",
    }),
    quantidadeAtual: z.coerce.number().int().min(0, "Não pode ser negativo.").nullable(),
    quantidadeMinima: z.coerce.number().int().min(0, "Não pode ser negativo.").nullable(),
    precoCusto: z.coerce.number().min(0, "Não pode ser negativo.").nullable(),
    precoVenda: z.coerce.number().min(0.01, "Informe um preço de venda válido."),
    ativo: z.coerce.boolean(),
    publicado: z.coerce.boolean(),
    destaque: z.coerce.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.modalidadeVenda === "sob_encomenda" && data.controleEstoque !== "sem_controle") {
      ctx.addIssue({
        code: "custom",
        path: ["controleEstoque"],
        message: "Produtos sob encomenda exigem controle de estoque \"sem controle\".",
      });
    }

    if (data.modalidadeVenda !== "sob_encomenda" && data.controleEstoque !== "quantidade") {
      ctx.addIssue({
        code: "custom",
        path: ["controleEstoque"],
        message: "Pronta entrega e ambos exigem controle de estoque por quantidade.",
      });
    }

    if (data.controleEstoque === "sem_controle") {
      if (data.quantidadeAtual !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantidadeAtual"],
          message: "Sem controle de estoque não deve informar quantidade.",
        });
      }
      if (data.quantidadeMinima !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantidadeMinima"],
          message: "Sem controle de estoque não deve informar quantidade mínima.",
        });
      }
    }

    if (data.controleEstoque === "quantidade") {
      if (data.quantidadeAtual === null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantidadeAtual"],
          message: "Informe a quantidade atual.",
        });
      }
      if (data.quantidadeMinima === null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantidadeMinima"],
          message: "Informe a quantidade mínima.",
        });
      }
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function parseProductFormData(formData: FormData) {
  const emptyToNull = (value: FormDataEntryValue | null) => {
    if (value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  };

  const raw = {
    nome: formData.get("nome") ?? "",
    slug: formData.get("slug") ?? "",
    descricao: formData.get("descricao") ?? "",
    categoriaId: formData.get("categoriaId") ?? "",
    modalidadeVenda: formData.get("modalidadeVenda") ?? "",
    controleEstoque: formData.get("controleEstoque") ?? "",
    quantidadeAtual: emptyToNull(formData.get("quantidadeAtual")),
    quantidadeMinima: emptyToNull(formData.get("quantidadeMinima")),
    precoCusto: emptyToNull(formData.get("precoCusto")),
    precoVenda: formData.get("precoVenda") ?? "",
    ativo: formData.get("ativo"),
    publicado: formData.get("publicado"),
    destaque: formData.get("destaque"),
  };

  return productFormSchema.safeParse(raw);
}

export const categoryFormSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da categoria.").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Informe o slug.")
    .max(80)
    .regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífens."),
  ordem: z.coerce.number().int().min(0).default(0),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
