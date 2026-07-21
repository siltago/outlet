import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.nome,
    description: product.descricao,
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <section className="py-10">
      <Container className="flex flex-col gap-12">
        <div className="grid gap-10 md:grid-cols-2">
          <ProductPurchasePanel product={product} />
        </div>

        <RelatedProducts products={related} />
      </Container>
    </section>
  );
}
