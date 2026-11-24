import Link from "next/link";
import type { ReactNode } from "react";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { LiveBanner } from "@/data/catalog";
import { cn } from "@/lib/cn";

/**
 * The home page's promotional slot: announcements, offers, launches. Each banner
 * is managed in the admin (Banners & notices) and, when it has a destination,
 * the whole banner is a link to that product, category, collection or page.
 *
 * One banner runs the full width. Two sit side by side as equal columns. Three
 * or four become a row to swipe through on phones and tablets, and on desktop
 * a row of three or a two-by-two grid, so no banner is ever left on its own at
 * half width. Banners in a row are always the same height.
 */
export function PromoSlot({ banners: all }: { banners: LiveBanner[] }) {
  const banners = all.slice(0, 4);
  const n = banners.length;
  if (n === 0) return null;
  if (n === 1) {
    return (
      <Reveal>
        <PromoBanner banner={banners[0]} wide />
      </Reveal>
    );
  }

  const row = n >= 3;
  return (
    <Reveal>
      <ul
        aria-label="Promotions"
        className={cn(
          "gap-3",
          row
            ? cn(
                // Phones and tablets: one row, the next banner peeking in from the edge.
                "no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] overflow-x-auto px-[var(--gutter)]",
                "lg:mx-0 lg:grid lg:overflow-visible lg:px-0",
                n === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
              )
            : "grid md:grid-cols-2",
        )}
      >
        {banners.map((b) => (
          <li key={b.id} className={cn("flex", row && "w-[85%] max-w-[26rem] shrink-0 snap-start md:w-[46%] lg:w-auto lg:max-w-none")}>
            <PromoBanner banner={b} wide={false} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function Wrap({ href, className, children }: { href: string | null; className: string; children: ReactNode }) {
  return href ? (
    <Link href={href} className={cn("group/promo", className)}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3 transition-transform duration-500 ease-out-expo group-hover/promo:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M5.5 2.5 11 8l-5.5 5.5" />
    </svg>
  );
}

/**
 * One banner. `wide` is the full-width layout (words beside the photograph from
 * tablets up); otherwise it is a card that fills its cell, with the call to
 * action at its foot so cards side by side line up.
 */
function PromoBanner({ banner: b, wide }: { banner: LiveBanner; wide: boolean }) {
  const cta = b.href ? b.cta || "Discover" : "";

  if (!b.shot) {
    // A text banner: a band of ink, for offers and notices.
    return (
      <Wrap href={b.href} className={cn("on-dark bg-ink px-6 py-8 text-white md:px-10 md:py-10", wide ? "block" : "flex w-full flex-col")}>
        <div className={cn("flex flex-col gap-5", wide ? "md:flex-row md:items-end md:justify-between md:gap-10" : "flex-1")}>
          <div className="max-w-2xl">
            {b.eyebrow ? <p className="label mb-3 text-white/70">{b.eyebrow}</p> : null}
            <p className="headline-sm text-balance">{b.title}</p>
            {b.body ? <p className="mt-3 text-[14.5px] leading-relaxed text-white/75">{b.body}</p> : null}
          </div>
          {cta ? (
            <span
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-3 self-start border border-white/50 px-5 text-[13px] tracking-[0.04em] transition-colors duration-300 group-hover/promo:border-white",
                wide ? "md:self-auto" : "mt-auto",
              )}
            >
              {cta}
              <Arrow />
            </span>
          ) : null}
        </div>
      </Wrap>
    );
  }

  // A photograph beside the words when wide; above them in a card.
  return (
    <Wrap href={b.href} className={cn("border border-line bg-paper", wide ? "block" : "flex w-full flex-col")}>
      <div className={cn(wide ? "grid md:grid-cols-12" : "flex flex-1 flex-col")}>
        <div className={cn("relative overflow-hidden", wide ? "aspect-[16/10] md:col-span-7 md:aspect-auto md:min-h-[360px]" : "aspect-[16/10] shrink-0")}>
          <div className="absolute inset-0 transition-transform duration-[1600ms] ease-out-expo group-hover/promo:scale-[1.03]">
            <Picture shot={b.shot} alt="" sizes={wide ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 1024px) 34vw, (min-width: 768px) 48vw, 85vw"} ratio="fill" />
          </div>
        </div>
        <div className={cn("flex flex-col gap-4 p-6 md:p-10", wide ? "justify-center md:col-span-5" : "flex-1")}>
          {b.eyebrow ? <p className="label text-accent">{b.eyebrow}</p> : null}
          <p className="headline-sm text-balance">{b.title}</p>
          {b.body ? <p className="text-[14.5px] leading-relaxed text-ink-2">{b.body}</p> : null}
          {cta ? (
            <span className={cn("inline-flex items-center gap-2 self-start pt-2 text-[13px] tracking-[0.04em] text-ink", !wide && "mt-auto")}>
              <span className="link-under">{cta}</span>
              <Arrow />
            </span>
          ) : null}
        </div>
      </div>
    </Wrap>
  );
}
