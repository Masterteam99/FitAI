import type { Metadata, Viewport } from "next";
import { Geist, Bowlby_One_SC } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { copy } from "@/content/copy";
import { SITE_URL } from "@/lib/site-url";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const bowlby = Bowlby_One_SC({ variable: "--font-display", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: copy.layout.meta.titleDefault, template: copy.layout.meta.titleTemplate },
  description: copy.layout.meta.description,
  manifest: "/manifest.json",
  icons: { apple: "/apple-icon.png" },
  openGraph: {
    type: "website",
    siteName: "FitAI",
    locale: "it_IT",
    title: copy.layout.meta.titleDefault,
    description: copy.layout.meta.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} ${bowlby.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
