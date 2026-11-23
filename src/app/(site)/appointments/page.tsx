import type { Metadata } from "next";
import { AppointmentView } from "@/components/pages/AppointmentView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Picture } from "@/components/ui/Picture";
import { SITE } from "@/config/site";
import { shot } from "@/lib/media";

export const metadata: Metadata = {
  title: "Book a fitting",
  description: "Request a fitting at Sartorial in Dhaka for heritage or classic tailoring.",
  alternates: { canonical: "/appointments" },
};

const EXPECT = [
  { title: "A conversation", text: "The occasion, how you like your clothes to sit, and what you already own." },
  { title: "Cloth and cut", text: "You choose from the bolts and the pieces on the stand; we advise." },
  { title: "Measurements", text: "Taken once, by hand, and used to draw your pattern." },
];

export default function AppointmentsPage() {
  const { contact } = SITE;
  return (
    <main className="pt-header">
      {/* Phones: the request follows the introduction directly; what to expect comes after it. Wide screens: two columns, as before. */}
      <div className="grid gap-x-16 gap-y-12 px-gutter pt-6 pb-20 md:pt-10 md:pb-24 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-6 lg:row-start-1">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Book a fitting" }]} />
          <p className="label mt-7 text-ink-3 md:mt-14">By appointment · {SITE.city}</p>
          <h1 className="display-md mt-4 md:mt-5">Book a fitting</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2 md:mt-6 md:text-[16px]">Tell us what you have in mind and when you would like to come in. We will reply to confirm a time.</p>
        </div>

        <section className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:pt-24" aria-labelledby="request-title">
          <h2 id="request-title" className="headline-sm mb-7">
            Your request
          </h2>
          <AppointmentView />
        </section>

        <div className="lg:col-span-6 lg:row-start-2">
          <ol className="max-w-lg border-t border-line">
            {EXPECT.map((item, i) => (
              <li key={item.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-5">
                <span className="label-sm pt-1 text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-[17px] font-light tracking-[-0.01em]">{item.title}</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {contact.address.length || contact.phone || contact.hours ? (
            <address className="mt-10 text-[14px] leading-relaxed text-ink-2 not-italic">
              <p className="label mb-3 text-ink-3">The atelier</p>
              {contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              {contact.hours ? <span className="block text-ink-3">{contact.hours}</span> : null}
              {contact.phone ? (
                <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="link-under mt-2 inline-block text-ink">
                  {contact.phone}
                </a>
              ) : null}
            </address>
          ) : null}

          <div className="mt-12 hidden max-w-lg lg:block">
            <Picture shot={shot("classic/suits/charcoal-three-piece-bespoke-suit-01")} alt="A client in a charcoal three-piece suit at the counter of the Sartorial salon in Dhaka" sizes="40vw" ratio="3 / 2" />
          </div>
        </div>
      </div>
    </main>
  );
}
