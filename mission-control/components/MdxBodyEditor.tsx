"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "@mdxeditor/editor/style.css";

/**
 * Prose edited as a document rather than as source.
 *
 * MDXEditor touches `window` at import time, so it is loaded with
 * `ssr: false` from here. That is why the real editor lives in its own
 * file: this one is a thin wrapper whose only jobs are to load it on
 * the client and to keep the surrounding form working.
 *
 * The forms post to server actions that read this field out of the form
 * data, and a rich text editor has no form value of its own, so the
 * current markdown rides along in a hidden input.
 *
 * Two flavours, and the difference matters. A blog post is MDX and may
 * use the site's components, so it gets the insert buttons. Client
 * notes are plain markdown rendered by components/Markdown.tsx, which
 * does not render JSX at all: a <Callout> inserted there would show up
 * as literal angle brackets on the record. So `withComponents` is off
 * by default and only the blog turns it on.
 */

const Editor = dynamic(() => import("./mdx-editor/InitializedMDXEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
      Loading the editor...
    </div>
  ),
});

/**
 * Take back out the import statement MDXEditor insists on adding.
 *
 * It writes one at the top of the document for every JSX component it
 * knows about, built from each descriptor's `source`. A blog post must
 * not have one: the site supplies these components globally through
 * `mdxComponents`, no post has ever imported anything, and an import
 * left in the file would have to resolve at MDX compile time, which
 * that path does not.
 *
 * There is no way to switch it off. `JsxPluginParams` exposes only
 * `jsxComponentDescriptors`, `allowFragment` and `kindMismatchPolicy`;
 * the `addImportStatements` flag exists but only on an internal
 * export. So it gets removed on the way out instead.
 *
 * Only leading imports, which is the only place it puts them.
 */
function stripImports(markdown: string): string {
  return markdown.replace(/^(?:[ \t]*import\s[^\n]*\n)+\s*/, "");
}

export function MdxBodyEditor({
  name = "body",
  initial,
  label,
  /** Offer the site's MDX components. Blog posts only; see the header. */
  withComponents = false,
  /** How tall the writing area starts out */
  minHeight = "16rem",
  sourceRows = 14,
  help,
}: {
  name?: string;
  initial: string;
  label: string;
  withComponents?: boolean;
  minHeight?: string;
  sourceRows?: number;
  help?: string;
}) {
  const [value, setValue] = useState(initial);
  const [source, setSource] = useState(false);

  const sourceLabel = withComponents ? "MDX" : "Markdown";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button
          type="button"
          className="btn btn-quiet text-xs"
          onClick={() => setSource((s) => !s)}
        >
          {source ? "Back to the editor" : `Edit as ${sourceLabel}`}
        </button>
      </div>

      {/* The escape hatch. Anything the rich editor cannot express, or
          gets wrong, is fixable here without leaving the page.

          `mdx-editor-shell` below is not decoration: MDXEditor declares
          its theme variables on a hashed class of its own, so a bare
          `.mdxeditor` override is a coin toss on stylesheet order. The
          extra parent settles it. See the block in globals.css. */}
      {source ? (
        <textarea
          rows={sourceRows}
          className="field font-mono text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div
          className="mdx-editor-shell"
          style={{ "--mdx-min-height": minHeight } as React.CSSProperties}
        >
          <Editor
            markdown={initial}
            withComponents={withComponents}
            onChange={(next) => setValue(stripImports(next))}
          />
        </div>
      )}

      {help && <p className="mt-1 text-xs text-muted">{help}</p>}

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
