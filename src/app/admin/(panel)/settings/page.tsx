import { ContactSettingsForm, PasswordForm, SocialSettingsForm } from "@/components/admin/SettingsForm";
import { Notice, PageHead } from "@/components/admin/ui";
import { getSettings } from "@/lib/admin/data";

/** "8801772121294" → "+880 1772 121294"; other countries as "+<digits>". */
function formatWhatsapp(digits: string): string {
  const m = /^880(\d{4})(\d{6})$/.exec(digits);
  return m ? `+880 ${m[1]} ${m[2]}` : `+${digits}`;
}

const SAVED: Record<string, string> = {
  contact: "Contact details saved. The website shows them straight away.",
  social: "Social links saved. The website shows them straight away.",
  password: "Password changed. You are still signed in here; any other phone or computer that was signed in will need the new password.",
};

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const sp = await searchParams;
  const { contact, social } = await getSettings();
  const saved = typeof sp.saved === "string" ? SAVED[sp.saved] : undefined;

  return (
    <>
      <PageHead title="Settings" intro="Where orders go, the house's contact details and social links, and the admin password." />
      {saved ? <div className="mb-5"><Notice tone="success">{saved}</Notice></div> : null}

      <section aria-label="Where orders go" className="mb-8 flex flex-col gap-4 border border-ink bg-white p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div>
          <p className="text-[12px] tracking-[0.06em] text-ink-3 uppercase">Orders and enquiries go to WhatsApp</p>
          {contact.whatsapp ? (
            <p className="mt-1 text-[26px] leading-tight font-light tracking-[-0.01em] md:text-[30px]">{formatWhatsapp(contact.whatsapp)}</p>
          ) : (
            <p className="mt-1 text-[15px] text-accent">No number yet. Add one below so customers can send their orders.</p>
          )}
          <p className="mt-1.5 text-[13px] text-ink-3">When a customer taps Send message, WhatsApp opens with their order addressed to this number.</p>
        </div>
        {contact.whatsapp ? (
          <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex h-10 shrink-0 items-center justify-center border border-line px-4 text-[13.5px] hover:border-ink">
            Open in WhatsApp ↗
          </a>
        ) : null}
      </section>

      <div className="space-y-10">
        <div id="contact">
          <ContactSettingsForm contact={contact} />
        </div>
        <div id="social">
          <SocialSettingsForm social={social} />
        </div>
        <div id="password">
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
