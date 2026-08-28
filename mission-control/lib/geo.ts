import { repoEnv } from "./env";

/**
 * Turning a business into a dot on a map.
 *
 * The honest precision here is usually the town, not the doorstep. The
 * research records a city and sometimes a street address; when there is
 * no address, Mapbox lands on the middle of the town and that is what
 * gets stored. `precise` records which of the two happened, so the map
 * can say "roughly here" rather than implying it knows the building.
 */

export function mapboxToken(): string {
  return process.env.MAPBOX_API_KEY || repoEnv().MAPBOX_API_KEY || "";
}

export type Located = {
  lat: number;
  lng: number;
  /** The town Mapbox matched, which is often better than what we typed */
  city: string;
  /** True when it matched a street address or the business itself */
  precise: boolean;
};

/**
 * Look up somewhere. Pass the most specific thing known first; the
 * fallbacks below are tried in order until one lands.
 */
export async function geocode(parts: {
  business?: string;
  address?: string;
  city?: string;
}): Promise<Located | null> {
  const token = mapboxToken();
  if (!token) return null;

  const region = "Oregon";
  const attempts = [
    parts.address && [parts.address, parts.city, region].filter(Boolean).join(", "),
    parts.business && [parts.business, parts.city, region].filter(Boolean).join(", "),
    parts.city && [parts.city, region].join(", "),
  ].filter((q): q is string => Boolean(q));

  for (const query of attempts) {
    const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");
    url.searchParams.set("country", "us");
    url.searchParams.set("access_token", token);

    let body: {
      features?: Array<{
        geometry?: { coordinates?: [number, number] };
        properties?: {
          feature_type?: string;
          context?: { place?: { name?: string } };
        };
      }>;
    };
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      body = await res.json();
    } catch {
      continue;
    }

    const hit = body.features?.[0];
    const coords = hit?.geometry?.coordinates;
    if (!hit || !coords) continue;

    const type = hit.properties?.feature_type ?? "";
    return {
      lng: coords[0],
      lat: coords[1],
      city: hit.properties?.context?.place?.name || parts.city || "",
      precise: type === "address" || type === "poi",
    };
  }
  return null;
}

/**
 * Nudge pins that share a spot so they do not stack into one dot.
 *
 * Everything geocoded to the middle of Medford lands on the identical
 * point, which reads as one prospect instead of six. The offset is
 * derived from the record's own key so it stays put between renders,
 * and it is tiny: a few hundred metres, well inside the town it is
 * already only claiming to be near.
 */
export function scatter(lat: number, lng: number, key: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const radius = 0.004 + (Math.abs(hash >> 9) % 100) / 100000;
  return [lat + Math.sin(angle) * radius, lng + Math.cos(angle) * radius];
}
