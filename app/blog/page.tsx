import type { Metadata } from "next";
import { blogSchema, jsonLdProps } from "@/lib/schema";
import Link from "next/link";
import { getBlogPosts } from "@/lib/content";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { CTABand } from "@/components/CTABand";

export const metadata: Metadata = {
  title: "Blog: Practical Automation & AI for Small Businesses",
  description:
    "Practical, hype-free writing on automation, AI, and websites for small businesses, from a Southern Oregon developer.",
  alternates: { canonical: "/blog" },
};

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <>
      <script {...jsonLdProps(blogSchema(posts))} />
      <HeroSplash
        compact
        cards={false}
        eyebrow="The blog"
        heading="Notes on getting your hours back"
        text="Practical writing about automation, AI, and websites for small businesses. No hype, no jargon, and honest about what isn't worth doing."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={(i % 3) * 120} className="h-full">
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
              >
                {post.image && post.imagePrompt && (
                  <div className="p-px">
                    <SiteImage
                      src={post.image}
                      alt={post.imageAlt ?? post.title}
                      prompt={post.imagePrompt}
                      width={800}
                      height={600}
                      sizes="(min-width: 1152px) 368px, (min-width: 640px) 50vw, 100vw"
                      className="!rounded-t-[11px] !rounded-b-none"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {formatDate(post.date)}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-pine-dark transition-colors duration-500 group-hover:text-pine">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {post.description}
                  </p>
                  <p className="mt-4 border-t border-line pt-4 text-sm font-semibold text-pine group-hover:underline">
                    Read the post →
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
