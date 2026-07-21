"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup, type SignupState } from "@/app/admin/signup/actions";

const initialState: SignupState = { error: null, success: false, userId: null };

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

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-sm text-brand-white">
          Conta criada. Seu acesso ao painel ainda precisa ser liberado manualmente — rode no SQL
          Editor do Supabase:
        </p>
        <pre className="overflow-x-auto rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-xs text-brand-gray-400">
          {`insert into public.profiles (id, nome)\nvalues ('${state.userId ?? "SEU_USER_ID"}', 'Seu nome');`}
        </pre>
        <Link
          href="/admin/login"
          className="text-center text-sm font-medium text-brand-red hover:text-brand-red-dark"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
          minLength={8}
          autoComplete="new-password"
          className="rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-sm text-brand-white placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
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
          className="rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-sm text-brand-white placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
          placeholder="••••••••"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-brand-white">Código de convite</span>
        <input
          type="password"
          name="code"
          required
          autoComplete="off"
          className="rounded-brand border border-brand-gray-600/40 bg-brand-white/5 px-3 py-2.5 text-sm text-brand-white placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
          placeholder="Código recebido"
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

      <Link
        href="/admin/login"
        className="text-center text-sm font-medium text-brand-gray-400 hover:text-brand-white"
      >
        Já tem conta? Entrar
      </Link>
    </form>
  );
}
