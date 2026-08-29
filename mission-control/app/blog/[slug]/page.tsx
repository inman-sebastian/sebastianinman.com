import Link from "next/link";
import { notFound } from "next/navigation";
import path from "node:path";
import { deletePostAction, savePostAction } from "@/app/blog/actions";
import { repoState } from "@/lib/git";
import { readJob } from "@/lib/illustrate";
import { blogImageVersion, listCandidates } from "@/lib/images";
import { getPost, postStatus, publishPaths, statusLabel } from "@/lib/posts";
import { REPO_ROOT, siteInfo } from "@/lib/site";
import { validatePost } from "@/lib/validate";
import { MdxBodyEditor } from "@/components/MdxBodyEditor";
import { IllustrationPanel } from "./IllustrationPanel";
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
        {/* min-w-0 is load-bearing. A grid item defaults to
            min-width:auto, so it refuses to shrink below its content's
            min-content width, and MDXEditor's toolbar is wide. Without
            this the first column pushed past its 3fr share and shoved
            the sidebar out of the container. */}
        <form action={savePostAction} className="min-w-0 space-y-4">
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
          <MdxBodyEditor
            label="The post"
            initial={post.body}
            withComponents
            minHeight="26rem"
            sourceRows={30}
          />
          <button type="submit" className="btn">
            {label.kind === "draft" ? "Save the draft" : "Save changes"}
          </button>
          <p className="text-xs text-muted">
            Saving writes the file and nothing else.{" "}
            {label.kind === "draft"
              ? "Nobody can see it yet."
              : "The live post does not change until you publish."}
          </p>
        </form>

        <div className="space-y-6">
          <PublishPanel
            slug={post.slug}
            branch={repo.branch}
            files={publishPaths(post).map((p) => path.relative(REPO_ROOT, p))}
            defaultMessage={
              label.kind === "draft"
                ? `Add blog post: ${post.title || post.slug}`
                : `Update blog post: ${post.title || post.slug}`
            }
            blocked={errors.map((e) => e.message)}
            status={label.detail}
            stage={label.kind}
          />

          <section className="card p-5">
            <h2 className="font-serif text-lg font-semibold text-pine-dark">
              Illustration
            </h2>
            <div className="mt-3">
              <IllustrationPanel
                slug={post.slug}
                image={post.image}
                imageVersion={blogImageVersion(post.image)}
                imagePrompt={post.imagePrompt}
                imageAlt={post.imageAlt}
                imageCaption={post.imageCaption}
                initialJob={readJob(post.slug)}
                candidates={listCandidates(post.slug)}
              />
            </div>

            <details className="mt-5 border-t border-line pt-4">
              <summary className="cursor-pointer text-sm font-semibold text-muted">
                Alt text and caption
              </summary>
              <form action={savePostAction} className="mt-3 space-y-3">
                <input type="hidden" name="slug" value={post.slug} />
                <input type="hidden" name="title" value={post.title} />
                <input
                  type="hidden"
                  name="description"
                  value={post.description}
                />
                <input type="hidden" name="date" value={post.date} />
                <input type="hidden" name="body" value={post.body} />
                <input type="hidden" name="image" value={post.image} />
                <input
                  type="hidden"
                  name="imagePrompt"
                  value={post.imagePrompt}
                />
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
                  Save
                </button>
              </form>
            </details>
          </section>
        </div>
      </div>

      <details className="card border-terracotta-tint p-5">
        <summary className="cursor-pointer text-sm font-semibold text-terracotta-dark">
          {label.kind === "draft" ? "Delete this draft" : "Delete this post"}
        </summary>
        {label.kind === "draft" ? (
          <p className="mt-2 text-sm text-muted">
            Removes <code>content/blog/{post.slug}.mdx</code> from this
            machine. It was never published, so nothing else has to happen.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">
            This post is published. Deleting it removes the file and its
            illustration, commits that, and pushes, so it comes off
            sebastianinman.com once Vercel rebuilds. There is no undo here.
          </p>
        )}
        <form action={deletePostAction} className="mt-3">
          <input type="hidden" name="slug" value={post.slug} />
          <button type="submit" className="btn btn-danger">
            {label.kind === "draft"
              ? "Delete the draft"
              : "Delete and take it off the site"}
          </button>
        </form>
      </details>
    </div>
  );
}
