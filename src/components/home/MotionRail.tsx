"use client";

import Link from "next/link";
import { LoopVideo, type FilmSource } from "@/components/ui/LoopVideo";
import { Rail } from "@/components/ui/Rail";

export type MotionItem = { key: string; film: FilmSource; name: string; category: string; href: string };

/** The client's showcase films as a rail of portrait frames. Each plays while it is on screen and links to its piece. */
export function MotionRail({ items }: { items: MotionItem[] }) {
  return (
    <Rail
      label="Pieces filmed in motion"
      itemClassName="w-[58vw] sm:w-[34vw] md:w-[27vw] lg:w-[19.4vw]"
      header={
        <div>
          <p className="label mb-4 text-ink-3">In motion</p>
          <h2 className="headline max-w-[16ch]">Cloth is meant to move.</h2>
        </div>
      }
    >
      {items.map((item) => (
        <Link key={item.key} href={item.href} className="group/film block">
          <LoopVideo film={item.film} label={`${item.name}, filmed`} className="aspect-[9/16] w-full" />
          <div className="px-1 pt-3.5 pb-1">
            <p className="label-sm text-mute">{item.category}</p>
            <p className="mt-1.5 text-[13.5px] leading-snug">
              <span className="link-draw">{item.name}</span>
            </p>
          </div>
        </Link>
      ))}
    </Rail>
  );
}
