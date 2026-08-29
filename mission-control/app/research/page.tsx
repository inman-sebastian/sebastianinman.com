import Link from "next/link";
import { displayName, listClients, listResearched } from "@/lib/clients";
import { estimatedWorth } from "@/lib/services";
import { money } from "@/lib/format";
import { readJob } from "@/lib/agent-run";
import { RESEARCH_JOB } from "@/lib/research";
import { Suspense } from "react";
import { FindLeadsPanel } from "./FindLeadsPanel";
import { RankingPanel, RankingPanelSkeleton } from "./RankingPanel";

export const dynamic = "force-dynamic";

export default function ResearchPage() {
  const waiting = listResearched();
  // Everything research has already turned up and been judged on
  const decided = listClients().filter(
    (c) => c.source === "outreach" && c.stage !== "researched"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-pine-dark">Research</h1>
        <p className="mt-1 text-lg leading-relaxed text-muted">
          Businesses research turned up. They are ordinary client records
          sitting at the researched stage, so nothing here is on the board
          until you say it is worth pursuing.
        </p>
      </div>

      <FindLeadsPanel initialJob={readJob(RESEARCH_JOB)} waiting={waiting.length} />

      <Suspense fallback={<RankingPanelSkeleton />}>
        <RankingPanel />
      </Suspense>

      <section className="card">
        <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Waiting on you · {waiting.length}
        </p>
        <ul className="divide-y divide-line">
          {waiting.map((r) => {
            const value = estimatedWorth(r.services);
            return (
              <li key={r.slug}>
                <Link
                  href={`/clients/${r.slug}/review`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4 hover:bg-pine-tint/40"
                >
                  <span className="font-serif text-lg font-semibold text-pine-dark">
                    {displayName(r)}
                  </span>
                  {r.fit === "strong" && (
                    <span className="rounded-full bg-pine-tint px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-pine-dark">
                      Strong
                    </span>
                  )}
                  <span className="text-sm text-muted">
                    {[r.category, r.city].filter(Boolean).join(" · ")}
                  </span>
                  {!r.website && (
                    <span className="text-xs text-terracotta-dark">No website</span>
                  )}
                  {r.platform && (
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted ring-1 ring-line">
                      {r.platform}
                    </span>
                  )}
                  {value > 0 && (
                    <span className="ml-auto text-sm font-semibold">
                      from {money(value)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          {waiting.length === 0 && (
            <li className="p-6 text-sm text-muted">
              Nothing waiting. Ask Cowork to find leads, or use the button on
              the dashboard.
            </li>
          )}
        </ul>
      </section>

      {decided.length > 0 && (
        <section className="card">
          <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Already decided · {decided.length}
          </p>
          <ul className="divide-y divide-line">
            {decided.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/clients/${r.slug}`}
                  className="flex flex-wrap items-center gap-x-3 p-4 text-sm hover:bg-pine-tint/40"
                >
                  <span className="font-semibold text-pine-dark">
                    {displayName(r)}
                  </span>
                  <span className="text-muted">
                    {r.stage === "lost" ? "Not a fit" : "In the pipeline"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-4 py-2 text-xs text-muted">
            Kept so a later research run knows these were already looked at.
          </p>
        </section>
      )}
    </div>
  );
}
