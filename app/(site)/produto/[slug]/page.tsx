import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInterestActions } from "@/components/product/ProductInterestActions";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getAvailability } from "@/lib/availability";
import { formatCurrencyBRL } from "@/lib/format";
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

  const availability = getAvailability(product);
  const related = await getRelatedProducts(product);

  return (
    <section className="py-10">
      <Container className="flex flex-col gap-12">
        <div className="grid gap-10 md:grid-cols-2">
          <ProductGallery images={product.imagens} name={product.nome} />

          <div className="flex flex-col gap-4">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-gray-600">
              {product.categoria.nome}
            </span>
            <h1 className="text-2xl font-bold text-brand-black sm:text-3xl">{product.nome}</h1>
            <AvailabilityBadge availability={availability} />
            <p className="text-3xl font-extrabold text-brand-black">
              {formatCurrencyBRL(product.precoVenda)}
            </p>
            <p className="text-sm leading-relaxed text-brand-gray-600">{product.descricao}</p>

            <div className="mt-2">
              <ProductInterestActions productName={product.nome} availability={availability} />
            </div>
          </div>
        </div>

        <RelatedProducts products={related} />
      </Container>
    </section>
  );
}
