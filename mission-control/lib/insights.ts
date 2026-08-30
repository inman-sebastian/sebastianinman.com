import { z } from "zod";
import { ask, type Asked } from "./claude";
import { displayName, listClients, listResearched, type ClientRecord } from "./clients";
import { estimatedWorth, serviceTitles } from "./services";
import { money } from "./format";
import { stageInfo } from "./stages";

/**
 * The two things Claude is asked about this business.
 *
 * Both are judgement over free text: what somebody wrote in a note, what
 * a timeline says happened, what the research actually found. Anything a
 * rule can answer stays a rule. The dashboard already counts, sorts and
 * flags overdue by itself, and none of that belongs here.
 *
 * The hard requirement on both prompts is permission to say nothing.
 * An assistant that must produce three insights a day will invent three
 * insights a day, and the invented ones cost more attention than they
 * are worth.
 */

/** One record, flattened to the facts worth reasoning over */
function describe(c: ClientRecord): string {
  const lines = [
    `## ${displayName(c)} (slug: ${c.slug})`,
    `Stage: ${stageInfo(c.stage).label}. Last touched ${c.updated}. Added ${c.created}.`,
    c.category || c.city ? `${[c.category, c.city].filter(Boolean).join(", ")}.` : "",
    c.services.length ? `Would need: ${serviceTitles(c.services).join(", ")}.` : "",
    c.value ? `Quoted ${money(c.value)}.` : "",
    c.website ? `Website: ${c.website}` : "No website of their own.",
    c.platform ? `Their site runs on ${c.platform}.` : "",
    c.fit ? `Research rated the fit: ${c.fit}.` : "",
    c.nextStep ? `Next step on file: ${c.nextStep}${c.nextStepDue ? ` (due ${c.nextStepDue})` : ""}.` : "",
    c.notes ? `\nNotes:\n${c.notes.trim()}` : "",
    c.timeline.length
      ? `\nWhat has happened:\n${c.timeline.map((t) => `- ${t.date}: ${t.title}${t.note ? ` (${t.note.replace(/\s+/g, " ").slice(0, 200)})` : ""}`).join("\n")}`
      : "",
  ];
  return lines.filter(Boolean).join("\n");
}

const VOICE = `You are helping Sebastian Inman, who runs a one-person automation and
web consultancy in Southern Oregon. He is the only person who reads this.

Write the way he writes: plain language, no jargon, no em dashes, no
corporate throat-clearing. Say "you", not "the user". Never pad.

The single most important rule: you are allowed, and expected, to say
there is nothing worth flagging. An empty answer is a good answer when
the situation is genuinely quiet. Do not manufacture observations to
fill space, do not restate numbers he can already see on the dashboard,
and do not give generic business advice. Every point you make must be
traceable to something specific in what you were given.`;

const BriefingSchema = z.object({
  summary: z
    .string()
    .describe(
      "One or two sentences on where things actually stand. Empty string if there is genuinely nothing worth saying."
    ),
  actions: z
    .array(
      z.object({
        slug: z
          .string()
          .describe("The slug of the client this concerns, or empty if it is not about one record."),
        title: z.string().describe("The concrete thing to do, as a short imperative."),
        why: z
          .string()
          .describe("One sentence, citing the specific thing in the record that prompts it."),
      })
    )
    .describe(
      "At most three, in the order you would actually do them, most worth doing first. Fewer is better. Empty when nothing needs doing."
    ),
});

export type Briefing = z.infer<typeof BriefingSchema>;

export async function briefing(input: {
  outstanding: number;
  overdue: number;
  visitors: number;
}): Promise<Asked<Briefing>> {
  const clients = listClients();
  const active = clients.filter((c) => c.stage !== "lost" && c.stage !== "done");

  const prompt = [
    `Today is ${new Date().toISOString().slice(0, 10)}.`,
    ``,
    `Money: ${money(input.outstanding) || "$0"} outstanding, ${money(input.overdue) || "$0"} overdue.`,
    `Website: ${input.visitors} visitors in the last seven days.`,
    ``,
    `There are ${active.length} records that are not closed:`,
    ``,
    active.map(describe).join("\n\n"),
    ``,
    `What, if anything, should he do today? At most three things, and`,
    `only things that are actually worth his time. If the honest answer`,
    `is that nothing needs doing, say so and return no actions.`,
  ].join("\n");

  // Pinned to nothing that moves on its own, which is the point.
  //
  // Content addressing rewrote the list every time a record changed,
  // and acting on the list is what changes records. Pinning to the date
  // fixed that but threw away anything not finished by midnight.
  // Neither is what a to-do list does: unfinished work rolls over.
  //
  // So it holds until the list is actually finished, and the route asks
  // for a new one once everything on it has been ticked. "Ask again" is
  // the other way out.
  return ask({
    kind: "briefing",
    system: VOICE,
    prompt,
    schema: BriefingSchema,
    cacheKey: "briefing-current",
  });
}

const RankingSchema = z.object({
  ranked: z
    .array(
      z.object({
        slug: z.string().describe("The slug of the researched business."),
        why: z
          .string()
          .describe(
            "One sentence on why they sit here, citing what the research actually found about them."
          ),
      })
    )
    .describe("Every business given, best prospect first."),
  skip: z
    .array(
      z.object({
        slug: z.string(),
        why: z.string().describe("One sentence on why this one is not worth pursuing."),
      })
    )
    .describe("Any that look like a waste of time. Usually empty."),
});

export type Ranking = z.infer<typeof RankingSchema>;

export async function rankResearch(): Promise<Asked<Ranking> | null> {
  const waiting = listResearched();
  if (waiting.length < 2) return null;

  const prompt = [
    `Here are ${waiting.length} businesses the research turned up. Nobody`,
    `has contacted any of them.`,
    ``,
    waiting
      .map(
        (r) =>
          `${describe(r)}\nRoughly worth: ${money(estimatedWorth(r.services)) || "unknown"} at starting prices.`
      )
      .join("\n\n"),
    ``,
    `Order them by who is most likely to say yes to a first email, and`,
    `say why in one sentence each, citing what the research actually`,
    `found. Judge on evidence of a real problem he can fix, not on how`,
    `big the business looks. Put anyone not worth the effort in "skip"`,
    `instead, and leave that empty if they are all worth a try.`,
  ].join("\n");

  return ask({ kind: "ranking", system: VOICE, prompt, schema: RankingSchema });
}
