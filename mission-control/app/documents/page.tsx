import Link from "next/link";
import { DocumentList } from "@/components/DocumentList";
import { displayName, listClients } from "@/lib/clients";
import { listDocuments } from "@/lib/documents";

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  const documents = listDocuments();
  const clients = listClients();

  const groups = clients
    .map((c) => ({
      key: c.slug,
      heading: displayName(c),
      href: `/clients/${c.slug}`,
      documents: documents.filter(
        (d) => d.record === c.slug || (!d.record && d.slug.startsWith(`${c.slug}-`))
      ),
    }))
    .filter((g) => g.documents.length > 0);

  const claimed = new Set(groups.flatMap((g) => g.documents.map((d) => d.slug)));
  const loose = documents.filter((d) => !claimed.has(d.slug));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-pine-dark">Documents</h1>
        <p className="mt-1 text-lg leading-relaxed text-muted">
          Proposals, agreements, and invoices. Start one from a client&apos;s
          page so their details come along with it.
        </p>
      </div>

      {documents.length === 0 && (
        <p className="card p-6 text-muted">
          Nothing drafted yet. Open a client and start a proposal.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.key} className="card p-5">
          <Link
            href={group.href}
            className="font-serif text-lg font-semibold text-pine-dark hover:underline"
          >
            {group.heading}
          </Link>
          <div className="mt-2">
            <DocumentList documents={group.documents} />
          </div>
        </section>
      ))}

      {loose.length > 0 && (
        <section className="card p-5">
          <h2 className="font-serif text-lg font-semibold text-pine-dark">
            Not linked to a client
          </h2>
          <p className="mt-1 text-sm text-muted">
            Drafts written before the client existed here, or the sample ones.
            Add <code>record: &lt;client-slug&gt;</code> to the frontmatter to
            pair one up.
          </p>
          <div className="mt-2">
            <DocumentList documents={loose} />
          </div>
        </section>
      )}
    </div>
  );
}
