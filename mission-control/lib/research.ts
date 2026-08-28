import { startRun } from "./agent-run";

/**
 * The find-leads button, on top of the generic runner.
 *
 * The skill does the actual work: searching for real businesses,
 * checking them against observable signals, and writing them up. This
 * only starts it, and hands it the two rules that matter most from a
 * button: do not add anybody already on file, and do not contact
 * anybody.
 */

/** Research reads the web and writes records. It has no business
    touching git, sending anything, or editing the website. */
const ALLOWED_TOOLS = [
  "WebSearch",
  "WebFetch",
  "Read",
  "Glob",
  "Grep",
  "Write",
  "Edit",
  "Bash(node mission-control/scripts/known-businesses.mjs:*)",
  "Bash(node mission-control/scripts/detect-stack.mjs:*)",
].join(",");

/** One research run at a time */
export const RESEARCH_JOB = "find-leads";

export function startResearch(brief: string): string | null {
  return startRun({
    key: RESEARCH_JOB,
    allowedTools: ALLOWED_TOOLS,
    maxTurns: 160,
    instruction: [
      `/find-leads ${brief.trim() || "Use the default targeting in the skill."}`,
      `Write each qualified business as a client record in mission-control/data/clients/<slug>.md with stage: researched and source: outreach, following the skill's field list.`,
      // The two things a button must not be able to get wrong
      `BEFORE writing anything, run: node mission-control/scripts/known-businesses.mjs`,
      `and check every candidate with: node mission-control/scripts/known-businesses.mjs --check "Name One" "Name Two"`,
      `Anything it reports as KNOWN must be skipped, and anything it reports as MAYBE must be skipped unless you can show it is genuinely a different business.`,
      `Do NOT contact anybody, do NOT submit any form, and do NOT run git.`,
      `Finish by saying how many you looked at, how many you wrote, and which ones you skipped as already on file.`,
    ].join(" "),
  });
}
