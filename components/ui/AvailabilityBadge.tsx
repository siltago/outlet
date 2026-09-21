import { CheckCircle2, Clock, PackageSearch } from "lucide-react";
import type { Availability } from "@/lib/availability";
import { cn } from "@/lib/cn";

const STYLES: Record<Availability["state"], string> = {
  pronta_entrega: "bg-brand-white text-brand-black",
  sob_encomenda: "bg-brand-black/80 text-brand-white border border-brand-white/30 backdrop-blur",
  ambos: "bg-brand-white text-brand-black",
  indisponivel: "bg-brand-surface-2 text-brand-gray-400 border border-brand-line",
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
        "inline-flex items-center gap-1 rounded-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        STYLES[availability.state],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {availability.label}
    </span>
  );
}
