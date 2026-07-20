import { Container } from "@/components/ui/Container";

export default function LoadingProduto() {
  return (
    <section className="py-10">
      <Container className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-brand bg-brand-gray-100" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 animate-pulse rounded-brand bg-brand-gray-100" />
          <div className="h-8 w-3/4 animate-pulse rounded-brand bg-brand-gray-100" />
          <div className="h-6 w-32 animate-pulse rounded-brand bg-brand-gray-100" />
          <div className="h-24 w-full animate-pulse rounded-brand bg-brand-gray-100" />
        </div>
      </Container>
    </section>
  );
}
