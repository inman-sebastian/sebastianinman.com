import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDocumentAction, saveDocumentAction } from "@/app/documents/actions";
import { displayName, getClient } from "@/lib/clients";
import { getDocument, kindLabel } from "@/lib/documents";
import { longDate, money } from "@/lib/format";
import { listServices } from "@/lib/services";
import { loadTemplate } from "@/lib/templates";
import { GenerateButton } from "./GenerateButton";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocument(slug);
  if (!doc) notFound();

  const client = doc.record ? getClient(doc.record) : null;
  const template = loadTemplate(doc.kind);

  // The floor for a quote is what the service pages say each piece
  // starts at; going under one is Sebastian's call to make on purpose,
  // not something to do by accident
  const services = listServices();
  const floor = (client?.services ?? []).reduce(
    (sum, s) => sum + (services.find((x) => x.slug === s)?.startingPrice ?? 0),
    0
  );
  const underFloor = Boolean(client?.value && floor && client.value < floor);

  return (
    <div className="space-y-6">
      <div>
        {client ? (
          <Link
            href={`/clients/${client.slug}`}
            className="text-sm text-muted hover:underline"
          >
            &larr; {displayName(client)}
          </Link>
        ) : (
          <Link href="/documents" className="text-sm text-muted hover:underline">
            &larr; All documents
          </Link>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-pine-dark">{doc.title}</h1>
          <span className="rounded-full bg-pine-tint px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-pine-dark">
            {kindLabel(doc.kind)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          <code>docs/clients/drafts/{doc.file}</code>
          {doc.pdf && ` · PDF built ${longDate(doc.pdf.generated.slice(0, 10))}`}
        </p>
      </div>

      <div className="space-y-3">
        {doc.placeholders > 0 && (
          <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
            <strong>
              {doc.placeholders} placeholder{doc.placeholders === 1 ? "" : "s"} left.
            </strong>{" "}
            The ones in double braces are writing prompts: the problem in their
            words, what you&apos;ll build, the timeline. They come from your
            consult notes, so nothing here fills them in for you.
          </p>
        )}
        {doc.kind === "agreement" && template?.needsLawyerReview && (
          <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
            <strong>This agreement is not lawyer-reviewed yet.</strong> Worth an
            Oregon attorney reading it once before a client signs one. After
            that it is reusable, and this warning comes off the template.
          </p>
        )}
        {underFloor && client && (
          <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
            Heads up: the quote on this record is {money(client.value)}, and the
            starting prices for what they picked add up to {money(floor)}.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveDocumentAction} className="space-y-4">
          <input type="hidden" name="slug" value={doc.slug} />
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label className="label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="field"
                defaultValue={doc.title}
              />
            </div>
            <div>
              <label className="label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="field"
                defaultValue={doc.date}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="signatures">
              Signers
            </label>
            <textarea
              id="signatures"
              name="signatures"
              rows={2}
              className="field text-sm"
              placeholder="One per line. Leave empty for documents nobody signs."
              defaultValue={doc.signatures.join("\n")}
            />
            <p className="mt-1 text-xs text-muted">
              One per line. Anyone listed gets a real fillable signature and
              date field on the last page of the PDF. Never type signature
              lines into the document itself.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="body">
              The document
            </label>
            <textarea
              id="body"
              name="body"
              rows={30}
              className="field font-mono text-sm"
              defaultValue={doc.body}
            />
          </div>

          <button type="submit" className="btn">
            Save and refresh the preview
          </button>
        </form>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card overflow-hidden">
            <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Preview
            </p>
            <iframe
              // The mtime in the URL is what makes a fresh save show up
              src={`/documents/${doc.slug}/preview?v=${encodeURIComponent(doc.updated)}`}
              title={`Preview of ${doc.title}`}
              className="h-[42rem] w-full bg-white"
            />
          </div>
          <GenerateButton slug={doc.slug} hasPdf={Boolean(doc.pdf)} />
          <p className="text-xs text-muted">
            The preview is the same rendering the PDF prints from. Long
            documents grow here instead of paginating; the PDF paginates.
          </p>
        </div>
      </div>

      <details className="card border-terracotta-tint p-5">
        <summary className="cursor-pointer text-sm font-semibold text-terracotta-dark">
          Delete this document
        </summary>
        <p className="mt-2 text-sm text-muted">
          Removes the draft and any PDF built from it. No undo.
        </p>
        <form action={deleteDocumentAction} className="mt-3">
          <input type="hidden" name="slug" value={doc.slug} />
          <button type="submit" className="btn btn-danger">
            Delete {doc.title}
          </button>
        </form>
      </details>
    </div>
  );
}
