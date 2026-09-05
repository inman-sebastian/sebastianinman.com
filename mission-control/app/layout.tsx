import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { NotificationSetup } from "@/components/NotificationSetup";

const outfit = Outfit({ variable: "--font-body", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Local control center for Sebastian Inman's business.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Mission Control" },
};

export const viewport: Viewport = { themeColor: "#234f3e" };

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/research", label: "Research" },
  { href: "/inbox", label: "Inbox" },
  { href: "/documents", label: "Documents" },
  { href: "/blog", label: "Blog" },
  { href: "/clients/new", label: "New client" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-terracotta" />
              <span className="font-serif text-lg font-semibold text-pine-dark">
                Mission Control
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-semibold text-muted">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-pine-dark"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <NotificationSetup />
              <p className="rounded-full bg-terracotta-tint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-terracotta-dark">
                Local only · never deployed
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {children}
        </main>
        <footer className="border-t border-line px-6 py-5 text-center text-xs text-muted">
          Client records live in this folder&apos;s git-ignored{" "}
          <code>data/</code>. Nothing here ships to the website.
        </footer>
      </body>
    </html>
  );
}
