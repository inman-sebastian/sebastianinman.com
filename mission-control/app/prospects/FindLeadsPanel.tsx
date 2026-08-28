"use client";

import { useActionState, useEffect, useState } from "react";
import { startResearchAction, type ResearchState } from "./research-actions";
import type { Job } from "@/lib/agent-run";

/**
 * Running the find-leads skill from here rather than from a chat.
 *
 * Same arrangement as the illustration button: it shells out to the
 * skill, streams what it is doing, and takes minutes. It writes records
 * and nothing else; it cannot contact anybody or touch git.
 */
export function FindLeadsPanel({ initialJob }: { initialJob: Job }) {
  const [state, formAction, pending] = useActionState(startResearchAction, {});
  const [job, setJob] = useState<Job>(initialJob);

  useEffect(() => {
    if (state.message) {
      setJob({
        state: "running",
        startedAt: "",
        elapsed: 0,
        log: "",
        summary: "",
        costUsd: null,
        denials: [],
        problem: "",
      });
    }
  }, [state.message]);

  useEffect(() => {
    if (job.state !== "running") return;
    const timer = setInterval(async () => {
      const next = await fetch("/prospects/job", { cache: "no-store" })
        .then((r) => r.json() as Promise<Job>)
        .catch(() => null);
      if (next) setJob(next);
      if (next && next.state !== "running") window.location.reload();
    }, 4000);
    return () => clearInterval(timer);
  }, [job.state]);

  const mins = Math.floor(job.elapsed / 60);
  const secs = job.elapsed % 60;

  return (
    <section className="card p-5">
      <h2 className="font-serif text-lg font-semibold text-pine-dark">
        Find more
      </h2>

      <form action={formAction} className="mt-3 space-y-3">
        <div>
          <label className="label" htmlFor="brief">
            What to look for
          </label>
          <input
            id="brief"
            name="brief"
            className="field"
            placeholder="salons in Ashland, or leave blank for the usual targeting"
          />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={pending || job.state === "running"}
        >
          {job.state === "running" ? "Researching..." : "Find leads"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {state.error}
        </p>
      )}

      {job.state !== "none" && (
        <div
          className={`mt-3 rounded-lg px-4 py-3 text-sm ${
            job.state === "failed"
              ? "bg-terracotta-tint text-terracotta-dark"
              : "bg-pine-tint text-pine-dark"
          }`}
        >
          <p className="font-semibold">
            {job.state === "running" &&
              `Looking... ${mins}m ${secs}s so far.`}
            {job.state === "done" && "Finished."}
            {job.state === "failed" && "That run did not finish."}
          </p>
          {job.summary && (
            <p className="mt-1 whitespace-pre-wrap">{job.summary}</p>
          )}
          {job.problem && (
            <p className="mt-2 rounded bg-terracotta-tint px-3 py-2 text-terracotta-dark">
              {job.problem}
            </p>
          )}
          {job.log && (
            <details className="mt-2" open={job.state === "running"}>
              <summary className="cursor-pointer text-xs">
                {job.state === "running" ? "What it's doing" : "What it did"}
              </summary>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-xs">
                {job.log}
              </pre>
            </details>
          )}
          {job.costUsd !== null && job.state !== "running" && (
            <p className="mt-2 text-xs opacity-80">
              Covered by your Claude subscription. At API rates this run would
              have been ${job.costUsd.toFixed(2)}.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
