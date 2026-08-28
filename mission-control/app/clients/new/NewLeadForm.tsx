"use client";

import { useActionState, useState, useTransition } from "react";
import { ClientFields } from "@/components/ClientFields";
import { createClientAction, parseInquiryAction } from "@/app/actions";
import type { ClientInput } from "@/lib/clients";
import type { ServiceSummary } from "@/lib/services";

/**
 * Two ways in: paste the notification email the website sends, or type
 * it yourself. The paste only fills the form; nothing saves until the
 * button gets clicked.
 */
export function NewLeadForm({ services }: { services: ServiceSummary[] }) {
  const [state, formAction, pending] = useActionState(createClientAction, {});
  const [defaults, setDefaults] = useState<ClientInput>({ stage: "inquiry" });
  // Remounting the field set is how parsed values reach uncontrolled inputs
  const [version, setVersion] = useState(0);
  const [pasted, setPasted] = useState("");
  const [reading, startReading] = useTransition();

  function readPaste() {
    if (!pasted.trim()) return;
    startReading(async () => {
      setDefaults(await parseInquiryAction(pasted));
      setVersion((v) => v + 1);
    });
  }

  return (
    <div className="space-y-8">
      <section className="card p-5">
        <h2 className="font-serif text-lg font-semibold text-pine-dark">
          Paste the inquiry email
        </h2>
        <p className="mt-1 text-sm text-muted">
          Copy the whole notification from hello@, drop it here, and the form
          below fills itself in. Check it over before saving.
        </p>
        <textarea
          rows={6}
          className="field mt-3 font-mono text-sm"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder={"New inquiry from https://www.sebastianinman.com\nName: ...\nEmail: ..."}
        />
        <button
          type="button"
          className="btn btn-quiet mt-3"
          onClick={readPaste}
          disabled={reading || !pasted.trim()}
        >
          {reading ? "Reading..." : "Fill the form from this"}
        </button>
      </section>

      <form action={formAction} className="space-y-6">
        <ClientFields key={version} defaults={defaults} services={services} />
        {state.error && (
          <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
            {state.error}
          </p>
        )}
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Saving..." : "Save this lead"}
        </button>
      </form>
    </div>
  );
}
