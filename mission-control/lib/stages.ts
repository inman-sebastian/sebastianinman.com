/**
 * The pipeline. These stages are the arc already written into
 * docs/clients/email-templates.md; keep the two in step. Every other
 * part of the app (board columns, filters, stage menus) reads this file.
 */

/** `emailId` points at a numbered template in
    docs/clients/email-templates.md; 0 means no template fits this stage
    and whatever gets said should be a personal note. */
export const STAGES = [
  {
    id: "inquiry",
    label: "Inquiry",
    blurb: "They reached out. Nothing scheduled yet.",
    nextStep: "Reply today and offer a time to talk",
    emailId: 1,
  },
  {
    id: "consult",
    label: "Consult",
    blurb: "A call is on the calendar, or just happened.",
    nextStep: "Write up the proposal",
    emailId: 2,
  },
  {
    id: "proposal",
    label: "Proposal sent",
    blurb: "The quote is with them. Waiting on a yes or a no.",
    nextStep: "Check back if it has been a few days",
    emailId: 0,
  },
  {
    id: "agreement",
    label: "Agreement & deposit",
    blurb: "They said go. Paperwork and the first invoice.",
    nextStep: "Send the agreement and the deposit invoice",
    emailId: 3,
  },
  {
    id: "build",
    label: "Building",
    blurb: "Work in progress.",
    nextStep: "Keep them posted as pieces land",
    emailId: 0,
  },
  {
    id: "delivered",
    label: "Delivered",
    blurb: "Handed over and walked through.",
    nextStep: "Send the walkthrough note and the final invoice",
    emailId: 4,
  },
  {
    id: "review",
    label: "Review ask",
    blurb: "About a week after delivery, once, if it went well.",
    nextStep: "Ask for a Google review",
    emailId: 5,
  },
  {
    id: "done",
    label: "Wrapped up",
    blurb: "Finished and paid.",
    nextStep: "",
    emailId: 0,
  },
  {
    id: "lost",
    label: "Not moving forward",
    blurb: "Went quiet, or it was not the right fit.",
    nextStep: "",
    emailId: 0,
  },
] as const;

export type Stage = (typeof STAGES)[number]["id"];

/** Stages that still need something from Sebastian, in board order */
export const ACTIVE_STAGES = STAGES.filter(
  (s) => s.id !== "done" && s.id !== "lost"
);

export const STAGE_IDS = STAGES.map((s) => s.id) as readonly Stage[];

export function isStage(value: unknown): value is Stage {
  return typeof value === "string" && STAGE_IDS.includes(value as Stage);
}

export function stageInfo(id: Stage) {
  return STAGES.find((s) => s.id === id) ?? STAGES[0];
}

/** Where a stage sits in the arc; used for sorting and progress */
export function stageIndex(id: Stage) {
  return STAGE_IDS.indexOf(id);
}

export const SOURCES = [
  { id: "contact-form", label: "Contact form" },
  { id: "booking", label: "Cal.com booking" },
  { id: "referral", label: "Referral" },
  { id: "manual", label: "Somewhere else" },
] as const;

export type Source = (typeof SOURCES)[number]["id"];

export function isSource(value: unknown): value is Source {
  return (
    typeof value === "string" && SOURCES.some((s) => s.id === value)
  );
}

export function sourceLabel(id: Source) {
  return SOURCES.find((s) => s.id === id)?.label ?? "Somewhere else";
}
