"use server";

import { revalidatePath } from "next/cache";
import { startResearch } from "@/lib/research";

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
  revalidatePath("/prospects");
  return { message: "Started. It searches and checks sites, so give it a few minutes." };
}
