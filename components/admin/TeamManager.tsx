"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Link2, Trash2, UserMinus } from "lucide-react";
import {
  createInviteAction,
  removeMemberAction,
  revokeInviteAction,
} from "@/app/admin/(protected)/equipe/actions";
import type { PendingInvite, TeamMember } from "@/lib/admin/team";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

interface TeamManagerProps {
  members: TeamMember[];
  invites: PendingInvite[];
  currentUserId: string;
}

export function TeamManager({ members, invites, currentUserId }: TeamManagerProps) {
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await createInviteAction();
      if (result.error || !result.path) {
        setError(result.error ?? "Não foi possível criar o convite.");
        return;
      }
      setLink(`${window.location.origin}${result.path}`);
    });
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  }

  function revoke(id: string) {
    if (!window.confirm("Revogar este convite? O link deixará de funcionar.")) return;
    startTransition(async () => {
      const result = await revokeInviteAction(id);
      if (result.error) setError(result.error);
    });
  }

  function remove(member: TeamMember) {
    if (!window.confirm(`Remover o acesso de ${member.nome ?? member.email}?`)) return;
    startTransition(async () => {
      const result = await removeMemberAction(member.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="rounded-brand border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-sm text-brand-red"
        >
          {error}
        </p>
      )}

      <section className="flex flex-col gap-4 rounded-brand border border-brand-gray-200 bg-brand-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-brand-black">Convidar alguém</h2>
          <button
            type="button"
            onClick={generate}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-brand bg-brand-red px-4 py-2.5 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
          >
            <Link2 className="h-4 w-4" aria-hidden="true" />
            Gerar link de convite
          </button>
        </div>

        {link && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-brand-gray-600">
              Copie e envie agora: por segurança, este link não poderá ser exibido de novo.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={link}
                onFocus={(event) => event.currentTarget.select()}
                className="w-full rounded-brand border border-brand-gray-200 bg-brand-gray-50 px-3 py-2.5 text-sm text-brand-black"
              />
              <button
                type="button"
                onClick={copy}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-brand border border-brand-gray-200 px-4 py-2.5 text-sm font-semibold text-brand-black hover:border-brand-red"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {invites.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-gray-600">
              Convites pendentes
            </h3>
            <ul className="divide-y divide-brand-gray-200 rounded-brand border border-brand-gray-200">
              {invites.map((invite) => (
                <li key={invite.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="text-sm text-brand-black">
                    Criado em {dateFormat.format(new Date(invite.criadoEm))}
                    <span className="text-brand-gray-600">
                      {" "}
                      · expira em {dateFormat.format(new Date(invite.expiraEm))}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => revoke(invite.id)}
                    disabled={pending}
                    aria-label="Revogar convite"
                    className="rounded-brand p-2 text-brand-gray-600 hover:text-brand-red disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-brand border border-brand-gray-200 bg-brand-white">
        <h2 className="border-b border-brand-gray-200 px-4 py-3 text-sm font-semibold text-brand-black">
          Quem tem acesso
        </h2>
        <ul className="divide-y divide-brand-gray-200">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-black">
                  {member.nome ?? "Sem nome"}
                  {member.id === currentUserId && (
                    <span className="ml-2 text-xs font-normal text-brand-gray-600">(você)</span>
                  )}
                </p>
                <p className="truncate text-xs text-brand-gray-600">{member.email}</p>
              </div>
              {member.id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => remove(member)}
                  disabled={pending}
                  aria-label={`Remover acesso de ${member.nome ?? member.email}`}
                  className="rounded-brand p-2 text-brand-gray-600 hover:text-brand-red disabled:opacity-60"
                >
                  <UserMinus className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
