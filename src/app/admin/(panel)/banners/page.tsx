import Link from "next/link";
import type { ReactNode } from "react";
import { moveBanner, setBannerActive } from "@/app/admin/actions/banners";
import { ButtonLink, Notice, PageHead, Pill, when } from "@/components/admin/ui";
import type { Banner } from "@/data/types";
import { getSettings, listBanners, thumbsFor } from "@/lib/admin/data";
import { describeLink, pickerOptions, type PickerOptions } from "@/lib/admin/options";

export default async function BannersPage({ searchParams }: PageProps<"/admin/banners">) {
  const sp = await searchParams;
  const [banners, options, settings] = await Promise.all([listBanners(), pickerOptions(), getSettings()]);
  const thumbs = new Map((await thumbsFor(banners.map((b) => b.image).filter((i): i is string => Boolean(i)))).map((t) => [t.id, t.src]));
  const now = new Date();
  const home = banners.filter((b) => b.placement === "home");
  const bar = banners.filter((b) => b.placement === "bar");
  const liveHome = home.filter((b) => status(b, now).live).length;
  const liveBar = bar.filter((b) => status(b, now).live).length;

  return (
    <>
      <PageHead
        title="Banners & notices"
        intro="The home page banner under the opening film, and the short notices in the bar above the menu. Give them dates to schedule them, or switch them on and off here."
        action={
          <>
            <ButtonLink href="/admin/banners/new?placement=home">Add a home page banner</ButtonLink>
            <ButtonLink href="/admin/banners/new?placement=bar" variant="secondary">
              Add a notice
            </ButtonLink>
          </>
        }
      />
      {typeof sp.saved === "string" ? (
        <div className="mb-5">
          {sp.ended ? (
            <Notice tone="warning">Saved, but its “show until” time has already passed, so it will not show on the website. To show it, open it below and choose a later time, or clear that date.</Notice>
          ) : (
            <Notice tone="success">Saved. The website shows the change straight away (scheduled ones start and stop within five minutes of their time).</Notice>
          )}
        </div>
      ) : null}
      {sp.deleted ? (
        <div className="mb-5">
          <Notice tone="success">Deleted.</Notice>
        </div>
      ) : null}

      <div className="space-y-10">
        <Group
          title="Home page banner"
          intro={
            <>
              The space under the opening film on the home page. When no banner is live, the space is simply left empty. If more than one is live they sit side by side (up to four), in this order.{" "}
              {liveHome ? `${liveHome} live now.` : "Nothing is live right now, so the space is empty."}
            </>
          }
          warning={
            settings.home.sections.promo === false && home.length ? (
              <>
                The promotional banner space is switched off for the home page, so these are not shown. Turn on “Promotional banner” in{" "}
                <Link href="/admin/homepage" className="underline">
                  Home page
                </Link>
                .
              </>
            ) : null
          }
          banners={home}
          thumbs={thumbs}
          options={options}
          now={now}
          empty="No home page banners yet."
          add={<ButtonLink href="/admin/banners/new?placement=home">Add a home page banner</ButtonLink>}
        />
        <Group
          title="Announcement bar"
          intro={
            <>
              The slim notices above the menu, on every page. When several are live they take turns, in this order.{" "}
              {liveBar ? `${liveBar} live now.` : "Nothing is live right now, so the bar is not shown."}
            </>
          }
          banners={bar}
          thumbs={thumbs}
          options={options}
          now={now}
          empty="No notices yet."
          add={
            <ButtonLink href="/admin/banners/new?placement=bar" variant="secondary">
              Add a notice
            </ButtonLink>
          }
        />
      </div>
    </>
  );
}

