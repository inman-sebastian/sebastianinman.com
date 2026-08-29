import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown from Claude, or from a record's notes, rendered as HTML.
 *
 * Everything the model writes comes back as markdown whether or not it
 * was asked to: bold, bullets, the occasional table. Rendering that in a
 * `whitespace-pre-wrap` block showed people the asterisks. This turns it
 * into real elements and styles them with the brand tokens.
 *
 * Raw HTML in the source is NOT rendered, which is react-markdown's
 * default and stays that way. Nothing here needs it, and the input is
 * model output and client notes, neither of which should be able to put
 * a tag on the page.
 *
 * `remark-gfm` is on for tables, strikethrough and task lists, which are
 * what markdown-in-the-wild actually uses beyond the basics.
 */
export function Markdown({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  if (!children?.trim()) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-pine-dark">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} className="text-pine underline">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface px-1 py-0.5 font-mono text-[0.9em]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-auto rounded-lg bg-surface p-3 font-mono text-xs">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-line pl-3 text-muted">
              {children}
            </blockquote>
          ),
          // Headings inside a panel are subheadings, never page titles,
          // so they all render at one modest size rather than stepping
          // down from h1 and fighting the surrounding layout.
          h1: ({ children }) => <h4 className="font-serif font-semibold text-pine-dark">{children}</h4>,
          h2: ({ children }) => <h4 className="font-serif font-semibold text-pine-dark">{children}</h4>,
          h3: ({ children }) => <h4 className="font-serif font-semibold text-pine-dark">{children}</h4>,
          h4: ({ children }) => <h4 className="font-serif font-semibold text-pine-dark">{children}</h4>,
          hr: () => <hr className="border-line" />,
          table: ({ children }) => (
            <div className="overflow-auto">
              <table className="w-full border-collapse text-left">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-line pb-1 pr-3 font-semibold text-pine-dark">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-line py-1 pr-3 align-top">
              {children}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
