import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getService, getServices } from "@/lib/content";
import { parseHeroCards } from "@/lib/heroCards";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";

/**
 * Dedicated landing page per service. One MDX file in content/services/
 * = one page here; the rotating hero examples come from the file's
 * heroCardsTop / heroCardsBottom frontmatter.
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

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div className="prose-site">
          <MDXRemote source={service.body} />
          <ConsultButton className="mt-6" />
        </div>
        <SiteImage
          src={service.image}
          alt={service.imageAlt}
          prompt={service.imagePrompt}
          width={900}
          height={675}
          className="md:sticky md:top-24"
        />
      </section>

      <CTABand />
    </>
  );
}
