"use client";

import { useState } from "react";
import { saveOffer } from "@/app/admin/actions/offers";
import type { Offer } from "@/data/types";
import { asciiDigits, money } from "@/lib/admin/form";
import { formatPrice } from "@/lib/format";
import { ActionForm } from "./ActionForm";
import { MultiPicker, ProductPicker, type Option, type ProductOption } from "./Pickers";
import { Card, Field, Input, localInput, Notice, Toggle } from "./ui";

/** The longest label that fits beside the wishlist heart on a phone's product card (checked again when saving). */
const BADGE_MAX = 18;

const KINDS = [
  { value: "percent", label: "A percentage off", hint: "e.g. 15% off the price." },
  { value: "amount", label: "An amount off, in taka", hint: "e.g. ৳2,000 off the price." },
  { value: "note", label: "Label only", hint: "The price stays the same; cards just carry the label, e.g. “Free alterations”." },
] as const;

const SCOPES = [
  { value: "all", label: "Everything", hint: "Every piece on the website." },
  { value: "collection", label: "A department", hint: "e.g. everything in Heritage." },
  { value: "category", label: "Categories", hint: "e.g. all Sherwanis and Achkans." },
  { value: "products", label: "Chosen pieces", hint: "Pick the pieces one by one." },
] as const;

export function OfferForm({ offer, departments, categories, products }: { offer: Offer | null; departments: Option[]; categories: Option[]; products: ProductOption[] }) {
  const o = offer;
  const [kind, setKind] = useState<Offer["kind"]>(o?.kind ?? "percent");
  const [scope, setScope] = useState<Offer["scope"]>(o?.scope ?? "category");
  const [value, setValue] = useState(o && o.kind !== "note" ? String(o.value) : "");
  const [name, setName] = useState(o?.name ?? "");
  const [badge, setBadge] = useState(o?.badge ?? "");
  const initial = (s: Offer["scope"]) => (o?.scope === s ? o.targets : []);
  // What cards show when the label is left empty (the same words the website uses).
  const percent = Number.parseInt(asciiDigits(value).replace(/\D/g, ""), 10);
  const amount = money(value).value;
  const defaultBadge = kind === "percent" ? `${percent > 0 ? percent : 15}% off` : kind === "amount" ? `${formatPrice(amount && amount > 0 ? amount : 2000)} off` : null;

  return (
    <ActionForm action={saveOffer} submitLabel={o ? "Save changes" : "Add offer"}>
      {o ? <input type="hidden" name="id" value={o.id} /> : null}
      <Notice>
        Offers change the price only on pieces that have a price; pieces shown as “Price on request” still get the label. If a piece is covered by more than one offer, or has its own sale price, visitors see the lowest price.
      </Notice>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="The offer">
            <Field label="Offer name" htmlFor="name" hint="Shown to visitors on the product page, e.g. “Eid offer” or “Wedding season”.">
              <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
            </Field>
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium">Kind of offer</legend>
              <RadioCards name="kind" options={KINDS} value={kind} onChange={(v) => setKind(v as Offer["kind"])} columns="sm:grid-cols-3" />
            </fieldset>
            <div hidden={kind === "note"}>
              <Field label={kind === "amount" ? "Taka off" : "Percentage off"} htmlFor="value" hint={kind === "amount" ? "Taken off the regular price of each piece. It must be less than the price of every piece it applies to." : "A whole number from 1 to 90."}>
                <div className="flex max-w-60 items-center">
                  {kind === "amount" ? <span className="border border-r-0 border-line bg-paper px-3 py-2.5 text-[13px] text-ink-3">৳</span> : null}
                  <Input
                    id="value"
                    name="value"
                    // An amount is typed like a price ("2,000" or "৳2,000"), so it is a text field; the server reads it.
                    type={kind === "percent" ? "number" : "text"}
                    inputMode="numeric"
                    min={kind === "percent" ? 1 : undefined}
                    max={kind === "percent" ? 90 : undefined}
                    step={kind === "percent" ? 1 : undefined}
                    required={kind !== "note"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={kind === "amount" ? "2000" : "15"}
                  />
                  {kind === "percent" ? <span className="border border-l-0 border-line bg-paper px-3 py-2.5 text-[13px] text-ink-3">%</span> : null}
                </div>
              </Field>
            </div>
            <Field
              label={kind === "note" ? "Label on cards" : "Label on cards (optional)"}
              htmlFor="badge"
              hint={
                kind === "note"
                  ? `The words product cards carry, e.g. “Free alterations”. Up to ${BADGE_MAX} letters, so it fits on a phone.`
                  : `A word or two on product cards, e.g. “Eid 15% off”, up to ${BADGE_MAX} letters. Left empty, cards show “${defaultBadge}”.`
              }
            >
              <Input
                id="badge"
                name="badge"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                maxLength={BADGE_MAX}
                required={kind === "note"}
                placeholder={defaultBadge ?? "e.g. Free alterations"}
              />
              {badge.length > BADGE_MAX ? <p className="mt-1.5 text-[12.5px] text-accent">This label has {badge.length} letters. Shorten it to {BADGE_MAX} or fewer.</p> : null}
            </Field>
          </Card>

          <Card title="Applies to">
            <fieldset>
              <legend className="sr-only">Applies to</legend>
              <RadioCards name="scope" options={SCOPES} value={scope} onChange={(v) => setScope(v as Offer["scope"])} columns="sm:grid-cols-2" />
            </fieldset>
            {/* Each choice keeps its own picker (hidden when not chosen), so switching back loses nothing. Only the chosen one is saved. */}
            <div hidden={scope !== "collection"}>
              <Field label="Departments">
                <MultiPicker name="departments" options={departments} initial={initial("collection")} />
              </Field>
            </div>
            <div hidden={scope !== "category"}>
              <Field label="Categories" hint="Tap to choose; tap again to remove.">
                <MultiPicker name="categories" options={categories} initial={initial("category")} />
              </Field>
            </div>
            <div hidden={scope !== "products"}>
              <Field label="Pieces">
                <ProductPicker name="products" options={products} initial={initial("products")} max={500} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="When it runs" intro="Dhaka time. Leave both empty to run it until you switch it off.">
            <Field label="Show from (optional)" htmlFor="startsAt">
              <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={localInput(o?.startsAt ?? null)} />
            </Field>
            <Field label="Show until (optional)" htmlFor="endsAt" hint="Prices go back to normal by themselves at this time.">
              <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={localInput(o?.endsAt ?? null)} />
            </Field>
            <Toggle name="active" label="Switched on" hint="Turn off to pause the offer without deleting it." defaultChecked={o ? o.active : true} />
          </Card>
        </div>
      </div>
    </ActionForm>
  );
}

function RadioCards({
  name,
  options,
  value,
  onChange,
  columns,
}: {
  name: string;
  options: ReadonlyArray<{ value: string; label: string; hint: string }>;
  value: string;
  onChange: (value: string) => void;
  columns: string;
}) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {options.map((opt) => (
        <label key={opt.value} className="flex cursor-pointer items-start gap-3 border border-line bg-white p-3.5 transition-colors has-[:checked]:border-ink">
          <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="mt-1 accent-ink" />
          <span>
            <span className="block text-[14px] font-medium text-ink">{opt.label}</span>
            <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-3">{opt.hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
