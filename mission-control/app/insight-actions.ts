"use server";

import { revalidatePath } from "next/cache";
import { forget } from "@/lib/claude";
import { clearDone } from "@/lib/done";

/**
 * Throw away a cached answer so the next render asks again.
 *
 * The briefing is pinned to the day so it survives being worked
 * through, which means this is now the only way to get a new one before
 * tomorrow: the answer was unhelpful, or enough has changed that it is
 * worth asking again.
 */
export async function refreshBriefingAction() {
  forget("briefing");
  // A new list has new ids, and yesterday's ticks would only be
  // hiding items that no longer exist.
  clearDone();
  revalidatePath("/");
}

export async function refreshRankingAction() {
  forget("ranking");
  revalidatePath("/research");
}
