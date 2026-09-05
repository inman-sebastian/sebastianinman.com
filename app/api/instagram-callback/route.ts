/**
 * Instagram OAuth callback relay for Mission Control.
 *
 * Mission Control is a local-only app, so Meta cannot redirect to it (and
 * it rejects a localhost redirect anyway). This endpoint, on a domain we
 * own, is registered as the OAuth redirect. It does exactly one thing:
 * catch Instagram's one-time authorization `code` and show it so it can be
 * copied into Mission Control, which finishes the token exchange locally.
 *
 * It holds no secret and stores nothing. The `code` is single-use, expires
 * in about an hour, and is worthless without the app secret, which never
 * leaves the local machine. Not linked anywhere and not indexed.
 */

export const dynamic = "force-dynamic";

const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function page(title: string, inner: string): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${escape(title)}</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #f7f4ee; color: #2b2b2b;
    font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .card { max-width: 34rem; margin: 1.5rem; padding: 2rem; background: #fff;
    border: 1px solid #e6e1d7; border-radius: 16px; }
  h1 { margin: 0 0 .5rem; font-size: 1.25rem; color: #234f3e; }
  p { margin: .5rem 0; }
  code { display: block; word-break: break-all; background: #f2efe8;
    border: 1px solid #e6e1d7; border-radius: 10px; padding: .75rem;
    margin: 1rem 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: .85rem; }
  button { font: inherit; font-weight: 600; color: #fff; background: #234f3e;
    border: 0; border-radius: 10px; padding: .6rem 1rem; cursor: pointer; }
  .muted { color: #6b6b6b; font-size: .875rem; }
  .err { color: #a3341f; }
</style>
</head>
<body><div class="card">${inner}</div></body>
</html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const error = params.get("error_message") || params.get("error");
  if (error) {
    return page(
      "Instagram connection error",
      `<h1>That didn't connect</h1>
       <p class="err">${escape(error)}</p>
       <p class="muted">Close this tab and try Connect Instagram again in Mission Control.</p>`,
    );
  }

  const code = (params.get("code") ?? "").replace(/#_$/, "");
  if (!code) {
    return page(
      "Instagram connection",
      `<h1>No code received</h1>
       <p class="muted">Close this tab and try Connect Instagram again in Mission Control.</p>`,
    );
  }

  const safe = escape(code);
  return page(
    "Instagram connection code",
    `<h1>Almost there</h1>
     <p>Copy this code and paste it into Mission Control's Instagram box. It expires in about an hour.</p>
     <code id="code">${safe}</code>
     <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('code').textContent).then(()=>{this.textContent='Copied'})">Copy code</button>
     <p class="muted">This page holds no login and stores nothing. You can close it once the code is pasted.</p>`,
  );
}
