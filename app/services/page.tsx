import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { BundleCard } from "@/components/BundleCard";
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 3) * 120} className="h-full">
              <ServiceCard service={service} headingLevel="h2" />
            </Reveal>
          ))}
          {/* Sixth card: combining services (completes the 3x2 grid) */}
          <Reveal delay={(services.length % 3) * 120} className="h-full">
            <BundleCard headingLevel="h2" />
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
