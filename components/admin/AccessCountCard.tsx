import { Users } from "lucide-react";

export function AccessCountCard({
  acessos,
  visitantes,
}: {
  acessos: number | null;
  visitantes: number | null;
}) {
  return (
    <div className="flex items-center gap-4 rounded-brand border border-brand-gray-200 bg-brand-white p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-brand bg-brand-gray-50">
        <Users className="h-5 w-5 text-brand-red" aria-hidden="true" />
      </span>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-brand-black">{acessos ?? "–"}</span>
        <span className="text-xs font-medium text-brand-gray-600">
          Acessos nos últimos 30 dias
          {visitantes !== null && ` · ${visitantes} ${visitantes === 1 ? "visitante único" : "visitantes únicos"}`}
        </span>
      </div>
    </div>
  );
}
