import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { Callout } from "@/components/mdx";
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
        <div className="max-w-2xl">
          <Callout title="Need more than one?">
            Most of my clients do. Combined projects get scoped together with
            one flat quote, and it usually costs less than doing them
            separately.
          </Callout>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 2) * 120} className="h-full">
              <ServiceCard service={service} headingLevel="h2" />
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
