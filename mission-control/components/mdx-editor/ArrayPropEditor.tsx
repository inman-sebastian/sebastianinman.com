"use client";

import { useMdastNodeUpdater, type JsxEditorProps, type MdastJsx } from "@mdxeditor/editor";
import { parseExpression, toExpression, STAT_ICONS, type Stat } from "./props";

/**
 * Forms for the two components whose props are arrays.
 *
 * MDXEditor's generic editor only understands string and expression
 * props, so without these a CheckList shows up as a box containing
 * `["...", "..."]` for hand-editing, which is worse than the plain
 * textarea it replaced. These give it labelled fields, an add button
 * and a remove button, which is the whole point of the exercise.
 *
 * If the expression cannot be parsed (someone wrote something clever in
 * the file), both fall back to editing the raw expression rather than
 * silently dropping it. Losing a reader's content to a parse failure
 * would be much worse than showing them a code box.
 */

function attrValue(node: MdastJsx, name: string): string {
  const attr = node.attributes.find(
    (a) => a.type === "mdxJsxAttribute" && a.name === name
  );
  if (!attr || attr.type !== "mdxJsxAttribute") return "";
  const value = attr.value;
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : String(value.value ?? "");
}

function useSetAttr(node: MdastJsx, name: string) {
  const update = useMdastNodeUpdater();
  return (expression: string) => {
    const others = node.attributes.filter(
      (a) => !(a.type === "mdxJsxAttribute" && a.name === name)
    );
    update({
      attributes: [
        ...others,
        {
          type: "mdxJsxAttribute",
          name,
          value: {
            type: "mdxJsxAttributeValueExpression",
            value: expression,
          },
        },
      ],
    });
  };
}

function RawFallback({
  label,
  raw,
  onChange,
}: {
  label: string;
  raw: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="rounded-lg bg-terracotta-tint p-3">
      <p className="text-xs font-semibold text-terracotta-dark">
        {label} could not be read as a list, so here it is as written.
      </p>
      <textarea
        className="field mt-2 font-mono text-xs"
        rows={4}
        defaultValue={raw}
        onBlur={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** `<CheckList items={["...", "..."]} />` */
export function CheckListEditor({ mdastNode }: JsxEditorProps) {
  const setItems = useSetAttr(mdastNode, "items");
  const parsed = parseExpression<string[]>(attrValue(mdastNode, "items"));

  if (!parsed.ok) {
    return (
      <RawFallback label="items" raw={parsed.raw} onChange={setItems} />
    );
  }

  const items = Array.isArray(parsed.value) ? parsed.value : [];
  const write = (next: string[]) => setItems(toExpression(next));

  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="label">Checklist</p>
      <div className="mt-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <textarea
              className="field text-sm"
              rows={2}
              defaultValue={item}
              onBlur={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                write(next);
              }}
            />
            <button
              type="button"
              className="btn btn-quiet shrink-0 text-xs"
              onClick={() => write(items.filter((_, at) => at !== i))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-quiet mt-2 text-xs"
        onClick={() => write([...items, ""])}
      >
        Add an item
      </button>
    </div>
  );
}

/** `<StatRow stats={[{ icon, title, detail }]} />` */
export function StatRowEditor({ mdastNode }: JsxEditorProps) {
  const setStats = useSetAttr(mdastNode, "stats");
  const parsed = parseExpression<Stat[]>(attrValue(mdastNode, "stats"));

  if (!parsed.ok) {
    return <RawFallback label="stats" raw={parsed.raw} onChange={setStats} />;
  }

  const stats = Array.isArray(parsed.value) ? parsed.value : [];
  const write = (next: Stat[]) => setStats(toExpression(next));
  const patch = (i: number, change: Partial<Stat>) => {
    const next = [...stats];
    next[i] = { ...next[i], ...change };
    // An empty icon or detail should leave the file, not sit there as ""
    if (!next[i].icon) delete next[i].icon;
    if (!next[i].detail) delete next[i].detail;
    write(next);
  };

  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="label">Promise cards</p>
      <div className="mt-2 space-y-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-lg border border-line p-2">
            <div className="flex gap-2">
              <select
                className="field w-32 shrink-0 text-sm"
                defaultValue={stat.icon ?? ""}
                onChange={(e) => patch(i, { icon: e.target.value })}
              >
                <option value="">No icon</option>
                {STAT_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
              <input
                className="field text-sm"
                placeholder="A short natural sentence"
                defaultValue={stat.title ?? ""}
                onBlur={(e) => patch(i, { title: e.target.value })}
              />
            </div>
            <input
              className="field mt-2 text-sm"
              placeholder="One supporting sentence (optional)"
              defaultValue={stat.detail ?? ""}
              onBlur={(e) => patch(i, { detail: e.target.value })}
            />
            <button
              type="button"
              className="btn btn-quiet mt-2 text-xs"
              onClick={() => write(stats.filter((_, at) => at !== i))}
            >
              Remove this card
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-quiet mt-2 text-xs"
        onClick={() => write([...stats, { title: "" }])}
      >
        Add a card
      </button>
    </div>
  );
}
