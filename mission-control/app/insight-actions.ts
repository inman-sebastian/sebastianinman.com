"use server";

import { revalidatePath } from "next/cache";
import { forget } from "@/lib/claude";

/**
 * Throw away a cached answer so the next render asks again.
 *
 * Answers are keyed by the question, so they refresh on their own when
 * the underlying records change. This is for the other case: the answer
 * was unhelpful and is worth another go at the same facts.
 */
export async function refreshBriefingAction() {
  forget("briefing");
  revalidatePath("/");
}

export async function refreshRankingAction() {
  forget("ranking");
  revalidatePath("/research");
}
