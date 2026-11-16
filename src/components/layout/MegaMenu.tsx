"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Picture } from "@/components/ui/Picture";
import type { NavCategory, NavGroup, NavMenu } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { pluralise } from "@/lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

type MegaMenuProps = {
  id: string;
  menu: NavMenu;
  onNavigate: () => void;
};

/**
 * One panel of the main menu: the collection's categories in columns, an
 * optional column of occasion edits, and a photograph that follows whichever
 * category is under the pointer.
 */
export function MegaMenu({ id, menu, onNavigate }: MegaMenuProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<{ group: NavGroup; category: NavCategory | null }>({ group: menu.groups[0], category: null });

  const shot = hovered.category ? hovered.category.preview[0] : hovered.group.cover;
  const caption = hovered.category
    ? { title: hovered.category.name, line: hovered.category.count > 0 ? pluralise(hovered.category.count, "piece") : hovered.category.blurb, href: hovered.category.href }
    : { title: hovered.group.name, line: hovered.group.tagline, href: hovered.group.href };

  const columns = menu.groups.length + (menu.highlights.length ? 1 : 0);

  return (
    <div id={id} className="grid grid-cols-12 border-t border-line-soft">
      <div
        className={cn("col-span-8 grid gap-x-10 py-10 pr-10 pl-[var(--gutter)] xl:col-span-9", columns >= 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-2")}
        onMouseLeave={() => setHovered((h) => ({ group: h.group, category: null }))}
      >
        {menu.groups.map((group, g) => (
          <motion.div
            key={group.key}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 + g * 0.06, ease: EASE }}
          >
            <Link
              href={group.href}
              onClick={onNavigate}
              onMouseEnter={() => setHovered({ group, category: null })}
              onFocus={() => setHovered({ group, category: null })}
              className="label flex items-baseline justify-between border-b border-line pb-3 text-ink"
            >
              <span>{group.name}</span>
              <span className="text-mute">View all</span>
            </Link>
            <ul className={cn("mt-4", menu.groups.length === 1 && "columns-2 gap-x-10")}>
              {group.categories.map((category) => (
                <li key={category.key} className="break-inside-avoid">
                  <Link
                    href={category.href}
                    onClick={onNavigate}
                    onMouseEnter={() => setHovered({ group, category })}
                    onFocus={() => setHovered({ group, category })}
                    className="group/item flex items-baseline gap-3 py-[7px] text-[15px] text-ink-2 transition-colors duration-300 hover:text-ink"
                  >
                    <span className="link-draw">{category.name}</span>
                    {category.count > 0 ? <span className="text-[11px] text-mute tabular-nums">{category.count}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {menu.highlights.length ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 + menu.groups.length * 0.06, ease: EASE }}
          >
            <p className="label border-b border-line pb-3 text-ink">Highlights</p>
            <ul className="mt-4">
              {menu.highlights.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={onNavigate} className="block py-[7px] text-[15px] text-ink-2 transition-colors duration-300 hover:text-ink">
                    <span className="link-draw">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </div>

      {/* The photograph follows the pointer */}
      <Link href={caption.href} onClick={onNavigate} tabIndex={-1} className="on-dark relative col-span-4 block min-h-[26rem] overflow-hidden bg-bone xl:col-span-3">
        <AnimatePresence initial={false}>
          <motion.div
            key={shot.id}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <Picture shot={shot} alt="" sizes="(min-width: 1280px) 25vw, 33vw" ratio="fill" />
          </motion.div>
        </AnimatePresence>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="label text-white/75">{caption.line}</p>
          <p className="mt-2 text-[26px] leading-none font-light tracking-[-0.03em]">{caption.title}</p>
        </div>
      </Link>
    </div>
  );
}
