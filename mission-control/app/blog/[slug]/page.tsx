import Link from "next/link";
import { notFound } from "next/navigation";
import path from "node:path";
import { deletePostAction, savePostAction } from "@/app/blog/actions";
import { repoState } from "@/lib/git";
import {
  getPost,
  postStatus,
  publishPaths,
  statusLabel,
  suggestedImagePath,
} from "@/lib/posts";
import { REPO_ROOT, siteInfo } from "@/lib/site";
import { validatePost } from "@/lib/validate";
import { PublishPanel } from "./PublishPanel";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const [repo, status, issues] = await Promise.all([
    repoState(),
    postStatus(post),
    validatePost(post),
  ]);
  const label = statusLabel(status, repo);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const site = siteInfo();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/blog" className="text-sm text-muted hover:underline">
          &larr; All posts
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-pine-dark">
            {post.title || post.slug}
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
              label.live
                ? "bg-pine-tint text-pine-dark"
                : "bg-terracotta-tint text-terracotta-dark"
            }`}
          >
            {label.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          <code>content/blog/{post.slug}.mdx</code>
          {label.live && (
            <>
              {" · "}
              <a
                className="hover:underline"
                href={`${site.url}/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                See it live
              </a>
            </>
          )}
        </p>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {errors.map((issue) => (
            <li key={issue.message}>{issue.message}</li>
          ))}
        </ul>
      )}
      {warnings.map((issue) => (
        <p
          key={issue.message}
          className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark"
        >
          {issue.message}
        </p>
      ))}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <form action={savePostAction} className="space-y-4">
          <input type="hidden" name="slug" value={post.slug} />
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              className="field"
              defaultValue={post.title}
            />
          </div>
          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="field"
              defaultValue={post.description}
            />
            <p className="mt-1 text-xs text-muted">
              One or two sentences. It is the card on the index, the meta
              description, and the RSS summary all at once.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="field"
              defaultValue={post.date}
            />
          </div>
          <div>
            <label className="label" htmlFor="body">
              The post
            </label>
            <textarea
              id="body"
              name="body"
              rows={30}
              className="field font-mono text-sm"
              defaultValue={post.body}
            />
          </div>
          <button type="submit" className="btn">
            Save the draft
          </button>
          <p className="text-xs text-muted">
            Saving writes the file and nothing else. It does not touch the
            website.
          </p>
        </form>

        <div className="space-y-6">
          <PublishPanel
            slug={post.slug}
            branch={repo.branch}
            files={publishPaths(post).map((p) => path.relative(REPO_ROOT, p))}
            defaultMessage={`Add blog post: ${post.title || post.slug}`}
            blocked={errors.map((e) => e.message)}
            status={label.detail}
          />

          <details className="card p-5">
            <summary className="cursor-pointer font-serif text-lg font-semibold text-pine-dark">
              Illustration
            </summary>
            <div className="mt-3 space-y-4">
              <p className="text-sm text-muted">
                Optional; posts read fine without one. The convention is 4:3 at{" "}
                <code>{suggestedImagePath(post.slug)}</code>. The
                generate-image skill makes it and{" "}
                <code>npm run optimize:images</code> shrinks it afterwards.
              </p>
              <form action={savePostAction} className="space-y-3">
                <input type="hidden" name="slug" value={post.slug} />
                <input type="hidden" name="title" value={post.title} />
                <input
                  type="hidden"
                  name="description"
                  value={post.description}
                />
                <input type="hidden" name="date" value={post.date} />
                <input type="hidden" name="body" value={post.body} />
                <div>
                  <label className="label" htmlFor="image">
                    Path
                  </label>
                  <input
                    id="image"
                    name="image"
                    className="field"
                    placeholder={suggestedImagePath(post.slug)}
                    defaultValue={post.image}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="imagePrompt">
                    Prompt
                  </label>
                  <textarea
                    id="imagePrompt"
                    name="imagePrompt"
                    rows={4}
                    className="field text-sm"
                    defaultValue={post.imagePrompt}
                  />
                  <p className="mt-1 text-xs text-muted">
                    Generator instructions only: scene, style, palette. No
                    reasoning or history, and cast any people explicitly.
                  </p>
                </div>
                <div>
                  <label className="label" htmlFor="imageAlt">
                    Alt text
                  </label>
                  <input
                    id="imageAlt"
                    name="imageAlt"
                    className="field"
                    defaultValue={post.imageAlt}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="imageCaption">
                    Caption
                  </label>
                  <input
                    id="imageCaption"
                    name="imageCaption"
                    className="field"
                    defaultValue={post.imageCaption}
                  />
                  <p className="mt-1 text-xs text-muted">
                    A warm one-liner that adds to the alt text rather than
                    repeating it.
                  </p>
                </div>
                <button type="submit" className="btn btn-quiet">
                  Save the image details
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>

      <details className="card border-terracotta-tint p-5">
        <summary className="cursor-pointer text-sm font-semibold text-terracotta-dark">
          Delete this draft
        </summary>
        <p className="mt-2 text-sm text-muted">
          Removes <code>content/blog/{post.slug}.mdx</code> from this machine.
          {label.live &&
            " This post is already live, so taking it off the site is a separate commit you would make yourself."}
        </p>
        <form action={deletePostAction} className="mt-3">
          <input type="hidden" name="slug" value={post.slug} />
          <button type="submit" className="btn btn-danger">
            Delete the draft
          </button>
        </form>
      </details>
    </div>
  );
}
