import Link from "next/link";
import { repoState } from "@/lib/git";
import { listPosts, postStatus, statusLabel } from "@/lib/posts";
import { longDate } from "@/lib/format";
import { NewPostForm } from "./NewPostForm";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const repo = await repoState();
  const posts = listPosts();
  const rows = await Promise.all(
    posts.map(async (post) => ({
      post,
      status: statusLabel(await postStatus(post), repo),
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-pine-dark">Blog</h1>
        <p className="mt-1 text-lg leading-relaxed text-muted">
          Posts on sebastianinman.com. Saving writes the file; publishing
          pushes it, and pushing is what puts it on the site.
        </p>
      </div>

      <ul className="card divide-y divide-line">
        {rows.map(({ post, status }) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4 hover:bg-pine-tint/40"
            >
              <span className="font-serif text-lg font-semibold text-pine-dark">
                {post.title || post.slug}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                  status.live
                    ? "bg-pine-tint text-pine-dark"
                    : "bg-terracotta-tint text-terracotta-dark"
                }`}
              >
                {status.label}
              </span>
              <span className="ml-auto text-xs text-muted">
                {longDate(post.date)}
              </span>
            </Link>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="p-6 text-muted">No posts yet.</li>
        )}
      </ul>

      <section className="card p-5">
        <h2 className="font-serif text-lg font-semibold text-pine-dark">
          Start a new one
        </h2>
        <div className="mt-3 max-w-xl">
          <NewPostForm />
        </div>
        <p className="mt-4 text-xs text-muted">
          The editorial rules live in CLAUDE.md: useful on its own, specific,
          honest, no invented statistics, and at most one soft link to
          /contact at the end. The write-blog-post skill does the whole job
          including the illustration.
        </p>
      </section>
    </div>
  );
}
