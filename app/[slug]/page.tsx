import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingPage, getLandingPages } from "@/lib/content";
import { parseHeroCards } from "@/lib/heroCards";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { MdxBody } from "@/components/mdx";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";
import { site } from "@/content/site";

/**
 * SEO landing pages. Every MDX file in content/landing/ becomes a page at
 * the site root; the filename is the URL slug. See CLAUDE.md for the
 * "add a landing page" recipe.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getLandingPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  return {
    // Landing pages carry their own fully-written SEO title
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function LandingPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  return (
    <>
      <HeroSplash
        compact
        eyebrow={`${site.name} · ${page.city}`}
        heading={page.heroHeadline}
        text={page.heroSubline || undefined}
        poolA={parseHeroCards(page.heroCardsTop)}
        poolB={parseHeroCards(page.heroCardsBottom)}
      >
        <ConsultButton />
        <ButtonLink href="/services" variant="light">
          See services & prices
        </ButtonLink>
      </HeroSplash>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div
          className={
            page.imagePrompt
              ? "grid items-start gap-10 md:grid-cols-2"
              : undefined
          }
        >
          {/* Campaign pages have no image column; center the prose so the
              page doesn't sit lopsided in the wide container */}
          <div className={page.imagePrompt ? "prose-site" : "prose-site mx-auto"}>
            <MdxBody source={page.body} />
          </div>
          {page.imagePrompt && (
            // Pulled up over the hero's flat green with a border matching
            // this section's cream background (see the service pages)
            <Reveal delay={150} className="md:sticky md:top-24 md:-mt-28">
              <SiteImage
                src={page.image}
                alt={page.imageAlt}
                prompt={page.imagePrompt}
                width={900}
                height={675}
                className="!rounded-2xl border-[6px] border-background md:shadow-lg"
              />
            </Reveal>
          )}
        </div>
      </section>

      <CTABand
        heading={`Ready to get some hours back${page.city ? `, ${page.city}` : ""}?`}
      />
    </>
  );
}
