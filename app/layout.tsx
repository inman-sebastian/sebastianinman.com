import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

// Outfit is a variable font: one file covers every weight the site uses
const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Film-grain texture over the whole site; purely decorative,
            never intercepts clicks (see .site-grain in globals.css) */}
        <div aria-hidden="true" className="site-grain" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SiteAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
