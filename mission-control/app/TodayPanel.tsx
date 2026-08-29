import { claudeReady } from "@/lib/claude";
import { listClients } from "@/lib/clients";
import { recordTasks } from "@/lib/tasks";
import { TaskList } from "./TaskList";
import { SuggestedTasks } from "./SuggestedTasks";

/**
 * One list of jobs, from wherever they came from.
 *
 * The record's own due steps, anything gone quiet, and Claude's
 * suggestions used to be three cards asking similar questions. It is one
 * checklist now, because the question is always the same.
 *
 * This component is entirely synchronous, which is the whole point.
 * Ticking a task writes to a record and revalidates this page, and a
 * server action's response waits for that render to finish. With the
 * briefing awaited here, every tick cost sixteen seconds before it
 * showed. The suggestions load in the browser instead.
 */
export function TodayPanel() {
  const mine = recordTasks(listClients());

  return (
    <section className="card overflow-hidden">
      <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Today{mine.length > 0 ? ` · ${mine.length}` : ""}
      </p>

      {mine.length > 0 && <TaskList tasks={mine} />}

      {claudeReady() ? (
        <SuggestedTasks hasOwn={mine.length > 0} />
      ) : (
        mine.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted">
            Nothing due and nothing gone quiet. Genuinely clear.
          </p>
        )
      )}
    </section>
  );
}
