import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { buildBannerUrl } from "@/lib/supabase/storage";
import type { Banner } from "@/types/banner";
import type { Database } from "@/types/database";

type BannerRow = Database["public"]["Tables"]["banners"]["Row"];

function mapBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    imagem: buildBannerUrl(row.imagem_caminho),
    imagemMobile: row.imagem_mobile_caminho ? buildBannerUrl(row.imagem_mobile_caminho) : null,
    link: row.link,
    ordem: row.ordem,
    ativo: row.ativo,
  };
}

/** Banners ativos para o carrossel da home. Nunca lança: sem banners, a home mostra o Hero. */
export async function getActiveBanners(): Promise<Banner[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("criado_em", { ascending: true });
    if (error || !data) return [];
    return data.map(mapBanner);
  } catch {
    return [];
  }
}

/** Todos os banners (ativos e inativos) para o painel admin. */
export async function listBannersAdmin(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("ordem", { ascending: true })
    .order("criado_em", { ascending: true });
  if (error) throw new Error("Não foi possível listar os banners.");
  return (data ?? []).map(mapBanner);
}
