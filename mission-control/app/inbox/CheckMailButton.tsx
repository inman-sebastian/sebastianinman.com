"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkInboxAction, type CheckState } from "./actions";

/**
 * The on-demand pull across every connected channel. Same shape as the
 * rest of the app: a button, a server action, then a refresh. The
 * dashboard's auto-check covers "it's just there when I open it," and this
 * covers "check now."
 */
export function CheckMailButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<CheckState | null>(null);

  function summary(r: CheckState): string {
    const total = (r.matched ?? 0) + (r.unmatched ?? 0);
    if (total === 0) return "No new mail.";
    const parts: string[] = [];
    if (r.matched) parts.push(`${r.matched} matched to a client`);
    if (r.unmatched) parts.push(`${r.unmatched} to sort`);
    return `Pulled ${total} new: ${parts.join(", ")}.`;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="btn"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await checkInboxAction();
            setResult(r);
            router.refresh();
          })
        }
      >
        {pending ? "Checking..." : "Check now"}
      </button>
      {result?.error && (
        <p className="rounded-lg bg-terracotta-tint px-3 py-2 text-sm text-terracotta-dark">
          {result.error}
        </p>
      )}
      {result && !result.error && !result.skipped && (
        <p className="text-sm text-muted">{summary(result)}</p>
      )}
    </div>
  );
}
