"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-brand bg-brand-red px-4 py-3 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-white">E-mail</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-sm text-brand-white placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
          placeholder="voce@outletpremium.com"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-white">Senha</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-sm text-brand-white placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
          placeholder="••••••••"
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-brand border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-sm text-brand-red"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
