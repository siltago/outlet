import { CheckCircle2, Clock, PackageSearch } from "lucide-react";
import type { Availability } from "@/lib/availability";
import { cn } from "@/lib/cn";

const STYLES: Record<Availability["state"], string> = {
  pronta_entrega: "bg-brand-black text-brand-white",
  sob_encomenda: "bg-brand-gray-100 text-brand-black border border-brand-gray-200",
  ambos: "bg-brand-black text-brand-white",
  indisponivel: "bg-brand-gray-100 text-brand-gray-600 border border-brand-gray-200",
};

const ICONS: Record<Availability["state"], typeof CheckCircle2> = {
  pronta_entrega: CheckCircle2,
  sob_encomenda: Clock,
  ambos: PackageSearch,
  indisponivel: Clock,
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const Icon = ICONS[availability.state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-brand px-2.5 py-1 text-xs font-semibold",
        STYLES[availability.state],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {availability.label}
    </span>
  );
}
