import Link from "next/link";
import { createDocumentAction } from "@/app/documents/actions";
import { kindLabel, KINDS, type ClientDocument } from "@/lib/documents";

export function DocumentList({ documents }: { documents: ClientDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted">Nothing drafted yet.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {documents.map((doc) => (
        <li key={doc.slug}>
          <Link
            href={`/documents/${doc.slug}`}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2"
          >
            <span className="font-semibold text-pine-dark hover:underline">
              {doc.title}
            </span>
            <span className="rounded-full bg-pine-tint px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-pine-dark">
              {kindLabel(doc.kind)}
            </span>
            {doc.placeholders > 0 ? (
              <span className="text-xs text-terracotta-dark">
                {doc.placeholders} to fill in
              </span>
            ) : (
              <span className="text-xs text-muted">
                {doc.pdf ? "PDF ready" : "Ready to generate"}
              </span>
            )}
            <span className="ml-auto text-xs text-muted">{doc.date}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Start a proposal, agreement, or invoice from the matching template */
export function NewDocumentButtons({ clientSlug }: { clientSlug: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {KINDS.map((kind) => (
        <form key={kind.id} action={createDocumentAction}>
          <input type="hidden" name="client" value={clientSlug} />
          <input type="hidden" name="kind" value={kind.id} />
          <button type="submit" className="btn btn-quiet">
            New {kindLabel(kind.id).toLowerCase()}
          </button>
        </form>
      ))}
    </div>
  );
}
