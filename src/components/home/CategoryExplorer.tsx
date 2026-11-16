"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Tabs } from "@/components/interior/tabs";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { NavCategory, NavGroup } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { pluralise } from "@/lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Where each of the three preview frames sits on the stage. */
const FRAMES = [
  { className: "left-0 top-0 h-full w-[58.5%]", sizes: "(min-width: 1024px) 34vw, 60vw" },
  { className: "right-0 top-0 h-[56%] w-[40%]", sizes: "(min-width: 1024px) 23vw, 40vw" },
  { className: "bottom-0 right-0 h-[42%] w-[40%]", sizes: "(min-width: 1024px) 23vw, 40vw" },
];

const countLabel = (category: NavCategory) => (category.count > 0 ? pluralise(category.count, "piece") : "The edit");

/**
 * Shop by category. Pointing at (or focusing) a category name brings that
 * category's photographs onto the stage beside the list; clicking it opens the
 * category page. On touch screens, where there is no hover, each category
 * carries its photographs with it as a swipeable strip.
 */
export function CategoryExplorer({ groups }: { groups: NavGroup[] }) {
  const [groupKey, setGroupKey] = useState(groups[0].key);
  const [activeByGroup, setActiveByGroup] = useState<Record<string, string>>({});

  return (
    <Tabs
      label="Collections"
      items={groups.map((g) => ({ value: g.key, label: g.name }))}
      value={groupKey}
      onValueChange={(v) => setGroupKey(v as NavGroup["key"])}
      classNames={{ list: "no-scrollbar overflow-x-auto px-gutter", panel: "pt-8 lg:pt-12" }}
      renderPanel={(value) => {
        const group = groups.find((g) => g.key === value) ?? groups[0];
        const active = group.categories.find((c) => c.key === activeByGroup[group.key]) ?? group.categories[0];
        return (
          <Panel
            group={group}
            active={active}
            onActivate={(key) => setActiveByGroup((prev) => (prev[group.key] === key ? prev : { ...prev, [group.key]: key }))}
          />
        );
      }}
    />
  );
}

function Panel({ group, active, onActivate }: { group: NavGroup; active: NavCategory; onActivate: (key: string) => void }) {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 gap-x-10 px-gutter lg:grid-cols-12">
      {/* The list */}
      <ul className="min-w-0 lg:col-span-5 lg:self-center">
        {group.categories.map((category, i) => {
          const isActive = category.key === active.key;
          return (
            <li key={category.key} className="border-b border-line first:border-t">
              <Link
                href={category.href}
                onMouseEnter={() => onActivate(category.key)}
                onFocus={() => onActivate(category.key)}
                className="group/row flex items-baseline gap-4 py-4 outline-offset-[-2px] lg:py-[clamp(0.85rem,1.25vw,1.4rem)]"
              >
                <span className="label-sm w-7 shrink-0 text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={cn(
                    "text-[clamp(1.6rem,6.4vw,2.2rem)] leading-[1.05] font-light tracking-[-0.035em] transition-[color,transform] duration-500 ease-out-expo lg:text-[clamp(1.7rem,2.75vw,2.9rem)]",
                    isActive ? "text-ink lg:translate-x-2" : "text-ink lg:text-ink/30",
                  )}
                >
                  {category.name}
                </span>
                <span className={cn("label-sm ml-auto shrink-0 transition-colors duration-500", isActive ? "text-ink-3" : "text-mute lg:text-mute/60")}>{countLabel(category)}</span>
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className={cn("hidden h-3.5 w-3.5 shrink-0 self-center transition-[opacity,transform] duration-500 ease-out-expo lg:block", isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                >
                  <path d="M1 8h13M9.5 3.5 14 8l-4.5 4.5" />
                </svg>
              </Link>

              {/* Touch screens: the category's photographs travel with it. */}
              <div className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-1 overflow-x-auto px-[var(--gutter)] pb-5 lg:hidden">
                {category.preview.map((shot) => (
                  <Link key={shot.id} href={category.href} tabIndex={-1} aria-hidden className="w-[38vw] max-w-52 shrink-0 snap-start">
                    <Picture shot={shot} alt="" sizes="38vw" ratio="4 / 5" />
                  </Link>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      {/* The stage (pointer devices) */}
      <div className="hidden lg:col-span-7 lg:block">
        <Link href={active.href} aria-label={`View ${active.name}`} tabIndex={-1} className="relative block aspect-[11/9] w-full">
          {group.categories.map((category) => {
            const isActive = category.key === active.key;
            return (
              <div key={category.key} aria-hidden={!isActive} className="absolute inset-0" style={{ zIndex: isActive ? 2 : 1 }}>
                {FRAMES.map((frame, n) => {
                  const shot = category.preview[n] ?? category.preview[category.preview.length - 1];
                  return (
                    <motion.div
                      key={n}
                      className={cn("absolute overflow-hidden", frame.className)}
                      initial={false}
                      animate={
                        isActive
                          ? { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: reduce ? 0 : 0.95, delay: reduce ? 0 : n * 0.07, ease: EASE } }
                          : { clipPath: "inset(100% 0% 0% 0%)", transition: { duration: 0, delay: reduce ? 0 : 1.05 } }
                      }
                    >
                      <motion.div
                        className="absolute inset-0"
                        initial={false}
                        animate={isActive ? { scale: 1 } : { scale: 1.12 }}
                        transition={isActive ? { duration: reduce ? 0 : 1.5, delay: n * 0.07, ease: EASE } : { duration: 0, delay: 1.05 }}
                      >
                        <Picture shot={shot} alt="" sizes={frame.sizes} ratio="fill" />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </Link>

        <div className="mt-6 flex items-end justify-between gap-8">
          <div aria-live="polite" className="max-w-md">
            <p className="label text-ink-3">
              {group.name}&ensp;/&ensp;{active.name}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{active.blurb}</p>
          </div>
          <ButtonLink href={active.href} variant="outline" className="shrink-0">
            View {active.name}
          </ButtonLink>
        </div>
      </div>

      <div className="mt-8 lg:hidden">
        <ButtonLink href={group.href} variant="outline" className="w-full">
          All {group.name}
        </ButtonLink>
      </div>
    </div>
  );
}
