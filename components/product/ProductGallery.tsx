"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const gallery = images.length > 0 ? images : ["/images/products/placeholder-produto.png"];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-brand bg-brand-gray-50">
        <Image
          src={gallery[active]}
          alt={name}
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-contain"
          quality={90}
          priority
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2" role="tablist" aria-label={`Imagens de ${name}`}>
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Ver imagem ${index + 1} de ${name}`}
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-brand border-2 transition-colors",
                active === index ? "border-brand-red" : "border-brand-gray-200",
              )}
            >
              <Image src={image} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
