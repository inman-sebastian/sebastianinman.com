import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addTimelineAction,
  deleteClientAction,
  setStageAction,
  updateClientAction,
} from "@/app/actions";
import { ClientFields } from "@/components/ClientFields";
import { DocumentList, NewDocumentButtons } from "@/components/DocumentList";
import { StageBadge } from "@/components/StageBadge";
import { displayName, getClient } from "@/lib/clients";
import { documentsForClient } from "@/lib/documents";
import { getEmailTemplate } from "@/lib/emails";
import { longDate, money, telHref } from "@/lib/format";
import { listServices, serviceTitles } from "@/lib/services";
import { sourceLabel, stageInfo, STAGES } from "@/lib/stages";

export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  const stage = stageInfo(client.stage);
  const stageEmail = stage.emailId ? getEmailTemplate(stage.emailId) : null;
  const services = listServices();
  const documents = documentsForClient(client.slug);
  const newestFirst = [...client.timeline].reverse();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/clients" className="text-sm text-muted hover:underline">
          &larr; All clients
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-pine-dark">
            {displayName(client)}
          </h1>
          <StageBadge stage={client.stage} />
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {client.name && client.business && <span>{client.name}</span>}
          {client.email && (
            <a className="hover:underline" href={`mailto:${client.email}`}>
              {client.email}
            </a>
          )}
          {client.phone && (
            <a className="hover:underline" href={telHref(client.phone)}>
              {client.phone}
            </a>
          )}
          <span>Came from {sourceLabel(client.source).toLowerCase()}</span>
          <span>Added {longDate(client.created)}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              What&apos;s next
            </h2>
            <p className="mt-2 text-lg leading-relaxed">
              {client.nextStep || "Nothing set. Pick the next move below."}
            </p>
            {client.nextStepDue && (
              <p className="mt-1 text-sm text-muted">
                By {longDate(client.nextStepDue)}
              </p>
            )}
            {stageEmail && (
              <div className="mt-4 rounded-lg bg-pine-tint px-4 py-3 text-sm">
                <p>
                  The email for this stage: <strong>{stageEmail.title}</strong>.
                  It comes up filled in, and nothing sends until you have read
                  it over.
                </p>
                <Link
                  href={`/clients/${client.slug}/email?template=${stageEmail.id}`}
                  className="btn mt-3"
                >
                  Write it
                </Link>
              </div>
            )}
            {!stageEmail && client.email && (
              <Link
                href={`/clients/${client.slug}/email`}
                className="btn btn-quiet mt-4"
              >
                Write to them
              </Link>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              Timeline
            </h2>
            <form action={addTimelineAction} className="mt-3 space-y-2">
              <input type="hidden" name="slug" value={client.slug} />
              <input
                name="title"
                className="field"
                placeholder="What just happened? (Consult booked, proposal sent...)"
              />
              <textarea
                name="note"
                rows={2}
                className="field"
                placeholder="Anything worth remembering. Optional."
              />
              <button type="submit" className="btn btn-quiet">
                Add to the timeline
              </button>
            </form>
            <ol className="mt-5 space-y-4 border-l border-line pl-4">
              {newestFirst.map((entry, i) => (
                <li key={`${entry.date}-${i}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {entry.date}
                  </p>
                  <p className="font-semibold text-ink">{entry.title}</p>
                  {entry.note && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                      {entry.note}
                    </p>
                  )}
                </li>
              ))}
              {newestFirst.length === 0 && (
                <li className="text-sm text-muted">Nothing logged yet.</li>
              )}
            </ol>
          </section>

          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              Documents
            </h2>
            <div className="mt-2">
              <DocumentList documents={documents} />
            </div>
            <div className="mt-4">
              <NewDocumentButtons clientSlug={client.slug} />
            </div>
            <p className="mt-3 text-xs text-muted">
              Templates fill in the facts (their details, the date, the price,
              the invoice number). The writing prompts stay for you.
            </p>
          </section>

          {client.notes && (
            <section className="card p-5">
              <h2 className="font-serif text-lg font-semibold text-pine-dark">
                Notes
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {client.notes}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              Move the stage
            </h2>
            <p className="mt-1 text-sm text-muted">{stage.blurb}</p>
            <form action={setStageAction} className="mt-3 flex gap-2">
              <input type="hidden" name="slug" value={client.slug} />
              <select name="stage" className="field" defaultValue={client.stage}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn">
                Move
              </button>
            </form>
          </section>

          <section className="card p-5 text-sm">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              At a glance
            </h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Quote</dt>
                <dd className="font-semibold">{money(client.value) || "Not quoted yet"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Services</dt>
                <dd className="text-right">
                  {serviceTitles(client.services).join(", ") || "Not pinned down"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Last touched</dt>
                <dd>{longDate(client.updated)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Record</dt>
                <dd>
                  <code className="text-xs">data/clients/{client.slug}.md</code>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <details className="card p-5">
        <summary className="cursor-pointer font-serif text-lg font-semibold text-pine-dark">
          Edit the details
        </summary>
        <form action={updateClientAction} className="mt-4 space-y-6">
          <input type="hidden" name="slug" value={client.slug} />
          <ClientFields defaults={client} services={services} />
          <button type="submit" className="btn">
            Save changes
          </button>
        </form>
      </details>

      <details className="card border-terracotta-tint p-5">
        <summary className="cursor-pointer text-sm font-semibold text-terracotta-dark">
          Delete this record
        </summary>
        <p className="mt-2 text-sm text-muted">
          This removes <code>data/clients/{client.slug}.md</code> for good.
          There is no undo and no trash.
        </p>
        <form action={deleteClientAction} className="mt-3">
          <input type="hidden" name="slug" value={client.slug} />
          <button type="submit" className="btn btn-danger">
            Delete {displayName(client)}
          </button>
        </form>
      </details>
    </div>
  );
}
