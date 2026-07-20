import Link from "next/link";
import { PackageX } from "lucide-react";

export default function ProdutoNaoEncontrado() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-brand border border-dashed border-brand-gray-200 py-16 text-center">
      <PackageX className="h-8 w-8 text-brand-gray-400" aria-hidden="true" />
      <p className="font-semibold text-brand-black">Produto não encontrado</p>
      <Link href="/admin/produtos" className="text-sm font-semibold text-brand-red hover:text-brand-red-dark">
        Voltar para produtos
      </Link>
    </div>
  );
}
