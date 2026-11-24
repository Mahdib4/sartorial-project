import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The admin panel's building blocks: deliberately plain. Labels say what a
 * field does in everyday words; hints say what visitors will see.
 */

/** 16px text on phones, so iPhones do not zoom in when a field is tapped; a little smaller from tablets up. */
export const inputClass =
  "block w-full min-w-0 border border-line bg-white px-3 py-2.5 text-[16px] text-ink outline-none transition-colors placeholder:text-mute focus:border-ink disabled:bg-paper disabled:text-ink-3 sm:text-[14.5px]";

export function PageHead({ title, intro, action }: { title: string; intro?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8">
      <div>
        <h1 className="text-[26px] leading-tight font-light tracking-[-0.02em] md:text-[30px]">{title}</h1>
        {intro ? <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-3">{intro}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function Card({ title, intro, children, className }: { title?: string; intro?: ReactNode; children: ReactNode; className?: string }) {
  return (
    // min-w-0: inside a form's grid, a long name in the card must not push the page wider than the screen.
    <section className={cn("min-w-0 border border-line bg-white p-5 md:p-6", className)}>
      {title ? <h2 className="text-[16px] font-medium tracking-[-0.01em]">{title}</h2> : null}
      {intro ? <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{intro}</p> : null}
      <div className={cn(title || intro ? "mt-5" : "", "space-y-5")}>{children}</div>
    </section>
  );
}

export function Field({ label, hint, htmlFor, children, className }: { label: string; hint?: ReactNode; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "min-h-[110px] resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(inputClass, "appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%231c1b17' stroke-width='1.3'/%3E%3C/svg%3E\")" }} {...props}>
      {children}
    </select>
  );
}

/** A labelled on/off switch built on a checkbox, so it posts with the form. */
export function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border border-line bg-white px-4 py-3">
      <span>
        <span className="block text-[14px] text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-3">{hint}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink/40" />
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

const buttonBase = "inline-flex h-10 items-center justify-center gap-2 px-4 text-[13.5px] tracking-[0.01em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const buttonStyles = {
  primary: cn(buttonBase, "bg-ink text-white hover:bg-ink-2"),
  secondary: cn(buttonBase, "border border-line bg-white text-ink hover:border-ink"),
  danger: cn(buttonBase, "border border-accent/40 bg-white text-accent hover:bg-accent hover:text-white"),
  ghost: cn(buttonBase, "px-2 text-ink-2 hover:text-ink"),
};

export function ButtonLink({ href, variant = "primary", children, className }: { href: string; variant?: keyof typeof buttonStyles; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn(buttonStyles[variant], className)}>
      {children}
    </Link>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "warning"; children: ReactNode }) {
  return (
    <div
      role={tone === "warning" ? "alert" : "status"}
      className={cn(
        "border-l-2 px-4 py-3 text-[13.5px] leading-relaxed",
        tone === "success" && "border-ok bg-[#eef5ef] text-ink",
        tone === "info" && "border-ink bg-white text-ink-2",
        tone === "warning" && "border-accent bg-accent-soft text-ink",
      )}
    >
      {children}
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "live" | "off" | "accent"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center px-2 text-[11px] tracking-[0.04em] whitespace-nowrap",
        tone === "neutral" && "bg-paper text-ink-2",
        tone === "live" && "bg-[#e5f1e7] text-[#245a30]",
        tone === "off" && "bg-line-soft text-ink-3",
        tone === "accent" && "bg-accent-soft text-accent",
      )}
    >
      {children}
    </span>
  );
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="text-[14.5px] text-ink-2">{children}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** "12 Nov 2026, 14:05" in Dhaka time. */
export function when(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(new Date(iso));
}

/** An ISO timestamp as a <input type="datetime-local"> value in Dhaka time. */
export function localInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 6 * 3_600_000);
  return d.toISOString().slice(0, 16);
}
