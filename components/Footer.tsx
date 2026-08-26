import Link from "next/link";
import { site } from "@/content/site";
import { getLandingPages, getServices } from "@/lib/content";

export function Footer() {
  const landingPages = getLandingPages();
  const services = getServices();

  return (
    <footer className="bg-pine-dark text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-lg font-semibold text-white">{site.name}</p>
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
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Areas we serve
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {landingPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="hover:text-white">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
