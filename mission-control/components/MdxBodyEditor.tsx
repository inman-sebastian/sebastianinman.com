"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "@mdxeditor/editor/style.css";

/**
 * The post body, edited as a document rather than as source.
 *
 * MDXEditor touches `window` at import time, so it is loaded with
 * `ssr: false` from here. That is why the real editor lives in its own
 * file: this one is a thin wrapper whose only jobs are to load it on
 * the client and to keep the surrounding form working.
 *
 * The form posts to a server action that reads `body` from the form
 * data, and a rich text editor has no form value of its own, so the
 * current markdown rides along in a hidden input.
 *
 * Only the body goes through here. lib/posts.ts splits frontmatter off
 * with gray-matter before this ever sees the file and re-stringifies it
 * on save, preserving keys the app does not manage, so nothing the
 * editor does can reach the frontmatter.
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
}: {
  name?: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [source, setSource] = useState(false);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label">The post</label>
        <button
          type="button"
          className="btn btn-quiet text-xs"
          onClick={() => setSource((s) => !s)}
        >
          {source ? "Back to the editor" : "Edit as MDX"}
        </button>
      </div>

      {/* The escape hatch. Anything the rich editor cannot express, or
          gets wrong, is fixable here without leaving the page. */}
      {source ? (
        <textarea
          rows={30}
          className="field font-mono text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div className="rounded-lg border border-line bg-background">
          <Editor
            markdown={initial}
            onChange={(next) => setValue(stripImports(next))}
          />
        </div>
      )}

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
