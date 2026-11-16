"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lightbox } from "@/components/interior/lightbox";
import { SnapCarousel } from "@/components/interior/snap-carousel";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { Picture } from "@/components/ui/Picture";
import { cn } from "@/lib/cn";
import type { Film, Shot } from "@/lib/media";

export type GalleryItem = { kind: "image"; shot: Shot; alt: string } | { kind: "film"; film: Film; label: string };

const landscape = (item: GalleryItem) => (item.kind === "image" ? item.shot.width > item.shot.height * 1.15 : !item.film.portrait);

/**
 * The product's photographs and films.
 * Wide screens: a mosaic (the lead image full width, the rest two across,
 * landscape frames spanning both columns). Any photograph opens in a lightbox
 * where it can be zoomed and panned; arrow keys move between photographs.
 * Small screens: a swipeable carousel, one frame at a time.
 */
export function ProductGallery({ items, name }: { items: GalleryItem[]; name: string }) {
  const images = items.flatMap((item) => (item.kind === "image" ? [item] : []));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const origin = useRef<HTMLElement | null>(null);
  const tiles = useRef<Array<HTMLButtonElement | null>>([]);

  const open = (index: number) => {
    origin.current = tiles.current[index];
    setShown(index);
    setOpenIndex(index);
  };

  const step = useCallback(
    (direction: 1 | -1) => {
      setShown((current) => {
        const next = (current + direction + images.length) % images.length;
        origin.current = tiles.current[next];
        setOpenIndex(next);
        return next;
      });
    },
    [images.length],
  );

  // Arrow keys page between photographs while the lightbox is open (it uses them itself only when zoomed in).
  useEffect(() => {
    if (openIndex === null || images.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, images.length, step]);

  const current = images[shown];
  const indexOf = new Map(images.map((item, i) => [item.shot.id, i]));

  return (
    <div>
      {/* Wide screens: mosaic */}
      <ul className="hidden grid-flow-dense grid-cols-2 gap-1 lg:grid">
        {items.map((item, i) => {
          const wide = i === 0 || landscape(item);
          if (item.kind === "film") {
            return (
              <li key={item.film.id} className={cn(wide && "col-span-2")}>
                <LoopVideo film={item.film} label={item.label} className={cn("w-full", item.film.portrait ? "aspect-[4/5]" : "aspect-video")} position={item.film.portrait ? "50% 30%" : "50% 50%"} />
              </li>
            );
          }
          const index = indexOf.get(item.shot.id) ?? 0;
          return (
            <li key={item.shot.id} className={cn(wide && "col-span-2")}>
              <button
                type="button"
                ref={(node) => {
                  tiles.current[index] = node;
                }}
                onClick={() => open(index)}
                aria-label={`Enlarge photograph ${index + 1} of ${images.length}: ${item.alt}`}
                className="group/tile relative block w-full cursor-zoom-in outline-offset-[-2px]"
              >
                <Picture
                  shot={item.shot}
                  alt={item.alt}
                  sizes={wide ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 29vw, 50vw"}
                  ratio={landscape(item) ? "3 / 2" : "4 / 5"}
                  priority={i === 0}
                />
                <span aria-hidden className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center bg-white/90 text-ink opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Small screens: carousel */}
      <div className="lg:hidden">
        <SnapCarousel label={`${name}: photographs`} gap={4} classNames={{ controls: "px-gutter mt-3", slide: "opacity-100!" }}>
          {items.map((item, i) =>
            item.kind === "film" ? (
              <LoopVideo key={item.film.id} film={item.film} label={item.label} className="aspect-[4/5] w-full" position="50% 30%" />
            ) : (
              <Picture key={item.shot.id} shot={item.shot} alt={item.alt} sizes="100vw" ratio="4 / 5" priority={i === 0} fit="product" />
            ),
          )}
        </SnapCarousel>
      </div>

      {current ? (
        <Lightbox
          open={openIndex !== null}
          onClose={() => setOpenIndex(null)}
          src={current.shot.srcSet.split(", ").pop()?.split(" ")[0] ?? current.shot.src}
          alt={current.alt}
          caption={images.length > 1 ? `${name}  ·  ${shown + 1} / ${images.length}` : name}
          width={current.shot.width}
          height={current.shot.height}
          originRef={origin}
        />
      ) : null}

      {/* Previous / next, laid over the lightbox for pointer and touch (the arrow keys do the same). */}
      {openIndex !== null && images.length > 1
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center gap-2 md:inset-x-6 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:justify-between">
              {([-1, 1] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  // Keep focus inside the lightbox so its own keyboard handling carries on.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => step(direction)}
                  aria-label={direction === 1 ? "Next photograph" : "Previous photograph"}
                  className="pointer-events-auto grid h-11 w-11 place-items-center border border-line bg-white text-ink transition-colors duration-200 hover:border-ink"
                >
                  <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.1">
                    {direction === 1 ? <path d="M1 8h13M9.5 3.5 14 8l-4.5 4.5" /> : <path d="M15 8H2M6.5 3.5 2 8l4.5 4.5" />}
                  </svg>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
