import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaperworkDrafts } from "@/lib/paperwork";

/**
 * DEV-ONLY index of client paperwork drafts. Two privacy walls: this
 * route 404s in production, and docs/clients/drafts/ is git-ignored so
 * drafts never reach the repo or the deployed site.
 */

export const dynamic = "force-dynamic";

export default function PaperworkIndex() {
  if (process.env.NODE_ENV === "production") notFound();
  const drafts = getPaperworkDrafts();

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">
        Local only
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-pine-dark">
        Client paperwork drafts
      </h1>
      <p className="mt-3 leading-relaxed text-muted">
        Drafts live in <code>docs/clients/drafts/</code> (git-ignored).
        Open one, check it, then print to PDF (Cmd+P). This page does not
        exist on the live site.
      </p>
      <ul className="mt-8 space-y-3">
        {drafts.length === 0 && (
          <li className="text-muted">
            No drafts yet. The draft-client-paperwork skill creates them.
          </li>
        )}
        {drafts.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/paperwork/${d.slug}`}
              className="block rounded-xl border border-line bg-surface p-4 hover:border-pine"
            >
              <span className="font-serif text-lg font-semibold text-pine-dark">
                {d.title}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {d.client}
                {d.date ? ` · ${d.date}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
