import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "@/lib/supabase/config";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Crie uma instância nova a cada requisição — nunca reutilize entre requests.
 */
export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Chamado a partir de um Server Component sem permissão de escrita
          // em cookies; o proxy.ts cuida do refresh de sessão nesse caso.
        }
      },
    },
  });
}
