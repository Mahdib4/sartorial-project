import Link from "next/link";
import { Picture } from "@/components/ui/Picture";
import { cn } from "@/lib/cn";
import type { Shot } from "@/lib/media";

export type CollectionTile = { key: string; name: string; tagline: string; meta?: string; href: string; cover: Shot; position?: string };

/**
 * Phones: the collections as a grid of portrait photographs, two across, each
 * named at its foot. (Wider screens show them as the opening image accordion.)
 */
export function CollectionTiles({ items, className, frameClassName = "aspect-[3/4]" }: { items: CollectionTile[]; className?: string; frameClassName?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-1", className)}>
      {items.map((item, i) => (
        <li key={item.key}>
          <Link href={item.href} className={cn("on-dark group/tile relative block overflow-hidden bg-ink text-white", frameClassName)}>
            <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out-expo group-active/tile:scale-[1.03]">
              <Picture shot={item.cover} alt="" sizes="50vw" ratio="fill" position={item.position} priority={i < 2} />
            </div>
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,17,14,0.78)_0%,rgba(18,17,14,0.2)_42%,rgba(18,17,14,0)_60%)]" />
            <div className="absolute inset-x-0 bottom-0 p-3.5 xs:p-4">
              {item.meta ? <p className="label-sm text-white/75">{item.meta}</p> : null}
              <p className="mt-1.5 text-[clamp(1.2rem,5.4vw,1.6rem)] leading-none tracking-[-0.035em] uppercase">{item.name}</p>
              <p className="mt-2 flex items-center gap-2 text-[12px] leading-snug text-white/80">
                <span className="truncate">{item.tagline}</span>
                <svg aria-hidden viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M5.5 2.5 11 8l-5.5 5.5" />
                </svg>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
