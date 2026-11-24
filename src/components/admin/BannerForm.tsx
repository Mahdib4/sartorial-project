"use client";

import { useState } from "react";
import { saveBanner } from "@/app/admin/actions/banners";
import type { Banner } from "@/data/types";
import type { LibraryImage } from "@/lib/admin/data";
import { ActionForm } from "./ActionForm";
import { ImagesField } from "./ImagesField";
import { LinkPicker, type LinkOptions } from "./Pickers";
import { Card, Field, Input, localInput, Textarea, Toggle } from "./ui";

const PLACEMENTS = [
  {
    value: "home",
    label: "Home page banner",
    hint: "A large banner in the space under the opening film on the home page. With a photograph, or as a dark band with your words.",
  },
  {
    value: "bar",
    label: "Announcement bar",
    hint: "One short line in the slim bar above the menu, on every page. When there are several, they take turns.",
  },
] as const;

/** The starting values for a new banner (the new-banner page fills them in from the address, e.g. for “Announce it”). */
export type BannerDraft = Omit<Banner, "id" | "position">;

/** About how many letters of a notice fit on one line of the bar on a phone (it is in capitals, widely spaced). */
const BAR_PHONE_LETTERS = 35;

const EMPTY: BannerDraft = { placement: "home", title: "", eyebrow: "", body: "", cta: "", image: null, linkType: "none", linkTarget: "", startsAt: null, endsAt: null, active: true };

export function BannerForm({ banner, draft, links, image, library }: { banner: Banner | null; draft?: BannerDraft; links: LinkOptions; image: LibraryImage[]; library: LibraryImage[] }) {
  const b = banner ?? draft ?? EMPTY;
  const [placement, setPlacement] = useState<Banner["placement"]>(b.placement);
  const [title, setTitle] = useState(b.title);
  const [endsAt, setEndsAt] = useState(localInput(b.endsAt));
  const home = placement === "home";
  // "Show until" in the past: it would never show. Compared in Dhaka time, as the field is (to the minute the form opened).
  const [openedAt] = useState(() => localInput(new Date().toISOString()));
  const ended = Boolean(endsAt) && endsAt <= openedAt;

  return (
    <ActionForm action={saveBanner} submitLabel={banner ? "Save changes" : home ? "Add banner" : "Add notice"}>
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Where it appears">
            <fieldset>
              <legend className="sr-only">Where it appears</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PLACEMENTS.map((p) => (
                  <label key={p.value} className="flex cursor-pointer items-start gap-3 border border-line bg-white p-4 transition-colors has-[:checked]:border-ink">
                    <input type="radio" name="placement" value={p.value} checked={placement === p.value} onChange={() => setPlacement(p.value)} className="mt-1 accent-ink" />
                    <span>
                      <span className="block text-[14px] font-medium text-ink">{p.label}</span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-3">{p.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>

          <Card title="The words">
            {/* Fields for the home page banner only are hidden (not removed) for the bar, so nothing typed is lost when switching. */}
            <div hidden={!home}>
              <Field label="Small heading above (optional)" htmlFor="eyebrow" hint="A few words in small letters above the heading, e.g. “New launch” or “Eid 2026”.">
                <Input id="eyebrow" name="eyebrow" defaultValue={b.eyebrow} maxLength={80} />
              </Field>
            </div>
            <Field
              label={home ? "Heading" : "Message"}
              htmlFor="title"
              hint={
                home ? (
                  "The large words on the banner, e.g. “The Eid edit has arrived”."
                ) : (
                  <>
                    One short line, e.g. “Free alterations this Eid”. A phone fits about {BAR_PHONE_LETTERS} letters on the line; a longer message is cut short there, ending in “…”.{" "}
                    <span className={title.trim().length > BAR_PHONE_LETTERS ? "text-accent" : undefined} aria-live="polite">
                      {title.trim().length > BAR_PHONE_LETTERS
                        ? `This one has ${title.trim().length} letters, so phones will cut it short.`
                        : title.trim()
                          ? `${title.trim().length} letters: it fits.`
                          : null}
                    </span>
                  </>
                )
              }
            >
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={home ? 160 : 140} />
            </Field>
            <div hidden={!home}>
              <Field label="More text (optional)" htmlFor="body" hint="A sentence or two under the heading.">
                <Textarea id="body" name="body" defaultValue={b.body} rows={3} maxLength={600} />
              </Field>
            </div>
            <Field
              label={home ? "Button text (optional)" : "Link text (optional)"}
              htmlFor="cta"
              hint={
                home
                  ? "e.g. Shop now. Shown only when the banner leads somewhere; left empty it reads “Discover”."
                  : "e.g. Shop now. Shown after the message on tablets and computers, when the notice leads somewhere. Phones show only the message, with a small arrow, and the whole bar is the link."
              }
            >
              <Input id="cta" name="cta" defaultValue={b.cta} maxLength={40} placeholder="Shop now" />
            </Field>
          </Card>

          <div hidden={!home}>
            <Card title="Photograph (optional)" intro="Without a photograph the banner is a dark band with your words. A wide photograph works best.">
              <ImagesField name="image" initial={image} library={library} max={1} emptyHint="No photograph: the banner is a dark band with your words." />
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Where it leads" intro={home ? "Clicking the banner takes visitors here." : "Clicking the notice takes visitors here."}>
            <LinkPicker options={links} initialType={b.linkType} initialTarget={b.linkTarget} />
            <p className="text-[12.5px] leading-relaxed text-ink-3">
              For a web address, a page on this website starts with “/”, e.g. /bespoke. Another website starts with https://.
            </p>
          </Card>

          <Card title="When it shows" intro="Dhaka time. Leave both empty to show it until you switch it off.">
            <Field label="Show from (optional)" htmlFor="startsAt">
              <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={localInput(b.startsAt)} />
            </Field>
            <Field
              label="Show until (optional)"
              htmlFor="endsAt"
              hint={ended ? <span className="text-accent">This time has already passed, so it will not show on the website. Choose a later time, or clear it.</span> : "It comes down by itself at this time."}
            >
              <Input id="endsAt" name="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} aria-invalid={ended || undefined} />
            </Field>
            <Toggle name="active" label="Switched on" hint="Turn off to take it down without deleting it." defaultChecked={b.active} />
          </Card>
        </div>
      </div>
    </ActionForm>
  );
}
