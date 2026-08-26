import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getService, getServices } from "@/lib/content";
import { parseHeroCards } from "@/lib/heroCards";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { mdxComponents } from "@/components/mdx";
import { BusyworkSwarm } from "@/components/BusyworkSwarm";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";

/**
 * Dedicated landing page per service. One MDX file in content/services/
 * = one page here. The body holds only the short intro prose; pain
 * points, deliverables, and the good-fit line come from frontmatter and
 * render as designed sections (no walls of text).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <HeroSplash
        compact
        eyebrow={`Starting at $${service.startingPrice.toLocaleString()}`}
        heading={service.title}
        text={service.summary}
        poolA={parseHeroCards(service.heroCardsTop)}
        poolB={parseHeroCards(service.heroCardsBottom)}
      >
        <ConsultButton />
        <ButtonLink href="/services" variant="light">
          All services
        </ButtonLink>
      </HeroSplash>

      {/* Short intro beside the service illustration */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <Reveal>
          <div className="prose-site">
            <MDXRemote source={service.body} components={mdxComponents} />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <SiteImage
            src={service.image}
            alt={service.imageAlt}
            prompt={service.imagePrompt}
            width={900}
            height={675}
          />
        </Reveal>
      </section>

      {/* The busywork this service clears, as poppable floating chips */}
      {service.busywork.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold text-pine-dark">
                Sound familiar?
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted">
                A few of the time-eaters this service clears off your plate.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-10 max-w-4xl">
                <BusyworkSwarm chips={service.busywork} />
              </div>
              <p className="mt-6 text-sm text-muted">
                Go ahead, pop a few. They&rsquo;ll be back. That&rsquo;s the
                point.
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* Deliverables as a checklist grid */}
      {service.deliverables.length > 0 && (
        <section className="bg-pine-tint/50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold text-pine-dark">
                What you get
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-muted">
                Plain talk about what you&rsquo;re actually paying for.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {service.deliverables.map((item, i) => (
                <Reveal key={item} delay={i * 120}>
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine text-white">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path
                          className="draw-check"
                          pathLength={1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </span>
                    <p className="leading-relaxed text-ink">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Good-fit callout with the CTA */}
      {service.goodFit && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <div className="items-center justify-between gap-8 rounded-2xl bg-terracotta-tint p-8 sm:flex">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-terracotta-dark">
                  A good fit if…
                </p>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink">
                  {service.goodFit}
                </p>
              </div>
              <ConsultButton className="mt-6 shrink-0 sm:mt-0" />
            </div>
          </Reveal>
        </section>
      )}

      <CTABand />
    </>
  );
}
