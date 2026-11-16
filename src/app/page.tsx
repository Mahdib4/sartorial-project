import { CategoryBanners } from "@/components/home/CategoryBanners";
import { CategoryExplorer } from "@/components/home/CategoryExplorer";
import { CollectionsAccordion } from "@/components/home/CollectionsAccordion";
import { Craft } from "@/components/home/Craft";
import { FilmBand } from "@/components/home/FilmBand";
import { Hero } from "@/components/home/Hero";
import { MotionRail, type MotionItem } from "@/components/home/MotionRail";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { SplitFeature } from "@/components/home/SplitFeature";
import { Statement } from "@/components/home/Statement";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { categoryHref, getCategory, getProduct, productHref, toCard } from "@/data/catalog";
import { navGroups } from "@/data/navigation";
import { film, shot } from "@/lib/media";

const card = (slug: string) => {
  const product = getProduct(slug);
  if (!product) throw new Error(`Home page references a missing product: ${slug}`);
  return toCard(product);
};

/** A showcase film on the "In motion" rail, linked to the piece it shows. */
const motion = (videoId: string, slug: string): MotionItem => {
  const product = getProduct(slug)!;
  const category = getCategory(product.category)!;
  return { key: videoId, film: film(videoId), name: product.name, category: category.name, href: productHref(product) };
};

