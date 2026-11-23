"use client";

import { useEffect, useMemo, useState } from "react";
import { FloatingLabelInput } from "@/components/interior/floating-label";
import { InlineValidation } from "@/components/interior/inline-validation";
import { SegmentedControl } from "@/components/interior/segmented-control";
import { ShowMore } from "@/components/interior/show-more";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { SITE } from "@/config/site";
import { composeEnquiry, emailLink, EMAIL_PATTERN, newEnquiryId, newEnquiryKey, recordEnquiry, whatsappLink, type EnquiryLine } from "@/lib/enquiry";
import { useShop } from "@/store/shop";

type EnquiryFormProps = {
  kind: "order" | "appointment";
  lines: EnquiryLine[];
  /** Appointment only: preselects the interest toggle. */
  initialInterest?: string;
  initialNotes?: string;
  /** Called once the visitor has sent the message. */
  onSent?: () => void;
  className?: string;
};

const INTERESTS = ["Heritage", "Classic", "Both"];

/**
 * The enquiry form behind both "send my selection" and "book a fitting".
 * There is no payment step: the form composes one clear message, with a
 * reference for the enquiry and a reference and link for every piece, and
 * "Send message" opens the visitor's WhatsApp with it, addressed to the house
 * number in src/config/site.ts. The same press logs the enquiry in the
 * database (/api/enquiries) without waiting on it.
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
  // The address, the enquiry's reference and its private key (which lets this form,
  // and only this form, update its own record) are only known in the browser.
  const [session, setSession] = useState({ origin: SITE.url, id: "", key: "" });
  const { origin, id, key } = session;
  const [sent, setSent] = useState<null | "whatsapp" | "email" | "copy">(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setSession({ origin: window.location.origin, id: newEnquiryId(), key: newEnquiryKey() });
  }, []);

  const nameMissing = name.trim().length < 2;
  const emailBad = email.trim() !== "" && !EMAIL_PATTERN.test(email.trim());
  const contactMissing = phone.trim().length < 6 && !EMAIL_PATTERN.test(email.trim());
  const valid = !nameMissing && !emailBad && !contactMissing;

  const message = useMemo(
    () => composeEnquiry({ kind, id, name, phone, email, interest: kind === "appointment" ? interest || undefined : undefined, occasion, preferredTime, notes, lines, origin }),
    [kind, id, name, phone, email, interest, occasion, preferredTime, notes, lines, origin],
  );

  const subject = kind === "order" ? `Order enquiry: ${name.trim() || "website"}` : `Fitting request: ${name.trim() || "website"}`;
  const { contact } = useShop();
  const wa = whatsappLink(message, contact);
  const mail = emailLink(message, subject, contact);
  const direct = Boolean(wa || mail);

  const guard = (event: React.MouseEvent, channel: "whatsapp" | "email") => {
    setAttempted(true);
    if (!valid || !id) {
      event.preventDefault();
      // On a phone the fields may be off-screen: take the visitor to the first one to fix.
      const first = nameMissing ? "name" : contactMissing ? "tel" : emailBad ? "email" : null;
      const field = first ? (event.currentTarget.closest("form")?.elements.namedItem(first) as HTMLElement | null) : null;
      if (field) {
        field.focus({ preventScroll: true });
        field.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      return;
    }
    // The link opens WhatsApp (or the mail app) with the message; the record is logged alongside it.
    recordEnquiry({
      id,
      key,
      kind,
      channel,
      name,
      phone,
      email,
      interest: kind === "appointment" ? interest || undefined : undefined,
      occasion,
      preferredTime,
      notes,
      lines: lines.map(({ slug, size, qty }) => ({ slug, size, qty })),
      message,
      pageUrl: window.location.href,
    });
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
              <SegmentedControl label="Collection of interest" className="max-sm:block max-sm:w-full" classNames={{ segment: "max-sm:h-11" }} value={interest} onValueChange={setInterest} options={INTERESTS.map((value) => ({ value, label: value }))} />
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
            maxLength={2000}
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
          // No address until the page is ready, so a tap can never skip the reference, the checks or the log.
          <ButtonAnchor href={id ? wa : undefined} aria-disabled={!id || undefined} target="_blank" rel="noopener noreferrer" onClick={(e) => guard(e, "whatsapp")} className={mail ? "sm:flex-1" : "sm:flex-none sm:px-12"}>
            Send message
          </ButtonAnchor>
        ) : null}
        {mail ? (
          <ButtonAnchor href={id ? mail : undefined} aria-disabled={!id || undefined} onClick={(e) => guard(e, "email")} variant={wa ? "outline" : "solid"} className="sm:flex-1">
            Send by email
          </ButtonAnchor>
        ) : null}
        {!direct ? (
          // Only when no WhatsApp number or email is configured at all.
          <Button onClick={copy} arrow={false} className="sm:flex-none sm:px-10">
            {sent === "copy" ? "Copied" : "Copy message"}
          </Button>
        ) : null}
      </div>

      <p role="status" className="mt-4 min-h-6 text-[13px] leading-relaxed text-ink-3">
        {attempted && !valid
          ? "Please complete the highlighted fields."
          : sent === "whatsapp"
            ? `WhatsApp has opened with your message${id ? ` (reference ${id})` : ""}. Press send there to reach us.`
            : sent === "email"
              ? "Your email app has opened with your message. Press send there to reach us."
              : sent === "copy"
                ? "Your message is on the clipboard, ready to paste into a message or email to us."
                : wa
                  ? "Send message opens WhatsApp with your message to the Sartorial team. Press send there to reach us."
                  : direct
                    ? "Nothing is sent until you press send in your email app."
                    : "Copy your message and send it to us by message or email."}
      </p>

      {!direct ? (
        <p className="mt-2 border-l-2 border-accent bg-accent-soft px-4 py-3 text-[12.5px] leading-relaxed text-ink-2">
          Site setup: add the house WhatsApp number and email address in <code className="font-sans font-medium">src/config/site.ts</code> to show “Send message” (WhatsApp) and “Send by email” here.
        </p>
      ) : null}
    </form>
  );
}
