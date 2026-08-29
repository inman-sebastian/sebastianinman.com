/**
 * The pipeline. These stages are the arc already written into
 * docs/clients/email-templates.md; keep the two in step. Every other
 * part of the app (board columns, filters, stage menus) reads this file.
 */

/**
 * `emailId` points at a numbered template in
 * docs/clients/email-templates.md; 0 means no template fits this stage
 * and whatever gets said should be a personal note.
 *
 * `advancesTo` is where finishing this stage's own next step leaves the
 * record, or null when finishing it moves nobody. Ticking "write the
 * first email" means they have been contacted; ticking "check back if
 * it has been a few days" means nothing has changed yet, because their
 * answer is the thing that moves them, not the chasing.
 */
export const STAGES = [
  {
    id: "researched",
    advancesTo: null,
    label: "Researched",
    blurb: "Turned up by research. You have not looked at it yet.",
    nextStep: "Decide whether they are worth pursuing",
    emailId: 0,
  },
  {
    id: "prospect",
    advancesTo: "contacted",
    label: "Prospect",
    blurb: "Worth pursuing. Nobody has said hello yet.",
    nextStep: "Write the first email",
    emailId: 6,
  },
  {
    id: "contacted",
    advancesTo: null,
    label: "Contacted",
    blurb: "First email sent. The ball is with them.",
    nextStep: "Give it a week, then let it go",
    emailId: 0,
  },
  {
    id: "inquiry",
    advancesTo: "consult",
    label: "Inquiry",
    blurb: "They reached out. Nothing scheduled yet.",
    nextStep: "Reply today and offer a time to talk",
    emailId: 1,
  },
  {
    id: "consult",
    advancesTo: "proposal",
    label: "Consult",
    blurb: "A call is on the calendar, or just happened.",
    nextStep: "Write up the proposal",
    emailId: 2,
  },
  {
    id: "proposal",
    advancesTo: null,
    label: "Proposal sent",
    blurb: "The quote is with them. Waiting on a yes or a no.",
    nextStep: "Check back if it has been a few days",
    emailId: 0,
  },
  {
    id: "agreement",
    advancesTo: "build",
    label: "Agreement & deposit",
    blurb: "They said go. Paperwork and the first invoice.",
    nextStep: "Send the agreement and the deposit invoice",
    emailId: 3,
  },
  {
    id: "build",
    advancesTo: null,
    label: "Building",
    blurb: "Work in progress.",
    nextStep: "Keep them posted as pieces land",
    emailId: 0,
  },
  {
    id: "delivered",
    advancesTo: "review",
    label: "Delivered",
    blurb: "Handed over and walked through.",
    nextStep: "Send the walkthrough note and the final invoice",
    emailId: 4,
  },
  {
    id: "review",
    advancesTo: "done",
    label: "Review ask",
    blurb: "About a week after delivery, once, if it went well.",
    nextStep: "Ask for a Google review",
    emailId: 5,
  },
  {
    id: "done",
    advancesTo: null,
    label: "Wrapped up",
    blurb: "Finished and paid.",
    nextStep: "",
    emailId: 0,
  },
  {
    id: "lost",
    advancesTo: null,
    label: "Not moving forward",
    blurb: "Went quiet, or it was not the right fit.",
    nextStep: "",
    emailId: 0,
  },
] as const;

export type Stage = (typeof STAGES)[number]["id"];

/**
 * Stages that still need something from Sebastian, in board order.
 *
 * `researched` is left off the board on purpose: those are a batch from
 * a research run that nobody has read yet, and they belong in the review
 * queue at /research rather than in the working pipeline. They join the
 * board the moment they are moved to `prospect`.
 */
export const ACTIVE_STAGES = STAGES.filter(
  (s) => s.id !== "done" && s.id !== "lost" && s.id !== "researched"
);

/** Found by research and not yet judged */
export const REVIEW_STAGE = "researched";

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

/**
 * The arc in four phases, for the places where a colour has to stand in
 * for a stage: the map's pins and its legend.
 *
 * Twelve colours would be a decoder ring, so stages that mean the same
 * thing at a glance share one. The order matches STAGES, and every stage
 * belongs to exactly one phase. Adding a stage above without placing it
 * here is a build error, not a quietly miscoloured pin.
 */
export const PHASES = [
  {
    id: "outreach",
    label: "Not contacted",
    colour: "#c05f33",
    stages: ["researched", "prospect", "contacted"],
  },
  {
    id: "talking",
    label: "In conversation",
    colour: "#b8862b",
    stages: ["inquiry", "consult", "proposal"],
  },
  {
    id: "working",
    label: "Working together",
    colour: "#234f3e",
    stages: ["agreement", "build", "delivered", "review"],
  },
  {
    id: "closed",
    label: "Closed",
    colour: "#9a9086",
    stages: ["done", "lost"],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  colour: string;
  stages: readonly Stage[];
}[];

export type Phase = (typeof PHASES)[number];

/** Empty only when every stage above sits in exactly one phase */
type Unplaced = Exclude<Stage, (typeof PHASES)[number]["stages"][number]>;
type MustBeEmpty<T extends never> = T;
export type _EveryStageHasAPhase = MustBeEmpty<Unplaced>;

export function phaseOf(stage: Stage): Phase {
  return (
    PHASES.find((p) => (p.stages as readonly Stage[]).includes(stage)) ??
    PHASES[0]
  );
}

export const SOURCES = [
  { id: "contact-form", label: "Contact form" },
  { id: "booking", label: "Cal.com booking" },
  { id: "referral", label: "Referral" },
  { id: "outreach", label: "Research" },
  { id: "manual", label: "Somewhere else" },
] as const;

/**
 * Records that came from research rather than from someone getting in
 * touch. They never asked to hear from Sebastian, which is why the app
 * refuses to send to them: Resend's acceptable use policy bans cold
 * outreach, and that account also carries the website's contact form and
 * every client email. Outreach gets drafted here and sent by hand.
 */
export const OUTREACH_SOURCE = "outreach";

export type Source = (typeof SOURCES)[number]["id"];

export function isSource(value: unknown): value is Source {
  return (
    typeof value === "string" && SOURCES.some((s) => s.id === value)
  );
}

export function sourceLabel(id: Source) {
  return SOURCES.find((s) => s.id === id)?.label ?? "Somewhere else";
}
