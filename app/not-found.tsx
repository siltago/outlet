import { PackageX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="min-h-screen bg-brand-black py-32">
      <Container className="flex flex-col items-center gap-4 text-center">
        <PackageX className="h-12 w-12 text-brand-gray-400" aria-hidden="true" />
        <h1 className="display text-2xl text-brand-white">Página não encontrada</h1>
        <p className="max-w-sm text-sm text-brand-gray-400">
          O conteúdo que você procura não existe ou não está mais disponível.
        </p>
        <Button href="/catalogo" variant="primary" size="md">
          Ver catálogo
        </Button>
      </Container>
    </section>
  );
}
