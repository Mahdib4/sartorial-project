import type { Metadata } from "next";
import { CategoryBanners, type Banner as BannerItem } from "@/components/home/CategoryBanners";
import { CategoryExplorer } from "@/components/home/CategoryExplorer";
import { CollectionsAccordion } from "@/components/home/CollectionsAccordion";
import { Craft } from "@/components/home/Craft";
import { FilmBand } from "@/components/home/FilmBand";
import { Hero } from "@/components/home/Hero";
import { Launches } from "@/components/home/Launches";
import { PromoSlot } from "@/components/home/PromoSlot";
import { MotionRail, type MotionItem } from "@/components/home/MotionRail";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { SplitFeature } from "@/components/home/SplitFeature";
import { Statement } from "@/components/home/Statement";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { catalog, categoryHref, productHref, type Catalog } from "@/data/catalog";
import { navGroups, shownGroups } from "@/data/navigation";
import { film, shot } from "@/lib/media";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Cards for the given pieces; any the admin has hidden or deleted are simply left out. */
const cards = (cat: Catalog, slugs: string[]) => slugs.flatMap((slug) => {
  const product = cat.getProduct(slug);
  return product ? [cat.toCard(product)] : [];
});

/** A showcase film on the "In motion" rail, linked to the piece it shows (left out if the piece is hidden). */
const motion = (cat: Catalog, videoId: string, slug: string): MotionItem[] => {
  const product = cat.getProduct(slug);
  if (!product) return [];
  const category = cat.getCategory(product.category)!;
  return [{ key: videoId, film: film(videoId), name: product.name, category: category.name, href: productHref(product) }];
};

