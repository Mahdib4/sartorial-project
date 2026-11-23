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
 */
export function PromoSlot({ banners }: { banners: LiveBanner[] }) {
  return (
    <div className={cn("grid gap-3", banners.length > 1 && "md:grid-cols-2")} aria-label="Promotions">
      {banners.slice(0, 4).map((b, i) => (
        <Reveal key={b.id} delay={i * 0.08}>
          <PromoBanner banner={b} wide={banners.length === 1} />
        </Reveal>
      ))}
    </div>
  );
}

function Wrap({ href, className, children }: { href: string | null; className: string; children: ReactNode }) {
  return href ? (
    <Link href={href} className={cn("group/promo block", className)}>
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

function PromoBanner({ banner: b, wide }: { banner: LiveBanner; wide: boolean }) {
  const cta = b.href ? b.cta || "Discover" : "";

  if (!b.shot) {
    // A text banner: a band of ink, for offers and notices.
    return (
      <Wrap href={b.href} className="on-dark bg-ink px-6 py-8 text-white md:px-10 md:py-10">
        <div className={cn("flex flex-col gap-5", wide && "md:flex-row md:items-end md:justify-between md:gap-10")}>
          <div className="max-w-2xl">
            {b.eyebrow ? <p className="label text-white/70">{b.eyebrow}</p> : null}
            <p className="headline-sm mt-3 text-balance">{b.title}</p>
            {b.body ? <p className="mt-3 text-[14.5px] leading-relaxed text-white/75">{b.body}</p> : null}
          </div>
          {cta ? (
            <span className="inline-flex h-11 shrink-0 items-center gap-3 self-start border border-white/50 px-5 text-[13px] tracking-[0.04em] transition-colors duration-300 group-hover/promo:border-white md:self-auto">
              {cta}
              <Arrow />
            </span>
          ) : null}
        </div>
      </Wrap>
    );
  }

  // A photograph beside the words; stacked on phones.
  return (
    <Wrap href={b.href} className="border border-line bg-paper">
      <div className={cn("grid", wide ? "md:grid-cols-12" : "")}>
        <div className={cn("relative overflow-hidden", wide ? "aspect-[16/10] md:col-span-7 md:aspect-auto md:min-h-[360px]" : "aspect-[16/10]")}>
          <div className="absolute inset-0 transition-transform duration-[1600ms] ease-out-expo group-hover/promo:scale-[1.03]">
            <Picture shot={b.shot} alt="" sizes={wide ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 48vw, 100vw"} ratio="fill" />
          </div>
        </div>
        <div className={cn("flex flex-col justify-center gap-4 p-6 md:p-10", wide && "md:col-span-5")}>
          {b.eyebrow ? <p className="label text-accent">{b.eyebrow}</p> : null}
          <p className="headline-sm text-balance">{b.title}</p>
          {b.body ? <p className="text-[14.5px] leading-relaxed text-ink-2">{b.body}</p> : null}
          {cta ? (
            <span className="mt-2 inline-flex items-center gap-2 self-start text-[13px] tracking-[0.04em] text-ink">
              <span className="link-under">{cta}</span>
              <Arrow />
            </span>
          ) : null}
        </div>
      </div>
    </Wrap>
  );
}
