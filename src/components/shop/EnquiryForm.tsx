"use client";

import { useEffect, useMemo, useState } from "react";
import { FloatingLabelInput } from "@/components/interior/floating-label";
import { InlineValidation } from "@/components/interior/inline-validation";
import { SegmentedControl } from "@/components/interior/segmented-control";
import { ShowMore } from "@/components/interior/show-more";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { SITE } from "@/config/site";
import { cn } from "@/lib/cn";
import { composeEnquiry, emailLink, EMAIL_PATTERN, whatsappLink, type EnquiryLine } from "@/lib/enquiry";

type EnquiryFormProps = {
  kind: "order" | "appointment";
  lines: EnquiryLine[];
  /** Appointment only: preselects the interest toggle. */
  initialInterest?: string;
  initialNotes?: string;
  /** Called once the visitor has sent or copied the message. */
  onSent?: () => void;
  className?: string;
};

const INTERESTS = ["Heritage", "Classic", "Both"];

/**
 * The enquiry form behind both "send my selection" and "book a fitting".
 * There is no payment step and no server: the form composes one clear message
 * and hands it to the visitor's own WhatsApp or email, addressed to the house,
 * or lets them copy it. Which channels appear depends on src/config/site.ts.
 */
export function EnquiryForm({ kind, lines, initialInterest, initialNotes, onSent, className }: EnquiryFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(INTERESTS.includes(initialInterest ?? "") ? initialInterest! : "");
  const [occasion, setOccasion] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [attempted, setAttempted] = useState(false);
  const [origin, setOrigin] = useState(SITE.url);
  const [sent, setSent] = useState<null | "whatsapp" | "email" | "copy">(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the origin is only known in the browser
    setOrigin(window.location.origin);
  }, []);

  const nameMissing = name.trim().length < 2;
  const emailBad = email.trim() !== "" && !EMAIL_PATTERN.test(email.trim());
  const contactMissing = phone.trim().length < 6 && !EMAIL_PATTERN.test(email.trim());
  const valid = !nameMissing && !emailBad && !contactMissing;

  const message = useMemo(
    () => composeEnquiry({ kind, name, phone, email, interest: kind === "appointment" ? interest || undefined : undefined, occasion, preferredTime, notes, lines, origin }),
    [kind, name, phone, email, interest, occasion, preferredTime, notes, lines, origin],
  );

  const subject = kind === "order" ? `Order enquiry: ${name.trim() || "website"}` : `Fitting request: ${name.trim() || "website"}`;
  const wa = whatsappLink(message);
  const mail = emailLink(message, subject);
  const direct = Boolean(wa || mail);

  const guard = (event: React.MouseEvent, channel: "whatsapp" | "email") => {
    setAttempted(true);
    if (!valid) {
      event.preventDefault();
      return;
    }
    setSent(channel);
    onSent?.();
  };

  const copy = async () => {
    setAttempted(true);
    if (!valid) return;
    try {
      await navigator.clipboard.writeText(message);
      setSent("copy");
      onSent?.();
    } catch {
      setSent(null);
    }
  };

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className={className}>
      <div className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
        <FloatingLabelInput className="sm:col-span-2" label="Full name" name="name" autoComplete="name" required value={name} onChange={(v) => setName(v)} invalid={attempted && nameMissing} hint={attempted && nameMissing ? "Please tell us your name." : undefined} />
        <FloatingLabelInput label="Phone or WhatsApp" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(v) => setPhone(v)} invalid={attempted && contactMissing} hint={attempted && contactMissing ? "A phone number or an email, please." : undefined} />
        <InlineValidation label="Email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={setEmail} validate={(v) => (v.trim() === "" || EMAIL_PATTERN.test(v.trim()) ? null : "That email address looks incomplete.")} />

        {kind === "appointment" ? (
          <>
            <div className="mb-4 sm:col-span-2">
              <p className="label mb-3 text-ink-3">I am interested in</p>
              <SegmentedControl label="Collection of interest" value={interest} onValueChange={setInterest} options={INTERESTS.map((value) => ({ value, label: value }))} />
            </div>
            <FloatingLabelInput label="Occasion and date, if any" name="occasion" value={occasion} onChange={(v) => setOccasion(v)} />
            <FloatingLabelInput label="Preferred day and time" name="preferred-time" value={preferredTime} onChange={(v) => setPreferredTime(v)} />
          </>
        ) : null}

        <label className="sm:col-span-2">
          <span className="label mb-3 block text-ink-3">{kind === "order" ? "Anything we should know" : "Tell us what you have in mind"}</span>
          <textarea
            name="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full resize-y border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink outline-none! transition-colors duration-200 placeholder:text-mute focus:border-ink"
            placeholder={kind === "order" ? "Occasion, dates, cloth preferences, alterations…" : "The occasion, the pieces you are considering, your timeline…"}
          />
        </label>
      </div>

      <div className="mt-6">
        <ShowMore lines={3} moreLabel="Show the full message" lessLabel="Show less" label="Preview of your message" className="border border-line-soft bg-paper p-4" fadeColor="var(--color-paper)">
          <p className="label-sm mb-2 text-mute">Your message</p>
          <pre className="font-sans text-[13px] leading-relaxed whitespace-pre-wrap text-ink-2">{message}</pre>
        </ShowMore>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {wa ? (
          <ButtonAnchor href={wa} target="_blank" rel="noreferrer" onClick={(e) => guard(e, "whatsapp")} className="flex-1">
            Send on WhatsApp
          </ButtonAnchor>
        ) : null}
        {mail ? (
          <ButtonAnchor href={mail} onClick={(e) => guard(e, "email")} variant={wa ? "outline" : "solid"} className="flex-1">
            Send by email
          </ButtonAnchor>
        ) : null}
        <Button onClick={copy} variant={direct ? "outline" : "solid"} arrow={false} className={cn("flex-1", !direct && "sm:flex-none sm:px-10")}>
          {sent === "copy" ? "Copied" : "Copy message"}
        </Button>
      </div>

      <p role="status" className="mt-4 min-h-6 text-[13px] leading-relaxed text-ink-3">
        {attempted && !valid
          ? "Please complete the highlighted fields."
          : sent === "whatsapp"
            ? "WhatsApp has opened with your message. Press send there to reach us."
            : sent === "email"
              ? "Your email app has opened with your message. Press send there to reach us."
              : sent === "copy"
                ? "Your message is on the clipboard, ready to paste into a message or email to us."
                : direct
                  ? "Nothing is sent until you press send in WhatsApp or your email app."
                  : "Copy your message and send it to us by message or email."}
      </p>

      {!direct ? (
        <p className="mt-2 border-l-2 border-accent bg-accent-soft px-4 py-3 text-[12.5px] leading-relaxed text-ink-2">
          Site setup: add the house WhatsApp number and email address in <code className="font-sans font-medium">src/config/site.ts</code> to show “Send on WhatsApp” and “Send by email” here.
        </p>
      ) : null}
    </form>
  );
}
