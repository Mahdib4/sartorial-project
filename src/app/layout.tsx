import type { Metadata, Viewport } from "next";
import "@fontsource-variable/jost";
import "./globals.css";
import "@/components/interior/interior-a.css";
import "@/components/interior/interior-b.css";
import { SITE } from "@/config/site";
import { INTRO_SCRIPT } from "@/lib/intro-script";
import { mediaUrl } from "@/lib/media";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Bespoke tailoring, ${SITE.city}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Bespoke tailoring, ${SITE.city}`,
    description: SITE.description,
    images: [{ url: mediaUrl("img/classic/suits/bespoke-tailored-suits-trio-01-1280.webp"), width: 1280, height: 891 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1c1b17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The opening animation's script marks <html> before the first paint (see lib/intro-script.ts).
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
