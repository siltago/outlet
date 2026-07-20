import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Clock, Eye, Package, PackageCheck } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/products";
import { formatCurrencyBRL } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

const STAT_CARDS = [
  { key: "ativos" as const, label: "Produtos ativos", icon: PackageCheck },
  { key: "publicados" as const, label: "Publicados no site", icon: Eye },
  { key: "prontaEntrega" as const, label: "Pronta entrega", icon: CheckCircle2 },
  { key: "sobEncomenda" as const, label: "Sob encomenda", icon: Clock },
  { key: "estoqueBaixo" as const, label: "Estoque baixo", icon: AlertTriangle },
];

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">Dashboard</h1>
        <p className="text-sm text-brand-gray-600">Visão geral do catálogo administrado.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="flex flex-col gap-2 rounded-brand border border-brand-gray-200 bg-brand-white p-4"
          >
            <card.icon className="h-5 w-5 text-brand-red" aria-hidden="true" />
            <span className="text-2xl font-bold text-brand-black">{stats[card.key]}</span>
            <span className="text-xs font-medium text-brand-gray-600">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-brand border border-brand-gray-200 bg-brand-white">
        <div className="flex items-center justify-between border-b border-brand-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-brand-black">Últimos produtos cadastrados</h2>
          <Link href="/admin/produtos" className="text-sm font-semibold text-brand-red hover:text-brand-red-dark">
            Ver todos
          </Link>
        </div>

        {stats.ultimos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Package className="h-8 w-8 text-brand-gray-400" aria-hidden="true" />
            <p className="text-sm text-brand-gray-600">Nenhum produto cadastrado ainda.</p>
            <Link href="/admin/produtos/novo" className="text-sm font-semibold text-brand-red hover:text-brand-red-dark">
              Cadastrar o primeiro produto
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-brand-gray-200">
            {stats.ultimos.map((produto) => (
              <li key={produto.id} className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-brand bg-brand-gray-50">
                  {produto.fotoPrincipal && (
                    <Image
                      src={produto.fotoPrincipal}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/produtos/${produto.id}`}
                    className="block truncate text-sm font-semibold text-brand-black hover:text-brand-red"
                  >
                    {produto.nome}
                  </Link>
                  <span className="text-xs text-brand-gray-600">{produto.categoriaNome}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-brand-black">
                  {formatCurrencyBRL(produto.precoVenda)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
