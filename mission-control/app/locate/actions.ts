"use server";

import { revalidatePath } from "next/cache";
import { getClient, listClients, updateClient } from "@/lib/clients";
import { geocode, mapboxToken } from "@/lib/geo";

/**
 * Filling in map coordinates.
 *
 * This is a button rather than something that happens quietly on save,
 * because it calls out to Mapbox and a record write should not depend on
 * a network being there. Anything already located is skipped, so
 * pressing it twice costs nothing.
 */
export type LocateState = { message?: string; error?: string };

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
    const hit = await geocode({
      business: c.business,
      address: c.address,
      city: c.city,
    });
    if (!hit) {
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
  revalidatePath("/prospects");
  revalidatePath("/clients");

  if (located === 0 && missed === 0) {
    return { message: "Everyone with a town already has a place on the map." };
  }
  return {
    message: `Put ${located} on the map${missed > 0 ? `, and could not place ${missed}` : ""}.`,
  };
}
