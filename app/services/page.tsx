import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/content";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { SiteImage } from "@/components/SiteImage";
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
          {/* Sixth card: combining services. Mirrors the ServiceCard anatomy
              (flush image, corner chip, top-aligned content) so it sits in
              the grid as a sibling; terracotta tint sets it apart. */}
          <Reveal delay={(services.length % 2) * 120} className="h-full">
            <Link
              href="/contact"
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-terracotta/20 bg-terracotta-tint transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
            >
              <div className="relative p-px">
                <SiteImage
                  src="/images/services/mix-and-match.jpg"
                  alt="Illustration of service pieces fitting together like a puzzle"
                  prompt="Flat illustration of two friendly hands assembling four large rounded puzzle pieces on a warm wooden workshop table so they click together into one neat square, each piece decorated with a simple picture: a laptop showing a small storefront website, a chat bubble, two connected gears, and a little rising chart, earthy cream, pine green, and terracotta palette. No text or lettering anywhere."
                  width={800}
                  height={600}
                  className="!rounded-t-[11px] !rounded-b-none"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-terracotta shadow-sm">
                  One flat quote
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 pt-4">
                <h2 className="text-xl font-semibold text-pine-dark">
                  Need more than one?
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/80">
                  Most of my clients do. Combined projects get scoped together
                  with one flat quote, and it usually costs less than doing
                  them separately.
                </p>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-dark">
                    Popular combos
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {[
                      "New Website + AI Assistant",
                      "Automation + Tool Integration",
                      "AI Insights + Automation",
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
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
