"use client";

import { useState, useTransition } from "react";
import { verifyEmailAction } from "@/app/verify-actions";
import type { Verdict } from "@/lib/hunter";

/**
 * "Will this address actually accept mail?", asked on purpose.
 *
 * Deliberately a button rather than something that happens by itself.
 * The free plan allows 100 checks a month, and an automatic check on
 * every render would spend them on addresses nobody was about to write
 * to. It also resets whenever the address changes, so a badge on screen
 * always belongs to the address beside it.
 *
 * A clean pass is a badge and nothing else: at a glance, beside the
 * address, done. Only a problem gets a sentence, because only a problem
 * needs reading. The root is inline so the badge sits next to the
 * address rather than under it.
 */

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3" fill="none">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3" fill="none">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VerifyEmail({
  email,
  label = "Check this address",
}: {
  email: string;
  label?: string;
}) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState("");
  const [pending, startChecking] = useTransition();

  // A verdict for a different address is worse than no verdict
  const stale = checked !== "" && checked !== email.trim();
  const showing = stale ? null : verdict;

  function check() {
    const address = email.trim();
    if (!address) return;
    startChecking(async () => {
      const result = await verifyEmailAction(address);
      setChecked(address);
      if (result.ok) {
        setVerdict(result.verdict);
        setError("");
      } else {
        setVerdict(null);
        setError(result.message);
      }
    });
  }

  if (!email.trim()) return null;

  if (error) {
    return (
      <span className="ml-2 rounded-lg bg-terracotta-tint px-2 py-0.5 text-xs text-terracotta-dark">
        {error}
      </span>
    );
  }

  if (!showing) {
    return (
      <button
        type="button"
        className="btn btn-quiet ml-2 text-xs"
        onClick={check}
        disabled={pending}
      >
        {pending ? "Checking..." : label}
      </button>
    );
  }

  const bad = showing.result === "undeliverable";
  // A catch-all server says yes to everything, so a pass against one
  // proves the domain exists and nothing about the mailbox. It has to
  // beat "deliverable", or the badge says more than the check knows.
  const unsure =
    showing.acceptAll ||
    showing.result === "risky" ||
    showing.result === "unknown";

  const tone = bad
    ? "bg-terracotta-tint text-terracotta-dark"
    : unsure
      ? "bg-surface text-muted ring-1 ring-line"
      : "bg-pine-tint text-pine-dark";

  return (
    <span>
      <span
        className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 align-middle text-xs font-semibold ${tone}`}
        title={`Hunter score ${showing.score}${showing.cached ? " (from an earlier check)" : ""}`}
      >
        {bad ? <Cross /> : unsure ? null : <Check />}
        {bad ? "Won't accept mail" : unsure ? "Can't tell" : "Deliverable"}
      </span>

      {/* Only a problem earns an explanation */}
      {(bad || unsure) && (
        <span className="mt-1 block text-xs text-muted">{showing.summary}</span>
      )}
    </span>
  );
}
