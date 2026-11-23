"use client";

import Link from "next/link";
import { saveHome } from "@/app/admin/actions/settings";
import type { HomeSectionKey, HomeSettings } from "@/data/types";
import { ActionForm } from "./ActionForm";
import { ProductPicker, type ProductOption } from "./Pickers";
import { Card, Toggle } from "./ui";

export type HomeSectionOption = { key: HomeSectionKey; label: string; hint: string };

/** Where some sections get their contents, for a link under the switches. */
const MANAGED_ELSEWHERE: Partial<Record<HomeSectionKey, { href: string; label: string }>> = {
  promo: { href: "/admin/banners", label: "Banners & notices" },
  launches: { href: "/admin/collections", label: "Collections & launches" },
  explorer: { href: "/admin/categories", label: "Categories" },
};

export function HomepageForm({ home, sections, products }: { home: HomeSettings; sections: HomeSectionOption[]; products: ProductOption[] }) {
  return (
    <ActionForm action={saveHome} submitLabel="Save the home page">
      <Card title="Sections, from top to bottom" intro="Turn a section off to take it off the home page. Nothing in it is deleted: turn it back on at any time.">
        <div className="grid gap-3 md:grid-cols-2">
          {sections.map((s) => (
            <Toggle key={s.key} name={`section-${s.key}`} label={s.label} hint={s.hint} defaultChecked={home.sections[s.key] !== false} />
          ))}
        </div>
        <p className="text-[12.5px] leading-relaxed text-ink-3">
          What some sections show is chosen elsewhere:{" "}
          {sections
            .filter((s) => MANAGED_ELSEWHERE[s.key])
            .map((s, i, list) => {
              const m = MANAGED_ELSEWHERE[s.key]!;
              return (
                <span key={s.key}>
                  {s.label.toLowerCase()} in{" "}
                  <Link href={m.href} className="underline hover:text-ink">
                    {m.label}
                  </Link>
                  {i < list.length - 1 ? "; " : "."}
                </span>
              );
            })}
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="The wedding wardrobe" intro="The four Heritage pieces shown beside the wedding photograph. Hidden pieces are skipped; with none left, the section is not shown.">
          <ProductPicker name="heritagePicks" options={products} initial={home.heritagePicks} max={4} />
        </Card>
        <Card title="The suit, cut for one" intro="The four Classic pieces shown beside the suit photograph. Hidden pieces are skipped; with none left, the section is not shown.">
          <ProductPicker name="classicPicks" options={products} initial={home.classicPicks} max={4} />
        </Card>
      </div>
    </ActionForm>
  );
}
