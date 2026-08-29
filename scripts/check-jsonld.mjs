const BASE = "http://localhost:3000";
const pages = ["/", "/services", "/services/website-design", "/services/ai-insights",
  "/about", "/contact", "/faq", "/blog", "/blog/before-you-buy-another-app",
  "/medford-small-business-automation", "/privacy"];

let problems = 0;
for (const path of pages) {
  const html = await fetch(BASE + path).then(r => r.text());
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => m[1]);
  const types = [];
  for (const raw of blocks) {
    let obj;
    try { obj = JSON.parse(raw.replace(/&quot;/g,'"').replace(/&amp;/g,"&")); }
    catch (e) { console.log(`  ${path}: UNPARSEABLE JSON-LD: ${e.message}`); problems++; continue; }
    const nodes = obj["@graph"] ?? [obj];
    for (const n of nodes) {
      types.push(n["@type"]);
      if (!n["@type"]) { console.log(`  ${path}: node with no @type`); problems++; }
    }
    if (!obj["@context"]) { console.log(`  ${path}: block missing @context`); problems++; }
  }
  console.log(`${path.padEnd(42)} ${blocks.length} block(s): ${types.join(", ") || "NONE"}`);
}
console.log(problems ? `\n${problems} problem(s)` : "\nno structural problems");
