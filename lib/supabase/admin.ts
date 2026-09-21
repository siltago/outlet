import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/config";

/**
 * Cliente com a service role: ignora RLS e acessa a API de administração do
 * Auth. Use SOMENTE em código de servidor, depois de validar quem está
 * chamando (requireStaff ou token de convite). Nunca exponha ao navegador.
 */
export function createServiceClient() {
  const { url } = requireSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada (veja .env.example).");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
