import { Container } from "@/components/ui/Container";

export default function LoadingCatalogo() {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-6 h-8 w-48 animate-pulse rounded-brand bg-brand-gray-100" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-brand bg-brand-gray-100" />
          ))}
        </div>
      </Container>
    </section>
  );
}
