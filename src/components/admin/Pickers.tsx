"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { buttonStyles, inputClass } from "./ui";

export type ProductOption = { slug: string; name: string; category: string; thumb: string | null; visible: boolean };
export type Option = { value: string; label: string; group?: string };

/** Choose products, in order. Posts a JSON list of slugs. */
export function ProductPicker({ name, options, initial, max = 200 }: { name: string; options: ProductOption[]; initial: string[]; max?: number }) {
  const bySlug = useMemo(() => new Map(options.map((o) => [o.slug, o])), [options]);
  const [chosen, setChosen] = useState<string[]>(initial.filter((s) => bySlug.has(s)));
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return options.filter((o) => !chosen.includes(o.slug) && terms.every((t) => `${o.name} ${o.category}`.toLowerCase().includes(t))).slice(0, 12);
  }, [options, q, chosen]);

  const move = (i: number, d: number) =>
    setChosen((list) => {
      const next = [...list];
      const j = i + d;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(chosen)} />
      {chosen.length ? (
        <ol className="divide-y divide-line border border-line bg-white">
          {chosen.map((slug, i) => {
            const o = bySlug.get(slug)!;
            return (
              <li key={slug} className="flex items-center gap-3 p-2">
                <Thumb src={o.thumb} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]">{o.name}</p>
                  <p className="text-[12px] text-ink-3">
                    {o.category}
                    {o.visible ? "" : " · hidden"}
                  </p>
                </div>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center text-ink-2 disabled:opacity-25" aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === chosen.length - 1} className="grid h-8 w-8 place-items-center text-ink-2 disabled:opacity-25" aria-label="Move down">
                  ↓
                </button>
                <button type="button" onClick={() => setChosen((l) => l.filter((s) => s !== slug))} className="h-8 px-2 text-[12.5px] text-accent hover:underline">
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="border border-dashed border-line bg-white px-4 py-4 text-[13.5px] text-ink-3">No pieces chosen yet.</p>
      )}
      {chosen.length < max ? (
        <div className="relative mt-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to find a piece: achkan, navy suit, white shirt…" className={inputClass} aria-label="Find a piece to add" />
          {matches.length ? (
            <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto border border-line bg-white shadow-lg">
              {matches.map((o) => (
                <li key={o.slug}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 p-2 text-left hover:bg-paper"
                    onClick={() => {
                      setChosen((l) => (l.length >= max ? l : [...l, o.slug]));
                      setQ("");
                    }}
                  >
                    <Thumb src={o.thumb} />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px]">{o.name}</span>
                      <span className="block text-[12px] text-ink-3">{o.category}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-[12.5px] text-ink-3">That is the most this section shows ({max}).</p>
      )}
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <span className="relative block h-12 w-10 shrink-0 bg-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /> : null}
    </span>
  );
}

/** Choose several values from a list (e.g. the categories an offer applies to). Posts a JSON list. */
export function MultiPicker({ name, options, initial }: { name: string; options: Option[]; initial: string[] }) {
  const [chosen, setChosen] = useState<string[]>(initial);
  const groups = useMemo(() => {
    const m = new Map<string, Option[]>();
    for (const o of options) m.set(o.group ?? "", [...(m.get(o.group ?? "") ?? []), o]);
    return [...m.entries()];
  }, [options]);
  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(chosen)} />
      {groups.map(([group, opts]) => (
        <div key={group}>
          {group ? <p className="mb-1.5 text-[12px] tracking-[0.06em] text-ink-3 uppercase">{group}</p> : null}
          <div className="flex flex-wrap gap-2">
            {opts.map((o) => {
              const on = chosen.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  aria-pressed={on}
                  onClick={() => setChosen((l) => (on ? l.filter((v) => v !== o.value) : [...l, o.value]))}
                  className={cn("border px-3 py-1.5 text-[13px] transition-colors", on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink")}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export type LinkOptions = { products: Option[]; categories: Option[]; collections: Option[]; curated: Option[] };

const LINK_TYPES = [
  { value: "none", label: "Nowhere (just a message)" },
  { value: "product", label: "A product" },
  { value: "category", label: "A category" },
  { value: "collection", label: "A department (Heritage, Classic…)" },
  { value: "curated", label: "A collection or launch" },
  { value: "url", label: "Another page or web address" },
] as const;

/** Where a banner leads when clicked. Posts linkType and linkTarget. */
export function LinkPicker({ options, initialType, initialTarget }: { options: LinkOptions; initialType: string; initialTarget: string }) {
  const [type, setType] = useState(initialType || "none");
  const [target, setTarget] = useState(initialTarget);
  const list = type === "product" ? options.products : type === "category" ? options.categories : type === "collection" ? options.collections : type === "curated" ? options.curated : [];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select name="linkType" value={type} onChange={(e) => {
        setType(e.target.value);
        setTarget("");
      }} className={inputClass} aria-label="Banner leads to">
        {LINK_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {type === "url" ? (
        <input name="linkTarget" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="/bespoke or https://…" className={inputClass} aria-label="Address" />
      ) : type === "none" ? (
        <input type="hidden" name="linkTarget" value="" />
      ) : (
        <select name="linkTarget" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} aria-label="Destination" required>
          <option value="">Choose…</option>
          {groupOptions(list).map(([group, opts]) =>
            group ? (
              <optgroup key={group} label={group}>
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              opts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            ),
          )}
        </select>
      )}
      {type !== "none" && list.length === 0 && type !== "url" ? <p className="text-[12.5px] text-ink-3 sm:col-span-2">Nothing to choose yet.</p> : null}
    </div>
  );
}

function groupOptions(list: Option[]): Array<[string, Option[]]> {
  const m = new Map<string, Option[]>();
  for (const o of list) m.set(o.group ?? "", [...(m.get(o.group ?? "") ?? []), o]);
  return [...m.entries()];
}

export function AddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={buttonStyles.secondary}>
      {children}
    </button>
  );
}
