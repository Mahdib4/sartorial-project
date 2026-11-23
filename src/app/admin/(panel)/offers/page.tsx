import Link from "next/link";
import { setOfferActive } from "@/app/admin/actions/offers";
import { ButtonLink, Empty, Notice, PageHead, Pill, when } from "@/components/admin/ui";
import { COLLECTIONS } from "@/data/categories";
import type { Offer } from "@/data/types";
import { listOffers } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";
import { formatPrice, pluralise } from "@/lib/format";

export default async function OffersPage({ searchParams }: PageProps<"/admin/offers">) {
  const sp = await searchParams;
  const [offers, options] = await Promise.all([listOffers(), pickerOptions()]);
  const now = new Date();
  const categoryNames = new Map(options.categories.map((c) => [c.value, c.label.replace(/ \(hidden\)$/, "")]));
  const productNames = new Map(options.products.map((p) => [p.slug, p.name]));
  const live = offers.filter((o) => status(o, now).live).length;

  return (
    <>
      <PageHead
        title="Offers & discounts"
        intro={
          <>
            Take a percentage or an amount off, or just put a label on the cards, for everything, a department, some categories or chosen pieces. Offers change the price only on pieces that have a price; pieces shown as “Price on request” still get the label.{" "}
            {offers.length ? (live ? `${pluralise(live, "offer")} live now.` : "No offer is live right now.") : null}
          </>
        }
        action={<ButtonLink href="/admin/offers/new">Add an offer</ButtonLink>}
      />
      {sp.saved ? (
        <div className="mb-5">
          <Notice tone="success">Saved. The website shows the change straight away (scheduled offers start and stop within five minutes of their time).</Notice>
        </div>
      ) : null}
      {sp.deleted ? (
        <div className="mb-5">
          <Notice tone="success">The offer was deleted. Prices are back to normal.</Notice>
        </div>
      ) : null}

      {offers.length === 0 ? (
        <Empty action={<ButtonLink href="/admin/offers/new">Add an offer</ButtonLink>}>No offers yet.</Empty>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {offers.map((o) => {
            const s = status(o, now);
            const applies = appliesTo(o, categoryNames, productNames);
            return (
              <li key={o.id} className="flex items-center gap-3 p-3 md:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link href={`/admin/offers/${o.id}`} className="truncate text-[14.5px] hover:underline">
                      {o.name}
                    </Link>
                    <Pill tone={s.tone}>{s.label}</Pill>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
                    <span className="text-ink-2">{discount(o)}</span>
                    <span>·</span>
                    <span className={applies.problem ? "text-accent" : undefined} title={applies.full}>
                      {applies.text}
                    </span>
                    <span>·</span>
                    <span>
                      Label <Pill tone="accent">{o.badge || defaultBadge(o)}</Pill>
                    </span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-ink-3">{dates(o)}</p>
                </div>
                <form action={setOfferActive}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="active" value={o.active ? "false" : "true"} />
                  <button className="h-9 min-w-[4.5rem] border border-line px-2 text-[12.5px] text-ink-2 hover:border-ink" title={o.active ? "Pause the offer without deleting it" : "Start the offer again"}>
                    {o.active ? "Switch off" : "Switch on"}
                  </button>
                </form>
                <Link href={`/admin/offers/${o.id}`} className="hidden h-9 items-center border border-line px-3 text-[12.5px] hover:border-ink md:inline-flex">
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/** "15% off", "৳2,000 off" or "Label only". */
function discount(o: Offer): string {
  if (o.kind === "percent") return `${o.value}% off`;
  if (o.kind === "amount") return `${formatPrice(o.value)} off`;
  return "Label only";
}

/** The label cards show when the offer has none of its own (as the website does). */
function defaultBadge(o: Offer): string {
  if (o.kind === "percent") return `−${o.value}%`;
  if (o.kind === "amount") return "Offer";
  return o.name;
}

/** "Everything", "All Heritage", "All Sherwanis and Achkans", "3 pieces". */
function appliesTo(o: Offer, categories: Map<string, string>, products: Map<string, string>): { text: string; full: string; problem: boolean } {
  if (o.scope === "all") return { text: "Everything", full: "Every piece on the website", problem: false };
  const names =
    o.scope === "collection"
      ? o.targets.map((k) => COLLECTIONS[k as keyof typeof COLLECTIONS]?.name).filter((n): n is string => Boolean(n))
      : o.scope === "category"
        ? o.targets.map((k) => categories.get(k)).filter((n): n is string => Boolean(n))
        : o.targets.map((s) => products.get(s)).filter((n): n is string => Boolean(n));
  if (!names.length) return { text: "Nothing (what it applied to was removed)", full: "", problem: true };
  const full = joinAnd(names);
  if (o.scope === "products") return { text: pluralise(names.length, "piece"), full, problem: false };
  const shown = names.length > 3 ? `${names.slice(0, 2).join(", ")} and ${pluralise(names.length - 2, o.scope === "collection" ? "more department" : "more category", o.scope === "collection" ? "more departments" : "more categories")}` : full;
  return { text: `All ${shown}`, full, problem: false };
}

function joinAnd(names: string[]): string {
  return names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function dates(o: Offer): string {
  if (o.startsAt && o.endsAt) return `From ${when(o.startsAt)} until ${when(o.endsAt)}`;
  if (o.startsAt) return `From ${when(o.startsAt)}, no end date`;
  if (o.endsAt) return `Until ${when(o.endsAt)}`;
  return "No dates: runs while switched on";
}

/** Live, scheduled, ended or switched off, from the on/off switch and the dates. */
function status(o: Pick<Offer, "active" | "startsAt" | "endsAt">, now: Date): { live: boolean; label: string; tone: "live" | "neutral" | "off" } {
  if (!o.active) return { live: false, label: "Off", tone: "off" };
  if (o.endsAt && new Date(o.endsAt) <= now) return { live: false, label: "Ended", tone: "off" };
  if (o.startsAt && new Date(o.startsAt) > now) return { live: false, label: "Scheduled", tone: "neutral" };
  return { live: true, label: "Live", tone: "live" };
}
