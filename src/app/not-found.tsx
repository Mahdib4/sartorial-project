import { SiteChrome } from "@/components/layout/SiteChrome";
import { NotFoundView } from "@/components/pages/NotFoundView";

/** An address that matches no page at all: the storefront's 404, with its header and footer. */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundView />
    </SiteChrome>
  );
}
