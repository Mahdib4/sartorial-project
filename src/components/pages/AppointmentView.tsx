"use client";

import { useEffect, useState } from "react";
import { EnquiryForm } from "@/components/shop/EnquiryForm";
import { Picture } from "@/components/ui/Picture";
import { useShop } from "@/store/shop";

type Prefill = { piece?: string; interest?: string };

/** The fitting request form. `?piece=<slug>` or `?interest=<name>` in the address pre-fills what the visitor was looking at. */
export function AppointmentView() {
  const { lookup } = useShop();
  const [prefill, setPrefill] = useState<Prefill | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the address bar is only readable after mount
    setPrefill({ piece: params.get("piece") ?? undefined, interest: params.get("interest") ?? undefined });
  }, []);

  const product = prefill?.piece ? lookup(prefill.piece) : undefined;

  return (
    <div>
      {product ? (
        <div className="mb-7 flex items-center gap-4 border border-line p-3">
          <div className="w-14 shrink-0">
            <Picture shot={product.image} alt="" sizes="56px" ratio="4 / 5" fit="product" />
          </div>
          <div className="min-w-0">
            <p className="label-sm text-mute">You are asking about</p>
            <p className="mt-1 truncate text-[14px]">{product.name}</p>
          </div>
        </div>
      ) : null}
      <EnquiryForm
        key={prefill ? `${prefill.piece ?? ""}|${prefill.interest ?? ""}` : "pending"}
        kind="appointment"
        initialInterest={product ? product.collectionName : undefined}
        initialNotes={prefill?.interest && !product ? `I would like to ask about ${prefill.interest}.` : ""}
        lines={product ? [{ slug: product.slug, name: product.name, reference: product.reference, category: product.categoryName, size: "To be confirmed", qty: 1, href: product.href }] : []}
      />
    </div>
  );
}
