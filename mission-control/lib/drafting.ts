import { z } from "zod";
import { ask, forget, type Asked } from "./claude";
import { fillEmail, type EmailTemplate } from "./emails";
import { siteInfo } from "./site";
import { listServices, serviceTitles } from "./services";
import { stageInfo } from "./stages";
import type { ClientRecord } from "./clients";

/**
 * Drafting a client email from the record, instead of filling the
 * writing prompts by hand.
 *
 * This uses the API path (lib/claude.ts), not the headless `claude -p`
 * runner in lib/agent-run.ts, and the difference is deliberate. That
 * runner exists for work that needs tools: find-leads browses the web,
 * generate-image drives Flow. Runs take minutes and report through a
 * log file, which is right for those and wrong for this. Drafting an
 * email needs no tools at all; everything it can honestly use is
 * already on disk in the record. So it is one request, a few seconds,
 * and a structured answer, rather than a background job with a progress
 * panel. The cost is cents per draft against the metered key rather
 * than nothing against the subscription, and at a handful of emails a
 * month that is worth paying for the latency alone.
 */

const DraftSchema = z.object({
  subject: z.string(),
  body: z.string(),
  /**
   * Anything it refused to make up. The composer already blocks sending
   * while a {{...}} remains, so leaving one is the safe move and this
   * says what Sebastian needs to supply.
   */
  leftBlank: z.array(
    z.object({
      placeholder: z.string(),
      missing: z.string(),
    }),
  ),
});

export type Draft = z.infer<typeof DraftSchema>;

/**
 * The rules, in rough order of how much damage breaking them does.
 *
 * Rule 1 is the whole thing. These emails go to real businesses who can
 * check what they say, and the research that feeds them was wrong twice
 * in one afternoon when it was assembled from a search index instead of
 * a look at the actual site. An invented detail in a first email is
 * worse than never writing.
 */
const DRAFT_VOICE = `You are drafting an email for Sebastian Inman to send. He runs a
one-person automation and web consultancy in Southern Oregon. He will
read every word before it goes anywhere, and he will notice if you make
something up.

THE RULES

1. Invent nothing. Every fact, observation, date, price and name in the
   draft must come from the record you are given. If the record does not
   say when the consult happened, you do not know when the consult
   happened. No plausible filler, no "as we discussed", no details about
   their business that are not written down in front of you.

2. If a writing prompt needs something the record does not contain,
   LEAVE THE {{PLACEHOLDER}} EXACTLY AS IT IS and list it in leftBlank.
   The app refuses to send while any placeholder remains, so leaving one
   costs nothing and guessing could cost a client. This is the correct
   move, not a failure.

3. When the record has an "Opening line", use it. It was written after
   somebody opened that business's website and checked what it said, and
   it is the sentence that proves a person looked. Reword it only enough
   to fit the sentence around it. Never replace it with a better-sounding
   observation you thought of yourself; you have not seen their website.

4. Keep the template's shape: same order, same sign-off, roughly the same
   length. These are short on purpose. Do not add a contact block at the
   end; a signature is appended automatically.

HOW HE WRITES

Plain language to a busy person who runs a business well and does not
work in tech. No jargon, and no explaining that you are avoiding jargon.
No em dashes anywhere. Contractions are good. First person, warm, direct.

Never condescend about what they currently have. A dated website is not
a failing and must not be written as one. Do not compare them to bigger
companies or mention competitors at all. Frame problems as things you
noticed, not things they got wrong, and say plainly when something is
free to fix or not worth paying for. Saying that is on brand; it is not
a missed sale.

Never tell a local business where Sebastian is based. They are in
Southern Oregon too, so "I'm Sebastian, based in Southern Oregon" is
news to nobody and announces that the sentence was written for a list
rather than for them. Being local shows in knowing something true about
their business, which the opening line already does.

Nothing you write should be a sentence that would read identically in
an email to a different business. If a line survives swapping the
business name out, it is filler: cut it or make it specific.

Never describe what something costs in vague words. "Not much", "cheap"
and "affordable" set an expectation the real figure has to survive, and
the starting prices are in the record. Either name the real starting
figure or say nothing about price at all. Offering to tell them the
number later is fine; promising in advance that they will like it is
not.`;

