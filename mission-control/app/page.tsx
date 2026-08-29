import { Suspense } from "react";
import Link from "next/link";
import { ClientCard } from "@/components/ClientCard";
import { StageBadge } from "@/components/StageBadge";
import { TrafficPanel, TrafficPanelSkeleton } from "./TrafficPanel";
import { MoneyPanel, MoneyPanelSkeleton } from "./MoneyPanel";
import {
  daysSinceTouched,
  displayName,
  goneQuiet,
  listClients,
  needsAttention,
} from "@/lib/clients";
import { money } from "@/lib/format";
import { mapboxToken, scatter } from "@/lib/geo";
import { ACTIVE_STAGES, stageInfo } from "@/lib/stages";
import { MapPanel } from "./MapPanel";
import type { MapPin } from "@/components/PipelineMap";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const clients = listClients();
  // Everything research turned up that has not been ruled out
  const researched = clients.filter((c) => c.stage === "researched");

  // Everyone who has been placed, whatever stage they are at, nudged
  // apart when they share a town. The map shows the lot and the filter
  // narrows it; leaving stages out here would mean a pin count that
  // quietly disagrees with the pipeline.
  const pins: MapPin[] = clients
    .filter((c) => c.lat !== null && c.lng !== null)
    .map((c) => {
      const [lat, lng] = scatter(c.lat as number, c.lng as number, c.slug);
      const waiting = c.stage === "researched";
      return {
        slug: c.slug,
        label: displayName(c),
        city: c.city,
        lat,
        lng,
        stage: c.stage,
        href: waiting ? `/clients/${c.slug}/review` : `/clients/${c.slug}`,
        detail: [stageInfo(c.stage).label, c.category, c.city]
          .filter(Boolean)
          .join(" · "),
      };
    });

  // Matches what the locate button actually does, which is everyone
  const unplaced = clients.filter(
    (c) => c.lat === null && (c.city || c.address)
  ).length;
  const open = clients.filter(
    (c) => c.stage !== "done" && c.stage !== "lost" && c.stage !== "researched"
  );
  const waiting = needsAttention(clients);
  const quiet = goneQuiet(clients);
  const quoted = open.reduce((sum, c) => sum + (c.value ?? 0), 0);

  // Only truly empty when there is nothing at all. Researched leads on their
  // own are worth a dashboard: that is the normal state before the
  // first client.
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
          Add the first client
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
            {quoted > 0 && `, ${money(quoted)} quoted`}
            {researched.length > 0 && `, ${researched.length} waiting to review`}
            .
          </p>
        </div>
        <Link href="/clients/new" className="btn">
          New client
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

      {quiet.length > 0 && (
        <section className="card p-5">
          <h2 className="font-serif text-lg font-semibold text-pine-dark">
            Gone quiet
          </h2>
          <p className="mt-1 text-sm text-muted">
            Nothing has happened on these in a while. Deals die here more
            often than they die on a no.
          </p>
          <ul className="mt-3 divide-y divide-line">
            {quiet.map((c) => (
              <li
                key={c.slug}
                className="flex flex-wrap items-baseline gap-x-3 py-2"
              >
                <Link
                  href={`/clients/${c.slug}`}
                  className="font-semibold text-pine-dark hover:underline"
                >
                  {displayName(c)}
                </Link>
                <StageBadge stage={c.stage} />
                <span className="ml-auto text-sm text-terracotta-dark">
                  {daysSinceTouched(c)} days quiet
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Money before traffic: what is owed outranks who visited */}
      <Suspense fallback={<MoneyPanelSkeleton />}>
        <MoneyPanel />
      </Suspense>

      <Suspense fallback={<TrafficPanelSkeleton />}>
        <TrafficPanel />
      </Suspense>

      {(pins.length > 0 || unplaced > 0) && (
        <MapPanel pins={pins} token={mapboxToken()} unplaced={unplaced} />
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
