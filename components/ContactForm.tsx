"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { submitContact, type ContactFormState } from "@/app/contact/actions";

const initialState: ContactFormState = { status: "idle" };

const inputClasses =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/60 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/20";

/** Slug + title pairs for the service checkboxes; passed in by the page */
export type ServiceOption = { slug: string; title: string };

/** Extra always-present option so nobody feels quizzed */
const NOT_SURE: ServiceOption = { slug: "not-sure", title: "Not sure yet" };

/**
 * Masks a US phone number as (541) 555-0134 while typing. Recomputed from
 * digits only, and trailing punctuation is only added once the next digit
 * exists, so backspacing never fights the mask.
 */
function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

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

function ServiceCheckboxes({
  services,
  selected,
  onToggle,
}: {
  services: ServiceOption[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-pine-dark">
        What do you need help with?{" "}
        <span className="font-normal text-muted">(check any that apply)</span>
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {[...services, NOT_SURE].map((s) => {
          const checked = selected.has(s.slug);
          return (
            <label
              key={s.slug}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                checked
                  ? "border-pine bg-pine-tint/60 text-pine-dark"
                  : "border-line bg-surface text-ink hover:border-pine/40"
              }`}
            >
              <input
                type="checkbox"
                name="services"
                value={s.slug}
                checked={checked}
                onChange={() => onToggle(s.slug)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  checked
                    ? "border-pine bg-pine text-white"
                    : "border-line bg-background"
                }`}
              >
                {checked && (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                )}
              </span>
              {s.title}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function FormInner({
  services,
  initialSelected,
}: {
  services: ServiceOption[];
  initialSelected: string[];
}) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected)
  );
  const [phone, setPhone] = useState("");

  const toggle = (slug: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-pine/30 bg-pine-tint p-8 text-center">
        <h2 className="text-2xl font-semibold text-pine-dark">Got it, thanks!</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Your message is on its way. I&rsquo;ll get back to you within one
          business day, usually sooner.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Honeypot field, hidden from real users */}
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

      <Field label="Phone (optional)">
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="If you'd rather I call you back"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          className={inputClasses}
        />
      </Field>

      <Field label="Business name (optional)">
        <input type="text" name="business" autoComplete="organization" className={inputClasses} />
      </Field>

      <ServiceCheckboxes
        services={services}
        selected={selected}
        onToggle={toggle}
      />

      <Field label="What can I help with?" error={state.errors?.message}>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="A sentence or two is plenty. What's eating your time, or what do you wish just worked?"
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

/** Reads ?service=<slug>(,<slug>) to pre-check the matching cards */
function FormWithParams({ services }: { services: ServiceOption[] }) {
  const params = useSearchParams();
  const valid = new Set([...services.map((s) => s.slug), NOT_SURE.slug]);
  const initialSelected = (params.get("service") ?? "")
    .split(",")
    .filter((slug) => valid.has(slug));
  return <FormInner services={services} initialSelected={initialSelected} />;
}

export function ContactForm({ services }: { services: ServiceOption[] }) {
  // useSearchParams needs a Suspense boundary so /contact stays static;
  // the fallback is the same form with nothing pre-checked
  return (
    <Suspense fallback={<FormInner services={services} initialSelected={[]} />}>
      <FormWithParams services={services} />
    </Suspense>
  );
}