/** Everything about this client that could honestly inform an email */
function recordContext(client: ClientRecord): string {
  const stage = stageInfo(client.stage);
  const lines: string[] = [
    `Business: ${client.business || "(not recorded)"}`,
    client.name ? `Contact name: ${client.name}` : `Contact name: (none recorded, do not invent one)`,
    `Town: ${client.city || "(not recorded)"}`,
    client.address ? `Address: ${client.address}` : "",
    `Stage: ${stage.label} (${stage.nextStep || "no set next step"})`,
    `How they came to us: ${client.source}`,
    client.website ? `Their website: ${client.website}` : "They have no website on file.",
    client.platform ? `Site platform: ${client.platform}` : "",
    client.stack.length ? `Tools on their site: ${client.stack.join(", ")}` : "",
    client.services.length
      ? `What they might need: ${serviceTitles(client.services)
          .map((t) => {
            const match = listServices().find((s) => s.title === t);
            return match ? `${t} (from $${match.startingPrice})` : t;
          })
          .join(", ")}`
      : "",
    client.value ? `Agreed or quoted price: $${client.value.toLocaleString("en-US")}` : "No price agreed yet.",
    client.fit ? `Research rated the fit: ${client.fit}` : "",
  ].filter(Boolean);

  const timeline = client.timeline
    .map((e) => `- ${e.date}: ${e.title}${e.note ? `\n  ${e.note}` : ""}`)
    .join("\n");

  return [
    "## The record",
    lines.join("\n"),
    "",
    "## Notes on file",
    client.notes.trim() || "(nothing written)",
    "",
    "## What has happened so far",
    timeline || "(nothing yet)",
  ].join("\n");
}

/**
 * Draft one email.
 *
 * `attempt` exists only to get a different answer out of the cache in
 * lib/claude.ts, which is content-addressed on the prompt. Bumping it
 * is how "draft me another one" works.
 */
export async function draftEmail(options: {
  client: ClientRecord;
  template: EmailTemplate;
  attempt?: number;
}): Promise<Asked<Draft>> {
  const { client, template } = options;
  const site = siteInfo();

  // Start from the mechanically filled version, so the model is only
  // ever writing the writing prompts and cannot mangle a booking link
  // or a price that lib/emails.ts already resolved correctly.
  const filled = fillEmail(template, client);

  const prompt = [
    `Draft email number ${template.id}, "${template.title}", for this client.`,
    "",
    template.notes ? `What this template says about itself:\n${template.notes}\n` : "",
    "## The template, with the mechanical facts already filled in",
    "Anything still in {{double braces}} is a writing prompt for you.",
    "",
    `Subject: ${filled.subject}`,
    "",
    filled.body,
    "",
    recordContext(client),
    "",
    "## Facts you may use",
    `Sebastian's phone: ${site.phone}`,
    `His booking link: ${site.bookingUrl}`,
    "",
    options.attempt && options.attempt > 1
      ? `This is redraft number ${options.attempt}. Take a genuinely different angle on the writing prompts rather than rephrasing the last attempt.`
      : "",
    "Return the finished subject and body, plus anything you deliberately left as a placeholder.",
  ]
    .filter(Boolean)
    .join("\n");

  return ask({
    kind: `draft-${client.slug}-${template.id}-${options.attempt ?? 1}`,
    system: DRAFT_VOICE,
    prompt,
    schema: DraftSchema,
  });
}

/** Drop every cached draft for one client, so the next one is fresh */
export function forgetDrafts(slug: string) {
  forget(`draft-${slug}`);
}
