"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Tabs } from "@/components/interior/tabs";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { NavCategory, NavGroup } from "@/data/navigation";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Where each of the three preview frames sits on the stage. */
const FRAMES = [
  { className: "left-0 top-0 h-full w-[58.5%]", sizes: "(min-width: 1024px) 34vw, 60vw" },
  { className: "right-0 top-0 h-[56%] w-[40%]", sizes: "(min-width: 1024px) 23vw, 40vw" },
  { className: "bottom-0 right-0 h-[42%] w-[40%]", sizes: "(min-width: 1024px) 23vw, 40vw" },
];

/**
 * Shop by category. Pointing at (or focusing) a category name brings that
 * category's photographs onto the stage beside the list; clicking it opens the
 * category page. On touch screens, where there is no hover, the categories
 * become a row of photographs to swipe through.
 */
export function CategoryExplorer({ groups: all }: { groups: NavGroup[] }) {
  // A department whose categories are all hidden has nothing to show here, so it gets no tab.
  const groups = all.filter((g) => g.categories.length > 0);
  const [groupKey, setGroupKey] = useState<string | null>(null);
  const [activeByGroup, setActiveByGroup] = useState<Record<string, string>>({});

  if (groups.length === 0) return null;
  const current = groups.find((g) => g.key === groupKey) ?? groups[0];

  return (
    <Tabs
      label="Collections"
      items={groups.map((g) => ({ value: g.key, label: g.name }))}
      value={current.key}
      onValueChange={setGroupKey}
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
      {/* Touch screens: the categories as a row of photographs to swipe through, the next one peeking in. */}
      <ul aria-label={`${group.name} categories`} className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-1 overflow-x-auto px-[var(--gutter)] lg:hidden">
        {group.categories.map((category, i) => (
          <li key={category.key} className="w-[44vw] max-w-64 shrink-0 snap-start sm:w-[30vw] md:w-[23vw]">
            <Link href={category.href} className="group/cat block outline-offset-[-2px]">
              <div className="relative overflow-hidden bg-paper">
                {category.preview[0] ? (
                  <div className="transition-transform duration-[1400ms] ease-out-expo group-active/cat:scale-[1.03]">
                    <Picture shot={category.preview[0]} alt="" sizes="(min-width: 768px) 23vw, (min-width: 640px) 30vw, 44vw" ratio="4 / 5" />
                  </div>
                ) : (
                  <div className="aspect-[4/5]" />
                )}
              </div>
              <p className="mt-3 flex items-baseline gap-2 px-0.5">
                <span className="label-sm shrink-0 text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate text-[17px] leading-tight font-light tracking-[-0.02em] text-ink">{category.name}</span>
              </p>
              <p className="label-sm mt-1.5 px-0.5 text-mute">{category.summary}</p>
            </Link>
          </li>
        ))}
      </ul>

      {/* Pointer devices: the list, which brings each category onto the stage beside it */}
      <ul className="hidden min-w-0 lg:col-span-5 lg:block lg:self-center">
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
                <span className={cn("label-sm ml-auto shrink-0 transition-colors duration-500", isActive ? "text-ink-3" : "text-mute lg:text-mute/60")}>{category.summary}</span>
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
                  if (!shot) return <div key={n} className={cn("absolute bg-paper", frame.className)} />;
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

      <div className="mt-7 lg:hidden">
        <ButtonLink href={group.href} variant="outline" className="w-full">
          All {group.name}
        </ButtonLink>
      </div>
    </div>
  );
}
