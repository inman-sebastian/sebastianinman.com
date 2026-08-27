import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { site } from "@/content/site";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { MdxBody } from "@/components/mdx";
import { CTABand } from "@/components/CTABand";

/**
 * Blog post pages. One MDX file in content/blog/ = one post at
 * /blog/<filename>. See the "write a blog post" recipe in CLAUDE.md.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSplash
        compact
        cards={false}
        eyebrow={formatDate(post.date)}
        heading={post.title}
        text={post.description}
      />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        {post.image && post.imagePrompt && (
          // Same hero-overlap treatment as the other inner pages
          <Reveal className="md:-mt-28">
            <SiteImage
              src={post.image}
              alt={post.imageAlt ?? post.title}
              prompt={post.imagePrompt}
              caption={post.imageCaption}
              width={900}
              height={675}
              sizes="(min-width: 768px) 704px, 100vw"
              className="!rounded-2xl border-[6px] border-background md:shadow-lg"
            />
          </Reveal>
        )}
        <div className="prose-site mx-auto mt-10">
          <MdxBody source={post.body} />
        </div>
        <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
          <Link
            href="/blog"
            className="font-semibold text-pine hover:text-pine-dark"
          >
            ← All posts
          </Link>
        </p>
      </article>

      <CTABand />
    </>
  );
}
