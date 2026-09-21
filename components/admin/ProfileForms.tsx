"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  changePasswordAction,
  updateNameAction,
  type ProfileFormState,
} from "@/app/admin/(protected)/perfil/actions";

const initialState: ProfileFormState = { error: null, success: false };

const INPUT_CLASS =
  "w-full rounded-brand border border-brand-gray-200 bg-brand-white px-3 py-2.5 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-fit items-center justify-center rounded-brand bg-brand-red px-5 py-2.5 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
    >
      {pending ? "Salvando..." : label}
    </button>
  );
}

function Feedback({ state, successMessage }: { state: ProfileFormState; successMessage: string }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-brand border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-sm text-brand-red"
      >
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-brand border border-brand-gray-200 bg-brand-gray-50 px-3 py-2 text-sm text-brand-black">
        {successMessage}
      </p>
    );
  }
  return null;
}

export function ProfileForms({ nome, email }: { nome: string; email: string }) {
  const [nameState, nameAction] = useActionState(updateNameAction, initialState);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, initialState);

  return (
    <div className="flex flex-col gap-6">
      <form
        action={nameAction}
        className="flex flex-col gap-4 rounded-brand border border-brand-gray-200 bg-brand-white p-4"
      >
        <h2 className="text-sm font-semibold text-brand-black">Dados do perfil</h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-brand-black">Nome</span>
          <input name="nome" required maxLength={80} defaultValue={nome} className={INPUT_CLASS} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-brand-black">E-mail</span>
          <input value={email} readOnly disabled className={`${INPUT_CLASS} opacity-60`} />
        </label>

        <Feedback state={nameState} successMessage="Nome atualizado." />
        <SubmitButton label="Salvar" />
      </form>

      <form
        key={passwordState.success ? "done" : "form"}
        action={passwordAction}
        className="flex flex-col gap-4 rounded-brand border border-brand-gray-200 bg-brand-white p-4"
      >
        <h2 className="text-sm font-semibold text-brand-black">Alterar senha</h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-brand-black">Senha atual</span>
          <input
            type="password"
            name="currentPassword"
            required
            autoComplete="current-password"
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-brand-black">Nova senha</span>
          <input
            type="password"
            name="newPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className={INPUT_CLASS}
            placeholder="Mínimo 8 caracteres"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-brand-black">Confirmar nova senha</span>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className={INPUT_CLASS}
          />
        </label>

        <Feedback state={passwordState} successMessage="Senha alterada." />
        <SubmitButton label="Alterar senha" />
      </form>
    </div>
  );
}
