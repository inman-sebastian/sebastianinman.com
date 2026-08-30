import crypto from "node:crypto";
import {
  daysSinceTouched,
  displayName,
  goneQuiet,
  needsAttention,
  type ClientRecord,
} from "./clients";
import { shortDate } from "./format";
import { stageInfo, type Stage } from "./stages";

/**
 * Everything worth doing today, as one list.
 *
 * Three sources feed it and they are deliberately not shown as three
 * lists: a next step that is due, a record that has gone quiet, and
 * whatever Claude suggested. What matters is the job, not which system
 * noticed it.
 *
 * Every task belongs to a record, because ticking one has to write
 * somewhere. An item with nowhere to record itself is a note, not a
 * task, and does not appear here.
 */

export type Task = {
  /** Stable across renders so React and the checkbox agree */
  id: string;
  slug: string;
  who: string;
  label: string;
  detail: string;
  /** "" when nothing is scheduled */
  when: string;
  urgent: boolean;
  /** Claude proposed this rather than the record asking for it */
  suggested: boolean;
  /** Ticked off today: still shown, struck through, not actionable */
  done?: boolean;
  /**
   * Where the record lands when this is ticked, or null to stay put.
   * Only ever set for a record's own next step: Claude suggesting
   * something does not mean finishing it moved anybody.
   */
  advancesTo: Stage | null;
};

/** The record's own next step, when it is the stage's default one */
function isStageDefault(c: ClientRecord): boolean {
  return c.nextStep === stageInfo(c.stage).nextStep;
}

export function recordTasks(clients: ClientRecord[]): Task[] {
  const due = needsAttention(clients).map((c) => ({
    id: `due-${c.slug}`,
    slug: c.slug,
    who: displayName(c),
    label: c.nextStep || "Decide what happens next here",
    detail: "",
    when: c.nextStepDue ? `due ${shortDate(c.nextStepDue)}` : "no date set",
    urgent: true,
    suggested: false,
    // Only the stage's own step carries a meaning for the stage. A note
    // somebody typed into the next-step box means whatever they meant.
    advancesTo: isStageDefault(c) ? stageInfo(c.stage).advancesTo : null,
  }));

  const quiet = goneQuiet(clients).map((c) => ({
    id: `quiet-${c.slug}`,
    slug: c.slug,
    who: displayName(c),
    label: c.nextStep || "Pick this back up or let it go",
    detail: "Nothing has happened here in a while.",
    when: `${daysSinceTouched(c)} days quiet`,
    urgent: false,
    suggested: false,
    advancesTo: isStageDefault(c) ? stageInfo(c.stage).advancesTo : null,
  }));

  return [...due, ...quiet];
}

function shortHash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 8);
}

/** Claude's suggestions, folded in beside the rest */
export function suggestedTasks(
  actions: { slug: string; title: string; why: string }[],
  clients: ClientRecord[]
): Task[] {
  return actions
    .map((a): Task | null => {
      const client = clients.find((c) => c.slug === a.slug);
      if (!client) return null;
      return {
        // Keyed by what it says, not where it sat in the list. An index
        // makes the id move when the order does, and worse, lets a
        // brand new suggestion inherit the id of one already ticked
        // and arrive pre-completed.
        id: `claude-${a.slug}-${shortHash(a.title)}`,
        slug: a.slug,
        who: displayName(client),
        label: a.title,
        detail: a.why,
        when: "",
        urgent: false,
        suggested: true,
        advancesTo: null,
      };
    })
    .filter((t): t is Task => t !== null);
}

/**
 * One list, with anything already on the record ahead of anything
 * merely suggested. A thing Sebastian wrote down himself outranks a
 * thing that was proposed to him.
 */
export function allTasks(record: Task[], suggested: Task[]): Task[] {
  const already = new Set(record.map((t) => t.slug));
  return [
    ...record,
    // A suggestion about a record already on the list would be the same
    // job described twice
    ...suggested.filter((t) => !already.has(t.slug)),
  ];
}
