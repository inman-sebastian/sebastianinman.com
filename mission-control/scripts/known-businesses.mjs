/**
 * Who is already in the pipeline?
 *
 *   node scripts/known-businesses.mjs                 # list everyone known
 *   node scripts/known-businesses.mjs --check "A" "B" # test names before writing
 *
 * Research has to skip anyone already recorded, including the ones
 * passed on: re-adding a business somebody already decided against is
 * worse than not finding it at all, because it quietly undoes a
 * decision. Judging that by eye across two folders is exactly the sort
 * of thing that goes wrong at the end of a long run, so this does it
 * deterministically instead.
 *
 * Matching is on a normalised name (lowercased, punctuation dropped, a
 * leading "the" removed) and on the website's domain. Anything that
 * merely contains the other is reported as a MAYBE rather than a match,
 * because "Rogue Coffee" and "Rogue Coffee Roasters" might be one
 * business or two, and that is a judgement call, not a rule.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, "..", "data");

function normalise(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^\s*the\s+/, "")
    .trim();
}

function domainOf(url) {
  if (!url) return "";
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return "";
  }
}

/** Pull one frontmatter value without a YAML dependency */
function field(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function read(dir, kind) {
  const full = path.join(DATA, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const text = fs.readFileSync(path.join(full, f), "utf8");
      return {
        kind,
        slug: f.replace(/\.md$/, ""),
        name: field(text, "business") || field(text, "name"),
        website: field(text, "website"),
        status: field(text, "stage"),
      };
    })
    .filter((r) => r.name || r.website);
}

export function known() {
  // One store now: a researched business and a client are the same
  // record at different stages
  return read("clients", "record");
}

function describe(entry) {
  return `${entry.name || entry.slug} (stage: ${entry.status || "unknown"})`;
}

const all = known();
const args = process.argv.slice(2);
const checkAt = args.indexOf("--check");

if (checkAt === -1) {
  if (all.length === 0) {
    console.log("Nobody is on file yet, so nothing is off limits.");
  } else {
    console.log(`${all.length} already on file. Do not add any of these again:\n`);
    for (const e of all) {
      const site = e.website ? `  ${domainOf(e.website)}` : "";
      console.log(`  [${(e.status || "?").padEnd(10)}] ${e.name}${site}`);
    }
  }
  process.exit(0);
}

const candidates = args.slice(checkAt + 1);
if (candidates.length === 0) {
  console.error('Usage: node scripts/known-businesses.mjs --check "Business Name" ["Another"]');
  process.exit(1);
}

let anyKnown = false;
for (const candidate of candidates) {
  const n = normalise(candidate);
  const d = domainOf(candidate);

  const exact = all.find(
    (e) => normalise(e.name) === n || (d && domainOf(e.website) === d)
  );
  if (exact) {
    anyKnown = true;
    console.log(`KNOWN  ${candidate}  ->  already ${describe(exact)}`);
    continue;
  }

  // Token overlap rather than substring: businesses get written down
  // under slightly different names ("Shine On Salon" for "Shine On Hair
  // Salon"), and neither contains the other as a substring.
  const words = new Set(n.split(" ").filter(Boolean));
  const near = all.find((e) => {
    const other = normalise(e.name);
    if (!other || !n) return false;
    if (other.includes(n) || n.includes(other)) return true;
    const otherWords = new Set(other.split(" ").filter(Boolean));
    if (words.size < 2 || otherWords.size < 2) return false;
    const shared = [...words].filter((w) => otherWords.has(w)).length;
    // Generous on purpose: MAYBE only asks for a human look, and a
    // missed duplicate is worse than a second glance
    return shared >= 2 && shared / Math.min(words.size, otherWords.size) >= 0.6;
  });
  if (near) {
    anyKnown = true;
    console.log(`MAYBE  ${candidate}  ->  looks like ${describe(near)}; check before adding`);
    continue;
  }

  console.log(`NEW    ${candidate}`);
}

// Non-zero when anything matched, so a script can branch on it
process.exit(anyKnown ? 2 : 0);
