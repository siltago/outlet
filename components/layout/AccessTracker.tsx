"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/supabase/config";

const SESSION_FLAG = "dstrkt:acesso-registrado";
const VISITOR_KEY = "dstrkt:visitante";

// Registra um acesso por sessão de navegação (contador do dashboard admin).
// Não renderiza nada e falha em silêncio: nunca deve atrapalhar o site.
export function AccessTracker() {
  useEffect(() => {
    if (!hasSupabaseEnv()) return;

    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
      sessionStorage.setItem(SESSION_FLAG, "1");

      let visitante = localStorage.getItem(VISITOR_KEY);
      if (!visitante) {
        visitante = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitante);
      }

      // Cliente sem tipagem: a tabela é só de escrita e não está em types/database.
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      void supabase
        .from("acessos_site")
        .insert({ visitante, caminho: window.location.pathname.slice(0, 200) })
        .then(() => {});
    } catch {
      // sem contador, sem problema
    }
  }, []);

  return null;
}
