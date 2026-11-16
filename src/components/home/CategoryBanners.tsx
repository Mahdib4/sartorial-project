"use client";

import Link from "next/link";
import { SnapCarousel } from "@/components/interior/snap-carousel";
import { Picture } from "@/components/ui/Picture";
import type { Shot } from "@/lib/media";

export type Banner = { key: string; title: string; href: string; line: string; image: Shot; position?: string };

/**
 * Wide banners, one category each, in a carousel you can drag, flick or step
 * through. The next banner peeks in from the edge.
 */
export function CategoryBanners({ banners, label }: { banners: Banner[]; label: string }) {
  return (
    // The carousel's own viewport is one banner wide; letting it overflow into
    // the wrapper's right padding is what shows the next banner at the edge.
    <div className="overflow-hidden pr-[12vw] pl-1 md:pr-[20vw]">
      <SnapCarousel label={label} gap={4} classNames={{ viewport: "overflow-visible!", controls: "pr-0 pl-[calc(var(--gutter)-0.25rem)]", slide: "opacity-100!" }}>
        {banners.map((banner) => (
          <Link key={banner.key} href={banner.href} draggable={false} className="on-dark group/banner relative block aspect-[4/5] overflow-hidden text-white sm:aspect-[16/10] lg:aspect-[16/9]">
            <div className="absolute inset-0 transition-transform duration-[1600ms] ease-out-expo group-hover/banner:scale-[1.04]">
              <Picture shot={banner.image} alt="" sizes="(min-width: 768px) 78vw, 86vw" ratio="fill" position={banner.position} />
            </div>
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,14,0.68)_0%,rgba(18,17,14,0)_50%)]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between md:p-8">
              <div>
                <p className="label mb-3 text-white/80">{banner.line}</p>
                <p className="display-md">{banner.title}</p>
              </div>
              <span className="inline-flex h-11 items-center gap-3 self-start bg-white px-5 text-[13px] tracking-[0.04em] text-ink md:self-auto">
                <span aria-hidden className="h-3 w-px bg-current opacity-60" />
                Discover
                <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3 transition-transform duration-500 ease-out-expo group-hover/banner:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M5.5 2.5 11 8l-5.5 5.5" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </SnapCarousel>
    </div>
  );
}
