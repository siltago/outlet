import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline-light";
type Size = "md" | "lg";

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-brand-red text-brand-white hover:bg-brand-red-dark",
  secondary: "bg-brand-black text-brand-white hover:bg-brand-gray-600",
  "outline-light":
    "border border-brand-white/40 text-brand-white hover:bg-brand-white/10",
};

const SIZE_STYLES: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-brand font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

type ButtonAsLink = CommonProps &
  ComponentPropsWithoutRef<typeof Link> & { href: string };

type ButtonAsButton = CommonProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, ...rest } = props;
  const classes = cn(baseStyles, VARIANT_STYLES[variant], SIZE_STYLES[size], className);

  if (rest.href !== undefined) {
    return <Link className={classes} {...(rest as ComponentPropsWithoutRef<typeof Link>)} />;
  }

  return <button className={classes} {...(rest as ComponentPropsWithoutRef<"button">)} />;
}
