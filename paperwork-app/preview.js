/**
 * Print one draft's branded HTML to stdout, styles inlined:
 *
 *   node preview.js <slug>
 *
 * Mission Control spawns this for its in-app preview, so the document
 * layout has exactly one implementation and the preview cannot drift
 * from the PDF. Nothing here is new; it is renderDoc() with the toolbar
 * off, the same call generate.js makes before printing.
 */

import { getDrafts, renderDoc } from "./render.js";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node preview.js <slug>");
  process.exit(1);
}

const draft = getDrafts().find((d) => d.slug === slug);
if (!draft) {
  console.error(`No draft named "${slug}" in docs/clients/drafts/`);
  process.exit(1);
}

process.stdout.write(renderDoc(draft, { toolbar: false, inlineCss: true }));
