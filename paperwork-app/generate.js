/**
 * Headless PDF generation:
 *
 *   npm run generate -- <slug>
 *   -> docs/clients/drafts/out/<slug>.pdf
 *
 * Pipeline: puppeteer-core drives the INSTALLED Chrome (no bundled
 * browser) through the same print CSS as the preview, so the body
 * pages match the proven print layout exactly. If the draft declares
 * `signatures:` in frontmatter, pdf-lib appends a brand-styled signing
 * page with REAL AcroForm text fields (typed signature + date per
 * signer) that work in any PDF viewer; recipients can also print and
 * sign by hand. Chrome path override: PAPERWORK_CHROME env var.
 */

import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { ROOT, DRAFTS, getDrafts, renderDoc, siteInfo } from "./render.js";

const CHROME =
  process.env.PAPERWORK_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Brand palette (mirror of style.css)
const SURFACE = rgb(1, 253 / 255, 248 / 255);
const INK = rgb(43 / 255, 38 / 255, 32 / 255);
const MUTED = rgb(107 / 255, 98 / 255, 87 / 255);
const PINE = rgb(35 / 255, 79 / 255, 62 / 255);
const PINE_DARK = rgb(24 / 255, 56 / 255, 44 / 255);
const TERRACOTTA = rgb(192 / 255, 95 / 255, 51 / 255);

const PAGE_W = 612; // Letter, points
const PAGE_H = 792;
const MARGIN = 66;

async function renderBodyPdf(draft) {
  const html = renderDoc(draft, {
    toolbar: false,
    htmlSignatures: false,
    inlineCss: true,
  });
  const browser = await puppeteer.launch({ executablePath: CHROME });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    return await page.pdf({
      format: "letter",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
    });
  } finally {
    await browser.close();
  }
}

async function appendSignaturePage(bodyPdfBytes, draft) {
  const info = siteInfo();
  const doc = await PDFDocument.load(bodyPdfBytes);
  doc.registerFontkit(fontkit);
  // The static instance: the variable-font slice used for OG images
  // breaks letter spacing when embedded in PDFs
  const fraunces = await doc.embedFont(
    fs.readFileSync(
      path.join(ROOT, "..", "assets", "fonts", "fraunces-600-static.ttf")
    )
  );
  const outfit = await doc.embedFont(
    fs.readFileSync(path.join(ROOT, "..", "assets", "fonts", "outfit-500.ttf"))
  );

  const page = doc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: SURFACE });

  // Letterhead: sun dot, wordmark, contact, pine rule
  let y = PAGE_H - MARGIN - 14;
  page.drawCircle({ x: MARGIN + 6, y: y + 5, size: 5.5, color: TERRACOTTA });
  page.drawText(info.name, {
    x: MARGIN + 20,
    y,
    size: 16,
    font: fraunces,
    color: PINE_DARK,
  });
  const contact = `${info.email} · ${info.phone}`;
  page.drawText(contact, {
    x: PAGE_W - MARGIN - outfit.widthOfTextAtSize(contact, 8.5),
    y: y + 2,
    size: 8.5,
    font: outfit,
    color: MUTED,
  });
  y -= 22;
  page.drawRectangle({ x: MARGIN, y, width: PAGE_W - 2 * MARGIN, height: 1.5, color: PINE });

  // Title + instruction
  y -= 52;
  page.drawText("Agreed and signed", { x: MARGIN, y, size: 21, font: fraunces, color: PINE_DARK });
  y -= 22;
  page.drawText(
    "Type your name and the date in the fields below, or print this page and sign by hand.",
    { x: MARGIN, y, size: 10, font: outfit, color: MUTED }
  );

  // Signer blocks with real form fields
  const form = doc.getForm();
  y -= 58;
  draft.signatures.forEach((name, i) => {
    page.drawText(name, { x: MARGIN, y, size: 11.5, font: outfit, color: INK });

    const lineY = y - 46;
    const sigW = 300;
    const dateX = MARGIN + sigW + 40;
    const dateW = PAGE_W - MARGIN - dateX;

    // ruled lines
    page.drawRectangle({ x: MARGIN, y: lineY, width: sigW, height: 1.2, color: INK });
    page.drawRectangle({ x: dateX, y: lineY, width: dateW, height: 1.2, color: INK });
    // labels
    page.drawText("Signature", { x: MARGIN, y: lineY - 13, size: 8, font: outfit, color: MUTED });
    page.drawText("Date", { x: dateX, y: lineY - 13, size: 8, font: outfit, color: MUTED });

    // interactive fields sitting on the lines
    const sig = form.createTextField(`signature_${i + 1}`);
    sig.addToPage(page, {
      x: MARGIN,
      y: lineY + 2,
      width: sigW,
      height: 30,
      borderWidth: 0,
      backgroundColor: SURFACE,
    });
    const date = form.createTextField(`date_${i + 1}`);
    date.addToPage(page, {
      x: dateX,
      y: lineY + 2,
      width: dateW,
      height: 30,
      borderWidth: 0,
      backgroundColor: SURFACE,
    });

    y = lineY - 64;
  });

  // Footer, aligned with the HTML pages' pinned docfoot (hairline at
  // ~0.7in, text baseline ~0.43in)
  const LINE = rgb(231 / 255, 223 / 255, 210 / 255);
  page.drawRectangle({ x: MARGIN, y: 50, width: PAGE_W - 2 * MARGIN, height: 0.75, color: LINE });
  const foot = `${info.name} · Southern Oregon · ${info.email} · ${info.phone}`;
  page.drawText(foot, { x: MARGIN, y: 31, size: 8, font: outfit, color: MUTED });

  form.updateFieldAppearances(outfit);
  return doc.save();
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npm run generate -- <slug>");
    console.error("Available drafts:");
    for (const d of getDrafts()) console.error(`  ${d.slug}`);
    process.exit(1);
  }
  const draft = getDrafts().find((d) => d.slug === slug);
  if (!draft) {
    console.error(`No draft named "${slug}" in docs/clients/drafts/`);
    process.exit(1);
  }
  if (!fs.existsSync(CHROME)) {
    console.error(`Chrome not found at ${CHROME}; set PAPERWORK_CHROME`);
    process.exit(1);
  }

  let pdf = await renderBodyPdf(draft);
  if (draft.signatures.length) {
    pdf = await appendSignaturePage(pdf, draft);
  }

  const outDir = path.join(DRAFTS, "out");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.pdf`);
  fs.writeFileSync(outPath, pdf);
  console.log(
    `Generated ${outPath}${draft.signatures.length ? ` (signing page with ${draft.signatures.length * 2} form fields)` : ""}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
