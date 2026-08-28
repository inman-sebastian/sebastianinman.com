"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  appendTimeline,
  createClient,
  deleteClient,
  getClient,
  updateClient,
  type ClientInput,
} from "@/lib/clients";
import { parseInquiry } from "@/lib/parse-inquiry";
import { isSource, isStage, stageInfo } from "@/lib/stages";

/**
 * Every write in the app goes through one of these. They only ever
 * touch files in ./data; nothing here sends email, commits, or reaches
 * outside this machine.
 */

export type FormState = { error?: string };

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readInput(formData: FormData): ClientInput {
  const rawValue = text(formData, "value").replace(/[^0-9.]/g, "");
  const value = Number(rawValue);
  const stage = text(formData, "stage");
  const source = text(formData, "source");
  return {
    name: text(formData, "name"),
    business: text(formData, "business"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    stage: isStage(stage) ? stage : "inquiry",
    services: formData.getAll("services").map(String),
    value: rawValue && Number.isFinite(value) && value > 0 ? Math.round(value) : null,
    source: isSource(source) ? source : "manual",
    nextStep: text(formData, "nextStep"),
    nextStepDue: text(formData, "nextStepDue"),
    notes: text(formData, "notes"),
  };
}

export async function parseInquiryAction(raw: string): Promise<ClientInput> {
  return parseInquiry(raw);
}

export async function createClientAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const input = readInput(formData);
  if (!input.name && !input.business) {
    return { error: "Give them a name or a business name so you can find them again." };
  }
  // Start them off with the stage's suggested move so the card says
  // something useful straight away
  if (!input.nextStep && input.stage) {
    input.nextStep = stageInfo(input.stage).nextStep;
  }
  const record = createClient(input);
  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${record.slug}`);
}

export async function updateClientAction(formData: FormData) {
  const slug = text(formData, "slug");
  updateClient(slug, readInput(formData));
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${slug}`);
}

export async function setStageAction(formData: FormData) {
  const slug = text(formData, "slug");
  const stage = text(formData, "stage");
  const current = getClient(slug);
  if (!current || !isStage(stage) || stage === current.stage) return;

  // Carry the new stage's suggested next step over, but never clobber
  // something Sebastian typed himself
  const wasAuto =
    !current.nextStep || current.nextStep === stageInfo(current.stage).nextStep;
  updateClient(slug, {
    stage,
    nextStep: wasAuto ? stageInfo(stage).nextStep : current.nextStep,
  });
  appendTimeline(slug, `Moved to ${stageInfo(stage).label.toLowerCase()}`);

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${slug}`);
}

export async function addTimelineAction(formData: FormData) {
  const slug = text(formData, "slug");
  const title = text(formData, "title");
  if (!title) return;
  appendTimeline(slug, title, text(formData, "note"));
  revalidatePath("/");
  revalidatePath(`/clients/${slug}`);
}

export async function deleteClientAction(formData: FormData) {
  const slug = text(formData, "slug");
  deleteClient(slug);
  revalidatePath("/");
  revalidatePath("/clients");
  redirect("/clients");
}
