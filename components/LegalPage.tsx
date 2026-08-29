import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { HeroSplash } from "@/components/HeroSplash";
import { MdxBody } from "@/components/mdx";

/** "August 28, 2026" from an ISO date, built from the parts so the
    rendered date does not shift by a day depending on the timezone */
function longDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * The privacy and terms pages, which are the same page with different
 * words. Narrower than the marketing pages on purpose: this is text
 * somebody reads a paragraph of to answer one question, so a shorter
 * line length matters more than a designed layout.
 */
export function LegalPage({ name, eyebrow }: { name: string; eyebrow: string }) {
  const page = getPage(name);
  if (!page) notFound();

  const updated = page.frontmatter.updated as string | undefined;

  return (
    <>
      <HeroSplash
        compact
        cards={false}
        eyebrow={eyebrow}
        heading={(page.frontmatter.title as string) ?? eyebrow}
        text={(page.frontmatter.metaDescription as string) ?? ""}
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="prose-site">
          <MdxBody source={page.body} />
        </div>
        {updated && (
          <p className="mt-10 border-t border-line pt-5 text-sm text-muted">
            Last updated {longDate(updated)}.
          </p>
        )}
      </section>
    </>
  );
}
