import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/BannerManager";
import { listBannersAdmin } from "@/lib/banners";

export const metadata: Metadata = {
  title: "Banners",
};

export default async function BannersPage() {
  const banners = await listBannersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">Banners</h1>
        <p className="text-sm text-brand-gray-600">
          Imagens que passam automaticamente no topo da página inicial. A ordem da lista é a ordem
          de exibição.
        </p>
      </div>

      <BannerManager banners={banners} />
    </div>
  );
}
