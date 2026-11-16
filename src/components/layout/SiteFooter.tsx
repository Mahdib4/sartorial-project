import Link from "next/link";
import { Newsletter } from "@/components/layout/Newsletter";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Wordmark";
import { SITE } from "@/config/site";
import type { NavGroup } from "@/data/navigation";

const HOUSE = [
  { label: "The bespoke process", href: "/bespoke" },
  { label: "Book a fitting", href: "/appointments" },
  { label: "Client services", href: "/client-services" },
  { label: "Size guide", href: "/client-services#size-guide" },
  { label: "Garment care", href: "/client-services#care" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Your bag", href: "/bag" },
];

const PROMISES = [
  { title: "Made to measure", text: "Tailoring is cut to a pattern drawn for its wearer." },
  { title: "Finished by hand", text: "Basting, canvas, buttonholes and embroidery are worked by hand." },
  { title: "Heritage and Classic", text: "Two wardrobes, sherwanis and suits, from one house in Dhaka." },
];

const SOCIAL: Array<{ key: keyof typeof SITE.social; label: string; icon: IconName }> = [
  { key: "instagram", label: "Instagram", icon: "instagram" },
  { key: "facebook", label: "Facebook", icon: "facebook" },
  { key: "youtube", label: "YouTube", icon: "youtube" },
];

function Column({ title, href, links }: { title: string; href?: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h2 className="label text-ink">{href ? <Link href={href}>{title}</Link> : title}</h2>
      <ul className="mt-5 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[13.5px] text-ink-3 transition-colors duration-300 hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ groups }: { groups: NavGroup[] }) {
  const by = (key: string) => groups.find((g) => g.key === key)!;
  const links = (key: string) => by(key).categories.map((c) => ({ label: c.name, href: c.href }));
  const social = SOCIAL.filter((s) => SITE.social[s.key]);
  const { contact } = SITE;
  const hasContact = Boolean(contact.phone || contact.email || contact.address.length || contact.hours);

  return (
    <footer className="mt-auto bg-paper text-ink">
      {/* Promises */}
      <div className="grid gap-y-8 border-b border-line px-gutter py-12 md:grid-cols-3 md:gap-x-10 md:py-16">
        {PROMISES.map((p) => (
          <div key={p.title} className="text-center">
            <h2 className="label">{p.title}</h2>
            <p className="mx-auto mt-3 max-w-[30ch] text-[13.5px] leading-relaxed text-ink-3">{p.text}</p>
          </div>
        ))}
      </div>

      {/* Wordmark, the width of the page */}
      <div aria-hidden className="overflow-hidden px-gutter pt-10 md:pt-14">
        <Wordmark fill="width" className="text-line select-none" />
      </div>

      <div className="grid gap-x-10 gap-y-12 px-gutter py-12 md:py-16 lg:grid-cols-12">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-7">
          <Column title="Heritage" href={by("heritage").href} links={links("heritage")} />
          <Column title="Classic" href={by("classic").href} links={links("classic")} />
          <div className="space-y-10">
            <Column title="Accessories" href={by("accessories").href} links={links("accessories")} />
            <Column title="Footwear" href={by("footwear").href} links={links("footwear")} />
          </div>
          <Column title="The house" links={HOUSE} />
        </nav>

        <div className="lg:col-span-5 lg:pl-10">
          <h2 className="label">Stay informed</h2>
          <p className="headline-sm mt-4 max-w-[18ch]">Letters from the cutting table.</p>
          <div className="mt-6">
            <Newsletter />
          </div>

          {hasContact ? (
            <address className="mt-8 text-[13.5px] leading-relaxed text-ink-3 not-italic">
              {contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              {contact.hours ? <span className="block">{contact.hours}</span> : null}
              {contact.phone ? (
                <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="mt-2 block text-ink hover:opacity-70">
                  {contact.phone}
                </a>
              ) : null}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="block text-ink hover:opacity-70">
                  {contact.email}
                </a>
              ) : null}
            </address>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-line px-gutter py-6 text-[12px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {SITE.name}, {SITE.city}. All rights reserved.
        </p>
        {social.length ? (
          <ul className="flex items-center gap-1 text-ink">
            {social.map((s) => (
              <li key={s.key}>
                <a href={SITE.social[s.key]} target="_blank" rel="noreferrer" aria-label={s.label} className="grid h-10 w-10 place-items-center transition-opacity hover:opacity-60">
                  <Icon name={s.icon} size={20} />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="sm:text-right">
          <Link href="/client-services" className="hover:text-ink">
            Client services
          </Link>
          <span aria-hidden className="mx-3">
            ·
          </span>
          <Link href="/appointments" className="hover:text-ink">
            Appointments
          </Link>
        </p>
      </div>
    </footer>
  );
}
