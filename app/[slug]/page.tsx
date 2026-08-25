import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getLandingPage, getLandingPages } from "@/lib/content";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";
import { site } from "@/content/site";

/**
 * SEO landing pages. Every MDX file in content/landing/ becomes a page at
 * the site root — the filename is the URL slug. See CLAUDE.md for the
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
      <section className="border-b border-line bg-pine-tint/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">
            {site.name} · {page.city}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-pine-dark sm:text-5xl">
            {page.heroHeadline}
          </h1>
          {page.heroSubline && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              {page.heroSubline}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <ConsultButton />
            <ButtonLink href="/services" variant="secondary">
              See services & prices
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="prose-site">
          <MDXRemote source={page.body} />
        </div>
      </section>

      <CTABand
        heading={`Ready to get some hours back${page.city ? `, ${page.city}` : ""}?`}
      />
    </>
  );
}
