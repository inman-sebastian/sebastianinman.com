"use client";

import { useActionState } from "react";
import { generatePdfAction } from "@/app/documents/actions";

/**
 * Generating drives Chrome through paperwork-app, so it takes a few
 * seconds and can fail for real reasons (Chrome moved, placeholders
 * left). Both outcomes get said out loud rather than swallowed.
 */
export function GenerateButton({
  slug,
  hasPdf,
}: {
  slug: string;
  hasPdf: boolean;
}) {
  const [state, formAction, pending] = useActionState(generatePdfAction, {});

  return (
    <div className="space-y-3">
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="slug" value={slug} />
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Generating..." : hasPdf ? "Generate again" : "Generate PDF"}
        </button>
        {hasPdf && (
          <a
            className="btn btn-quiet"
            href={`/documents/${slug}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Open the PDF
          </a>
        )}
      </form>
      {state.error && (
        <p className="whitespace-pre-wrap rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="rounded-lg bg-pine-tint px-4 py-3 text-sm text-pine-dark">
          {state.message}
        </p>
      )}
    </div>
  );
}
