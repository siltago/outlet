"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BANNERS_BUCKET } from "@/lib/supabase/storage";

interface ActionResult {
  error: string | null;
}

// O upload das imagens é feito direto do navegador para o Storage (a sessão
// do admin + RLS autorizam). Aqui só validamos os caminhos e gravamos o registro.
const PATH_PATTERN = /^[0-9a-f-]{36}\.(png|jpe?g|webp|avif)$/;

function revalidateBanners() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

function normalizeLink(raw: string): string | null | undefined {
  const link = raw.trim();
  if (!link) return null;
  if (link.length > 500) return undefined;
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  try {
    const url = new URL(link);
    return url.protocol === "https:" || url.protocol === "http:" ? link : undefined;
  } catch {
    return undefined;
  }
}

export async function createBannerAction(input: {
  imagemCaminho: string;
  link: string;
}): Promise<ActionResult> {
  await requireStaff();

  if (!PATH_PATTERN.test(input.imagemCaminho)) return { error: "Imagem inválida." };
  const link = normalizeLink(input.link);
  if (link === undefined) {
    return { error: "Link inválido. Use um endereço https://... ou um caminho como /catalogo." };
  }

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("banners")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("banners").insert({
    imagem_caminho: input.imagemCaminho,
    link,
    ordem: (last?.ordem ?? -1) + 1,
  });

  if (error) {
    await supabase.storage.from(BANNERS_BUCKET).remove([input.imagemCaminho]);
    return { error: "Não foi possível salvar o banner." };
  }

  revalidateBanners();
  return { error: null };
}

export async function toggleBannerAction(id: string, ativo: boolean): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("banners").update({ ativo }).eq("id", id);
  if (error) return { error: "Não foi possível atualizar o banner." };
  revalidateBanners();
  return { error: null };
}

export async function moveBannerAction(id: string, direction: -1 | 1): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("banners")
    .select("id")
    .order("ordem", { ascending: true })
    .order("criado_em", { ascending: true });
  if (error || !rows) return { error: "Não foi possível reordenar." };

  const ids = rows.map((row) => row.id);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ids.length) return { error: null };

  [ids[from], ids[to]] = [ids[to], ids[from]];

  // Reescreve a ordem de todos (poucos banners) para não deixar empates.
  const results = await Promise.all(
    ids.map((bannerId, index) => supabase.from("banners").update({ ordem: index }).eq("id", bannerId)),
  );
  if (results.some((result) => result.error)) return { error: "Não foi possível reordenar." };

  revalidateBanners();
  return { error: null };
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const { data: banner } = await supabase
    .from("banners")
    .select("imagem_caminho")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: "Não foi possível remover o banner." };

  if (banner) {
    // Arquivo órfão no bucket não é crítico; por isso não falha a ação.
    await supabase.storage.from(BANNERS_BUCKET).remove([banner.imagem_caminho]);
  }

  revalidateBanners();
  return { error: null };
}
