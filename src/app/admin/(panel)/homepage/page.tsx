import { HomepageForm } from "@/components/admin/HomepageForm";
import { Notice, PageHead } from "@/components/admin/ui";
import { HOME_SECTIONS } from "@/data/seed";
import { getSettings } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";

export default async function HomepageAdminPage({ searchParams }: PageProps<"/admin/homepage">) {
  const sp = await searchParams;
  const [settings, options] = await Promise.all([getSettings(), pickerOptions()]);
  return (
    <>
      <PageHead
        title="Home page"
        intro="Choose which sections the home page shows, and the pieces in its two features."
        action={
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center border border-line bg-white px-4 text-[13.5px] hover:border-ink">
            View the home page ↗
          </a>
        }
      />
      {sp.saved ? <div className="mb-5"><Notice tone="success">Saved. The home page shows the change straight away.</Notice></div> : null}
      <HomepageForm home={settings.home} sections={HOME_SECTIONS} products={options.products} />
    </>
  );
}
