import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage } from "@/lib/content";
import { HeroSplash } from "@/components/HeroSplash";
import { SiteImage } from "@/components/SiteImage";
import { Reveal } from "@/components/Reveal";
import { CTABand } from "@/components/CTABand";

/**
 * FAQ page. Questions and answers live in content/pages/faq.mdx
 * frontmatter (question/answer pairs); this page renders them as native
 * details/summary accordions and emits FAQPage structured data from the
 * same source.
 */

type Faq = { question: string; answer: string };

export function generateMetadata(): Metadata {
  const page = getPage("faq");
  return {
    title: { absolute: (page?.frontmatter.metaTitle as string) ?? "FAQ" },
    description: (page?.frontmatter.metaDescription as string) ?? "",
    alternates: { canonical: "/faq" },
  };
}

export default function FaqPage() {
  const page = getPage("faq");
  if (!page) notFound();
  const faqs = (page.frontmatter.faqs as Faq[]) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
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
        eyebrow="FAQ"
        heading={(page.frontmatter.title as string) ?? "FAQ"}
        text={(page.frontmatter.heroSubline as string) || undefined}
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={Math.min(i, 4) * 80}>
                <details className="group rounded-xl border border-line bg-surface px-5 py-4 open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg font-semibold text-pine-dark [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <svg
                      className="h-5 w-5 shrink-0 text-pine transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{faq.answer}</p>
                </details>
              </Reveal>
            ))}
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Have a question that isn&rsquo;t here? Ask me anything in the
              free consult, or send it through the{" "}
              <Link
                href="/contact"
                className="text-pine underline underline-offset-2 hover:text-pine-dark"
              >
                contact form
              </Link>
              .
            </p>
          </div>

          {/* Same sticky-overlap illustration treatment as the service and
              location pages, so the FAQ doesn't read as a bare list */}
          <Reveal delay={150} className="md:sticky md:top-24 md:-mt-28">
            <SiteImage
              src="/images/faq.jpg"
              alt="Illustration of two people talking over coffee at a small table, one with a laptop"
              prompt="Friendly modern flat illustration of two people having a relaxed conversation at a small wooden cafe table: one is a business owner with a notebook full of scribbled questions, the other listens warmly over coffee with a laptop open between them, morning light through a window, a few plants, earthy cream, pine green, and terracotta palette. No text or lettering anywhere; notebook scribbles abstract."
              caption="The free consult, more or less: coffee, questions, straight answers."
              width={900}
              height={675}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="!rounded-2xl border-[6px] border-background md:shadow-lg"
            />
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
