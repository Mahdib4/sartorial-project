"use client";

import { useState } from "react";
import { saveCurated } from "@/app/admin/actions/curated";
import type { Curated } from "@/data/types";
import type { LibraryImage } from "@/lib/admin/data";
import { slugify } from "@/lib/admin/form";
import { ActionForm } from "./ActionForm";
import { ImagesField } from "./ImagesField";
import { ProductPicker, type ProductOption } from "./Pickers";
import { Card, Field, Input, Textarea, Toggle } from "./ui";

export function CollectionForm({ collection, cover, library, products }: { collection: Curated | null; cover: LibraryImage[]; library: LibraryImage[]; products: ProductOption[] }) {
  const c = collection;
  const [title, setTitle] = useState(c?.title ?? "");
  return (
    <ActionForm action={saveCurated} submitLabel={c ? "Save changes" : "Add collection"}>
      {c ? <input type="hidden" name="original" value={c.slug} /> : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="About the collection">
            <Field label="Title" htmlFor="title" hint="The name visitors see, e.g. “The Eid edit” or “Winter wedding”.">
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} placeholder="e.g. The Eid edit" />
            </Field>
            {!c ? (
              <Field label="Web address" htmlFor="slug" hint="Leave empty to make it from the title. It cannot be changed later.">
                <div className="flex items-center">
                  <span className="shrink-0 border border-r-0 border-line bg-paper px-3 py-2.5 text-[13px] text-ink-3">/collections/</span>
                  <Input id="slug" name="slug" placeholder={slugify(title) || "the-eid-edit"} />
                </div>
              </Field>
            ) : (
              <p className="text-[13px] text-ink-3">
                Web address:{" "}
                <a href={`/collections/${c.slug}`} target="_blank" rel="noreferrer" className="underline">
                  /collections/{c.slug}
                </a>
              </p>
            )}
            <Field label="Small heading (optional)" htmlFor="eyebrow" hint="A few words shown above the title, e.g. “Eid 2026”. Left empty, the page says “New launch” or “Collection”.">
              <Input id="eyebrow" name="eyebrow" defaultValue={c?.eyebrow} maxLength={60} placeholder="e.g. Eid 2026" />
            </Field>
            <Field label="Introduction (optional)" htmlFor="intro" hint="A sentence or two at the top of its page.">
              <Textarea id="intro" name="intro" defaultValue={c?.intro} rows={4} maxLength={2000} />
            </Field>
          </Card>

          <Card title="Cover photograph" intro="Shown at the top of its page and on its card on the home page. Optional: without one, the main photograph of the first piece is used.">
            <ImagesField name="cover" initial={cover} library={library} max={1} emptyHint="No cover chosen. The first piece's photograph will be used." />
          </Card>

          <Card title="The pieces" intro="Choose the pieces in this collection and put them in the order visitors should see them. Hidden pieces are left out on the website.">
            <ProductPicker name="products" options={products} initial={c?.products ?? []} max={120} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Where it appears" intro="Collections are listed on the home page (up to six) and at the top of the Clothing menu (up to three).">
            <Toggle name="visible" label="Show on the website" hint="Turn off to prepare it first, or to take it down without deleting it." defaultChecked={c ? c.visible : true} />
            <Toggle name="isLaunch" label="This is a new launch" hint="Adds a “New launch” tag to its card on the home page." defaultChecked={c?.isLaunch} />
            <Field label="Position" htmlFor="position" hint="Lower numbers come first. Collections with the same number show the newest first, so 0 is fine for most.">
              <Input id="position" name="position" inputMode="numeric" defaultValue={c?.position ?? 0} className="max-w-32" />
            </Field>
          </Card>
        </div>
      </div>
    </ActionForm>
  );
}
