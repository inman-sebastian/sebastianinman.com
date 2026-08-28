import type { ClientInput } from "@/lib/clients";
import type { ServiceSummary } from "@/lib/services";
import { SOURCES, STAGES } from "@/lib/stages";

/**
 * The shared field set for a client record, used by both the new-lead
 * form and the edit panel. Inputs are uncontrolled; the new-lead form
 * remounts this with a key when the paste parser fills it in.
 */
export function ClientFields({
  defaults,
  services,
}: {
  defaults: ClientInput;
  services: ServiceSummary[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Their name
          </label>
          <input
            id="name"
            name="name"
            className="field"
            defaultValue={defaults.name ?? ""}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor="business">
            Business
          </label>
          <input
            id="business"
            name="business"
            className="field"
            defaultValue={defaults.business ?? ""}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor="city">
            Town
          </label>
          <input
            id="city"
            name="city"
            className="field"
            defaultValue={defaults.city ?? ""}
            placeholder="Medford"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="field"
            defaultValue={defaults.email ?? ""}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            className="field"
            defaultValue={defaults.phone ?? ""}
            autoComplete="off"
          />
        </div>
      </div>

      <fieldset>
        <legend className="label">What they need</legend>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <label
              key={s.slug}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="services"
                value={s.slug}
                defaultChecked={defaults.services?.includes(s.slug)}
              />
              {s.title}
              <span className="text-xs text-muted">from ${s.startingPrice}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="stage">
            Stage
          </label>
          <select
            id="stage"
            name="stage"
            className="field"
            defaultValue={defaults.stage ?? "inquiry"}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="source">
            Came from
          </label>
          <select
            id="source"
            name="source"
            className="field"
            defaultValue={defaults.source ?? "manual"}
          >
            {SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="value">
            Quote, if there is one
          </label>
          <input
            id="value"
            name="value"
            inputMode="numeric"
            className="field"
            placeholder="750"
            defaultValue={defaults.value ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="label" htmlFor="nextStep">
            Next step
          </label>
          <input
            id="nextStep"
            name="nextStep"
            className="field"
            placeholder="Reply today and offer a time to talk"
            defaultValue={defaults.nextStep ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="nextStepDue">
            By when
          </label>
          <input
            id="nextStepDue"
            name="nextStepDue"
            type="date"
            className="field"
            defaultValue={defaults.nextStepDue ?? ""}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={8}
          className="field font-mono text-sm"
          placeholder="What they said, in their words."
          defaultValue={defaults.notes ?? ""}
        />
        <p className="mt-1 text-xs text-muted">
          Markdown. This is the top half of the record file; the timeline
          lives below it.
        </p>
      </div>
    </div>
  );
}
