import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="pt-header">
      <div className="px-gutter py-24 md:py-36">
        <p className="label text-ink-3">Page not found</p>
        <h1 className="display-md mt-5 max-w-[14ch]">This page has been unpicked.</h1>
        <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-2">The address may have changed, or the piece may no longer be listed. The collections are a good place to start again.</p>
        <div className="mt-9 flex flex-col gap-3 xs:flex-row">
          <ButtonLink href="/clothing/heritage">Heritage</ButtonLink>
          <ButtonLink href="/clothing/classic" variant="outline">
            Classic
          </ButtonLink>
          <ButtonLink href="/" variant="outline">
            Home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
