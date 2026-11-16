"use client";

import Link from "next/link";
import { BagLines } from "@/components/shop/BagLines";
import { EnquiryForm } from "@/components/shop/EnquiryForm";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice, pluralise } from "@/lib/format";
import { useShop } from "@/store/shop";

/** The bag as a page: the lines on one side, the enquiry on the other. */
export function BagView() {
  const { bag, count, subtotal, ready, clear } = useShop();

  if (!ready) {
    return <div className="min-h-[50vh]" aria-busy="true" />;
  }

  if (bag.length === 0) {
    return (
      <div className="px-gutter pb-24">
        <p className="max-w-md text-[16px] leading-relaxed text-ink-2">Your bag is empty. Add the pieces you are considering and send them to us as one enquiry.</p>
        <div className="mt-8 flex flex-col gap-3 xs:flex-row">
          <ButtonLink href="/clothing/heritage">Explore Heritage</ButtonLink>
          <ButtonLink href="/clothing/classic" variant="outline">
            Explore Classic
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-x-16 gap-y-14 px-gutter pb-24 lg:grid-cols-12">
      <section className="lg:col-span-7" aria-label="Pieces in your bag">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="label text-ink-3">{pluralise(count, "piece")}</h2>
          <button type="button" onClick={clear} className="link-under text-[12.5px] text-ink-3 hover:text-ink">
            Empty the bag
          </button>
        </div>
        <BagLines roomy />
        <dl className="mt-6 flex items-baseline justify-between text-[15px]">
          <dt className="label text-ink-3">{subtotal === null ? "Total" : "Subtotal"}</dt>
          <dd>{subtotal === null ? "Price on request" : formatPrice(subtotal)}</dd>
        </dl>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-3">
          Pieces are made to order, so nothing is charged here. Send us your selection and we will reply to confirm cloth, price and a time for your fitting. Prefer to begin in person?{" "}
          <Link href="/appointments" className="link-under text-ink">
            Book a fitting
          </Link>
          .
        </p>
      </section>

      <section className="lg:col-span-5" aria-labelledby="enquiry-title">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+1.5rem)]">
          <h2 id="enquiry-title" className="headline-sm">
            Send your selection
          </h2>
          <p className="mt-3 mb-7 max-w-md text-[14px] leading-relaxed text-ink-3">Leave your details and we will be in touch about the pieces in your bag.</p>
          <EnquiryForm kind="order" lines={bag.map((line) => ({ name: line.product.name, size: line.size, qty: line.qty, href: line.product.href }))} />
        </div>
      </section>
    </div>
  );
}
