"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { acceptInviteAction, type InviteSignupState } from "@/app/admin/convite/[token]/actions";

const initialState: InviteSignupState = { error: null };

const INPUT_CLASS =
  "rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-sm text-brand-white placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-brand bg-brand-red px-4 py-3 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
    >
      {pending ? "Criando conta..." : "Criar conta"}
    </button>
  );
}

export function InviteSignupForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(acceptInviteAction.bind(null, token), initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-white">Nome</span>
        <input name="nome" required autoComplete="name" className={INPUT_CLASS} placeholder="Seu nome" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-white">E-mail</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={INPUT_CLASS}
          placeholder="voce@email.com"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-white">Senha</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={INPUT_CLASS}
          placeholder="Mínimo 8 caracteres"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-white">Confirmar senha</span>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={INPUT_CLASS}
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
