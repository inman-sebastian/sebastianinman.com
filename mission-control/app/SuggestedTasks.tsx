"use client";

import { useEffect, useState } from "react";
import { Markdown } from "@/components/Markdown";
import { TaskList } from "./TaskList";
import { RefreshBriefing } from "./RefreshBriefing";
import type { Task } from "@/lib/tasks";

type Payload = { summary: string; tasks: Task[]; footer: string };

/**
 * Claude's half of the checklist, loaded after the page is on screen.
 *
 * Kept off the server render on purpose: see app/briefing/route.ts. The
 * cost of that choice is this brief "asking" line, which is a fair trade
 * for a dashboard that always appears at once.
 */
export function SuggestedTasks({ hasOwn }: { hasOwn: boolean }) {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/briefing", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Payload) => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) setData({ summary: "", tasks: [], footer: "Could not reach Claude." });
      });
    return () => {
      live = false;
    };
  }, []);

  if (!data) {
    return (
      <p className={`px-4 py-3 text-sm text-muted ${hasOwn ? "border-t border-line" : ""}`}>
        Asking Claude what else is worth doing...
      </p>
    );
  }

  const empty = !data.summary && data.tasks.length === 0;
  if (empty && !hasOwn) {
    return (
      <>
        <p className="px-4 py-6 text-sm text-muted">
          Nothing due, nothing gone quiet, nothing worth flagging. Genuinely clear.
        </p>
        <Footer text={data.footer} />
      </>
    );
  }

  return (
    <>
      {data.summary && (
        <div className="border-t border-line bg-pine-tint/30 px-4 py-3 text-sm text-pine-dark">
          <Markdown>{data.summary}</Markdown>
        </div>
      )}
      {data.tasks.length > 0 && <TaskList tasks={data.tasks} />}
      <Footer text={data.footer} />
    </>
  );
}

function Footer({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 border-t border-line px-4 py-2 text-xs text-muted">
      <span>{text}</span>
      <RefreshBriefing />
    </p>
  );
}
