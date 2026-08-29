/**
 * Reading and writing the array props on the site's MDX components.
 *
 * `<CheckList items={["a", "b"]} />` and
 * `<StatRow stats={[{ icon: "clock", title: "..." }]} />` store their
 * value as a raw expression string in the JSX attribute, because that
 * is what it is in the file. To show a form instead of that string, the
 * expression has to be parsed, and to save it has to be written back.
 *
 * Neither direction is quite JSON. Object keys in the existing posts
 * are unquoted (`icon:`, not `"icon":`), which JSON.parse rejects, so
 * the read side tries progressively looser things and gives up
 * honestly rather than guessing. Nothing here evals; the content is
 * Sebastian's own, but a parser that can run code is still the wrong
 * shape for a text field.
 */

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; raw: string };

/** Quote bare object keys so JSON.parse will take them */
function quoteKeys(source: string): string {
  return source.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":');
}

/** Turn a JSX expression string into data, or report that it could not */
export function parseExpression<T>(raw: string): ParseResult<T> {
  const source = raw.trim();
  if (!source) return { ok: true, value: [] as unknown as T };

  for (const candidate of [source, quoteKeys(source)]) {
    try {
      return { ok: true, value: JSON.parse(candidate) as T };
    } catch {
      // try the next, then fall through to the honest failure
    }
  }
  return { ok: false, raw: source };
}

/**
 * Data back to an expression string.
 *
 * Writes valid JSON, which is also valid JS, so object keys come back
 * quoted even if they went in bare. That is a formatting change to the
 * file and the only one this editor makes to a component it touches.
 */
export function toExpression(value: unknown): string {
  return JSON.stringify(value);
}

export type Stat = { title: string; icon?: string; detail?: string };

/** The hero-card icon set, which is what StatRow's `icon` accepts */
export const STAT_ICONS = [
  "check",
  "calendar",
  "star",
  "sync",
  "chart",
  "mail",
  "clock",
  "phone",
  "users",
  "tag",
  "globe",
] as const;
