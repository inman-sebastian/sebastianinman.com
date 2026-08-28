"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendTimeline, createClient } from "@/lib/clients";
import { getProspect, updateProspect } from "@/lib/prospects";
import { stageInfo } from "@/lib/stages";

/**
 * Promoting is the only way a researched business becomes a record in
 * the pipeline. It is a decision Sebastian makes one at a time, on
 * purpose: a research run finds a batch, and most of a batch is not
 * worth pursuing.
 */

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function promoteProspectAction(formData: FormData) {
  const slug = text(formData, "slug");
  const prospect = getProspect(slug);
  if (!prospect || prospect.status === "promoted") return;

  const stack =
    prospect.platform || prospect.stack.length
      ? [
          "## What they're running",
          "",
          prospect.platform ? `- Built on ${prospect.platform}` : "",
          ...prospect.stack.map((t) => `- ${t}`),
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  const notes = [
    prospect.why,
    prospect.saw ? `## What I saw\n\n${prospect.saw}` : "",
    stack,
    prospect.openingLine ? `## Opening line\n\n${prospect.openingLine}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const record = createClient({
    name: "",
    business: prospect.business,
    email: prospect.email,
    phone: prospect.phone,
    stage: "prospect",
    services: prospect.services,
    source: "outreach",
    nextStep: stageInfo("prospect").nextStep,
    notes,
  });

  appendTimeline(
    record.slug,
    "Found by research",
    [
      prospect.city ? `${prospect.category} in ${prospect.city}` : prospect.category,
      prospect.listing ? `Found at ${prospect.listing}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );

  updateProspect(slug, { status: "promoted" });

  revalidatePath("/");
  revalidatePath("/prospects");
  revalidatePath("/clients");
  redirect(`/clients/${record.slug}`);
}

export async function passProspectAction(formData: FormData) {
  const slug = text(formData, "slug");
  // Kept rather than deleted, so a later research run knows it was
  // already looked at and decided against
  updateProspect(slug, { status: "passed" });
  revalidatePath("/prospects");
  revalidatePath(`/prospects/${slug}`);
}

export async function reopenProspectAction(formData: FormData) {
  const slug = text(formData, "slug");
  updateProspect(slug, { status: "new" });
  revalidatePath("/prospects");
  revalidatePath(`/prospects/${slug}`);
}

export async function saveProspectAction(formData: FormData) {
  const slug = text(formData, "slug");
  updateProspect(slug, {
    business: text(formData, "business"),
    city: text(formData, "city"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    website: text(formData, "website"),
    body: text(formData, "body"),
  });
  revalidatePath("/prospects");
  revalidatePath(`/prospects/${slug}`);
}
