import { BannerForm, type BannerDraft } from "@/components/admin/BannerForm";
import { PageHead } from "@/components/admin/ui";
import type { LinkType } from "@/data/types";
import { getCurated, mediaLibrary } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";

const LINK_TYPES: LinkType[] = ["none", "product", "category", "collection", "curated", "url"];

/**
 * A new banner or notice. The form can be filled in from the address, e.g.
 * /admin/banners/new?placement=home&linkType=curated&linkTarget=<slug>&title=…
 * (the Collections section's “Announce it” button).
 */
export default async function NewBannerPage({ searchParams }: PageProps<"/admin/banners/new">) {
  const sp = await searchParams;
  const str = (key: string, max = 300) => (typeof sp[key] === "string" ? (sp[key] as string).trim().slice(0, max) : "");
  const placement = str("placement") === "bar" ? "bar" : "home";
  const linkType = LINK_TYPES.find((t) => t === str("linkType")) ?? "none";
  const linkTarget = linkType === "none" ? "" : str("linkTarget", 500);

  const [{ links }, library, curated] = await Promise.all([pickerOptions(), mediaLibrary(), linkType === "curated" && linkTarget ? getCurated(linkTarget) : null]);

  const draft: BannerDraft = {
    placement,
    title: str("title", 160) || curated?.title || "",
    eyebrow: str("eyebrow", 80) || (curated?.isLaunch ? "New launch" : ""),
    body: str("body", 600),
    cta: str("cta", 40),
    image: null,
    linkType,
    linkTarget,
    startsAt: null,
    endsAt: null,
    active: true,
  };

  return (
    <>
      <PageHead
        title={placement === "home" ? "Add a home page banner" : "Add a notice"}
        intro={
          placement === "home"
            ? "Write the words, add a photograph if you like, and choose where it leads. It appears under the opening film on the home page as soon as you save (unless you set a start date or switch it off)."
            : "Write one short line and choose where it leads. It appears in the bar above the menu as soon as you save (unless you set a start date or switch it off)."
        }
      />
      <BannerForm banner={null} draft={draft} links={links} image={[]} library={library} />
    </>
  );
}
