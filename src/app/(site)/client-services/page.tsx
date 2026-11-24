import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/interior/accordion";
import { SizeTables } from "@/components/pages/SizeTables";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { catalog } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Client services",
  description: "How to order from Sartorial, the size guide, and how to care for tailoring, shirts and embroidered heritage pieces.",
  alternates: { canonical: "/client-services" },
};

const ORDER = [
  { title: "Choose", text: "Add the pieces you are considering to your bag, with a size or marked “Made to measure”. Save others to your wishlist." },
  { title: "Send", text: "Open your bag and send your selection to us as one message, by WhatsApp or email. Nothing is charged on this site." },
  { title: "Fit", text: "We reply to confirm cloth, price and a time for your fitting, where measurements are taken and details are decided." },
];

const CARE = [
  { title: "Tailoring", points: ["Dry clean only, and as seldom as you can. Brushing and airing after each wear does more for the cloth.", "Hang on a shaped, wide-shouldered hanger and rest the garment for a day between wears.", "Steam rather than iron; if you must press, use a cloth between iron and garment."] },
  { title: "Shirts", points: ["Machine wash cool with similar colours, collar and cuffs unbuttoned.", "Hang to dry and iron while slightly damp, collar first.", "Avoid tumble drying, which shortens the life of the collar."] },
  { title: "Embroidered heritage pieces", points: ["Specialist dry clean only. Point out the embroidery before the garment is treated.", "Store on a padded hanger in a breathable garment bag, away from light.", "Keep perfume and moisture away from metal-thread work, which can tarnish."] },
];

const QUESTIONS = [
  { id: "pay", title: "Can I pay on the website?", content: "No. Our pieces are made to order, so the site takes enquiries rather than payments. Send us the contents of your bag and we will confirm everything with you directly." },
  { id: "size", title: "Do I need to know my size?", content: "No. Choose “Made to measure” on any tailored piece and we will take your measurements at a fitting. If you know your size, select it and we will use it as a starting point." },
  { id: "saved", title: "Where are my bag and wishlist kept?", content: "In your browser, on this device. They are not sent to us until you send an enquiry, and clearing your browser data will remove them." },
  { id: "price", title: "Why do some pieces show “Price on request”?", content: "The price of a made-to-order garment depends on the cloth and the work involved. We confirm it when we reply to your enquiry." },
];

export default async function ClientServicesPage() {
  // Phone and email as set in the admin (Settings).
  const { contact } = (await catalog()).settings;
  const hasContact = Boolean(contact.phone || contact.email);
  return (
    <main className="pt-header">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Client services" }]} eyebrow="At your service" title="Client services">
        <p>How ordering works, the size guide, and how to look after what we make for you.</p>
      </PageHeader>

      <nav aria-label="On this page" className="no-scrollbar flex gap-x-7 overflow-x-auto border-y border-line-soft px-gutter">
        {[
          ["#ordering", "Ordering"],
          ["#size-guide", "Size guide"],
          ["#care", "Garment care"],
          ["#questions", "Questions"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="flex h-12 shrink-0 items-center text-[13.5px] whitespace-nowrap text-ink-3 transition-colors duration-300 hover:text-ink">
            {label}
          </a>
        ))}
      </nav>

      <section id="ordering" className="scroll-mt-32 grid grid-cols-1 gap-x-10 gap-y-8 px-gutter py-16 md:py-24 lg:grid-cols-12" aria-labelledby="ordering-title">
        <h2 id="ordering-title" className="headline lg:col-span-4">
          How ordering works
        </h2>
        <ol className="border-t border-line lg:col-span-7 lg:col-start-6">
          {ORDER.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-6 md:grid-cols-[4rem_10rem_1fr]">
              <span className="label-sm pt-1.5 text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-[20px] leading-tight font-light tracking-[-0.02em]">{step.title}</h3>
              <p className="col-start-2 mt-2 text-[14.5px] leading-relaxed text-ink-2 md:col-start-3 md:mt-0">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="size-guide" className="scroll-mt-32 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-line-soft px-gutter py-16 md:py-24 lg:grid-cols-12" aria-labelledby="size-title">
        <h2 id="size-title" className="headline lg:col-span-4">
          Size guide
        </h2>
        <div className="lg:col-span-7 lg:col-start-6">
          <SizeTables />
        </div>
      </section>

      <section id="care" className="scroll-mt-32 border-t border-line-soft bg-paper px-gutter py-16 md:py-24" aria-labelledby="care-title">
        <h2 id="care-title" className="headline">
          Garment care
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
          {CARE.map((block) => (
            <div key={block.title}>
              <h3 className="label border-b border-line pb-3">{block.title}</h3>
              <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-ink-2">
                {block.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="questions" className="scroll-mt-32 grid grid-cols-1 gap-x-10 gap-y-8 px-gutter py-16 md:py-24 lg:grid-cols-12" aria-labelledby="questions-title">
        <div className="lg:col-span-4">
          <h2 id="questions-title" className="headline">
            Questions
          </h2>
          <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-ink-2">
            Anything else, ask us when you{" "}
            <Link href="/appointments" className="link-under text-ink">
              book a fitting
            </Link>
            .
          </p>
          {hasContact ? (
            <address className="mt-6 text-[14.5px] leading-relaxed [overflow-wrap:anywhere] not-italic">
              {contact.phone ? (
                <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="block hover:opacity-70">
                  {contact.phone}
                </a>
              ) : null}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="block hover:opacity-70">
                  {contact.email}
                </a>
              ) : null}
            </address>
          ) : null}
        </div>
        <div className="border-t border-line lg:col-span-7 lg:col-start-6">
          <Accordion type="single" collapsible defaultOpen={["pay"]} maxPanelHeight={600} headingLevel={3} items={QUESTIONS.map((q) => ({ id: q.id, title: q.title, content: <p className="max-w-xl pb-2 text-[14.5px] leading-relaxed text-ink-2">{q.content}</p> }))} />
        </div>
      </section>

      <section className="border-t border-line-soft px-gutter py-16 text-center md:py-24">
        <h2 className="headline mx-auto max-w-[18ch]">Ready when you are.</h2>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-row sm:items-center sm:justify-center">
          <ButtonLink href="/appointments">Book a fitting</ButtonLink>
          <ButtonLink href="/bag" variant="outline">
            Open your bag
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
