"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Banner } from "@/types/banner";

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

function BannerImage({ banner, priority }: { banner: Banner; priority: boolean }) {
  const common = { fill: true, sizes: "100vw", quality: 85, priority };

  if (!banner.imagemMobile) {
    return <Image src={banner.imagem} alt="" className="object-cover" {...common} />;
  }

  // Direção de arte: imagem própria para celular, sem baixar as duas.
  const desktop = getImageProps({ ...common, alt: "", src: banner.imagem });
  const mobile = getImageProps({ ...common, alt: "", src: banner.imagemMobile });
  const { srcSet: _unused, ...imgProps } = mobile.props;
  void _unused;

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop.props.srcSet} />
      <source media="(max-width: 767px)" srcSet={mobile.props.srcSet} />
      <img {...imgProps} alt="" className="object-cover" />
    </picture>
  );
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = banners.length;

  const go = useCallback((next: number) => setIndex((next + total) % total), [total]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (total < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [total, paused, reducedMotion, index]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) return;
    const delta = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? index + 1 : index - 1);
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative isolate w-full overflow-hidden bg-brand-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
    >
      <div className="relative aspect-[16/10] w-full md:aspect-[8/3]">
        {banners.map((banner, i) => {
          const active = i === index;
          const slide = (
            <div className="absolute inset-0">
              <BannerImage banner={banner} priority={i === 0} />
            </div>
          );

          return (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {banner.link ? (
                banner.link.startsWith("/") ? (
                  <Link href={banner.link} tabIndex={active ? 0 : -1} className="block h-full w-full">
                    {slide}
                    <span className="sr-only">Ver mais</span>
                  </Link>
                ) : (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={active ? 0 : -1}
                    className="block h-full w-full"
                  >
                    {slide}
                    <span className="sr-only">Ver mais</span>
                  </a>
                )
              ) : (
                slide
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-brand border border-brand-white/30 bg-brand-black/50 p-2 text-brand-white backdrop-blur transition-colors hover:bg-brand-black/80 md:block"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Próximo banner"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-brand border border-brand-white/30 bg-brand-black/50 p-2 text-brand-white backdrop-blur transition-colors hover:bg-brand-black/80 md:block"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir para o banner ${i + 1}`}
                aria-current={i === index}
                className="group flex h-6 items-center"
              >
                <span
                  className={cn(
                    "block h-0.5 transition-all",
                    i === index ? "w-8 bg-brand-white" : "w-5 bg-brand-white/40 group-hover:bg-brand-white/70",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
