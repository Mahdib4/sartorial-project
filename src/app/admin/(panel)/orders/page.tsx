import Link from "next/link";
import { deleteEnquiry } from "@/app/admin/actions/orders";
import { ConfirmButton } from "@/components/admin/ActionForm";
import { OrderStatus } from "@/components/admin/OrderStatus";
import { ButtonLink, Empty, inputClass, Notice, PageHead, Pill, when } from "@/components/admin/ui";
import { ENQUIRY_STATUSES, listEnquiries, type Enquiry } from "@/lib/admin/data";
import { cn } from "@/lib/cn";
import { pluralise } from "@/lib/format";

/** How many enquiries a tab shows before a search is needed to reach older ones. */
const PAGE = 200;

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  // A search looks through every status (an enquiry found under Contacted is still found from the New tab).
  const status = !q && typeof sp.status === "string" && ENQUIRY_STATUSES.some((s) => s.value === sp.status) ? sp.status : "";
  const enquiries = await listEnquiries(status || undefined, q ? 2000 : PAGE);
  const shown = q ? enquiries.filter((e) => matches(e, q)) : enquiries;
  const statusLabel = ENQUIRY_STATUSES.find((s) => s.value === status)?.label;
  const options = ENQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label }));
  const labelOf = (value: string) => ENQUIRY_STATUSES.find((s) => s.value === value)?.label ?? value;
  // "2 New, 1 Contacted" for the search summary.
  const byStatus = ENQUIRY_STATUSES.map((s) => ({ label: s.label, n: shown.filter((e) => e.status === s.value).length })).filter((s) => s.n > 0);

  const tabHref = (value: string) => (value ? `/admin/orders?status=${value}` : "/admin/orders");

  return (
    <>
      <PageHead
        title="Orders & enquiries"
        intro="Every “Send message” from the bag page or the fitting form is logged here, under the same reference the customer’s WhatsApp message carries. Change the status as you go, so nobody is missed."
      />
      {sp.deleted ? (
        <div className="mb-5">
          <Notice tone="success">The enquiry was deleted.</Notice>
        </div>
      ) : null}

      <nav aria-label="Show enquiries by status" className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max border-b border-line">
          {[{ value: "", label: "All" }, ...ENQUIRY_STATUSES].map((tab) => {
            const active = tab.value === status;
            return (
              <li key={tab.value || "all"}>
                <Link
                  href={tabHref(tab.value)}
                  aria-current={active ? "page" : undefined}
                  className={cn("-mb-px inline-flex h-11 items-center border-b-2 px-3.5 text-[13.5px] transition-colors", active ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink")}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" role="search">
        <input name="q" type="search" enterKeyHint="search" defaultValue={q} placeholder="Search by reference, name or phone" className={inputClass} aria-label="Search all enquiries" />
        <div className="flex gap-2">
          <button type="submit" className="h-[42px] flex-1 border border-ink bg-ink px-4 text-[13.5px] text-white sm:flex-none">
            Find
          </button>
          {q ? (
            <Link href="/admin/orders" className="inline-flex h-[42px] items-center border border-line bg-white px-4 text-[13.5px] hover:border-ink">
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {status === "new" && shown.length ? (
        <p className="mb-4 text-[13px] text-ink-3">Once you have replied to a customer, set their enquiry to Contacted. It stays on this page (with Undo, in case of a slip) and leaves the New list the next time you open it.</p>
      ) : null}
      {q && shown.length ? (
        <p className="mb-4 text-[13px] text-ink-3">
          {pluralise(shown.length, "enquiry", "enquiries")} found for “{q}”, across every status: {byStatus.map((s) => `${s.n} ${s.label}`).join(", ")}.
        </p>
      ) : null}

      {shown.length === 0 ? (
        q || status ? (
          <Empty action={<ButtonLink href="/admin/orders" variant="secondary">Show all enquiries</ButtonLink>}>
            {q ? `Nothing matches “${q}”, under any status. Try part of the reference, the customer’s name or their phone number.` : `No enquiries are marked ${statusLabel}.`}
          </Empty>
        ) : (
          <Empty>
            No enquiries yet. They appear here the moment a customer presses “Send message” on the bag page or the fitting form, under the same reference their WhatsApp message carries (for example SRT-261122-7KQ3).
          </Empty>
        )
      ) : (
        <ul className="space-y-4">
          {shown.map((e) => (
            <EnquiryCard key={e.id} enquiry={e} options={options} status={status} q={q} statusLabel={q ? labelOf(e.status) : null} />
          ))}
        </ul>
      )}

      {!q && enquiries.length >= PAGE ? <p className="mt-5 text-[13px] text-ink-3">Showing the newest {PAGE}. Search by reference, name or phone to find older ones.</p> : null}
    </>
  );
}

const linkButton = "inline-flex h-8 items-center border border-line bg-white px-3 text-[12.5px] text-ink-2 hover:border-ink hover:text-ink";
const heading = "text-[11px] tracking-[0.14em] text-ink-3 uppercase";

/** Long words and pasted links in what customers type wrap inside the card instead of widening the page. */
const wrap = "[overflow-wrap:anywhere]";

function EnquiryCard({
  enquiry: e,
  options,
  status,
  q,
  statusLabel,
}: {
  enquiry: Enquiry;
  options: Array<{ value: string; label: string }>;
  status: string;
  q: string;
  /** Shown on search results, which come from every status. */
  statusLabel: string | null;
}) {
  const items = Array.isArray(e.items) ? e.items : [];
  const pieces = items.reduce((n, item) => n + (Number(item.qty) || 1), 0);
  const wa = e.phone ? whatsappDigits(e.phone) : null;
  // The WhatsApp reply opens with a short greeting, so the customer knows who is writing and about what.
  const greeting = `Hello ${e.name.trim()}, this is Sartorial. Thank you for your ${e.kind === "order" ? "enquiry" : "fitting request"} ${e.reference}. `;
  const details = [
    { label: "Interested in", value: e.interest },
    { label: "Occasion", value: e.occasion },
    { label: "Preferred time", value: e.preferredTime },
  ].filter((d): d is { label: string; value: string } => Boolean(d.value));

  return (
    <li className={cn("group min-w-0 border border-line bg-white", e.status === "new" && "border-l-2 border-l-accent")}>
      <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-start sm:justify-between md:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[19px] leading-tight tracking-[0.03em] break-all md:text-[21px]">{e.reference}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
            {statusLabel ? <Pill tone={e.status === "new" ? "accent" : "neutral"}>{statusLabel}</Pill> : null}
            <Pill>{e.kind === "order" ? "Order" : "Fitting request"}</Pill>
            <span>{when(e.createdAt)}</span>
            {pieces ? (
              <>
                <span>·</span>
                <span>{pluralise(pieces, "piece")}</span>
              </>
            ) : null}
          </p>
        </div>
        <OrderStatus id={e.id} status={e.status} reference={e.reference} options={options} filter={status} />
      </div>

      {/* Faded once its status was changed on a list of another status (it leaves that list next time). */}
      <div className="grid grid-cols-1 gap-6 p-4 transition-opacity group-has-[[data-moved]]:opacity-55 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:px-5">
        <section aria-label="Customer" className="min-w-0">
          <h3 className={heading}>Customer</h3>
          <p className={cn("mt-1.5 text-[15px] text-ink", wrap)}>{e.name}</p>
          {e.phone ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={cn("mr-1 text-[14px] text-ink-2", wrap)}>{e.phone}</span>
              {wa ? (
                <a href={`https://wa.me/${wa}?text=${encodeURIComponent(greeting)}`} target="_blank" rel="noreferrer" className={linkButton} aria-label={`Reply to ${e.name.trim()} on WhatsApp`}>
                  WhatsApp
                </a>
              ) : null}
              <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className={linkButton} aria-label={`Call ${e.name.trim()}`}>
                Call
              </a>
            </div>
          ) : null}
          {e.email ? (
            <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your enquiry ${e.reference}`)}`} className="mt-2 block text-[14px] break-all text-ink-2 underline decoration-line underline-offset-4 hover:text-ink">
              {e.email}
            </a>
          ) : null}
          {details.length ? (
            <dl className="mt-4 space-y-2 text-[13.5px]">
              {details.map((d) => (
                <div key={d.label}>
                  <dt className="text-[12.5px] text-ink-3">{d.label}</dt>
                  <dd className={cn("text-ink-2", wrap)}>{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>

        <div className="min-w-0 space-y-5">
          {items.length ? (
            <section aria-label="Pieces">
              <h3 className={heading}>{e.kind === "order" ? "Pieces" : "Pieces of interest"}</h3>
              <ul className="mt-1 divide-y divide-line-soft">
                {items.map((item, i) => (
                  <li key={`${item.slug}-${item.size}-${i}`} className="py-2.5">
                    <a href={`/products/${item.slug}`} target="_blank" rel="noreferrer" className={cn("text-[14.5px] text-ink hover:underline", wrap)}>
                      {item.name} <span className="text-ink-3">↗</span>
                    </a>
                    <p className={cn("mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-ink-3", wrap)}>
                      {item.category ? <span>{item.category}</span> : null}
                      <span>
                        Ref <span className="font-mono text-ink-2">{item.reference}</span>
                      </span>
                      <span>
                        Size <span className="text-ink-2">{item.size}</span>
                      </span>
                      <span>
                        Qty <span className="text-ink-2">{item.qty}</span>
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {e.notes ? (
            <section aria-label="Notes">
              <h3 className={heading}>Notes from the customer</h3>
              <p className={cn("mt-1.5 text-[14px] leading-relaxed whitespace-pre-line text-ink-2", wrap)}>{e.notes}</p>
            </section>
          ) : null}
          {!items.length && !e.notes ? <p className="text-[13px] text-ink-3">No pieces or notes were sent with this enquiry.</p> : null}
        </div>
      </div>

      <div className="flex justify-end border-t border-line-soft px-4 py-3 md:px-5">
        <form action={deleteEnquiry}>
          <input type="hidden" name="id" value={e.id} />
          {status ? <input type="hidden" name="status" value={status} /> : null}
          {q ? <input type="hidden" name="q" value={q} /> : null}
          <ConfirmButton message={`Delete enquiry ${e.reference} from ${e.name}? This cannot be undone. (To keep it but mark it closed, set it to Completed or Cancelled instead.)`} label={`Delete enquiry ${e.reference}`}>
            Delete
          </ConfirmButton>
        </form>
      </div>
    </li>
  );
}

/** Reference, name or phone (phone numbers match with or without the 0 / +880 at the start). */
function matches(e: Enquiry, q: string): boolean {
  const needle = q.toLowerCase();
  if (`${e.reference} ${e.name} ${e.phone ?? ""} ${e.email ?? ""}`.toLowerCase().includes(needle)) return true;
  const digits = localNumber(q.replace(/\D/g, ""));
  return digits.length >= 4 && Boolean(e.phone) && localNumber(e.phone!.replace(/\D/g, "")).includes(digits);
}

function localNumber(digits: string): string {
  return digits.replace(/^(00)?880/, "").replace(/^0/, "");
}

/** A phone number as wa.me wants it: international digits, Bangladeshi local numbers given their 880. */
function whatsappDigits(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `880${digits.slice(1)}`;
  else if (/^1\d{9}$/.test(digits) && !phone.trim().startsWith("+")) digits = `880${digits}`;
  return digits.length >= 8 ? digits : null;
}
