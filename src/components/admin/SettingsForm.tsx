"use client";

import { useState } from "react";
import { changePassword, saveContact, saveSocial } from "@/app/admin/actions/settings";
import type { ContactSettings, SocialSettings } from "@/data/types";
import { ActionForm } from "./ActionForm";
import { Card, Field, Input, Textarea } from "./ui";

/** "8801772121294" → "+880 1772 121294"; other countries as "+<digits>". */
function formatWhatsapp(digits: string): string {
  if (!digits) return "";
  const m = /^880(\d{4})(\d{6})$/.exec(digits);
  return m ? `+880 ${m[1]} ${m[2]}` : `+${digits}`;
}

/** Where orders go, and the contact details on the website. Fields keep what was typed if saving fails. */
export function ContactSettingsForm({ contact }: { contact: ContactSettings }) {
  const [v, setV] = useState({
    whatsapp: formatWhatsapp(contact.whatsapp),
    phone: contact.phone,
    email: contact.email,
    address: contact.address.join("\n"),
    hours: contact.hours,
  });
  const bind = (key: keyof typeof v) => ({ name: key, id: key, value: v[key], onChange: (e: { target: { value: string } }) => setV((s) => ({ ...s, [key]: e.target.value })) });

  return (
    <ActionForm action={saveContact} submitLabel="Save contact details">
      <Card title="Contact & orders" intro="Where orders go, and the details shown in the footer and on the Client services and Appointments pages. Leave a detail empty to hide it.">
        <Field label="WhatsApp number for orders" htmlFor="whatsapp" hint="Customers' Send message opens WhatsApp to this number. International format, e.g. +880 1772 121294">
          <Input {...bind("whatsapp")} type="tel" inputMode="tel" autoComplete="off" required placeholder="+880 1772 121294" className="max-w-sm" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone (optional)" htmlFor="phone" hint="For customers who prefer to call.">
            <Input {...bind("phone")} type="tel" inputMode="tel" maxLength={40} placeholder="+880 1XXX XXXXXX" />
          </Field>
          <Field label="Email (optional)" htmlFor="email" hint="Also lets customers send their order by email.">
            <Input {...bind("email")} type="email" maxLength={160} placeholder="hello@example.com" />
          </Field>
        </div>
        <Field label="Address (optional)" htmlFor="address" hint="One line per line, as it should appear, e.g. the house and road on the first line, the area and city on the next.">
          <Textarea {...bind("address")} rows={3} className="min-h-[90px]" />
        </Field>
        <Field label="Opening hours (optional)" htmlFor="hours" hint="One line, e.g. “Saturday to Thursday, 11am – 8pm”.">
          <Input {...bind("hours")} maxLength={200} />
        </Field>
      </Card>
    </ActionForm>
  );
}

const SOCIAL: Array<{ key: keyof SocialSettings; label: string; placeholder: string }> = [
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/…" },
  { key: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@…" },
];

/** Links to the house's social pages, shown as icons in the footer. */
export function SocialSettingsForm({ social }: { social: SocialSettings }) {
  const [v, setV] = useState<SocialSettings>({ ...social });
  return (
    <ActionForm action={saveSocial} submitLabel="Save social links">
      <Card title="Social links" intro="Shown as icons at the foot of every page. Paste the full address of each page, starting with https://. Leave one empty to hide its icon.">
        {SOCIAL.map((s) => (
          <Field key={s.key} label={`${s.label} (optional)`} htmlFor={s.key}>
            <Input id={s.key} name={s.key} type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={v[s.key]} onChange={(e) => setV((x) => ({ ...x, [s.key]: e.target.value }))} placeholder={s.placeholder} maxLength={300} />
          </Field>
        ))}
      </Card>
    </ActionForm>
  );
}

/** Change the admin password. */
export function PasswordForm() {
  return (
    <ActionForm action={changePassword} submitLabel="Change password">
      <Card title="Admin password" intro="The password for signing in to this admin. After changing it you stay signed in here; any other phone or computer that was signed in will need the new password.">
        <Field label="Current password" htmlFor="current">
          <Input id="current" name="current" type="password" autoComplete="current-password" required className="max-w-sm" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="New password" htmlFor="password" hint="At least 10 characters. A short sentence is easy to remember and hard to guess.">
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
          </Field>
          <Field label="New password again" htmlFor="confirm" hint="To make sure it was typed correctly.">
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={10} />
          </Field>
        </div>
      </Card>
    </ActionForm>
  );
}
