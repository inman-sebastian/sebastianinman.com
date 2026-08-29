import { cache } from "react";
import { repoEnv } from "./env";

/**
 * What the website is actually doing, from Vercel Web Analytics.
 *
 * The site already ships `@vercel/analytics`, so this reads the same
 * aggregated numbers the Vercel dashboard shows, through the public
 * Web Analytics API (available since May 2026). No scraping, no
 * undocumented endpoints.
 *
 * The account is on Hobby, which sets two hard limits worth knowing
 * before adding anything here:
 *
 *  - Custom events are Pro-only. `events/count` answers 402, so
 *    "did somebody click that button" is not a question this can ask.
 *    Page views are automatic, so anything expressible as a route is
 *    fair game, which covers most of it.
 *  - The reporting window is one month. Asking for last year returns
 *    nothing useful, so don't build a year-over-year panel on this.
 *
 * Nothing here writes, and the token is read-only by intention: it is
 * never logged, never sent anywhere else, and never rendered.
 */

const API = "https://api.vercel.com/v1/query/web-analytics";

/** The sebastianinman.com project. Not a secret, and not worth a
    required env var, but overridable for a second project later. */
const DEFAULT_PROJECT = "prj_0Lfasdl2C9qGAOtygKcFcpVPaLHD";

function token(): string {
  return process.env.VERCEL_API_TOKEN || repoEnv().VERCEL_API_TOKEN || "";
}

export function analyticsReady(): boolean {
  return Boolean(token());
}

function projectId(): string {
  return (
    process.env.VERCEL_PROJECT_ID || repoEnv().VERCEL_PROJECT_ID || DEFAULT_PROJECT
  );
}

/** Personal accounts still sit behind a team id; the API tolerates it
    being absent, so this is only sent when it is set. */
function teamId(): string {
  return process.env.VERCEL_TEAM_ID || repoEnv().VERCEL_TEAM_ID || "";
}

/**
 * A few minutes of memory.
 *
 * The dashboard is a page Sebastian refreshes without thinking about
 * it, and these numbers move slowly. Without this, every refresh would
 * be four calls to somebody else's API for an answer that has not
 * changed.
 */
const TTL_MS = 5 * 60 * 1000;
const memo = new Map<string, { at: number; value: unknown }>();

async function query<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const search = new URLSearchParams({ projectId: projectId(), ...params });
  const team = teamId();
  if (team) search.set("teamId", team);

  const url = `${API}/${path}?${search}`;
  const hit = memo.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // The message is shown on screen, so it says what to do about it
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Vercel refused the token. Check VERCEL_API_TOKEN in the repo root's .env.local has not expired."
      );
    }
    if (res.status === 402) {
      throw new Error("That needs a Pro plan. This account is on Hobby.");
    }
    throw new Error(
      `Vercel answered ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }
  const json = (await res.json()) as { data: T };
  memo.set(url, { at: Date.now(), value: json.data });
  return json.data;
}

/** YYYY-MM-DD, N days before today, in UTC to match what the API returns */
function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * `until` counts the whole of that day, so a seven-day window runs from
 * six days ago to today, not seven. Getting this wrong makes both
 * windows eight days long and overlaps them by one, which quietly
 * double-counts a day in the week-on-week comparison.
 */
const THIS_WEEK = { since: daysAgo(6), until: today() };
const LAST_WEEK = { since: daysAgo(13), until: daysAgo(7) };

type Totals = { visitors: number; pageviews: number };
type RouteRow = { route: string; visitors: number; pageviews: number };
type ReferrerRow = {
  referrerHostname: string;
  visitors: number;
  pageviews: number;
};

export type SiteTraffic = {
  week: Totals;
  /** The seven days before that, for a direction rather than a number */
  previousWeek: Totals;
  routes: RouteRow[];
  referrers: ReferrerRow[];
  /** Views of /contact in the last week; the closest Hobby gets to a
      funnel, since the click itself would be a custom event */
  contactViews: number;
};

export const siteTraffic = cache(async function siteTraffic(): Promise<SiteTraffic> {
  const [week, previousWeek, routes, referrers] = await Promise.all([
    query<Totals>("visits/count", THIS_WEEK),
    query<Totals>("visits/count", LAST_WEEK),
    query<RouteRow[]>("visits/aggregate", {
      ...THIS_WEEK,
      by: "route",
      limit: "8",
    }),
    query<ReferrerRow[]>("visits/aggregate", {
      ...THIS_WEEK,
      by: "referrerHostname",
      limit: "5",
    }),
  ]);

  const contact = routes.find((r) => r.route === "/contact");

  return {
    week,
    previousWeek,
    // The API happens to return these busiest-first, but the bar widths
    // are drawn relative to the first row, so sort rather than trust it
    routes: [...routes].sort((a, b) => b.pageviews - a.pageviews),
    // An empty hostname is somebody who typed the address or came from a
    // link with no referrer. Real, but not a source, so it is labelled
    // rather than dropped.
    referrers: referrers.filter((r) => r.visitors > 0),
    contactViews: contact?.visitors ?? 0,
  };
});
