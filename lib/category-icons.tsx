import {
  Baby,
  Cable,
  Camera,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Glasses,
  Headphones,
  Home,
  Laptop,
  Package,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  SprayCan,
  Watch,
} from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";

export interface CategoryIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

// Catálogo fixo de ícones que o admin escolhe ao criar uma categoria — não é
// upload de imagem, é a chave (`value`) salva em `categorias.icone`.
export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: "smartphone", label: "Celular", icon: Smartphone },
  { value: "smartwatch", label: "Smartwatch", icon: Watch },
  { value: "fone", label: "Fones", icon: Headphones },
  { value: "perfume", label: "Perfumes", icon: SprayCan },
  { value: "tenis", label: "Tênis", icon: Footprints },
  { value: "roupa", label: "Roupas", icon: Shirt },
  { value: "bolsa", label: "Bolsas", icon: ShoppingBag },
  { value: "oculos", label: "Óculos", icon: Glasses },
  { value: "joia", label: "Joias", icon: Gem },
  { value: "acessorio", label: "Acessórios", icon: Cable },
  { value: "eletronico", label: "Eletrônicos", icon: Laptop },
  { value: "camera", label: "Câmeras", icon: Camera },
  { value: "game", label: "Games", icon: Gamepad2 },
  { value: "casa", label: "Casa", icon: Home },
  { value: "beleza", label: "Beleza", icon: Sparkles },
  { value: "presente", label: "Presentes", icon: Gift },
  { value: "bebe", label: "Bebê", icon: Baby },
  { value: "outro", label: "Outro", icon: Package },
];

const ICON_BY_VALUE: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map((option) => [option.value, option.icon]),
);

// Categorias criadas antes desse recurso não têm `icone` salvo — usa o slug
// para adivinhar um ícone razoável em vez de cair direto no genérico.
const LEGACY_SLUG_FALLBACK: Record<string, string> = {
  smartphones: "smartphone",
  relogios: "smartwatch",
  fones: "fone",
  perfumes: "perfume",
  tenis: "tenis",
  acessorios: "acessorio",
};

const DEFAULT_ICON = Package;

export function CategoryIcon({
  icone,
  slug,
  ...props
}: { icone?: string | null; slug?: string } & ComponentPropsWithoutRef<LucideIcon>) {
  const Icon =
    (icone && ICON_BY_VALUE[icone]) ||
    (slug && ICON_BY_VALUE[LEGACY_SLUG_FALLBACK[slug]]) ||
    DEFAULT_ICON;
  return <Icon {...props} />;
}
