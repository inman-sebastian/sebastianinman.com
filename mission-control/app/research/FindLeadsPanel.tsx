"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { clearResearchJobAction, startResearchAction } from "./actions";
import type { Job } from "@/lib/agent-run";

/**
 * Running the find-leads skill from here rather than from a chat.
 *
 * Same arrangement as the illustration button: it shells out to the
 * skill, streams what it is doing, and takes minutes. It writes records
 * and nothing else; it cannot contact anybody or touch git.
 *
 * A finished run is reported for the rest of this page view and then
 * thrown away, because what a run produced is the queue below it, not
 * the write-up. The report is long by nature (the skill is asked to say
 * what it looked at and why), so it lives folded up rather than spread
 * across the top of the page.
 */
export function FindLeadsPanel({
  initialJob,
  waiting,
}: {
  initialJob: Job;
  /** How many researched records are in the queue right now */
  waiting: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(startResearchAction, {});
  const [job, setJob] = useState<Job>(initialJob);
  const cleared = useRef(false);

  useEffect(() => {
    if (state.message) {
      cleared.current = false;
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
      const next = await fetch("/research/job", { cache: "no-store" })
        .then((r) => r.json() as Promise<Job>)
        .catch(() => null);
      if (!next) return;
      setJob(next);
      // The whole point of the notification: a research run takes
      // minutes, so it is meant to be left alone. notify() stays quiet
      // when this window is in front, where the panel already says so.
      if (next.state !== "running") {
        void notify(
          next.state === "failed"
            ? "Lead research failed"
            : "Lead research finished",
          {
            body:
              next.state === "failed"
                ? "Open Research to see what went wrong."
                : next.summary || "Open Research to review what it found.",
            url: "/research",
          }
        );
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [job.state]);

  // A run that is over gets shown once and then thrown away, whether it
  // finished while this page was open or hours ago with nobody looking.
  // The result is already in React state by this point, so the files are
  // spent. Note this refreshes and never reloads: a reload would throw
  // away the very state we are keeping, leaving nothing to show.
  useEffect(() => {
    if (job.state !== "done" && job.state !== "failed") return;
    if (cleared.current) return;
    cleared.current = true;
    clearResearchJobAction().then(() => router.refresh());
  }, [job.state, router]);

  const mins = Math.floor(job.elapsed / 60);
  const secs = job.elapsed % 60;
  const failed = job.state === "failed";

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
            failed
              ? "bg-terracotta-tint text-terracotta-dark"
              : "bg-pine-tint text-pine-dark"
          }`}
        >
          <p className="font-semibold">
            {job.state === "running" && `Looking... ${mins}m ${secs}s so far.`}
            {job.state === "done" &&
              `Finished in ${mins}m ${secs}s. ${waiting} waiting to review below.`}
            {failed && "That run did not finish."}
          </p>

          {job.problem && (
            <p className="mt-2 rounded bg-terracotta-tint px-3 py-2 text-terracotta-dark">
              {job.problem}
            </p>
          )}

          {/* While it runs, the live trace is the whole point, so it is
              open. Once it is over, both the report and the trace fold
              away: the queue below is the answer. */}
          {job.state === "running" ? (
            job.log && (
              <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs">
                {job.log}
              </pre>
            )
          ) : (
            <>
              {job.summary && (
                <Fold label="What it found" tone={failed}>
                  {job.summary}
                </Fold>
              )}
              {job.log && (
                <Fold label="What it did" tone={failed}>
                  {job.log}
                </Fold>
              )}
            </>
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

/** A collapsed, bounded, scrollable block of run output */
function Fold({
  label,
  tone,
  children,
}: {
  label: string;
  /** True when this sits on the failure background */
  tone: boolean;
  children: string;
}) {
  return (
    <details className="mt-2">
      <summary
        className={`cursor-pointer text-xs font-semibold ${
          tone ? "text-terracotta-dark" : "text-pine-dark"
        }`}
      >
        {label}
      </summary>
      <pre
        className={`mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded border px-3 py-2 text-xs ${
          tone ? "border-terracotta/30" : "border-pine/15"
        }`}
      >
        {children}
      </pre>
    </details>
  );
}
