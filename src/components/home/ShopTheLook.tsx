"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { TiltCard } from "@/components/bencho/tilt/TiltCard";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { CardData } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Shot } from "@/lib/media";

export type LookSpot = {
  /** Position on the photograph, in percent. */
  x: number;
  y: number;
  product: CardData;
  summary: string;
};

type ShopTheLookProps = {
  eyebrow: string;
  title: string;
  image: Shot;
  imageAlt: string;
  spots: LookSpot[];
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One photograph, several pieces. Each marker on the image selects the piece
 * it sits on; the card beside it follows.
 */
export function ShopTheLook({ eyebrow, title, image, imageAlt, spots }: ShopTheLookProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const spot = spots[active];

  return (
    <section className="grid gap-1 px-1 lg:grid-cols-12" aria-label={title}>
      {/* Phones: the title sits above the photograph, so it never covers a face. */}
      <div className="px-[calc(var(--gutter)-0.25rem)] pb-6 md:hidden">
        <p className="label text-ink-3">{eyebrow}</p>
        <p className="headline mt-4">{title}</p>
      </div>
      <div className="on-dark relative overflow-hidden lg:col-span-8">
        <Picture shot={image} alt={imageAlt} sizes="(min-width: 1024px) 66vw, 100vw" ratio="3 / 2" />
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden p-8 text-white md:block">
          <p className="label text-white/80">{eyebrow}</p>
          <h2 className="headline mt-4 max-w-[12ch]">{title}</h2>
        </div>
        {spots.map((s, i) => (
          <button
            key={s.product.slug}
            type="button"
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-label={`Show ${s.product.name}`}
            aria-pressed={i === active}
            className="group/spot absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            {i !== active ? <span aria-hidden className="absolute h-7 w-7 rounded-full border border-white/80 motion-safe:animate-ping" /> : null}
            <span aria-hidden className={cn("absolute h-10 w-10 rounded-full border border-white transition-[transform,opacity] duration-700 ease-out-expo", i === active ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
            <span aria-hidden className={cn("relative grid h-7 w-7 place-items-center rounded-full text-[11px] tabular-nums shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition-colors duration-300", i === active ? "bg-white text-ink" : "bg-white/85 text-ink")}>
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col bg-paper p-5 md:p-8 lg:col-span-4">
        <ol className="flex gap-6 border-b border-line">
          {spots.map((s, i) => (
            <li key={s.product.slug}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={cn("label relative pb-3 transition-colors duration-300", i === active ? "text-ink" : "text-mute hover:text-ink-3")}
              >
                Look {String(i + 1).padStart(2, "0")}
                {i === active ? <motion.span layoutId="look-underline" className="absolute inset-x-0 -bottom-px h-px bg-ink" transition={{ duration: 0.5, ease: EASE }} /> : null}
              </button>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={spot.product.slug}
            className="flex flex-1 flex-col pt-6"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <TiltCard
              className="mx-auto w-full max-w-[320px] lg:max-w-none"
              aspect="4 / 5"
              tilt={5}
              image={{ src: spot.product.image.src, srcSet: spot.product.image.srcSet, sizes: "(min-width: 1024px) 30vw, 320px", alt: spot.product.name }}
            />
            <p className="label-sm mt-6 text-mute">{spot.product.categoryName}</p>
            <h3 className="headline-sm mt-2">{spot.product.name}</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{spot.summary}</p>
            <p className="mt-3 text-[13px] text-ink-3">{formatPrice(spot.product.price)}</p>
            <ButtonLink href={spot.product.href} className="mt-6 w-full">
              View this piece
            </ButtonLink>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
