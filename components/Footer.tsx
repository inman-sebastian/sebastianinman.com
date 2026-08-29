import Link from "next/link";
import { site } from "@/content/site";
import { getLandingPages, getServices } from "@/lib/content";

export function Footer() {
  const services = getServices();
  // City-level location pages only; campaign pages stay out of navigation
  const areas = getLandingPages().filter((p) => p.kind === "location");

  return (
    // Background matches the treetop silhouettes in the CTA band image
    // above it, so the treeline reads as the footer's forest rising up.
    // If cta-treetops.jpg is ever regenerated, re-sample the silhouette
    // color and update this hex.
    <footer className="relative bg-[#132c1f] text-white/80">
      {/* Sawtooth top edge: footer-green teeth biting up into the page.
          Crisp against the contact page's cream; near-invisible against
          the CTA band's dark treetops, preserving that treeline blend.
          Sits 1px into the footer so rounding can't leave a hairline. */}
      <svg
        aria-hidden="true"
        className="absolute inset-x-0 top-px h-2.5 w-full -translate-y-full text-[#132c1f]"
      >
        <defs>
          <pattern
            id="footer-zigzag"
            width="20"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 10 L10 0 L20 10 Z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-zigzag)" />
      </svg>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="inline-flex items-center gap-2.5 font-serif text-lg font-semibold text-white">
            {/* Same terracotta sun dot as the header wordmark */}
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-terracotta" />
            {site.name}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">
            {site.serviceAreaLine}
          </p>
          <div className="mt-4 flex flex-col gap-1 text-sm">
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
            <a href={site.phoneHref} className="hover:text-white">
              {site.phone}
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Services
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Areas
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {areas.map((a) => (
              <li key={a.slug}>
                <Link href={`/${a.slug}`} className="hover:text-white">
                  {a.city}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            More
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {/* Legal lives here rather than in the header: people look for it
          at the bottom, and it earns no room in the main nav. */}
      <div className="flex flex-col items-center gap-2 border-t border-white/10 py-4 text-xs text-white/50 sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
        </p>
      </div>
    </footer>
  );
}
