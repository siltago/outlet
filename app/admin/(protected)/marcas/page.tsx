import type { Metadata } from "next";
import { MarcaManager } from "@/components/admin/MarcaManager";
import { listMarcasAdmin } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "Marcas",
};

export default async function MarcasPage() {
  const marcas = await listMarcasAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">Marcas</h1>
        <p className="text-sm text-brand-gray-600">
          Gerencie as marcas do catálogo. Opcional — um produto pode ficar sem marca.
        </p>
      </div>

      <MarcaManager marcas={marcas} />
    </div>
  );
}
