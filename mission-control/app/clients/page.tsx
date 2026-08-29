import Link from "next/link";
import { StageBadge } from "@/components/StageBadge";
import { displayName, listClients, type ClientRecord } from "@/lib/clients";
import { money, shortDate } from "@/lib/format";
import { estimatedWorth, serviceTitles } from "@/lib/services";
import { isStage, stageInfo, STAGES } from "@/lib/stages";

export const dynamic = "force-dynamic";

/**
 * Every record, as a table.
 *
 * The columns are chosen to be worth scanning: two records at the same
 * stage should not look identical, which is what a list of names and
 * dates gives you. So the left half says who they are and what they
 * would need, and the right half says where they are and when they were
 * last touched.
 */
export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const filter = isStage(stage) ? stage : null;
  const all = listClients();
  const clients = filter ? all.filter((c) => c.stage === filter) : all;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold text-pine-dark">Clients</h1>
        <Link href="/clients/new" className="btn">
          New client
        </Link>
      </div>

      <nav className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
        <Link
          href="/clients"
          className={`rounded-full px-3 py-1 ${
            filter ? "bg-surface text-muted" : "bg-pine text-background"
          }`}
        >
          Everyone · {all.length}
        </Link>
        {STAGES.map((s) => {
          const count = all.filter((c) => c.stage === s.id).length;
          if (count === 0) return null;
          return (
            <Link
              key={s.id}
              href={`/clients?stage=${s.id}`}
              className={`rounded-full px-3 py-1 ${
                filter === s.id ? "bg-pine text-background" : "bg-surface text-muted"
              }`}
            >
              {s.label} · {count}
            </Link>
          );
        })}
      </nav>

      {clients.length === 0 ? (
        <p className="card p-6 text-muted">Nobody here yet.</p>
      ) : (
        <div className="card overflow-hidden">
          <div className={`${COLUMNS} hidden border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted md:grid`}>
            <span>Business</span>
            <span>What they need</span>
            <span className="text-right">Worth</span>
            <span>Stage</span>
            <span className="text-right">Updated</span>
          </div>
          <ul className="divide-y divide-line">
            {clients.map((c) => (
              <Row key={c.slug} client={c} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Shared by the header and every row, so the columns actually line up.
    The stage column is wide enough for "Agreement & deposit", the
    longest badge, on one line. */
const COLUMNS =
  "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)_7rem_10.5rem_7rem] md:items-baseline md:gap-x-5";

function Row({ client: c }: { client: ClientRecord }) {
  const services = serviceTitles(c.services);

  // The stage already says "decide whether they are worth pursuing" on
  // the stage's own terms. Repeating its default next step on every row
  // fills the column with the one thing that cannot tell two records
  // apart, so only a next step somebody actually wrote gets shown.
  const ownNextStep =
    c.nextStep && c.nextStep !== stageInfo(c.stage).nextStep ? c.nextStep : "";

  // A quoted figure is real. Anything else is the floor implied by the
  // services on the record, and has to read as one.
  const floor = c.value ? 0 : estimatedWorth(c.services);

  return (
    <li>
      <Link
        href={`/clients/${c.slug}`}
        className={`${COLUMNS} block px-4 py-3 hover:bg-pine-tint/40`}
      >
        <span className="block min-w-0">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-serif text-lg font-semibold text-pine-dark">
              {displayName(c)}
            </span>
            {c.fit === "strong" && (
              <span className="rounded-full bg-pine-tint px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-pine-dark">
                Strong
              </span>
            )}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
            {[c.category, c.city].filter(Boolean).join(" · ") || "No details yet"}
            {!c.website && (
              <span className="text-terracotta-dark">No website</span>
            )}
            {c.platform && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs ring-1 ring-line">
                {c.platform}
              </span>
            )}
          </span>
        </span>

        <span className="mt-1 block min-w-0 text-sm md:mt-0">
          {services.length > 0 ? (
            <span className="text-ink">{services.join(", ")}</span>
          ) : (
            <span className="text-muted">Not scoped yet</span>
          )}
          {ownNextStep && (
            <span className="mt-0.5 block text-xs text-terracotta-dark">
              {ownNextStep}
            </span>
          )}
        </span>

        <span className="mt-1 block text-sm md:mt-0 md:text-right">
          {c.value ? (
            <span className="font-semibold text-ink">{money(c.value)}</span>
          ) : floor > 0 ? (
            <span className="text-muted">from {money(floor)}</span>
          ) : (
            <span className="text-muted">&mdash;</span>
          )}
        </span>

        <span className="mt-2 block md:mt-0">
          <StageBadge stage={c.stage} />
        </span>

        <span className="mt-1 block text-xs text-muted md:mt-0 md:text-right">
          {shortDate(c.updated)}
        </span>
      </Link>
    </li>
  );
}
