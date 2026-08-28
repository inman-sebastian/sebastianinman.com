import Link from "next/link";
import { StageBadge } from "@/components/StageBadge";
import { displayName, listClients } from "@/lib/clients";
import { money } from "@/lib/format";
import { isStage, STAGES } from "@/lib/stages";

export const dynamic = "force-dynamic";

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
          New lead
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
        <ul className="card divide-y divide-line">
          {clients.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/clients/${c.slug}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:bg-pine-tint/40"
              >
                <span className="font-serif text-lg font-semibold text-pine-dark">
                  {displayName(c)}
                </span>
                <StageBadge stage={c.stage} />
                <span className="text-sm text-muted">
                  {c.nextStep || "No next step set"}
                </span>
                <span className="ml-auto text-sm font-semibold text-ink">
                  {money(c.value)}
                </span>
                <span className="text-xs text-muted">{c.updated}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
