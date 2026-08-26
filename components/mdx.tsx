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
  stats: {
    /** A short natural sentence, e.g. "Projects start at $500" */
    title: string;
    icon?: keyof typeof heroCardIcons;
    /** One supporting sentence; keeps the card from being a bare number */
    detail?: string;
  }[];
}) {
  return (
    <div className="my-6 flex flex-col gap-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="flex items-start gap-4 rounded-xl border border-line bg-surface px-5 py-4"
        >
          {stat.icon && (
            // Solid saturated light green, not a low-opacity pine: thin
            // washes of the muted dark green read as gray. mt-1 pins the
            // disc's center to the title/detail boundary (one-line title)
            // so a wrapping detail paragraph can't drag it downward.
            <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d9ecdc] text-pine-dark">
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
          {/* !my-0: neutralize .prose-site's paragraph margins, which
              otherwise force a full 1rem gap between title and detail */}
          <div>
            <p className="!my-0 font-serif text-lg font-semibold leading-snug text-pine-dark">
              {stat.title}
            </p>
            {stat.detail && (
              <p className="!mb-0 !mt-0.5 text-sm leading-relaxed text-muted">
                {stat.detail}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The standard promise row used on the automation landing pages: what it
 * costs, what you're committing to, how fast I reply. One source of
 * truth so every page makes the same (true) promises.
 */
export function PromiseRow() {
  return (
    <StatRow
      stats={[
        {
          icon: "tag",
          title: "Projects start at $500",
          detail:
            "Quoted flat before we begin, so there are no surprise invoices.",
        },
        {
          icon: "clock",
          title: "The first 30 minutes are free",
          detail:
            "Tell me what's eating your time, no obligation. If it isn't worth fixing, I'll say so.",
        },
        {
          icon: "mail",
          title: "Replies within 1 business day",
          detail: "Usually much sooner. You get me, not a ticket queue.",
        },
      ]}
    />
  );
}

/** Map passed to every MDXRemote render */
export const mdxComponents: MDXComponents = {
  Callout,
  CheckList,
  ChatBubble,
  StatRow,
  PromiseRow,
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
