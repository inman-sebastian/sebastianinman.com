"use client";

import { useTransition } from "react";
import { refreshBriefingAction } from "./insight-actions";

/** Ask again over the same facts, for when the answer was not useful */
export function RefreshBriefing() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="ml-auto font-semibold text-pine hover:underline disabled:opacity-50"
      disabled={pending}
      onClick={() => start(async () => { await refreshBriefingAction(); })}
    >
      {pending ? "Asking..." : "Ask again"}
    </button>
  );
}
