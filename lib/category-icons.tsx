import { Cable, Footprints, Headphones, Smartphone, SprayCan, Watch } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  relogios: Watch,
  fones: Headphones,
  perfumes: SprayCan,
  tenis: Footprints,
  acessorios: Cable,
};

export function CategoryIcon({
  slug,
  ...props
}: { slug: string } & ComponentPropsWithoutRef<LucideIcon>) {
  const Icon = CATEGORY_ICONS[slug] ?? Cable;
  return <Icon {...props} />;
}
