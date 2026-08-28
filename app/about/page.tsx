import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getLandingPages, getPage } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { CTABand } from "@/components/CTABand";
import { MdxBody } from "@/components/mdx";
import { AreaCard } from "@/components/AreaCard";

export function generateMetadata(): Metadata {
  const page = getPage("about");
  return {
    title: "About",
    description:
      (page?.frontmatter.metaDescription as string) ?? site.description,
  };
}

export default function AboutPage() {
  const page = getPage("about");
  if (!page) notFound();
  // Only literal location pages; campaign pages stay unlisted
  const areaPages = getLandingPages().filter((p) => p.kind === "location");

  return (
    <>
      <HeroSplash
        compact
        cards={false}
        eyebrow="About"
        heading={(page.frontmatter.title as string) ?? "About"}
        text="I'm the one-person shop behind everything on this site: based in Southern Oregon, working with small businesses everywhere. Here's what working together looks like."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1fr_2fr]">
        {/* Headshot pulls up over the hero green, matching the
            overlapping-image treatment on the other inner pages */}
        {/* Sticky lives on the wrapper so the figcaption rides along */}
        <div className="md:sticky md:top-24 md:-mt-28 md:self-start">
          <SiteImage
            src="/images/headshot.jpg"
            alt={`Professional headshot of ${site.name}`}
            prompt="Sebastian's professional headshot (real photo; drop in the existing headshot file)"
            caption="Coffee's on me if you're ever in the Rogue Valley."
            width={600}
            height={700}
            priority
            sizes="(min-width: 768px) 33vw, 100vw"
            className="!rounded-2xl border-[6px] border-background md:shadow-lg"
          />
        </div>
        <div className="prose-site">
          <MdxBody source={page.body} />
        </div>
      </section>

      {/* Internal links to the SEO landing pages; deliberately the only
          on-site navigation to them (they're campaign entry points) */}
      {areaPages.length > 0 && (
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold text-pine-dark">
                Areas I serve
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                Home base is Southern Oregon, and I work with small businesses
                across{" "}
                <Link
                  href="/jackson-county-ai-integration"
                  className="text-pine underline underline-offset-2 hover:text-pine-dark"
                >
                  Jackson
                </Link>{" "}
                and{" "}
                <Link
                  href="/josephine-county-small-business-automation"
                  className="text-pine underline underline-offset-2 hover:text-pine-dark"
                >
                  Josephine
                </Link>{" "}
                counties, and anywhere in the US. A few of the places I know
                best:
              </p>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {areaPages.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 120} className="h-full">
                  <AreaCard area={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand />
    </>
  );
}
