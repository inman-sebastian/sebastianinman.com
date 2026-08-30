"use client";

import { useActionState, useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import {
  adoptCandidateAction,
  discardCandidateAction,
  dismissJobAction,
  generateIllustrationAction,
  uploadIllustrationAction,
} from "@/app/blog/actions";
import type { Job } from "@/lib/illustrate";
import type { Candidate } from "@/lib/images";

/**
 * The illustration half of a post: what it looks like now, a button that
 * runs the real Flow pipeline, whatever that run has staged for a
 * decision, and an upload for art made elsewhere.
 */
export function IllustrationPanel({
  slug,
  image,
  imageVersion,
  imagePrompt,
  imageAlt,
  imageCaption,
  initialJob,
  candidates,
}: {
  slug: string;
  image: string;
  imageVersion: string;
  imagePrompt: string;
  imageAlt: string;
  imageCaption: string;
  initialJob: Job;
  /** Generated images and previously-used ones, none of them live */
  candidates: Candidate[];
}) {
  const [state, formAction, pending] = useActionState(
    generateIllustrationAction,
    {}
  );
  const [job, setJob] = useState<Job>(initialJob);
  const [prompt, setPrompt] = useState(imagePrompt);
  /** The image being looked at full size, if any */
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(
    null
  );

  // The action only starts the run, so switch to watching as soon as it
  // reports back that one is going
  useEffect(() => {
    if (state.message) {
      setJob({
        state: "running",
        startedAt: "",
        elapsed: 0,
        log: "",
        summary: "",
        costUsd: null,
        denials: [],
        problem: "",
      });
    }
  }, [state.message]);

  // While a run is going, keep asking how it is doing
  useEffect(() => {
    if (job.state !== "running") return;
    const timer = setInterval(async () => {
      const next = await fetch(`/blog/${slug}/job`, { cache: "no-store" })
        .then((r) => r.json() as Promise<Job>)
        .catch(() => null);
      if (next) setJob(next);
      if (next && next.state !== "running") {
        // Before the reload, or the page goes away mid-notification.
        await notify(
          next.state === "failed"
            ? "Illustration failed"
            : "Illustration ready",
          {
            body:
              next.state === "failed"
                ? "Open the post to see what went wrong."
                : "Open the post to look it over before adopting it.",
            url: `/blog/${slug}`,
          }
        );
        // A finished run has usually just written the image
        window.location.reload();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [job.state, slug]);

  const fileName = image.split("/").pop() ?? "";
  const mins = Math.floor(job.elapsed / 60);
  const secs = job.elapsed % 60;

  // Escape closes the lightbox, because a picture covering the screen
  // with no obvious way out is its own small annoyance
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div className="space-y-5">
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.label}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-ink/85 p-6"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={lightbox.label}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
          <p className="text-sm text-background">
            {lightbox.label} · click anywhere, or press Escape, to close
          </p>
        </div>
      )}

      {image ? (
        <figure className="overflow-hidden rounded-xl border border-line bg-surface">
          {/* Served out of the website's public folder by a local route */}
          <button
            type="button"
            className="block w-full cursor-zoom-in"
            onClick={() =>
              setLightbox({
                src: `/media/blog/${fileName}?v=${imageVersion}`,
                label: "The illustration on this post",
              })
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/blog/${fileName}?v=${imageVersion}`}
              alt={imageAlt || "The post's illustration"}
              className="w-full"
            />
          </button>
          <figcaption className="border-t border-line px-4 py-2 text-xs text-muted">
            <code>{image}</code>
            {imageCaption && ` · ${imageCaption}`}
          </figcaption>
        </figure>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          No illustration yet. Posts read fine without one.
        </p>
      )}

      <section className="space-y-3">
        <div>
          <label className="label" htmlFor="imagePrompt">
            The prompt
          </label>
          <textarea
            id="imagePrompt"
            name="imagePrompt"
            form="generate-illustration"
            rows={5}
            className="field text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Friendly modern flat illustration of ... warm cream, deep pine green, and terracotta palette. No text or lettering anywhere."
          />
        </div>

        <form action={formAction} id="generate-illustration">
          <input type="hidden" name="slug" value={slug} />
          {/* No optimistic disable in onClick here: turning a submit
              button disabled during its own click stops the browser
              dispatching the submit at all, and the run never starts.
              `pending` handles the same job safely. */}
          <button
            type="submit"
            className="btn"
            disabled={pending || job.state === "running" || !prompt.trim()}
          >
            {job.state === "running"
              ? "Generating..."
              : image
                ? "Generate a new one"
                : "Generate the illustration"}
          </button>
        </form>

        {state.error && (
          <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
            {state.error}
          </p>
        )}

        {job.state !== "none" && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              job.state === "failed"
                ? "bg-terracotta-tint text-terracotta-dark"
                : "bg-pine-tint text-pine-dark"
            }`}
          >
            <p className="font-semibold">
              {job.state === "running" &&
                `Working on it... ${mins}m ${secs}s so far.`}
              {job.state === "done" && "Finished."}
              {job.state === "failed" && "That run did not finish."}
            </p>

            {job.summary && (
              <p className="mt-1 whitespace-pre-wrap">{job.summary}</p>
            )}

            {job.problem && (
              <p className="mt-2 rounded bg-terracotta-tint px-3 py-2 text-terracotta-dark">
                {job.problem}
              </p>
            )}

            {/* Live while it runs, so the minutes are not silent */}
            {job.log && (
              <details className="mt-2" open={job.state === "running"}>
                <summary className="cursor-pointer text-xs">
                  {job.state === "running" ? "What it's doing" : "What it did"}
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs">
                  {job.log}
                </pre>
              </details>
            )}

            {job.costUsd !== null && job.state !== "running" && (
              <p className="mt-2 text-xs opacity-80">
                Covered by your Claude subscription. At API rates this run
                would have been ${job.costUsd.toFixed(2)}.
              </p>
            )}
            {job.state !== "running" && (
              <form action={dismissJobAction} className="mt-2">
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="text-xs underline">
                  Clear this
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      {candidates.length > 0 && (
        <section className="space-y-3 border-t border-line pt-4">
          <p className="label">Waiting for you to decide</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {candidates.map((c) => (
              <figure
                key={c.file}
                className="overflow-hidden rounded-xl border border-line bg-surface"
              >
                <button
                  type="button"
                  className="block w-full cursor-zoom-in"
                  onClick={() =>
                    setLightbox({
                      src: `/media/candidate/${c.file}`,
                      label:
                        c.kind === "prev"
                          ? "The illustration this post used before"
                          : "A newly generated illustration",
                    })
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/media/candidate/${c.file}`}
                    alt={
                      c.kind === "prev"
                        ? "The illustration this post used before"
                        : "A newly generated illustration"
                    }
                    className="w-full"
                  />
                </button>
                <figcaption className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                      c.kind === "prev"
                        ? "bg-line/60 text-muted"
                        : "bg-pine-tint text-pine-dark"
                    }`}
                  >
                    {c.kind === "prev" ? "Was on the post" : "New"}
                  </span>
                  <form action={adoptCandidateAction} className="ml-auto">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="file" value={c.file} />
                    <button type="submit" className="btn">
                      {image ? "Use this instead" : "Use this one"}
                    </button>
                  </form>
                  <form action={discardCandidateAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="file" value={c.file} />
                    <button type="submit" className="btn btn-quiet">
                      Discard
                    </button>
                  </form>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3 border-t border-line pt-4">
        <p className="label">Upload your own</p>
        <form action={uploadIllustrationAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="slug" value={slug} />
          <input
            type="file"
            name="upload"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm"
          />
          <button type="submit" className="btn btn-quiet">
            Use this file
          </button>
        </form>
      </section>
    </div>
  );
}
