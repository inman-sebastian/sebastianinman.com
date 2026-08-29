"use server";

import { revalidatePath } from "next/cache";
import { getClient, listClients, updateClient } from "@/lib/clients";
import { geocode, mapboxToken } from "@/lib/geo";

/**
 * Filling in map coordinates.
 *
 * The dashboard calls this on its own when somebody has a town but no
 * pin, so everybody on file ends up on the map without anything being
 * pressed. It still runs after the page has rendered rather than during
 * it: looking a record up means a call to Mapbox, and the pipeline has
 * to be readable on a bad connection.
 *
 * A geocode writes coordinates into the record, so this is a one-time
 * cost per business rather than something that happens on every load.
 */
export type LocateState = { message?: string; error?: string };

/**
 * Businesses Mapbox had nothing for, remembered for as long as the
 * server is up. Without this, anyone unplaceable would be looked up
 * again on every single dashboard load, which is a loop against
 * somebody else's API. A restart is enough to try them again.
 */
const unplaceable = new Set<string>();

export async function locateEveryoneAction(): Promise<LocateState> {
  if (!mapboxToken()) {
    return {
      error:
        "No MAPBOX_API_KEY in the repo root's .env.local, so there is nothing to look anybody up with.",
    };
  }

  let located = 0;
  let missed = 0;

  for (const c of listClients()) {
    if (c.lat !== null && c.lng !== null) continue;
    if (!c.city && !c.address) continue;
    if (unplaceable.has(c.slug)) continue;

    const hit = await geocode({
      business: c.business,
      address: c.address,
      city: c.city,
    });
    if (!hit) {
      unplaceable.add(c.slug);
      missed += 1;
      continue;
    }
    if (getClient(c.slug)) {
      updateClient(c.slug, {
        lat: hit.lat,
        lng: hit.lng,
        city: c.city || hit.city,
      });
      located += 1;
    }
  }

  revalidatePath("/");
  revalidatePath("/research");
  revalidatePath("/clients");

  if (located === 0 && missed === 0) {
    return { message: "" };
  }
  if (located === 0) {
    return {
      error: `Could not find ${missed === 1 ? "a place" : `places`} for ${missed} of them. Adding a street address to the record usually fixes it.`,
    };
  }
  return {
    message:
      missed > 0
        ? `Put ${located} on the map, and could not place ${missed}.`
        : "",
  };
}
