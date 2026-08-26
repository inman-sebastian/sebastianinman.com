import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getService, getServices } from "@/lib/content";
import { parseHeroCards } from "@/lib/heroCards";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { MdxBody } from "@/components/mdx";
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

/**
 * Brand favicon for a tool chip, looked up by slugified name in
 * public/images/tools (e.g. "Microsoft 365" -> microsoft-365.png).
 * Returns undefined when no file exists; the chip renders text-only.
 */
function toolIcon(name: string): string | undefined {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const rel = `/images/tools/${slug}.png`;
  return fs.existsSync(path.join(process.cwd(), "public", rel)) ? rel : undefined;
}

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
        <ConsultButton service={service.slug} />
        <ButtonLink href="/services" variant="light">
          All services
        </ButtonLink>
      </HeroSplash>

      {/* Short intro beside the service illustration. The image pulls up
          over the hero's flat green, with a border matching this section's
          cream background so the overlap reads as a deliberate layer. */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <Reveal>
          <div className="prose-site">
            <MdxBody source={service.body} />
          </div>
        </Reveal>
        <Reveal delay={150} className="md:-mt-28 md:self-start">
          <SiteImage
            src={service.image}
            alt={service.imageAlt}
            prompt={service.imagePrompt}
            width={900}
            height={675}
            className="!rounded-2xl border-[6px] border-background md:shadow-lg"
          />
        </Reveal>
      </section>

      {/* Named tools as a chip grid; renders only when the MDX lists any.
          First designed section on purpose: recognition ("that's MY
          stuff") is the fastest hook. Customer-court framing, and no
          partnership claims. */}
      {service.tools.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold text-pine-dark">
              Use any of these?
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">
              Then I can make them talk to each other, so the things you type
              once show up everywhere they should.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <ul className="mt-8 flex max-w-4xl flex-wrap gap-2.5">
              {service.tools.map((tool) => {
                const icon = toolIcon(tool);
                return (
                  <li
                    key={tool}
                    className="flex items-center gap-2 rounded-lg border border-line bg-background px-4 py-2 text-sm font-medium text-pine-dark"
                  >
                    {icon && (
                      <Image
                        src={icon}
                        alt=""
                        width={18}
                        height={18}
                        className="shrink-0"
                      />
                    )}
                    {tool}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
              Don&rsquo;t see yours? If it can export a file or has any way to
              connect, I can usually work with it. Ask me about it in the free
              consult.
            </p>
          </Reveal>
          </div>
        </section>
      )}

      {/* The busywork this service clears, as poppable floating chips.
          Plain cream: the surface band above it carries the separation. */}
      {service.busywork.length > 0 && (
        <section>
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
                Straight talk about what&rsquo;s included in the price.
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
              <ConsultButton service={service.slug} className="mt-6 shrink-0 sm:mt-0" />
            </div>
          </Reveal>
        </section>
      )}

      <CTABand service={service.slug} />
    </>
  );
}
