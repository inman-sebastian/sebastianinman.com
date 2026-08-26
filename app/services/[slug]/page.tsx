import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getService, getServices } from "@/lib/content";
import { parseHeroCards } from "@/lib/heroCards";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { mdxComponents } from "@/components/mdx";
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
        <ButtonLink href="/services" variant="secondary">
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

      {/* Pain points as chat-style bubbles (echoes the hero cards) */}
      {service.painPoints.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold text-pine-dark">
                Sound familiar?
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {service.painPoints.map((point, i) => (
                <Reveal key={point} delay={i * 120} className="h-full">
                  <div className="h-full rounded-2xl border border-line bg-pine-tint/60 px-5 py-4">
                    <p className="leading-relaxed text-pine-dark">
                      &ldquo;{point}&rdquo;
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={service.painPoints.length * 120}>
              <p className="mt-8 max-w-xl text-lg text-muted">
                If any of these sound like your week, you&rsquo;re exactly who
                this is for.
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
