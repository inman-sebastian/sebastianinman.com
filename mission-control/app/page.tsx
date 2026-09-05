import { Suspense } from "react";
import Link from "next/link";
import { ClientCard } from "@/components/ClientCard";
import { TrafficPanel, TrafficPanelSkeleton } from "./TrafficPanel";
import { MoneyPanel, MoneyPanelSkeleton } from "./MoneyPanel";
import { MoneyStats, Stat, StatPending, TrafficStat } from "./Stats";
import { TodayPanel } from "./TodayPanel";
import { MailAutoCheck } from "./MailAutoCheck";
import { displayName, listClients } from "@/lib/clients";
import { isConnected as gmailConnected } from "@/lib/gmail";
import { isConnected as igConnected } from "@/lib/instagram";
import { unmatchedCount } from "@/lib/messages";
import { money } from "@/lib/format";
import { mapboxToken, scatter } from "@/lib/geo";
import { ACTIVE_STAGES, stageInfo } from "@/lib/stages";
import { MapPanel } from "./MapPanel";
import type { MapPin } from "@/components/PipelineMap";

export const dynamic = "force-dynamic";

/**
 * The dashboard, in four bands rather than seven stacked lists:
 *
 *   1. the numbers, in one row
 *   2. what needs doing, beside what is owed
 *   3. the board
 *   4. where everyone is, beside what the website did
 *
 * The rule that keeps it readable: totals live in band 1 and nowhere
 * else, and the detail below repeats none of them. Anything depending on
 * another company's server sits in its own Suspense boundary, so the
 * page never waits on Stripe or Vercel to show what this machine already
 * knows.
 */
export default function Dashboard() {
  const clients = listClients();
  const researched = clients.filter((c) => c.stage === "researched");

  // Everyone who has been placed, whatever stage they are at, nudged
  // apart when they share a town.
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

  const unplaced = clients.filter(
    (c) => c.lat === null && (c.city || c.address),
  ).length;
  const open = clients.filter(
    (c) => c.stage !== "done" && c.stage !== "lost" && c.stage !== "researched",
  );
  const quoted = open.reduce((sum, c) => sum + (c.value ?? 0), 0);
  const toSort = gmailConnected() || igConnected() ? unmatchedCount() : 0;

  if (clients.length === 0) {
    return (
      <section className="card mx-auto max-w-xl p-10 text-center">
        <MailAutoCheck />
        <h1 className="text-3xl font-semibold text-pine-dark">
          Nobody in the pipeline yet
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          When the first inquiry lands, paste the notification email in and it
          fills most of this out for you.
        </p>
        <Link href="/clients/new" className="btn mt-6">
          Add the first client
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <MailAutoCheck />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-pine-dark">Pipeline</h1>
        <Link href="/clients/new" className="btn">
          New client
        </Link>
      </div>

      {/* Band 1: the state of the business, in one row */}
      <section className="card overflow-hidden">
        <div className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Stat
            label="Open"
            value={String(open.length)}
            sub={open.length === 1 ? "conversation" : "conversations"}
            href="/clients"
          />
          <Stat
            label="Quoted"
            value={quoted > 0 ? money(quoted) : "$0"}
            sub="across open work"
          />
          <Suspense
            fallback={
              <>
                <StatPending label="Outstanding" />
                <StatPending label="Overdue" />
              </>
            }
          >
            <MoneyStats />
          </Suspense>
          <Suspense fallback={<StatPending label="Visitors" />}>
            <TrafficStat />
          </Suspense>
        </div>
      </section>

      {researched.length > 0 && (
        <p className="text-sm text-muted">
          <Link
            href="/research"
            className="font-semibold text-pine hover:underline"
          >
            {researched.length} researched{" "}
            {researched.length === 1 ? "business" : "businesses"}
          </Link>{" "}
          waiting for you to judge.
        </p>
      )}

      {toSort > 0 && (
        <p className="text-sm text-muted">
          <Link
            href="/inbox"
            className="font-semibold text-pine hover:underline"
          >
            {toSort} {toSort === 1 ? "message" : "messages"} to sort
          </Link>{" "}
          in the inbox, from people not yet on file.
        </p>
      )}

      {/* Band 2: the jobs. Full width, because it is the reason to open
          this page and because pairing it with an empty money card left
          a tall blank column beside it. */}
      <TodayPanel />

      {/* Band 3: the pipeline itself */}
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

      {/* Band 4: everything else, none of it urgent */}
      <div className="grid gap-6 lg:grid-cols-2">
        {(pins.length > 0 || unplaced > 0) && (
          <MapPanel pins={pins} token={mapboxToken()} unplaced={unplaced} />
        )}
        <div className="space-y-6">
          <Suspense fallback={<MoneyPanelSkeleton />}>
            <MoneyPanel />
          </Suspense>
          <Suspense fallback={<TrafficPanelSkeleton />}>
            <TrafficPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
