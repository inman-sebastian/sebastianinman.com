/**
 * Social profile URLs, shared by the views and the review form.
 *
 * A record stores social profiles as a flat list of full URLs (like the
 * tool `stack`), and the network is worked out from the hostname when it
 * is shown, so a new network never needs a schema change. The one place
 * that knows the network names for display is here; detection has its own
 * copy in scripts/detect-stack.mjs.
 */

/** hostname suffix -> display name. Longest match wins, so a bare host
    like "instagram.com" and "www.instagram.com" both resolve. */
const NETWORKS: [suffix: string, name: string][] = [
  ["instagram.com", "Instagram"],
  ["facebook.com", "Facebook"],
  ["fb.com", "Facebook"],
  ["linkedin.com", "LinkedIn"],
  ["x.com", "X"],
  ["twitter.com", "X"],
  ["youtube.com", "YouTube"],
  ["youtu.be", "YouTube"],
  ["tiktok.com", "TikTok"],
  ["yelp.com", "Yelp"],
  ["pinterest.com", "Pinterest"],
];

/**
 * The network a profile URL belongs to, plus its bare hostname for a
 * fallback label. Returns null for anything unrecognised so callers can
 * decide whether to still show it.
 */
export function socialNetwork(
  url: string
): { name: string; host: string } | null {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  const hit = NETWORKS.find(
    ([suffix]) => host === suffix || host.endsWith(`.${suffix}`)
  );
  return hit ? { name: hit[1], host } : null;
}

/** A short label for a profile URL: the network name when known, else the
    bare hostname, else the raw string. */
export function socialLabel(url: string): string {
  const net = socialNetwork(url);
  if (net) return net.name;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Parse a textarea value (one URL per line, commas allowed) into a clean,
    deduped list of URLs. */
export function parseSocials(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[\n,]+/)) {
    const url = raw.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}
