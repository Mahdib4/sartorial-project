import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

/** The opening of a plain (non-hero) page: breadcrumb, small label, large title and an optional line beneath. */
export function PageHeader({ crumbs, eyebrow, title, children }: { crumbs: Crumb[]; eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="px-gutter pt-8 pb-10 md:pt-10 md:pb-14">
      <Breadcrumbs items={crumbs} />
      {eyebrow ? <p className="label mt-10 text-ink-3 md:mt-14">{eyebrow}</p> : null}
      <h1 className="display-md mt-5">{title}</h1>
      {children ? <div className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-2">{children}</div> : null}
    </header>
  );
}
