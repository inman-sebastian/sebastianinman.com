/**
 * Paperwork app: a tiny local server that renders client documents
 * (markdown/MDX drafts in ../docs/clients/drafts/) as print-ready,
 * brand-styled HTML. Runs independently from the website; documents
 * are just the letterhead and the content, no site chrome.
 *
 *   npm start   ->  http://localhost:4747
 *
 * Brand contact info is parsed live from ../content/site.ts so the
 * two apps never drift. NEVER deploy this; drafts hold client data.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS = path.join(ROOT, "..", "docs", "clients", "drafts");
const SITE_TS = path.join(ROOT, "..", "content", "site.ts");
const PORT = 4747;

/** Pull name/email/phone from the website's single source of truth */
function siteInfo() {
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

function drafts() {
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
        body: content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function page(title, body, { print = false } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
</head>
<body class="${print ? "doc" : "index"}">${body}</body>
</html>`;
}

function renderIndex() {
  const items = drafts()
    .map(
      (d) => `<li><a href="/doc/${esc(d.slug)}">
        <strong>${esc(d.title)}</strong>
        <span>${esc(d.client)}${d.date ? ` · ${esc(d.date)}` : ""}</span>
      </a></li>`
    )
    .join("\n");
  return page(
    "Paperwork",
    `<main>
      <p class="eyebrow">Local only · never deployed</p>
      <h1>Client paperwork</h1>
      <p class="sub">Drafts from <code>docs/clients/drafts/</code>. Open one,
      check every line, then print to PDF (Cmd+P).</p>
      <ul class="drafts">${items || "<li class='empty'>No drafts yet. The draft-client-paperwork skill creates them.</li>"}</ul>
    </main>`
  );
}

function renderDoc(d) {
  const info = siteInfo();
  const html = marked.parse(d.body);
  return page(
    d.title,
    `<nav class="toolbar">
      <a href="/">&larr; All documents</a>
      <span>Check every line, then Cmd+P to save as PDF</span>
    </nav>
    <article class="sheet">
      <table class="print-frame">
        <thead class="print-space"><tr><td></td></tr></thead>
        <tbody><tr><td>
          <header class="letterhead">
            <p class="wordmark"><span class="dot"></span>${esc(info.name)}</p>
            <p class="contact">${esc(info.email)}<br>${esc(info.phone)} · sebastianinman.com</p>
          </header>
          <div class="content">${html}</div>
          <footer class="docfoot">${esc(info.name)} · Southern Oregon · ${esc(info.email)} · ${esc(info.phone)}</footer>
        </td></tr></tbody>
        <tfoot class="print-space"><tr><td></td></tr></tfoot>
      </table>
    </article>`,
    { print: true }
  );
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const send = (code, type, body) => {
    res.writeHead(code, { "content-type": type });
    res.end(body);
  };

  if (url.pathname === "/style.css") {
    return send(200, "text/css", fs.readFileSync(path.join(ROOT, "style.css")));
  }
  if (url.pathname === "/") {
    return send(200, "text/html; charset=utf-8", renderIndex());
  }
  const m = url.pathname.match(/^\/doc\/([\w-]+)$/);
  if (m) {
    const d = drafts().find((x) => x.slug === m[1]);
    if (d) return send(200, "text/html; charset=utf-8", renderDoc(d));
  }
  send(404, "text/plain", "Not found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Paperwork app: http://localhost:${PORT}`);
});
