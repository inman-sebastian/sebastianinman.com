/**
 * Paperwork app preview server: renders client documents
 * (markdown/MDX drafts in ../docs/clients/drafts/) as brand-styled
 * HTML for checking before generation. The finished PDF comes from
 * generate.js (headless, with real signature form fields), not from
 * printing this page.
 *
 *   npm start                     ->  http://localhost:4747
 *   npm run generate -- <slug>    ->  docs/clients/drafts/out/<slug>.pdf
 *
 * Brand contact info is parsed live from ../content/site.ts so the
 * two apps never drift. NEVER deploy this; drafts hold client data.
 * NOTE: plain Node, no hot reload; restart after editing js files.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { ROOT, getDrafts, renderIndex, renderDoc } from "./render.js";
import { buildPdf } from "./generate.js";

const PORT = 4747;

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
    const d = getDrafts().find((x) => x.slug === m[1]);
    if (d) return send(200, "text/html; charset=utf-8", renderDoc(d));
  }
  // The exact final artifact, generated on demand (takes a few seconds)
  const pm = url.pathname.match(/^\/pdf\/([\w-]+)$/);
  if (pm) {
    const d = getDrafts().find((x) => x.slug === pm[1]);
    if (d) {
      return buildPdf(d)
        .then((pdf) => send(200, "application/pdf", Buffer.from(pdf)))
        .catch((err) => send(500, "text/plain", String(err)));
    }
  }
  send(404, "text/plain", "Not found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Paperwork app: http://localhost:${PORT}`);
});
