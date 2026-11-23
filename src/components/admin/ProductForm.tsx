"use client";

import { saveProduct } from "@/app/admin/actions/products";
import type { Product } from "@/data/types";
import type { LibraryImage } from "@/lib/admin/data";
import { ActionForm } from "./ActionForm";
import { ImagesField } from "./ImagesField";
import { Card, Field, Input, Select, Textarea, Toggle } from "./ui";

const COLOUR_FAMILIES = ["Black", "Navy", "Blue", "Grey", "Brown", "Green", "Ivory", "Gold", "Pink", "Red", "White", "Multi"];
const OCCASIONS = ["Wedding", "Festive", "Black tie", "Business", "Casual"];

export type CategoryOption = { key: string; name: string; collection: string };

export function ProductForm({ product, categories, images, library, defaultCategory }: { product: Product | null; categories: CategoryOption[]; images: LibraryImage[]; library: LibraryImage[]; defaultCategory?: string }) {
  const p = product;
  const groups = ["heritage", "classic", "accessories", "footwear"].map((g) => [g, categories.filter((c) => c.collection === g)] as const);
  return (
    <ActionForm action={saveProduct} submitLabel={p ? "Save changes" : "Add product"}>
      {p ? <input type="hidden" name="original" value={p.slug} /> : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Photographs" intro="The first photograph is shown on product cards and should show the piece being worn. Visitors see the rest when they open the product.">
            <ImagesField name="images" initial={images} library={library} />
          </Card>

          <Card title="About the piece">
            <Field label="Name" htmlFor="name">
              <Input id="name" name="name" defaultValue={p?.name} required placeholder="e.g. Ivory Paisley Jacquard Achkan" />
            </Field>
            {!p ? (
              <Field label="Web address" htmlFor="slug" hint="Leave empty to make it from the name. It cannot be changed later.">
                <div className="flex items-center">
                  <span className="border border-r-0 border-line bg-paper px-3 py-2.5 text-[13px] text-ink-3">/products/</span>
                  <Input id="slug" name="slug" placeholder="ivory-paisley-jacquard-achkan" />
                </div>
              </Field>
            ) : (
              <p className="text-[13px] text-ink-3">
                Web address: <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="underline">/products/{p.slug}</a>
              </p>
            )}
            <Field label="One-line summary" htmlFor="summary" hint="Shown under the name.">
              <Input id="summary" name="summary" defaultValue={p?.summary} maxLength={300} />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" defaultValue={p?.description} rows={5} />
            </Field>
            <Field label="Details" htmlFor="details" hint="One per line, e.g. “Knee-length achkan with band collar”.">
              <Textarea id="details" name="details" defaultValue={p?.details.join("\n")} rows={5} />
            </Field>
            <Field label="Small note (optional)" htmlFor="note">
              <Input id="note" name="note" defaultValue={p?.note} />
            </Field>
          </Card>

          <Card title="Colour, cloth and occasion">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Colour" htmlFor="colour" hint="As customers would say it, e.g. “Midnight navy”.">
                <Input id="colour" name="colour" defaultValue={p?.colour} />
              </Field>
              <Field label="Colour group" htmlFor="colourFamily" hint="Used by the colour filter.">
                <Select id="colourFamily" name="colourFamily" defaultValue={p?.colourFamily ?? "Multi"}>
                  {COLOUR_FAMILIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cloth (optional)" htmlFor="fabric">
                <Input id="fabric" name="fabric" defaultValue={p?.fabric} placeholder="e.g. Brocade, Velvet, Linen" />
              </Field>
              <Field label="House code (optional)" htmlFor="code" hint="Shown on the product and in WhatsApp orders.">
                <Input id="code" name="code" defaultValue={p?.code} />
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium">Occasions</legend>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <label key={o} className="flex cursor-pointer items-center gap-2 border border-line bg-white px-3 py-2 text-[13.5px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white">
                    <input type="checkbox" name="occasions" value={o} defaultChecked={p?.occasions.includes(o)} className="sr-only" />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Where it appears">
            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" defaultValue={p?.category ?? defaultCategory ?? ""} required>
                <option value="" disabled>
                  Choose a category
                </option>
                {groups.map(([g, list]) =>
                  list.length ? (
                    <optgroup key={g} label={g[0].toUpperCase() + g.slice(1)}>
                      {list.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null,
                )}
              </Select>
            </Field>
            <Toggle name="visible" label="Show on the website" hint="Turn off to hide it without deleting it." defaultChecked={p ? p.visible !== false : true} />
            <Toggle name="featured" label="Featured" hint="Marks it as a favourite when choosing home page pieces." defaultChecked={p?.featured} />
          </Card>

          <Card title="Price and label" intro="Leave the price empty to show “Price on request”.">
            <Field label="Price (৳)" htmlFor="price">
              <Input id="price" name="price" inputMode="numeric" defaultValue={p?.price ?? ""} placeholder="e.g. 45000" />
            </Field>
            <Field label="Sale price (৳, optional)" htmlFor="salePrice" hint="Shown with the regular price struck through.">
              <Input id="salePrice" name="salePrice" inputMode="numeric" defaultValue={p?.salePrice ?? ""} />
            </Field>
            <Field label="Label on the card (optional)" htmlFor="badge" hint="A word or two, e.g. “New” or “Limited”. A live offer's label takes its place.">
              <Input id="badge" name="badge" defaultValue={p?.badge} maxLength={30} />
            </Field>
          </Card>

          {p?.videos?.length ? (
            <Card title="Films" intro="Filmed in the atelier. Untick one to remove it from this piece.">
              {p.videos.map((v) => (
                <label key={v} className="flex items-center gap-2 text-[13px] text-ink-2">
                  <input type="checkbox" defaultChecked onChange={(e) => {
                    const hidden = e.currentTarget.form?.elements.namedItem("videos") as HTMLInputElement | null;
                    if (!hidden) return;
                    const list = JSON.parse(hidden.value) as string[];
                    hidden.value = JSON.stringify(e.currentTarget.checked ? [...new Set([...list, v])] : list.filter((x) => x !== v));
                  }} />
                  {v.split("/").pop()}
                </label>
              ))}
              <input type="hidden" name="videos" defaultValue={JSON.stringify(p.videos)} />
            </Card>
          ) : null}
        </div>
      </div>
    </ActionForm>
  );
}