export default async function HomePage() {
  const cat = await catalog();
  // A department whose categories have all been hidden in the admin is simply left out of the home page.
  const groups = shownGroups(navGroups(cat));
  const { sections, heritagePicks, classicPicks } = cat.settings.home;
  const show = (key: keyof typeof sections) => sections[key] !== false;
  const promos = show("promo") ? cat.banners("home") : [];
  const categoryCount = groups.reduce((n, g) => n + g.categories.length, 0);
  const H = "heritage";
  const C = "classic";
  const category = (key: string) => cat.getCategory(key);
  const classicBanners: BannerItem[] = [
    { key: "suits", title: "Suits", line: "Two-piece and three-piece", category: `${C}/suits`, image: `${C}/suits/bespoke-tailored-suits-trio-01`, position: "50% 30%" },
    { key: "black-tie", title: "Black tie", line: "Dinner suits and velvet", category: `${C}/suits`, href: "/clothing/classic/suits?occasion=Black+tie", image: `${C}/suits/black-tie-evening-tuxedos-trio-01`, position: "50% 5%" },
    { key: "shirts", title: "Shirts", line: "Four collars", category: `${C}/shirts`, image: `${C}/shirts/bespoke-blue-chambray-and-poplin-shirts-stack-01`, position: "50% 60%" },
    { key: "trousers", title: "Trousers", line: "Side tabs and single pleats", category: `${C}/trousers`, image: `${C}/trousers/tailored-side-tab-trousers-stack-01`, position: "50% 40%" },
    { key: "jackets", title: "Jackets", line: "Blazers, tweeds and safari", category: `${C}/sports-jackets`, image: `${C}/suits/mid-grey-flannel-two-piece-suit-03`, position: "50% 40%" },
  ].flatMap((b) => {
    const c = category(b.category);
    return c ? [{ key: b.key, title: b.title, line: b.line, href: b.href ?? categoryHref(c), image: shot(b.image), position: b.position }] : [];
  });
  const evening = cards(cat, ["tobacco-brown-velvet-dinner-suit", "midnight-navy-double-breasted-tuxedo"]);
  const motionItems = [
    ...motion(cat, `${H}/achkans/black-velvet-embroidered-collar-achkan-showcase-01`, "black-velvet-embroidered-collar-achkan"),
    ...motion(cat, `${H}/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-showcase-01`, "ivory-floral-jacquard-jodhpuri-jacket"),
    ...motion(cat, `${H}/achkans/powder-blue-silk-embroidered-collar-achkan-showcase-01`, "powder-blue-silk-embroidered-collar-achkan"),
    ...motion(cat, `${H}/stoles/ivory-gold-embroidered-border-heritage-stole-showcase-01`, "ivory-gold-embroidered-border-heritage-stole"),
    ...motion(cat, `${H}/achkans/mocha-brown-silk-embroidered-collar-achkan-showcase-02`, "mocha-brown-silk-embroidered-collar-achkan"),
    ...motion(cat, `${H}/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-showcase-01`, "ivory-embossed-open-front-jodhpuri-jacket"),
    ...motion(cat, `${H}/achkans/ochre-gold-brocade-achkan-detail-02`, "ochre-gold-brocade-achkan"),
  ];
  const heritageLinks = [
    { label: "Sherwanis", key: `${H}/sherwanis` },
    { label: "Achkans", key: `${H}/achkans` },
    { label: "Jodhpuri jackets", key: `${H}/jodhpuri-jackets` },
  ].flatMap(({ label, key }) => {
    const c = category(key);
    return c ? [{ label, href: categoryHref(c) }] : [];
  });

  return (
    <main>
      <Hero desktop={film("film/hero-desktop")} tablet={film("film/hero-tablet")} mobile={film("film/hero-mobile")} />

      {/* The space under the film: a promotional banner when one is live (Admin → Banners), otherwise left open. */}
      {show("statement") ? (
        <Statement promo={promos.length ? <PromoSlot banners={promos} /> : null} />
      ) : promos.length ? (
        <div className="px-gutter py-10 md:py-14">
          <PromoSlot banners={promos} />
        </div>
      ) : null}

      {show("collections") && groups.length ? <CollectionsAccordion groups={groups} /> : null}

      {show("explorer") && groups.length ? (
        /* Shop by category: hover a name to see the category, click to open it */
        <section className="py-20 md:py-32" aria-labelledby="explorer-title">
          <SectionHeading eyebrow="Shop by category" title={<span id="explorer-title">{`${categoryCount} ways into the wardrobe.`}</span>} className="mb-10 md:mb-14" />
          <CategoryExplorer groups={groups} />
        </section>
      ) : null}

      {show("launches") && cat.curated().length ? <Launches cat={cat} /> : null}

      {show("heritageFeature") && cards(cat, heritagePicks).length ? (
        <SplitFeature
          eyebrow="Heritage"
          title="The wedding wardrobe."
          href="/clothing/heritage"
          cta="Explore Heritage"
          image={shot(`${H}/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-01`)}
          imageAlt="A groom in an ivory brocade sherwani, safa and gold-bordered stole"
          products={cards(cat, heritagePicks).slice(0, 4)}
        />
      ) : null}

      {show("heritageFilm") ? (
        <div className="mt-1">
          <FilmBand
            film={film(`${H}/sherwanis/sartorial-heritage-zardosi-sherwanis-collection-showcase`)}
            label="Zardosi-embroidered sherwanis on the stand in the Sartorial atelier"
            eyebrow="The Heritage collection"
            title="Zardosi, worked by hand."
            links={heritageLinks}
          />
        </div>
      ) : null}

      {show("classicBanners") && classicBanners.length ? (
        /* Classic, as a carousel of banners */
        <section className="py-20 md:py-32" aria-labelledby="classic-title">
          <SectionHeading eyebrow="Classic" title={<span id="classic-title">Tailoring for every other day.</span>} link={{ label: "All Classic", href: "/clothing/classic" }} className="mb-10 md:mb-14" />
          <CategoryBanners label="Classic categories" banners={classicBanners} />
        </section>
      ) : null}

      {show("classicFeature") && cards(cat, classicPicks).length ? (
        <SplitFeature
          flip
          eyebrow="Classic"
          title="The suit, cut for one."
          href="/clothing/classic/suits"
          cta="Explore suits"
          image={shot(`${C}/suits/deep-navy-three-piece-peak-lapel-suit-02`)}
          imageAlt="A man seated in a deep navy three-piece suit with a rust printed tie"
          products={cards(cat, classicPicks).slice(0, 4)}
        />
      ) : null}

      {show("motion") && motionItems.length ? (
        <section className="py-20 md:py-32">
          <MotionRail items={motionItems} />
        </section>
      ) : null}

      {show("shopTheLook") && evening.length === 2 ? (
        <ShopTheLook
          eyebrow="The evening edit"
          title="Black tie, two ways."
          image={shot(`${C}/suits/velvet-and-navy-double-breasted-tuxedos-duo-01`)}
          imageAlt="Two men in evening dress: a tobacco brown velvet dinner jacket and a midnight navy double-breasted dinner suit"
          spots={[
            { x: 36, y: 50, product: evening[0], summary: "Velvet is the host's dinner jacket. In tobacco brown, over black dress trousers." },
            { x: 64, y: 56, product: evening[1], summary: "Midnight navy with black silk facings: darker than black under evening light." },
          ]}
        />
      ) : null}

      {show("craft") ? (
        <div className="mt-20 md:mt-32">
          <Craft film={film(`${C}/suits/bespoke-navy-suit-lapel-canvas-craftsmanship-02`)} still={shot(`${C}/suits/charcoal-double-breasted-bespoke-suit-01`)} />
        </div>
      ) : null}
    </main>
  );
}