export default function HomePage() {
  const groups = navGroups();
  const H = "heritage";
  const C = "classic";

  return (
    <main>
      <Hero desktop={film("film/hero-desktop")} tablet={film("film/hero-tablet")} mobile={film("film/hero-mobile")} />

      <Statement />

      <CollectionsAccordion groups={groups} />

      {/* Shop by category: hover a name to see the category, click to open it */}
      <section className="py-20 md:py-32" aria-labelledby="explorer-title">
        <SectionHeading eyebrow="Shop by category" title={<span id="explorer-title">Twenty-one ways into the wardrobe.</span>} className="mb-10 md:mb-14" />
        <CategoryExplorer groups={groups} />
      </section>

      <SplitFeature
        eyebrow="Heritage"
        title="The wedding wardrobe."
        href="/clothing/heritage"
        cta="Explore Heritage"
        image={shot(`${H}/stoles/ivory-gold-embroidered-border-heritage-stole-ensemble-01`)}
        imageAlt="A groom in an ivory brocade sherwani, safa and gold-bordered stole"
        products={[
          card("emerald-dupioni-silk-sherwani-with-zardosi"),
          card("black-velvet-embroidered-collar-achkan"),
          card("ivory-floral-jacquard-jodhpuri-jacket"),
          card("midnight-navy-bandhgala-suit"),
        ]}
      />

      <div className="mt-1">
        <FilmBand
          film={film(`${H}/sherwanis/sartorial-heritage-zardosi-sherwanis-collection-showcase`)}
          label="Zardosi-embroidered sherwanis on the stand in the Sartorial atelier"
          eyebrow="The Heritage collection"
          title="Zardosi, worked by hand."
          links={[
            { label: "Sherwanis", href: "/clothing/heritage/sherwanis" },
            { label: "Achkans", href: "/clothing/heritage/achkans" },
            { label: "Jodhpuri jackets", href: "/clothing/heritage/jodhpuri-jackets" },
          ]}
        />
      </div>

      {/* Classic, as a carousel of banners */}
      <section className="py-20 md:py-32" aria-labelledby="classic-title">
        <SectionHeading eyebrow="Classic" title={<span id="classic-title">Tailoring for every other day.</span>} link={{ label: "All Classic", href: "/clothing/classic" }} className="mb-10 md:mb-14" />
        <CategoryBanners
          label="Classic categories"
          banners={[
            { key: "suits", title: "Suits", line: "Two-piece and three-piece", href: categoryHref(getCategory(`${C}/suits`)!), image: shot(`${C}/suits/bespoke-tailored-suits-trio-01`), position: "50% 30%" },
            { key: "black-tie", title: "Black tie", line: "Dinner suits and velvet", href: "/clothing/classic/suits?occasion=Black+tie", image: shot(`${C}/suits/black-tie-evening-tuxedos-trio-01`), position: "50% 35%" },
            { key: "shirts", title: "Shirts", line: "Four collars", href: categoryHref(getCategory(`${C}/shirts`)!), image: shot(`${C}/shirts/bespoke-blue-chambray-and-poplin-shirts-stack-01`), position: "50% 60%" },
            { key: "trousers", title: "Trousers", line: "Side tabs and single pleats", href: categoryHref(getCategory(`${C}/trousers`)!), image: shot(`${C}/trousers/tailored-side-tab-trousers-stack-01`), position: "50% 40%" },
            { key: "jackets", title: "Jackets", line: "Blazers, tweeds and safari", href: categoryHref(getCategory(`${C}/sports-jackets`)!), image: shot(`${C}/suits/mid-grey-flannel-two-piece-suit-03`), position: "50% 40%" },
          ]}
        />
      </section>

      <SplitFeature
        flip
        eyebrow="Classic"
        title="The suit, cut for one."
        href="/clothing/classic/suits"
        cta="Explore suits"
        image={shot(`${C}/suits/deep-navy-three-piece-peak-lapel-suit-02`)}
        imageAlt="A man seated in a deep navy three-piece suit with a rust printed tie"
        products={[card("charcoal-three-piece-bespoke-suit"), card("mid-grey-flannel-two-piece-suit"), card("classic-navy-worsted-blazer"), card("the-classic-crisp-dress-shirt-white")]}
      />

      <section className="py-20 md:py-32">
        <MotionRail
          items={[
            motion(`${H}/achkans/black-velvet-embroidered-collar-achkan-showcase-01`, "black-velvet-embroidered-collar-achkan"),
            motion(`${H}/jodhpuri-jackets/ivory-floral-jacquard-jodhpuri-jacket-showcase-01`, "ivory-floral-jacquard-jodhpuri-jacket"),
            motion(`${H}/achkans/powder-blue-silk-embroidered-collar-achkan-showcase-01`, "powder-blue-silk-embroidered-collar-achkan"),
            motion(`${H}/stoles/ivory-gold-embroidered-border-heritage-stole-showcase-01`, "ivory-gold-embroidered-border-heritage-stole"),
            motion(`${H}/achkans/mocha-brown-silk-embroidered-collar-achkan-showcase-02`, "mocha-brown-silk-embroidered-collar-achkan"),
            motion(`${H}/jodhpuri-jackets/ivory-embossed-open-front-jodhpuri-jacket-showcase-01`, "ivory-embossed-open-front-jodhpuri-jacket"),
            motion(`${H}/achkans/ochre-gold-brocade-achkan-detail-02`, "ochre-gold-brocade-achkan"),
          ]}
        />
      </section>

      <ShopTheLook
        eyebrow="The evening edit"
        title="Black tie, two ways."
        image={shot(`${C}/suits/velvet-and-navy-double-breasted-tuxedos-duo-01`)}
        imageAlt="Two men in evening dress: a tobacco brown velvet dinner jacket and a midnight navy double-breasted dinner suit"
        spots={[
          { x: 36, y: 50, product: card("tobacco-brown-velvet-dinner-suit"), summary: "Velvet is the host's dinner jacket. In tobacco brown, over black dress trousers." },
          { x: 64, y: 56, product: card("midnight-navy-double-breasted-tuxedo"), summary: "Midnight navy with black silk facings: darker than black under evening light." },
        ]}
      />

      <div className="mt-20 md:mt-32">
        <Craft film={film(`${C}/suits/bespoke-navy-suit-lapel-canvas-craftsmanship-02`)} still={shot(`${C}/suits/charcoal-double-breasted-bespoke-suit-01`)} />
      </div>
    </main>
  );
}
