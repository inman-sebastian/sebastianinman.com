import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import {
  passAction,
  pursueAction,
  reopenAction,
  saveReviewAction,
} from "./actions";
import { displayName, getClient } from "@/lib/clients";
import { isBlocked } from "@/lib/suppression";
import { longDate, money, telHref } from "@/lib/format";
import { integratedTools, listServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = getClient(slug);
  if (!record) notFound();

  const services = listServices();
  const integrated = integratedTools();
  const named = record.services
    .map((s) => services.find((x) => x.slug === s))
    .filter((s): s is (typeof services)[number] => Boolean(s));
  const floor = named.reduce((sum, s) => sum + s.startingPrice, 0);
  const blocked = isBlocked([
    record.business,
    record.email,
    record.website,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/research" className="text-sm text-muted hover:underline">
          &larr; Research
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-pine-dark">
            {displayName(record)}
          </h1>
          {record.fit === "strong" && (
            <span className="rounded-full bg-pine-tint px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-pine-dark">
              Strong fit
            </span>
          )}
          {record.stage !== "researched" && (
            <span className="rounded-full bg-line/60 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {record.stage === "lost" ? "Not a fit" : "In the pipeline"}
            </span>
          )}
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {[record.category, record.city].filter(Boolean).join(" · ")}
          {record.phone && (
            <a className="hover:underline" href={telHref(record.phone)}>
              {record.phone}
            </a>
          )}
          {record.email && (
            <a className="hover:underline" href={`mailto:${record.email}`}>
              {record.email}
            </a>
          )}
          <span>Researched {longDate(record.researched || record.created)}</span>
        </p>
      </div>

      {blocked && (
        <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          <strong>On the do-not-contact list</strong> (matched
          &ldquo;{blocked}&rdquo;). Leave this one alone.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              What the research found
            </h2>
            <p className="mt-1 text-xs text-muted">
              Every line should have a link behind it. Open a couple and check
              before you write to anyone.
            </p>
            {/* Rendered rather than shown raw, because remark-gfm
                autolinks the bare source URLs the research records
                beside every claim, which is what makes the "open a
                couple and check" instruction above actionable. */}
            <Markdown className="mt-3 text-sm">
              {record.notes || "Nothing recorded."}
            </Markdown>
          </section>

          {(record.platform || record.stack.length > 0) && (
            <section className="card p-5">
              <h2 className="font-serif text-lg font-semibold text-pine-dark">
                What they&apos;re running
              </h2>
              {record.platform && (
                <p className="mt-2 text-sm">
                  The site is built on{" "}
                  <strong className="text-pine-dark">{record.platform}</strong>.
                </p>
              )}
              {record.stack.length > 0 && (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {record.stack.map((tool) => {
                      const known = integrated.has(tool.toLowerCase());
                      return (
                        <span
                          key={tool}
                          className={`rounded-full px-3 py-1 text-sm ${
                            known
                              ? "bg-pine-tint font-semibold text-pine-dark"
                              : "bg-surface text-muted ring-1 ring-line"
                          }`}
                        >
                          {tool}
                        </span>
                      );
                    })}
                  </div>
                  {record.stack.some((t) => integrated.has(t.toLowerCase())) && (
                    <p className="mt-3 text-xs text-muted">
                      The filled-in ones are already on your tool-integration
                      page, so connecting them is work you list.
                    </p>
                  )}
                </>
              )}
            </section>
          )}

        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              Worth pursuing?
            </h2>
            {record.stage === "researched" ? (
              <>
                <p className="mt-1 text-sm text-muted">
                  Adding them moves this record on to the prospect stage,
                  with the research attached. It does not write to anybody.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={pursueAction}>
                    <input type="hidden" name="slug" value={record.slug} />
                    <button type="submit" className="btn" disabled={Boolean(blocked)}>
                      Add to the pipeline
                    </button>
                  </form>
                  <form action={passAction}>
                    <input type="hidden" name="slug" value={record.slug} />
                    <button type="submit" className="btn btn-quiet">
                      Not a fit
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <form action={reopenAction} className="mt-3">
                <input type="hidden" name="slug" value={record.slug} />
                <p className="text-sm text-muted">
                  {record.stage === "lost"
                    ? "Passed on. Kept so research skips them next time."
                    : "Already in the pipeline."}
                </p>
                <button type="submit" className="btn btn-quiet mt-3">
                  Put it back in the queue
                </button>
              </form>
            )}
          </section>

          <section className="card p-5 text-sm">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              At a glance
            </h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Website</dt>
                <dd className="text-right">
                  {record.website ? (
                    <a
                      className="hover:underline"
                      href={record.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit
                    </a>
                  ) : (
                    "None found"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Google profile</dt>
                <dd className="text-right">
                  {record.googleProfile === "yes" ? (
                    record.googleProfileUrl ? (
                      <a
                        className="hover:underline"
                        href={record.googleProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Yes, view it
                      </a>
                    ) : (
                      "Yes"
                    )
                  ) : record.googleProfile === "no" ? (
                    <span className="text-terracotta-dark">None found</span>
                  ) : (
                    "Not checked"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Where</dt>
                <dd className="text-right">
                  {record.address || record.city || "Not recorded"}
                  {record.lat === null && (record.city || record.address) && (
                    <span className="block text-xs text-muted">
                      not on the map yet
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Found at</dt>
                <dd className="text-right">
                  {record.listing ? (
                    <a
                      className="hover:underline"
                      href={record.listing}
                      target="_blank"
                      rel="noreferrer"
                    >
                      The listing
                    </a>
                  ) : (
                    "Not recorded"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Might need</dt>
                <dd className="text-right">
                  {named.map((s) => s.title).join(", ") || "Not pinned down"}
                </dd>
              </div>
              {floor > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Starts at</dt>
                  <dd className="font-semibold">{money(floor)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Record</dt>
                <dd>
                  <code className="text-xs">data/clients/{record.slug}.md</code>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <details className="card p-5">
        <summary className="cursor-pointer font-serif text-lg font-semibold text-pine-dark">
          Fix the details
        </summary>
        <form action={saveReviewAction} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value={record.slug} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="business">
                Business
              </label>
              <input
                id="business"
                name="business"
                className="field"
                defaultValue={displayName(record)}
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
                defaultValue={record.city}
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                className="field"
                defaultValue={record.email}
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
                defaultValue={record.phone}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="website">
              Website
            </label>
            <input
              id="website"
              name="website"
              className="field"
              defaultValue={record.website}
            />
          </div>
          <div>
            <label className="label" htmlFor="body">
              The research
            </label>
            <textarea
              id="body"
              name="body"
              rows={16}
              className="field font-mono text-sm"
              defaultValue={record.notes}
            />
          </div>
          <button type="submit" className="btn">
            Save
          </button>
        </form>
      </details>
    </div>
  );
}
