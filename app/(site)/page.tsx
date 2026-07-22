import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Hero } from "@/components/home/Hero";
import { CommunityBand } from "@/components/home/CommunityBand";
import { TrustSection } from "@/components/home/TrustSection";
import { WhatsAppBand } from "@/components/home/WhatsAppBand";
import { getCategories, getFeaturedProducts } from "@/lib/data";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <Hero />

      <section className="py-14">
        <Container>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-brand-black">Categorias</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      {featuredProducts.length > 0 && (
        <section className="pb-14">
          <Container>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-brand-black">Produtos em destaque</h2>
              <Button href="/catalogo" variant="secondary" size="md" className="shrink-0">
                Ver tudo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
