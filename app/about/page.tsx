import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getPage } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
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
      <CTABand />
    </>
  );
}
