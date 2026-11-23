import { notFound } from "next/navigation";
import { deleteBanner } from "@/app/admin/actions/banners";
import { ConfirmButton } from "@/components/admin/ActionForm";
import { BannerForm } from "@/components/admin/BannerForm";
import { PageHead } from "@/components/admin/ui";
import { getBanner, mediaLibrary, thumbsFor } from "@/lib/admin/data";
import { pickerOptions } from "@/lib/admin/options";

export default async function EditBannerPage({ params }: PageProps<"/admin/banners/[id]">) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isSafeInteger(n) || n <= 0) notFound();
  const banner = await getBanner(n);
  if (!banner) notFound();
  const [{ links }, library, image] = await Promise.all([pickerOptions(), mediaLibrary(), thumbsFor(banner.image ? [banner.image] : [])]);
  const what = banner.placement === "home" ? "banner" : "notice";
  return (
    <>
      <PageHead
        title={banner.placement === "home" ? "Home page banner" : "Announcement bar notice"}
        intro={`“${banner.title}”`}
        action={
          <form action={deleteBanner}>
            <input type="hidden" name="id" value={banner.id} />
            <ConfirmButton message={`Delete this ${what}, “${banner.title}”? This cannot be undone. (To take it down for now, switch it off instead.)`}>Delete</ConfirmButton>
          </form>
        }
      />
      <BannerForm banner={banner} links={links} image={image} library={library} />
    </>
  );
}
