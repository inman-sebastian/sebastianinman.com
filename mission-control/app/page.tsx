import Link from "next/link";
import { ClientCard } from "@/components/ClientCard";
import { displayName, listClients, needsAttention } from "@/lib/clients";
import { money } from "@/lib/format";
import { ACTIVE_STAGES } from "@/lib/stages";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const clients = listClients();
  const open = clients.filter((c) => c.stage !== "done" && c.stage !== "lost");
  const waiting = needsAttention(clients);
  const quoted = open.reduce((sum, c) => sum + (c.value ?? 0), 0);

  if (clients.length === 0) {
    return (
      <section className="card mx-auto max-w-xl p-10 text-center">
        <h1 className="text-3xl font-semibold text-pine-dark">
          Nobody in the pipeline yet
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          When the first inquiry lands, paste the notification email in and
          it fills most of this out for you.
        </p>
        <Link href="/clients/new" className="btn mt-6">
          Add the first lead
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-pine-dark">Pipeline</h1>
          <p className="mt-1 text-lg leading-relaxed text-muted">
            {open.length} open {open.length === 1 ? "conversation" : "conversations"}
            {quoted > 0 && `, ${money(quoted)} quoted`}.
          </p>
        </div>
        <Link href="/clients/new" className="btn">
          New lead
        </Link>
      </section>

      {waiting.length > 0 && (
        <section className="card p-5">
          <h2 className="font-serif text-lg font-semibold text-pine-dark">
            Waiting on you
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {waiting.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-baseline gap-x-3 py-2">
                <Link
                  href={`/clients/${c.slug}`}
                  className="font-semibold text-pine-dark hover:underline"
                >
                  {displayName(c)}
                </Link>
                <span className="text-sm text-ink">
                  {c.nextStep || "No next step set"}
                </span>
                {c.nextStepDue && (
                  <span className="text-xs text-terracotta-dark">
                    due {c.nextStepDue}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-3xl font-semibold text-pine-dark">The board</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
          {ACTIVE_STAGES.map((stage) => {
            const inStage = clients.filter((c) => c.stage === stage.id);
            return (
              <div key={stage.id} className="w-64 shrink-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {stage.label} · {inStage.length}
                </p>
                <div className="mt-2 space-y-2">
                  {inStage.map((c) => (
                    <ClientCard key={c.slug} client={c} />
                  ))}
                  {inStage.length === 0 && (
                    <p className="rounded-xl border border-dashed border-line p-3 text-xs text-muted">
                      {stage.blurb}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
