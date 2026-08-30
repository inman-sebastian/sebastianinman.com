import { z } from "zod";
import { ask, forget, type Asked } from "./claude";
import { fillEmail, type EmailTemplate } from "./emails";
import { siteInfo, voiceGuide } from "./site";
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

His voice guide is included below, verbatim. It governs this email the
same as it governs the website. Read it before you write.

WHAT MUST BE TRUE

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

4. Keep the template's order and its sign-off, and do not add a contact
   block at the end; a signature is appended automatically.

HOW IT SHOULD FEEL

This is a note from one person to another, not a summary of findings.
A stranger is about to read it while doing six other things, and the
only question that matters is whether he comes across as someone worth
replying to.

Be warm first and useful second. Every observation about a gap needs
something human around it, or the whole thing reads as a list of what
is wrong with them, which is a horrible thing to receive from someone
you have never met. Say the good things the record actually records:
the five-star reviews, the award, the thirty years in the same shop,
the fact that people plainly love the place. Those are verified facts
sitting in the notes and they belong in the email.

Do not be terse. Short is not the goal and clipped is not a style. Full
sentences, ordinary connective words, the small courtesies a person
uses when writing to someone they have not met. A sentence that exists
to be friendly is doing a job.

Never write a low-pressure line that lands as a shrug. "You have been
doing fine without one" and "you clearly do not need this" are meant to
relieve pressure and instead read as dismissive, or worse, as sarcasm.
Make the easy exit generous rather than resigned: he would be glad to
help, and equally glad if they are sorted already.

Nothing you write should make a CLAIM that would be identically true of
another business. That rule is about substance, not about courtesy: it
is there to stop generic flattery and boilerplate pitches, not to strip
out the ordinary human phrasing that makes an email readable.

On price, in a first email to someone who has not asked: say nothing
about cost at all. Offering to tell them later is fine. Naming a
starting figure unprompted, in the same breath as pointing out a
problem, reads as a quote for work nobody agreed to. If the record
shows they have asked, or a price is already agreed, use the real
figure and never a vague word like "cheap" or "not much".

Never tell a local business where Sebastian is based. They are in
Southern Oregon too, so "I'm Sebastian, based in Southern Oregon" is
news to nobody and announces that the sentence was written for a list
rather than for them. Being local shows in knowing something true about
their business, which the opening line already does.

THE VOICE GUIDE

`;

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
    // The guide is appended rather than baked in, so an edit to
    // CLAUDE.md reaches this on the next draft. It is also part of the
    // cache key, which is what we want: change the voice, get new
    // drafts rather than yesterday's.
    system: `${DRAFT_VOICE}${voiceGuide()}`,
    prompt,
    schema: DraftSchema,
  });
}

/** Drop every cached draft for one client, so the next one is fresh */
export function forgetDrafts(slug: string) {
  forget(`draft-${slug}`);
}
