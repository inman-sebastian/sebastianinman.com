"use server";

import { revalidatePath } from "next/cache";
import { clearJob } from "@/lib/agent-run";
import { RESEARCH_JOB, startResearch } from "@/lib/research";

export type ResearchState = { message?: string; error?: string };

/**
 * Starts a research run in the background. It writes records and
 * nothing else: the skill is told not to contact anybody and not to
 * touch git, and the allowlist does not grant it the means to.
 */
export async function startResearchAction(
  _prev: ResearchState,
  formData: FormData
): Promise<ResearchState> {
  const brief = String(formData.get("brief") ?? "").trim();
  const problem = startResearch(brief);
  if (problem) return { error: problem };
  revalidatePath("/research");
  return { message: "Started. It searches and checks sites, so give it a few minutes." };
}

/**
 * Throws away a finished run's files.
 *
 * The panel calls this the moment a run ends, having already got the
 * result in hand, so the report lives for the rest of that page view
 * and no longer. What a run actually produced is the records below it,
 * not the write-up, and a wall of text from last week sitting above the
 * queue is just something to scroll past.
 *
 * A run still in flight is left alone, so closing the tab and coming
 * back still finds it.
 */
export async function clearResearchJobAction(): Promise<void> {
  clearJob(RESEARCH_JOB);
  revalidatePath("/research");
}
