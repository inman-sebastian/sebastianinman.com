import type { MDXComponents } from "mdx/types";

/**
 * Design components available inside MDX content bodies (services,
 * landing pages, long-form pages). Keep this set small and purposeful;
 * document any addition in CLAUDE.md so content authors know it exists.
 *
 * Usage in MDX:
 *   <Callout title="Worth knowing">Plain text here.</Callout>
 *   <CheckList items={["First thing", "Second thing"]} />
 *   <ChatBubble question="..." answer="..." caption="..." />
 *   <StatRow stats={[{ value: "3 hrs", label: "saved weekly" }]} />
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
    <ul className="my-6 flex list-none flex-col gap-3 !p-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 !p-0">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine text-white">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </span>
          <span className="leading-relaxed">{item}</span>
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
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="my-6 flex flex-wrap gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="min-w-36 flex-1 rounded-xl border border-line bg-surface px-5 py-4 text-center"
        >
          <p className="font-serif text-3xl font-semibold text-pine-dark">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-muted">{stat.label}</p>
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
