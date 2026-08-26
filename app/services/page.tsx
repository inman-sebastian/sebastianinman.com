import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getServices } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
import { ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";

export const metadata: Metadata = {
  title: "Services: Automation, AI & Websites for Small Businesses",
  description:
    "Website design, workflow automation, tool integration, AI assistants, and AI-powered insights for small businesses. Plain-English help with clear starting prices.",
};

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <h1 className="max-w-2xl text-4xl font-semibold text-pine-dark sm:text-5xl">
          What I can take off your plate
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Every project starts with a free consult and a plain-English plan.
          Prices below are honest starting points. Most projects are quoted
          flat, so you know the cost before we begin.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {services.map((service, i) => (
          <section
            key={service.slug}
            id={service.slug}
            className={`grid scroll-mt-24 items-start gap-10 py-14 md:grid-cols-2 ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <SiteImage
                src={service.image}
                alt={service.imageAlt}
                prompt={service.imagePrompt}
                width={900}
                height={675}
                className="md:sticky md:top-24"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-pine-dark">
                {service.title}
              </h2>
              <p className="mt-2 font-semibold text-terracotta">
                Starting at ${service.startingPrice.toLocaleString()}
              </p>
              <div className="prose-site mt-6">
                <MDXRemote source={service.body} />
              </div>
              <ConsultButton className="mt-6" />
            </div>
          </section>
        ))}
      </div>

      <CTABand />
    </>
  );
}
