import Link from "next/link";
import { notFound } from "next/navigation";
import {
  passProspectAction,
  promoteProspectAction,
  reopenProspectAction,
  saveProspectAction,
} from "@/app/prospects/actions";
import { getProspect, isBlocked } from "@/lib/prospects";
import { longDate, money, telHref } from "@/lib/format";
import { integratedTools, listServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function ProspectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prospect = getProspect(slug);
  if (!prospect) notFound();

  const services = listServices();
  const integrated = integratedTools();
  const named = prospect.services
    .map((s) => services.find((x) => x.slug === s))
    .filter((s): s is (typeof services)[number] => Boolean(s));
  const floor = named.reduce((sum, s) => sum + s.startingPrice, 0);
  const blocked = isBlocked([
    prospect.business,
    prospect.email,
    prospect.website,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/prospects" className="text-sm text-muted hover:underline">
          &larr; All prospects
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-pine-dark">
            {prospect.business}
          </h1>
          {prospect.fit === "strong" && (
            <span className="rounded-full bg-pine-tint px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-pine-dark">
              Strong fit
            </span>
          )}
          {prospect.status !== "new" && (
            <span className="rounded-full bg-line/60 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {prospect.status === "promoted" ? "In the pipeline" : "Not a fit"}
            </span>
          )}
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {[prospect.category, prospect.city].filter(Boolean).join(" · ")}
          {prospect.phone && (
            <a className="hover:underline" href={telHref(prospect.phone)}>
              {prospect.phone}
            </a>
          )}
          {prospect.email && (
            <a className="hover:underline" href={`mailto:${prospect.email}`}>
              {prospect.email}
            </a>
          )}
          <span>Researched {longDate(prospect.researched)}</span>
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
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {prospect.saw || "Nothing recorded."}
            </div>
          </section>

          {prospect.why && (
            <section className="card p-5">
              <h2 className="font-serif text-lg font-semibold text-pine-dark">
                Why it&apos;s a fit
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {prospect.why}
              </p>
            </section>
          )}

          {(prospect.platform || prospect.stack.length > 0) && (
            <section className="card p-5">
              <h2 className="font-serif text-lg font-semibold text-pine-dark">
                What they&apos;re running
              </h2>
              {prospect.platform && (
                <p className="mt-2 text-sm">
                  The site is built on{" "}
                  <strong className="text-pine-dark">{prospect.platform}</strong>.
                </p>
              )}
              {prospect.stack.length > 0 && (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prospect.stack.map((tool) => {
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
                  {prospect.stack.some((t) => integrated.has(t.toLowerCase())) && (
                    <p className="mt-3 text-xs text-muted">
                      The filled-in ones are already on your tool-integration
                      page, so connecting them is work you list.
                    </p>
                  )}
                </>
              )}
            </section>
          )}

          {prospect.openingLine && (
            <section className="card p-5">
              <h2 className="font-serif text-lg font-semibold text-pine-dark">
                Opening line
              </h2>
              <p className="mt-1 text-xs text-muted">
                The specific true thing the first email leads with. If it could
                be said to any business in town, it is not specific enough.
              </p>
              <p className="mt-3 rounded-lg bg-pine-tint px-4 py-3 text-sm leading-relaxed">
                {prospect.openingLine}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              Worth pursuing?
            </h2>
            {prospect.status === "new" ? (
              <>
                <p className="mt-1 text-sm text-muted">
                  Adding them puts a record in the pipeline at the prospect
                  stage with the research attached. It does not write to
                  anybody.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={promoteProspectAction}>
                    <input type="hidden" name="slug" value={prospect.slug} />
                    <button type="submit" className="btn" disabled={Boolean(blocked)}>
                      Add to the pipeline
                    </button>
                  </form>
                  <form action={passProspectAction}>
                    <input type="hidden" name="slug" value={prospect.slug} />
                    <button type="submit" className="btn btn-quiet">
                      Not a fit
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <form action={reopenProspectAction} className="mt-3">
                <input type="hidden" name="slug" value={prospect.slug} />
                <p className="text-sm text-muted">
                  {prospect.status === "promoted"
                    ? "Already in the pipeline."
                    : "Passed on. Kept so research skips them next time."}
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
                  {prospect.website ? (
                    <a
                      className="hover:underline"
                      href={prospect.website}
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
                <dt className="text-muted">Found at</dt>
                <dd className="text-right">
                  {prospect.listing ? (
                    <a
                      className="hover:underline"
                      href={prospect.listing}
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
                  <code className="text-xs">data/prospects/{prospect.slug}.md</code>
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
        <form action={saveProspectAction} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value={prospect.slug} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="business">
                Business
              </label>
              <input
                id="business"
                name="business"
                className="field"
                defaultValue={prospect.business}
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
                defaultValue={prospect.city}
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
                defaultValue={prospect.email}
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
                defaultValue={prospect.phone}
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
              defaultValue={prospect.website}
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
              defaultValue={prospect.body}
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
