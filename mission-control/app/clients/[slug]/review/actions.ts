"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendTimeline, getClient, updateClient } from "@/lib/clients";
import { parseSocials } from "@/lib/socials";
import { stageInfo } from "@/lib/stages";

/**
 * Reviewing what research turned up.
 *
 * These used to move a record between two stores. Now a researched
 * business and a client are the same record at different stages, so
 * deciding is just a stage change with a note about why.
 */

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function pursueAction(formData: FormData) {
  const slug = text(formData, "slug");
  const record = getClient(slug);
  if (!record) return;

  updateClient(slug, {
    stage: "prospect",
    nextStep: stageInfo("prospect").nextStep,
  });
  appendTimeline(slug, "Worth pursuing", "Moved out of the research queue.");

  revalidatePath("/");
  revalidatePath("/research");
  revalidatePath("/clients");
  redirect(`/clients/${slug}`);
}

export async function passAction(formData: FormData) {
  const slug = text(formData, "slug");
  if (!getClient(slug)) return;
  // Kept rather than deleted, so a later research run knows this one was
  // already looked at and decided against
  updateClient(slug, { stage: "lost", nextStep: "" });
  appendTimeline(slug, "Not a fit", "Decided against from the research queue.");
  revalidatePath("/research");
  revalidatePath(`/clients/${slug}/review`);
}

export async function reopenAction(formData: FormData) {
  const slug = text(formData, "slug");
  if (!getClient(slug)) return;
  updateClient(slug, { stage: "researched" });
  revalidatePath("/research");
  revalidatePath(`/clients/${slug}/review`);
}

export async function saveReviewAction(formData: FormData) {
  const slug = text(formData, "slug");
  updateClient(slug, {
    business: text(formData, "business"),
    city: text(formData, "city"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    website: text(formData, "website"),
    socials: parseSocials(text(formData, "socials")),
    notes: text(formData, "body"),
  });
  revalidatePath("/research");
  revalidatePath(`/clients/${slug}/review`);
}
