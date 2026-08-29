"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  Button,
  CreateLink,
  GenericJsxEditor,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  headingsPlugin,
  insertJsx$,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  usePublisher,
  type JsxComponentDescriptor,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import type { ForwardedRef } from "react";
import { CheckListEditor, StatRowEditor } from "./ArrayPropEditor";

/**
 * The site's MDX components, described so they can be inserted and
 * edited as forms rather than typed as JSX.
 *
 * `source` builds an import statement MDXEditor adds at the top of the
 * document, and it cannot be turned off. Our posts must never import
 * anything, because the site supplies these components globally, so
 * every descriptor names the same module and MdxBodyEditor strips the
 * resulting import back out on save. Verified: without that strip, one
 * edit puts `import { CheckList, Callout } from '@/components/mdx'`
 * into the committed post.
 *
 * Callout and ChatBubble take plain strings, so the generic editor
 * handles them well: labelled fields, and for Callout a nested rich
 * text area for its children. CheckList and StatRow take arrays, which
 * the generic editor can only show as raw expressions, so they get the
 * hand-written forms in ArrayPropEditor.
 */
const descriptors: JsxComponentDescriptor[] = [
  {
    name: "Callout",
    kind: "flow",
    source: "@/components/mdx",
    props: [{ name: "title", type: "string" }],
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "ChatBubble",
    kind: "flow",
    source: "@/components/mdx",
    props: [
      { name: "question", type: "string" },
      { name: "answer", type: "string" },
      { name: "caption", type: "string" },
    ],
    hasChildren: false,
    Editor: GenericJsxEditor,
  },
  {
    name: "CheckList",
    kind: "flow",
    source: "@/components/mdx",
    props: [{ name: "items", type: "expression" }],
    hasChildren: false,
    Editor: CheckListEditor,
  },
  {
    name: "StatRow",
    kind: "flow",
    source: "@/components/mdx",
    props: [{ name: "stats", type: "expression" }],
    hasChildren: false,
    Editor: StatRowEditor,
  },
  {
    name: "PromiseRow",
    kind: "flow",
    source: "@/components/mdx",
    props: [],
    hasChildren: false,
    Editor: GenericJsxEditor,
  },
];

/** One toolbar button per component, with a sensible starting shape */
function InsertComponents() {
  const insertJsx = usePublisher(insertJsx$);

  const insert = (
    name: string,
    props: Record<string, string | { type: "expression"; value: string }>
  ) => insertJsx({ name, kind: "flow", props });

  return (
    <>
      <Button
        onClick={() => insert("Callout", { title: "Worth knowing" })}
        title="Insert a Callout"
      >
        Callout
      </Button>
      <Button
        onClick={() =>
          insert("CheckList", {
            items: { type: "expression", value: '["First item"]' },
          })
        }
        title="Insert a CheckList"
      >
        CheckList
      </Button>
      <Button
        onClick={() =>
          insert("StatRow", {
            stats: {
              type: "expression",
              value: '[{"title":"Projects start at $500"}]',
            },
          })
        }
        title="Insert a StatRow"
      >
        StatRow
      </Button>
      <Button
        onClick={() =>
          insert("ChatBubble", {
            question: "Are you open Saturday?",
            answer: "Open 9 to 3.",
            caption: "",
          })
        }
        title="Insert a ChatBubble"
      >
        Chat
      </Button>
      <Button onClick={() => insert("PromiseRow", {})} title="Insert a PromiseRow">
        Promises
      </Button>
    </>
  );
}

export default function InitializedMDXEditor({
  editorRef,
  markdown,
  onChange,
  withComponents = false,
}: {
  editorRef?: ForwardedRef<MDXEditorMethods> | null;
  markdown: string;
  onChange: (value: string) => void;
  /** Enable the site's MDX components. Off for plain-markdown fields:
      without the plugin, a stray JSX tag is left as text rather than
      being offered as something to insert. */
  withComponents?: boolean;
}) {
  return (
    <MDXEditor
      ref={editorRef}
      markdown={markdown}
      onChange={onChange}
      contentEditableClassName="mdx-body"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        markdownShortcutPlugin(),
        ...(withComponents
          ? [jsxPlugin({ jsxComponentDescriptors: descriptors })]
          : []),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <BlockTypeSelect />
              <CreateLink />
              {withComponents && (
                <>
                  {/* Forces the component buttons onto a row of their
                      own rather than letting them wrap wherever they
                      land. A flex item at 100% basis takes the whole
                      line, so everything after it starts on the next. */}
                  <div className="mdx-toolbar-break" />
                  <InsertComponents />
                </>
              )}
            </>
          ),
        }),
      ]}
    />
  );
}
