/**
 * Shared rendering for the paperwork app: drafts loading, brand info,
 * and the HTML document template. Used by server.js (live preview) and
 * generate.js (headless PDF generation).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

export const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const DRAFTS = path.join(ROOT, "..", "docs", "clients", "drafts");
const SITE_TS = path.join(ROOT, "..", "content", "site.ts");

/** Pull name/email/phone from the website's single source of truth */
export function siteInfo() {
  const src = fs.readFileSync(SITE_TS, "utf8");
  const grab = (key, fallback) => {
    const m = src.match(new RegExp(`${key}:\\s*"([^"]+)"`));
    return m ? m[1] : fallback;
  };
  return {
    name: grab("name", "Sebastian Inman"),
    email: grab("email", ""),
    phone: grab("phone", ""),
  };
}

export function getDrafts() {
  if (!fs.existsSync(DRAFTS)) return [];
  return fs
    .readdirSync(DRAFTS)
    .filter((f) => /\.(md|mdx)$/.test(f))
    .map((f) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(DRAFTS, f), "utf8")
      );
      return {
        slug: f.replace(/\.(md|mdx)$/, ""),
        title: String(data.title ?? f),
        client: String(data.client ?? ""),
        date: String(data.date ?? ""),
        signatures: Array.isArray(data.signatures)
          ? data.signatures.map(String)
          : [],
        body: content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pageHtml(title, body, { print = false, inlineCss = false } = {}) {
  const css = inlineCss
    ? `<style>${fs.readFileSync(path.join(ROOT, "style.css"), "utf8")}</style>`
    : `<link rel="stylesheet" href="/style.css">`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
${css}
</head>
<body class="${print ? "doc" : "index"}">${body}</body>
</html>`;
}

export function renderIndex() {
  const items = getDrafts()
    .map(
      (d) => `<li><a href="/doc/${esc(d.slug)}">
        <strong>${esc(d.title)}</strong>
        <span>${esc(d.client)}${d.date ? ` · ${esc(d.date)}` : ""}</span>
      </a></li>`
    )
    .join("\n");
  return pageHtml(
    "Paperwork",
    `<main>
      <p class="eyebrow">Local only · never deployed</p>
      <h1>Client paperwork</h1>
      <p class="sub">Drafts from <code>docs/clients/drafts/</code>. Preview
      here; generate finished PDFs with
      <code>npm run generate -- &lt;slug&gt;</code>.</p>
      <ul class="drafts">${items || "<li class='empty'>No drafts yet. The draft-client-paperwork skill creates them.</li>"}</ul>
    </main>`
  );
}

/**
 * The document template. Options:
 * - toolbar: the on-screen helper bar (off for headless generation)
 * - htmlSignatures: render signature blocks as HTML lines (the preview
 *   path); generate.js turns this off and builds a native PDF signing
 *   page with real form fields instead
 * - inlineCss: embed style.css directly (headless has no server)
 */
export function renderDoc(
  d,
  { toolbar = true, htmlSignatures = true, inlineCss = false } = {}
) {
  const info = siteInfo();
  const html = marked.parse(d.body);
  const signatures =
    htmlSignatures && d.signatures.length
      ? `<section class="signatures">
        ${d.signatures
          .map(
            (name) => `<div class="sig-row">
          <div class="sig-field">
            <span class="sig-line"></span>
            <span class="sig-label">Signature · ${esc(name)}</span>
          </div>
          <div class="sig-field sig-date">
            <span class="sig-line"></span>
            <span class="sig-label">Date</span>
          </div>
        </div>`
          )
          .join("\n")}
      </section>`
      : "";
  const bar = toolbar
    ? `<nav class="toolbar">
      <a href="/">&larr; All documents</a>
      <span>Preview only: generate the finished PDF with <code>npm run generate -- ${esc(d.slug)}</code></span>
    </nav>`
    : "";
  return pageHtml(
    d.title,
    `${bar}
    <article class="sheet">
      <table class="print-frame">
        <thead class="print-space"><tr><td><div class="spacer"></div></td></tr></thead>
        <tbody><tr><td>
          <header class="letterhead">
            <p class="wordmark"><span class="dot"></span>${esc(info.name)}</p>
            <p class="contact">${esc(info.email)}<br>${esc(info.phone)} · sebastianinman.com</p>
          </header>
          <div class="content">${html}</div>
          ${signatures}
          <footer class="docfoot">${esc(info.name)} · Southern Oregon · ${esc(info.email)} · ${esc(info.phone)}</footer>
        </td></tr></tbody>
        <tfoot class="print-space"><tr><td><div class="spacer"></div></td></tr></tfoot>
      </table>
    </article>`,
    { print: true, inlineCss }
  );
}
