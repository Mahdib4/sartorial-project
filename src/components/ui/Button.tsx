import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "light" | "outline" | "outline-light";
type Size = "md" | "sm";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-ink text-white hover:bg-ink-2",
  light: "bg-white text-ink hover:bg-paper",
  outline: "border border-ink text-ink hover:bg-ink hover:text-white",
  "outline-light": "border border-white/80 text-white hover:bg-white hover:text-ink",
};

const SIZES: Record<Size, string> = {
  md: "h-12 min-w-44 px-6 text-[13px]",
  sm: "h-10 min-w-32 px-5 text-[12px]",
};

const BASE =
  "group/btn relative inline-flex items-center justify-center gap-3 whitespace-nowrap tracking-[0.04em] transition-colors duration-300 select-none disabled:opacity-40";

function Inner({ children, arrow }: { children: ReactNode; arrow: boolean }) {
  return (
    <>
      <span aria-hidden className="h-3 w-px bg-current opacity-60" />
      <span>{children}</span>
      {arrow ? (
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="h-3 w-3 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M5.5 2.5 11 8l-5.5 5.5" />
        </svg>
      ) : null}
    </>
  );
}

type Shared = { variant?: Variant; size?: Size; arrow?: boolean; className?: string; children: ReactNode };

/** The house button as a link: a hairline bar, the label, and a chevron that leans forward on hover. */
export function ButtonLink({
  variant = "solid",
  size = "md",
  arrow = true,
  className,
  children,
  ...props
}: Shared & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}

export function Button({
  variant = "solid",
  size = "md",
  arrow = true,
  className,
  children,
  type = "button",
  ...props
}: Shared & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}

/** A plain external anchor styled as the house button (WhatsApp, mailto). */
export function ButtonAnchor({
  variant = "solid",
  size = "md",
  arrow = true,
  className,
  children,
  ...props
}: Shared & Omit<ComponentProps<"a">, "className" | "children">) {
  return (
    <a className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </a>
  );
}