function Group({
  title,
  intro,
  warning,
  banners,
  thumbs,
  options,
  now,
  empty,
  add,
}: {
  title: string;
  intro: ReactNode;
  warning?: ReactNode;
  banners: Banner[];
  thumbs: Map<string, string>;
  options: PickerOptions;
  now: Date;
  empty: string;
  add: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h2 className="text-[18px] font-medium tracking-[-0.01em]">{title}</h2>
      <p className="mt-1 mb-4 max-w-2xl text-[13.5px] leading-relaxed text-ink-3">{intro}</p>
      {warning ? (
        <div className="mb-4">
          <Notice tone="warning">{warning}</Notice>
        </div>
      ) : null}
      {banners.length === 0 ? (
        <div className="border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="text-[14.5px] text-ink-2">{empty}</p>
          <div className="mt-5 flex justify-center">{add}</div>
        </div>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {banners.map((b, i) => {
            const s = status(b, now);
            const link = describeLink(options, b.linkType, b.linkTarget);
            const src = b.image ? thumbs.get(b.image) : undefined;
            return (
              <li key={b.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
                  {b.placement === "home" ? (
                    <Link href={`/admin/banners/${b.id}`} className="relative grid h-12 w-16 shrink-0 place-items-center overflow-hidden bg-ink sm:h-14 sm:w-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {src ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /> : <span className="px-1 text-center text-[9.5px] leading-tight tracking-[0.06em] text-white/70 uppercase">Words only</span>}
                    </Link>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/banners/${b.id}`} className="block truncate text-[14.5px] hover:underline">
                      {b.title}
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
                      <Pill tone={s.tone}>{s.label}</Pill>
                      {s.detail ? <span>{s.detail}</span> : null}
                    </p>
                    <p className={link.problem ? "mt-1 text-[12.5px] text-accent" : "mt-1 text-[12.5px] text-ink-3"}>
                      Leads to: {link.text}
                      {b.cta && b.linkType !== "none" ? ` · “${b.cta}”` : ""}
                    </p>
                    {link.problem ? <p className="mt-1 text-[12.5px] text-accent">{link.problem}</p> : null}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 sm:gap-2">
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button disabled={i === 0} className="grid h-9 w-9 place-items-center text-ink-3 hover:text-ink disabled:opacity-25" aria-label={`Move “${b.title}” earlier`} title="Move earlier">
                      ↑
                    </button>
                  </form>
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button disabled={i === banners.length - 1} className="grid h-9 w-9 place-items-center text-ink-3 hover:text-ink disabled:opacity-25" aria-label={`Move “${b.title}” later`} title="Move later">
                      ↓
                    </button>
                  </form>
                  <form action={setBannerActive}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="active" value={b.active ? "false" : "true"} />
                    <button
                      className="h-9 min-w-[4.5rem] border border-line px-2 text-[12.5px] text-ink-2 hover:border-ink"
                      title={b.active ? "Take it down without deleting it" : "Put it back up"}
                      aria-label={`${b.active ? "Switch off" : "Switch on"} “${b.title}”`}
                    >
                      {b.active ? "Switch off" : "Switch on"}
                    </button>
                  </form>
                  <Link href={`/admin/banners/${b.id}`} className="inline-flex h-9 items-center border border-line px-3 text-[12.5px] hover:border-ink" aria-label={`Edit “${b.title}”`}>
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {banners.length ? <div className="mt-3 flex justify-end">{add}</div> : null}
    </section>
  );
}

/**
 * Live, scheduled, ended or switched off, from the on/off switch and the dates.
 * `detail` carries the date ("from 1 Dec 2026, 10:00") beside the pill, so long dates can wrap on phones.
 */
function status(b: Pick<Banner, "active" | "startsAt" | "endsAt">, now: Date): { live: boolean; label: string; detail: string | null; tone: "live" | "neutral" | "off" } {
  if (!b.active) return { live: false, label: "Off", detail: null, tone: "off" };
  if (b.endsAt && new Date(b.endsAt) <= now) return { live: false, label: "Ended", detail: `on ${when(b.endsAt)}`, tone: "off" };
  if (b.startsAt && new Date(b.startsAt) > now) return { live: false, label: "Scheduled", detail: `from ${when(b.startsAt)}${b.endsAt ? ` until ${when(b.endsAt)}` : ""}`, tone: "neutral" };
  return { live: true, label: "Live", detail: b.endsAt ? `until ${when(b.endsAt)}` : null, tone: "live" };
}
