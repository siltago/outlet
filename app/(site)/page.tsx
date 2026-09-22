import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CategoryList } from "@/components/catalog/CategoryList";
import { ProductCard } from "@/components/catalog/ProductCard";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { Hero } from "@/components/home/Hero";
import { CommunityBand } from "@/components/home/CommunityBand";
import { TrustSection } from "@/components/home/TrustSection";
import { WhatsAppBand } from "@/components/home/WhatsAppBand";
import { getActiveBanners } from "@/lib/banners";
import { getCategories, getFeaturedProducts } from "@/lib/data";

export default async function HomePage() {
  const [categories, featuredProducts, banners] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getActiveBanners(),
  ]);

  return (
    <>
      <Hero />

      <section className="py-16">
        <Container>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="display text-2xl text-brand-white">Categorias</h2>
          </div>
          <CategoryList categories={categories} />
        </Container>
      </section>

      {banners.length > 0 && (
        <div className="pb-16">
          <Container>
            <BannerCarousel banners={banners} />
          </Container>
        </div>
      )}

      {featuredProducts.length > 0 && (
        <section className="pb-16">
          <Container>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="display text-2xl text-brand-white">Produtos em destaque</h2>
              <Button href="/catalogo" variant="outline-light" size="md" className="shrink-0">
                Ver tudo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CommunityBand />
      <TrustSection />
      <WhatsAppBand />
    </>
  );
}
