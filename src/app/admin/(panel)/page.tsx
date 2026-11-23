import Link from "next/link";
import { ButtonLink, PageHead, Pill, when } from "@/components/admin/ui";
import { dashboardCounts, getSettings, listEnquiries } from "@/lib/admin/data";
import { cn } from "@/lib/cn";
import { pluralise } from "@/lib/format";

const QUICK_ACTIONS = [
  { href: "/admin/products/new", title: "Add a product", hint: "A new piece, with its photographs, words and price." },
  { href: "/admin/banners/new", title: "Add a banner", hint: "A promotion on the home page, or a notice in the bar at the top." },
  { href: "/admin/offers/new", title: "Create an offer", hint: "Money off, or a label, on everything or chosen pieces." },
  { href: "/admin/collections/new", title: "Create a collection", hint: "A page of hand-picked pieces, such as a new launch." },
  { href: "/admin/homepage", title: "Edit the home page", hint: "Choose which sections show and which pieces are featured." },
  { href: "/admin/settings", title: "Contact & WhatsApp", hint: "The number orders go to, and the phone, email, address and hours." },
];

/** The admin's front page: what needs a reply, shortcuts, and a few plain numbers. */
export default async function OverviewPage() {
  const [counts, latest, settings] = await Promise.all([dashboardCounts(), listEnquiries(undefined, 5), getSettings()]);
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Dhaka" }).format(now));
  const greeting = hour >= 5 && hour < 12 ? "Good morning" : hour >= 12 && hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" }).format(now);

  const count = (key: string) => counts[key] ?? 0;
  const fresh = count("enquiries_new");
  const whatsapp = settings.contact.whatsapp.replace(/\D/g, "");
  const uploads = Boolean(process.env.R2_ACCESS_KEY_ID && process.env.R2_BUCKET);

  const glance = [
    { href: "/admin/products", value: count("products_live"), label: "Pieces on the website" },
    { href: "/admin/products", value: count("products_hidden"), label: "Hidden pieces" },
    { href: "/admin/categories", value: count("categories"), label: "Categories" },
    { href: "/admin/banners", value: count("banners_live"), label: "Banners showing now" },
    { href: "/admin/offers", value: count("offers_live"), label: "Offers running now" },
    { href: "/admin/collections", value: count("collections"), label: "Collections on the website" },
  ];

  return (
    <>
      <PageHead title={greeting} intro={`${today}. Here is what needs you, and shortcuts to what you change most often.`} />

      <div className="space-y-8 md:space-y-10">
        {/* 1. Needs attention */}
        <section aria-labelledby="attention" className={cn("border border-line bg-white", fresh > 0 && "border-l-2 border-l-accent")}>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between md:p-6">
            <div>
              <h2 id="attention" className="text-[16px] font-medium tracking-[-0.01em]">
                Needs attention
              </h2>
              {fresh > 0 ? (
                <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[44px] leading-none font-light tracking-[-0.02em] text-accent">{fresh}</span>
                  <span className="text-[14.5px] text-ink-2">new {fresh === 1 ? "enquiry" : "enquiries"} waiting for a reply</span>
                </p>
              ) : (
                <p className="mt-2 text-[14.5px] text-ink-2">Nothing new. Every enquiry has been looked at.</p>
              )}
              <p className="mt-2 text-[12.5px] text-ink-3">{pluralise(count("enquiries_30d"), "enquiry", "enquiries")} in the last 30 days.</p>
            </div>
            {fresh > 0 ? <ButtonLink href="/admin/orders?status=new">See new orders</ButtonLink> : <ButtonLink href="/admin/orders" variant="secondary">All orders</ButtonLink>}
          </div>

          <div className="border-t border-line">
            <h3 className="px-5 pt-4 text-[11px] tracking-[0.14em] text-ink-3 uppercase md:px-6">Latest enquiries</h3>
            {latest.length ? (
              <ul className="mt-2 divide-y divide-line-soft">
                {latest.map((e) => {
                  const pieces = (Array.isArray(e.items) ? e.items : []).reduce((n, item) => n + (Number(item.qty) || 1), 0);
                  return (
                    <li key={e.id}>
                      <Link href={`/admin/orders?q=${encodeURIComponent(e.reference)}`} className="flex flex-col gap-1 px-5 py-3 hover:bg-paper sm:flex-row sm:items-center sm:gap-4 md:px-6">
                        <span className="font-mono text-[14px] tracking-[0.03em] sm:w-44 sm:shrink-0">{e.reference}</span>
                        <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{e.name}</span>
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
                          <span>{pieces ? pluralise(pieces, "piece") : e.kind === "order" ? "Order" : "Fitting request"}</span>
                          <span>·</span>
                          <span>{when(e.createdAt)}</span>
                          {e.status === "new" ? <Pill tone="accent">New</Pill> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 pt-2 pb-5 text-[13.5px] text-ink-3 md:px-6">No enquiries yet. They appear here the moment a customer presses “Send message” on the bag page or the fitting form.</p>
            )}
            {latest.length ? (
              <div className="border-t border-line-soft px-5 py-3 md:px-6">
                <Link href="/admin/orders" className="text-[13px] text-ink-2 hover:text-ink">
                  See all orders →
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* 2. Quick actions */}
        <section aria-labelledby="quick">
          <h2 id="quick" className="mb-3 text-[16px] font-medium tracking-[-0.01em]">
            Quick actions
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
            {QUICK_ACTIONS.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="group flex h-full min-h-[92px] flex-col justify-between gap-3 border border-line bg-white p-4 transition-colors hover:border-ink sm:min-h-[112px] md:p-5">
                  <span className="text-[15px] leading-snug text-ink">{a.title}</span>
                  <span className="hidden text-[12.5px] leading-relaxed text-ink-3 sm:block">{a.hint}</span>
                  <span aria-hidden className="text-[15px] text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink sm:hidden">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6">
          {/* 3. At a glance */}
          <section aria-labelledby="glance">
            <h2 id="glance" className="mb-3 text-[16px] font-medium tracking-[-0.01em]">
              At a glance
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {glance.map((g) => (
                <li key={g.label}>
                  <Link href={g.href} className="block h-full border border-line bg-white p-4 transition-colors hover:border-ink">
                    <span className="block text-[28px] leading-none font-light tracking-[-0.02em]">{g.value}</span>
                    <span className="mt-2 block text-[12.5px] leading-snug text-ink-3">{g.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Setup */}
          <section aria-labelledby="setup">
            <h2 id="setup" className="mb-3 text-[16px] font-medium tracking-[-0.01em]">
              Setup
            </h2>
            <ul className="divide-y divide-line-soft border border-line bg-white">
              <SetupRow ok label="Database" status="Connected">
                Products, orders and settings are saved safely.
              </SetupRow>
              <SetupRow ok={uploads} label="Photo uploads" status={uploads ? "Ready" : "Not set up"}>
                {uploads ? "New photographs you add are stored online and shown on the website." : "You can still choose from the photographs already in the library. Your developer can switch uploads on by adding the R2 storage keys."}
              </SetupRow>
              <SetupRow ok={Boolean(whatsapp)} label="WhatsApp number" status={whatsapp ? `+${whatsapp}` : "Not set"}>
                {whatsapp ? "Orders and fitting requests are sent here. " : "Without it, “Send message” cannot open WhatsApp. "}
                <Link href="/admin/settings" className="text-ink-2 underline decoration-line underline-offset-4 hover:text-ink">
                  Change in Settings
                </Link>
              </SetupRow>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function SetupRow({ ok, label, status, children }: { ok: boolean; label: string; status: string; children: React.ReactNode }) {
  return (
    <li className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[14px] text-ink">
          <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", ok ? "bg-ok" : "bg-accent")} />
          {label}
        </span>
        <Pill tone={ok ? "live" : "accent"}>{status}</Pill>
      </div>
      <p className="mt-1 pl-4 text-[12.5px] leading-relaxed text-ink-3">{children}</p>
    </li>
  );
}
