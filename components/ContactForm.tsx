"use client";

import { useActionState } from "react";
import { submitContact, type ContactFormState } from "@/app/contact/actions";

const initialState: ContactFormState = { status: "idle" };

const inputClasses =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/60 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/20";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-pine-dark">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-terracotta-dark">{error}</span>}
    </label>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-pine/30 bg-pine-tint p-8 text-center">
        <h2 className="text-2xl font-semibold text-pine-dark">Got it — thanks!</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Your message is on its way. I&rsquo;ll get back to you within one
          business day, usually sooner.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Honeypot field — hidden from real users */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <Field label="Your name" error={state.errors?.name}>
        <input type="text" name="name" required autoComplete="name" className={inputClasses} />
      </Field>

      <Field label="Email" error={state.errors?.email}>
        <input type="email" name="email" required autoComplete="email" className={inputClasses} />
      </Field>

      <Field label="Business name (optional)">
        <input type="text" name="business" autoComplete="organization" className={inputClasses} />
      </Field>

      <Field label="What can I help with?" error={state.errors?.message}>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="A sentence or two is plenty — what's eating your time, or what do you wish just worked?"
          className={inputClasses}
        />
      </Field>

      {state.message && (
        <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-terracotta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
