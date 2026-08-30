"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { completeTaskAction, type TaskState } from "./task-actions";
import type { Task } from "@/lib/tasks";

/**
 * The checklist.
 *
 * A tick writes to the record rather than just hiding a row, so the
 * checkbox says up front what it is about to do. Nothing here is a
 * surprise and nothing here contacts anybody.
 */
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="divide-y divide-line">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [state, act, pending] = useActionState<TaskState, FormData>(
    completeTaskAction,
    {}
  );
  // Ticked stays ticked while the server catches up, so the box does not
  // spring back under the cursor
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    if (state.error) setTicked(false);
  }, [state.error]);

  // Either just ticked in this session, or ticked earlier and read
  // back from disk. Same row either way.
  if (state.done || task.done) {
    return (
      <li className="flex items-baseline gap-3 px-4 py-2.5 text-sm">
        <span
          aria-hidden
          className="flex size-4 shrink-0 translate-y-0.5 items-center justify-center rounded border border-pine bg-pine text-[10px] font-bold text-background"
        >
          ✓
        </span>
        <span className="text-muted line-through">{task.label}</span>
        <span className="text-xs text-muted">{task.who}</span>
        {state.moved && (
          <span className="ml-auto text-xs font-semibold text-pine">
            moved to {state.moved}
          </span>
        )}
      </li>
    );
  }

  return (
    <li className="px-4 py-2.5">
      <form action={act} className="flex gap-3">
        <input type="hidden" name="slug" value={task.slug} />
        <input type="hidden" name="label" value={task.label} />
        <input type="hidden" name="advancesTo" value={task.advancesTo ?? ""} />
        {/* Every task, not just suggestions. Ticked items stay on the
            list struck through, and a finished record task has nothing
            left to rebuild itself from once the record has moved. */}
        <input type="hidden" name="taskId" value={task.id} />
        <button
          type="submit"
          disabled={pending || ticked}
          onClick={() => setTicked(true)}
          aria-label={`Tick off: ${task.label}`}
          className={`mt-0.5 size-4 shrink-0 rounded border transition ${
            ticked
              ? "border-pine bg-pine"
              : "border-muted/50 bg-surface hover:border-pine"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-semibold text-pine-dark">
              {task.label}
            </span>
            {task.suggested && (
              <span className="text-xs text-muted">suggested</span>
            )}
            {task.when && (
              <span
                className={`ml-auto text-xs ${
                  task.urgent ? "text-terracotta-dark" : "text-muted"
                }`}
              >
                {task.when}
              </span>
            )}
          </span>
          {task.detail && (
            <span className="mt-0.5 block text-sm leading-relaxed text-muted">
              {task.detail}
            </span>
          )}
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <Link
              href={`/clients/${task.slug}`}
              className="font-semibold text-pine hover:underline"
            >
              {task.who}
            </Link>
            {/* Say what the tick will do before it does it */}
            {task.advancesTo && <span>ticking moves them on</span>}
          </span>
          {state.error && (
            <span className="mt-1 block text-xs text-terracotta-dark">
              {state.error}
            </span>
          )}
        </span>
      </form>
    </li>
  );
}
