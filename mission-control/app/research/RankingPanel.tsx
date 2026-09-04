import Link from "next/link";
import { claudeReady } from "@/lib/claude";
import { rankResearch } from "@/lib/insights";
import { displayName, getClient } from "@/lib/clients";

/**
 * The queue in the order worth working it.
 *
 * The list below this is sorted by nothing in particular, which is fine
 * when there are three and useless when there are thirty. This reads
 * what the research actually found about each one and puts the likeliest
 * yes first. It only runs with two or more waiting, since ranking one
 * business is not ranking.
 */
export async function RankingPanel() {
  if (!claudeReady()) return null;

  let result;
  try {
    result = await rankResearch();
  } catch (err) {
    return (
      <Shell>
        <p className="bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </Shell>
    );
  }
  if (!result) return null;

  const { value, cached, costUsd, via } = result;

  return (
    <Shell>
      <ol className="divide-y divide-line">
        {value.ranked.map((r, i) => {
          const client = getClient(r.slug);
          if (!client) return null;
          return (
            <li key={r.slug} className="flex gap-3 px-4 py-2.5 text-sm">
              <span className="w-5 shrink-0 font-serif text-lg font-semibold text-pine-dark">
                {i + 1}
              </span>
              <span className="min-w-0">
                <Link
                  href={`/clients/${r.slug}/review`}
                  className="font-semibold text-pine-dark hover:underline"
                >
                  {displayName(client)}
                </Link>
                <span className="block text-muted">{r.why}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {value.skip.length > 0 && (
        <div className="border-t border-line px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Probably not worth it
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {value.skip.map((s) => {
              const client = getClient(s.slug);
              if (!client) return null;
              return (
                <li key={s.slug}>
                  <Link
                    href={`/clients/${s.slug}/review`}
                    className="font-semibold text-pine-dark hover:underline"
                  >
                    {displayName(client)}
                  </Link>
                  <span className="text-muted"> {s.why}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="border-t border-line px-4 py-2 text-xs text-muted">
        {cached
          ? "Held until the research changes."
          : via === "subscription"
            ? "Fresh, through your Claude Code subscription: the API account is out of credit."
            : `Fresh. That cost about $${costUsd.toFixed(3)}.`}{" "}
        A guess from what the research found, not a verdict.
      </p>
    </Shell>
  );
}

export function RankingPanelSkeleton() {
  return (
    <Shell>
      <p className="px-4 py-6 text-sm text-muted">Reading the research...</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Where Claude would start
      </p>
      {children}
    </section>
  );
}
