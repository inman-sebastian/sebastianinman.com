"use server";

import { revalidatePath } from "next/cache";
import { appendTimeline, displayName, getClient, updateClient } from "@/lib/clients";
import { markDone } from "@/lib/done";
import { isStage, stageInfo } from "@/lib/stages";

/**
 * Ticking something off.
 *
 * A checkbox that only hides a row is a lie, so this writes: the job
 * goes on the record's timeline, the due date clears so it stops being
 * due, and where the stage arc says finishing that step moves somebody,
 * the record moves.
 *
 * It never sends anything. The two things that reach other people,
 * client email and invoices, stay behind their own deliberate buttons.
 */

export type TaskState = { error?: string; done?: string; moved?: string };

export async function completeTaskAction(
  _prev: TaskState,
  formData: FormData
): Promise<TaskState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const advancesTo = String(formData.get("advancesTo") ?? "").trim();
  // Every task carries one now, suggestions and record tasks alike, so
  // a ticked item can stay on the list struck through instead of just
  // vanishing. A finished record task has nothing left to render it
  // from, so its label and name get written down here too.
  const taskId = String(formData.get("taskId") ?? "").trim();

  const client = getClient(slug);
  if (!client) return { error: "That record is gone." };

  let moved = "";
  if (advancesTo && isStage(advancesTo)) {
    const next = stageInfo(advancesTo);
    updateClient(slug, {
      stage: advancesTo,
      nextStep: next.nextStep,
      nextStepDue: "",
    });
    moved = next.label;
  } else {
    // Clear the date so it stops being due, but leave the step itself:
    // it may still be the right thing to do, just not today.
    updateClient(slug, { nextStepDue: "" });
  }

  appendTimeline(
    slug,
    label || "Did the next step",
    moved ? `Ticked off. Moved to ${moved}.` : "Ticked off."
  );

  if (taskId) {
    markDone({
      id: taskId,
      slug,
      who: displayName(client),
      label: label || "Did the next step",
    });
  }

  revalidatePath("/");
  revalidatePath(`/clients/${slug}`);
  revalidatePath("/research");
  return { done: label, moved };
}
