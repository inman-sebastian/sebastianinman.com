import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaperworkDraft } from "@/lib/paperwork";
import { MdxBody } from "@/components/mdx";
import { site } from "@/content/site";

/**
 * DEV-ONLY rendered paperwork draft with brand letterhead, styled for
 * print (Cmd+P -> save as PDF). 404s in production; drafts are
 * git-ignored. The site header/footer hide themselves under @media
 * print (see globals.css) so the PDF is just the document.
 */

export const dynamic = "force-dynamic";

export default async function PaperworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { slug } = await params;
  const draft = getPaperworkDraft(slug);
  if (!draft) notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 print:max-w-none print:p-0">
      <p className="mb-8 text-sm text-muted print:hidden">
        <Link href="/paperwork" className="font-semibold text-pine">
          ← All drafts
        </Link>
        {"  ·  Check every line, then Cmd+P to save as PDF"}
      </p>

      {/* Letterhead */}
      <header className="flex items-center justify-between border-b-2 border-pine pb-5">
        <p className="inline-flex items-center gap-2.5 font-serif text-xl font-semibold text-pine-dark">
          <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-terracotta" />
          {site.name}
        </p>
        <p className="text-right text-xs leading-relaxed text-muted">
          {site.email}
          <br />
          {site.phone} · sebastianinman.com
        </p>
      </header>

      <div className="prose-site mt-8">
        <MdxBody source={draft.body} />
      </div>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-muted">
        {site.name} · Southern Oregon · {site.email} · {site.phone}
      </footer>
    </section>
  );
}
