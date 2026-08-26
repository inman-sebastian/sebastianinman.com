import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getLandingPages, getPage } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { CTABand } from "@/components/CTABand";
import { mdxComponents } from "@/components/mdx";

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
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr]">
        <div>
          <SiteImage
            src="/images/headshot.jpg"
            alt={`Professional headshot of ${site.name}`}
            prompt="Sebastian's professional headshot (real photo; drop in the existing headshot file)"
            width={600}
            height={700}
            priority
            className="md:sticky md:top-24"
          />
        </div>
        <div className="prose-site">
          <h1 className="text-4xl font-semibold text-pine-dark sm:text-5xl">
            {(page.frontmatter.title as string) ?? "About"}
          </h1>
          <div className="mt-8">
            <MDXRemote source={page.body} components={mdxComponents} />
          </div>
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
                across the region and anywhere in the US. A few of the places
                I know best:
              </p>
            </Reveal>
            <Reveal delay={150}>
              <ul className="mt-6 flex flex-wrap gap-2">
                {areaPages.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/${p.slug}`}
                      className="inline-block rounded-full border border-line bg-pine-tint/60 px-4 py-2 text-sm font-medium text-pine-dark transition-colors hover:bg-pine-tint"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      <CTABand />
    </>
  );
}
