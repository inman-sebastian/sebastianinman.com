import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { getServices } from "@/lib/content";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";

export const metadata: Metadata = {
  title: "Services: Automation, AI & Websites for Small Businesses",
  description:
    "Website design, workflow automation, tool integration, AI assistants, and AI-powered insights for small businesses. Jargon-free help with clear starting prices.",
};

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      <HeroSplash
        compact
        eyebrow="Services"
        heading="What I can take off your plate"
        text="Every project starts with a free consult and a clear plan. Prices below are honest starting points. Most projects are quoted flat, so you know the cost before we begin."
      >
        <ConsultButton />
        <ButtonLink href="/contact" variant="light">
          Send a message
        </ButtonLink>
      </HeroSplash>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 2) * 120} className="h-full">
              <ServiceCard service={service} headingLevel="h2" />
            </Reveal>
          ))}
          {/* Sixth card: combining services. Fills the grid's empty slot;
              terracotta tint sets it apart from the five real services. */}
          <Reveal delay={(services.length % 2) * 120} className="h-full">
            <Link
              href={site.bookingUrl || "/contact"}
              className="group flex h-full flex-col rounded-xl border border-terracotta/20 bg-terracotta-tint p-5 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-dark">
                Mix and match
              </p>
              {/* Centered in the leftover height so the card doesn't feel
                  empty beside its taller, image-topped siblings */}
              <div className="flex flex-1 flex-col justify-center py-6">
                <h2 className="text-xl font-semibold text-pine-dark">
                  Need more than one?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  Most of my clients do. Combined projects get scoped together
                  with one flat quote, and it usually costs less than doing
                  them separately.
                </p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-terracotta-dark">
                  Popular combos
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    "New website + AI assistant",
                    "Automation + tool integration",
                    "AI insights + automation",
                  ].map((combo) => (
                    <li
                      key={combo}
                      className="whitespace-nowrap rounded-md bg-surface/80 px-2 py-1 text-xs font-medium text-ink"
                    >
                      {combo}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 border-t border-terracotta/20 pt-4 text-sm font-semibold text-terracotta-dark group-hover:underline">
                Let&rsquo;s scope it together →
              </p>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
