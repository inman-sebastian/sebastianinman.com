import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
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

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <SiteImage
                src={service.image}
                alt={service.imageAlt}
                prompt={service.imagePrompt}
                width={800}
                height={600}
              />
              <h2 className="mt-4 text-xl font-semibold text-pine-dark group-hover:text-pine">
                {service.title}
              </h2>
              <p className="mt-2 flex-1 leading-relaxed text-muted">
                {service.summary}
              </p>
              <p className="mt-4 flex items-center justify-between text-sm font-semibold">
                <span className="text-terracotta">
                  Starting at ${service.startingPrice.toLocaleString()}
                </span>
                <span className="text-pine group-hover:underline">
                  Learn more →
                </span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
