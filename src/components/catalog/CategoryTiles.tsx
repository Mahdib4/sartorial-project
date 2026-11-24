import Link from "next/link";
import { Picture } from "@/components/ui/Picture";
import type { NavCategory } from "@/data/navigation";

/** The categories of a collection as a row of photographs. Scrolls sideways on small screens. */
export function CategoryTiles({ categories, label }: { categories: NavCategory[]; label: string }) {
  return (
    <ul aria-label={label} className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 lg:grid lg:grid-flow-col lg:auto-cols-fr lg:overflow-visible">
      {categories.map((category) => (
        <li key={category.key} className="w-[46vw] shrink-0 snap-start sm:w-[30vw] lg:w-auto">
          <Link href={category.href} className="group/tile block">
            <div className="zoom-frame">
              <div className="zoom-target">
                {category.preview[0] ? (
                  <Picture shot={category.preview[0]} alt="" sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 46vw" ratio="3 / 4" />
                ) : (
                  <span className="block aspect-[3/4] bg-paper" />
                )}
              </div>
            </div>
            <p className="mt-3 px-1 text-[14px] leading-snug">
              <span className="link-draw">{category.name}</span>
            </p>
            <p className="label-sm mt-1 px-1 text-mute">{category.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
