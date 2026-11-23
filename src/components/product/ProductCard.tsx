"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Like } from "@/components/bencho/like/Like";
import { Picture } from "@/components/ui/Picture";
import type { CardData } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { PriceTag } from "@/components/product/PriceTag";
import { useShop } from "@/store/shop";

type ProductCardProps = {
  product: CardData;
  /** `sizes` for the photo; depends on the grid the card sits in. */
  sizes?: string;
  priority?: boolean;
  /** Show the category above the name (mixed grids and rails). */
  showCategory?: boolean;
  className?: string;
};

/**
 * One piece in a grid. On pointer devices the photo gives way on hover to a
 * second view or, where the piece has been filmed, to the film itself.
 * The heart saves it to the wishlist without leaving the grid.
 */
export function ProductCard({ product, sizes = "(min-width: 1024px) 25vw, 50vw", priority, showCategory, className }: ProductCardProps) {
  const { isSaved, toggleSaved, ready } = useShop();
  const [hovered, setHovered] = useState(false);
  const [everHovered, setEverHovered] = useState(false);
  const saved = ready && isSaved(product.slug);
  const clipRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = clipRef.current;
    if (!video) return;
    if (hovered) video.play().catch(() => undefined);
    else video.pause();
  }, [hovered, everHovered]);

  return (
    <article className={cn("group/card relative", className)}>
      <Link
        href={product.href}
        className="block outline-offset-[-2px]"
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          setHovered(true);
          setEverHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="relative overflow-hidden">
          <Picture shot={product.image} alt={`${product.name}, ${product.colour.toLowerCase()}`} sizes={sizes} ratio="4 / 5" priority={priority} fit="product" />

          {product.clip ? (
            everHovered ? (
              <video
                src={product.clip.src}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                tabIndex={-1}
                disablePictureInPicture
                ref={clipRef}
                className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", hovered ? "opacity-100" : "opacity-0")}
              />
            ) : null
          ) : product.hover ? (
            <div className={cn("absolute inset-0 transition-opacity duration-700 ease-out-expo", hovered ? "opacity-100" : "opacity-0")} aria-hidden>
              {everHovered ? <Picture shot={product.hover} alt="" sizes={sizes} ratio="fill" fit="product" /> : null}
            </div>
          ) : null}

          {product.badge ? (
            <span className="absolute top-3 left-3 bg-accent px-2 py-1 text-[9.5px] leading-none tracking-[0.12em] text-white uppercase">{product.badge}</span>
          ) : null}
          {product.clip ? (
            <span className="label-sm absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 px-2 py-1 text-ink backdrop-blur-sm">
              <svg aria-hidden viewBox="0 0 8 8" className="h-1.5 w-1.5 fill-current">
                <path d="M1 0.5v7l6-3.5z" />
              </svg>
              Film
            </span>
          ) : null}
        </div>

        <div className="px-2 pt-3.5 pb-1 text-center">
          {showCategory ? <p className="label-sm mb-1.5 text-mute">{product.categoryName}</p> : null}
          <h3 className="text-[13.5px] leading-snug text-ink">{product.name}</h3>
          <PriceTag price={product.price} compareAt={product.compareAt} className="mt-1 justify-center text-[12px] tracking-[0.02em] text-ink-3" />
        </div>
      </Link>

      <div className="absolute top-1.5 right-1.5 text-ink">
        <Like active={saved} onChange={() => toggleSaved(product.slug)} label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} size={17} color="Ink" variant="bare" burst={40} />
      </div>
    </article>
  );
}
