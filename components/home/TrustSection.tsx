import { CreditCard, MessageCircle, PackageCheck, PackageSearch } from "lucide-react";
import { Container } from "@/components/ui/Container";

const BENEFITS = [
  {
    icon: PackageCheck,
    title: "Pronta entrega em Sorocaba",
    description: "Produtos em estoque prontos para retirada ou combinação de entrega.",
  },
  {
    icon: PackageSearch,
    title: "Produtos sob encomenda",
    description: "Itens selecionados disponíveis por encomenda, com prazo combinado.",
  },
  {
    icon: MessageCircle,
    title: "Atendimento direto pelo WhatsApp",
    description: "Fale direto com quem vende, sem burocracia.",
  },
  {
    icon: CreditCard,
    title: "Pagamento combinado com o cliente",
    description: "Forma de pagamento definida diretamente na conversa.",
  },
];

export function TrustSection() {
  return (
    <section className="bg-brand-gray-50 py-14">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex flex-col gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-brand bg-brand-black text-brand-white">
                <benefit.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-brand-black">{benefit.title}</h3>
              <p className="text-sm text-brand-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
