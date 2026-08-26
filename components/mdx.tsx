import type { MDXComponents } from "mdx/types";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Reveal } from "@/components/Reveal";
import { heroCardIcons } from "@/lib/heroCards";

/**
 * Design components available inside MDX content bodies (services,
 * landing pages, long-form pages). Keep this set small and purposeful;
 * document any addition in CLAUDE.md so content authors know it exists.
 *
 * Usage in MDX:
 *   <Callout title="Worth knowing">Plain text here.</Callout>
 *   <CheckList items={["First thing", "Second thing"]} />
 *   <ChatBubble question="..." answer="..." caption="..." />
 *   <StatRow stats={[{ icon: "clock", value: "3 hrs", label: "saved weekly" }]} />
 */

export function Callout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="my-6 rounded-2xl bg-terracotta-tint px-6 py-5">
      {title && (
        <p className="text-sm font-semibold uppercase tracking-wide text-terracotta-dark">
          {title}
        </p>
      )}
      <div className="mt-1 leading-relaxed text-ink [&>p]:mb-0">{children}</div>
    </aside>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="my-6 flex !list-none flex-col gap-3 !p-0">
      {items.map((item, i) => (
        <li key={item} className="list-none !p-0">
          <Reveal delay={i * 120} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine text-white">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path
                  className="draw-check"
                  pathLength={1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </span>
            <span className="leading-relaxed">{item}</span>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export function ChatBubble({
  question,
  answer,
  caption,
}: {
  question: string;
  answer: string;
  caption?: string;
}) {
  return (
    <div className="my-6 flex max-w-sm flex-col gap-2 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <p className="self-start rounded-2xl rounded-bl-sm bg-pine-tint px-3 py-1.5 text-sm text-pine-dark">
        {question}
      </p>
      <p className="self-end rounded-2xl rounded-br-sm bg-pine px-3 py-1.5 text-sm text-white">
        {answer}
      </p>
      {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
    </div>
  );
}

export function StatRow({
  stats,
}: {
  stats: { value: string; label: string; icon?: keyof typeof heroCardIcons }[];
}) {
  // Fixed anatomy (icon circle, value, label) and a stretch grid keep
  // every tile in a row the same height regardless of label length
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center rounded-xl border border-line bg-surface px-4 py-5 text-center"
        >
          {stat.icon && (
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-pine-tint text-pine">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={heroCardIcons[stat.icon]}
                />
              </svg>
            </span>
          )}
          <p className="font-serif text-2xl font-semibold leading-tight text-pine-dark">
            {stat.value}
          </p>
          <p className="mt-1 text-sm leading-snug text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Map passed to every MDXRemote render */
export const mdxComponents: MDXComponents = {
  Callout,
  CheckList,
  ChatBubble,
  StatRow,
};

/**
 * Render an MDX content body with the site's component kit. Always use
 * this instead of MDXRemote directly: next-mdx-remote v6 strips JSX
 * expression attributes (like `stats={[...]}`) by default as a security
 * measure for untrusted content. Our MDX is repo-authored and trusted,
 * so we disable that (blockJS: false) while leaving the dangerous-call
 * blocker at its default.
 */
export function MdxBody({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{ blockJS: false }}
    />
  );
}
