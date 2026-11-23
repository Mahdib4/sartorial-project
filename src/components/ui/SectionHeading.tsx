import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  /** Optional link shown opposite the title. */
  link?: { label: string; href: string };
  as?: "h2" | "h1";
  className?: string;
};

/** The standard section opener: a small tracked label, a light headline, and an optional link on the far side. */
export function SectionHeading({ eyebrow, title, link, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-5 px-gutter md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {eyebrow ? <p className="label mb-4 text-ink-3">{eyebrow}</p> : null}
        <Tag className="headline max-w-[18ch]">{title}</Tag>
      </div>
      {link ? (
        <Link href={link.href} className="-my-3 self-start py-3 text-[14px] md:my-0 md:self-auto md:py-0">
          <span className="link-under inline-block">{link.label}</span>
        </Link>
      ) : null}
    </div>
  );
}
