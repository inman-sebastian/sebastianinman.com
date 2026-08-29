import fs from "node:fs";
const vocab = JSON.parse(fs.readFileSync("/tmp/schemaorg.jsonld", "utf8"))["@graph"];
const types = new Set(), props = new Set();
for (const n of vocab) {
  const id = (n["@id"] || "").replace("schema:", "");
  const t = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
  if (t.includes("rdfs:Class")) types.add(id);
  if (t.includes("rdf:Property")) props.add(id);
}
const BASE = "http://localhost:3000";
const pages = ["/", "/services", "/services/website-design", "/about", "/contact",
  "/faq", "/blog", "/blog/before-you-buy-another-app", "/medford-small-business-automation"];

const badTypes = new Set(), badProps = new Set();
const seenTypes = new Set(), seenProps = new Set();

function walk(node, page) {
  if (Array.isArray(node)) return node.forEach(n => walk(n, page));
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (k === "@type") {
      for (const ty of [].concat(v)) {
        seenTypes.add(ty);
        if (!types.has(ty)) badTypes.add(`${ty} (${page})`);
      }
    } else if (!k.startsWith("@")) {
      seenProps.add(k);
      if (!props.has(k)) badProps.add(`${k} (${page})`);
      walk(v, page);
    } else walk(v, page);
  }
}

for (const p of pages) {
  const html = await fetch(BASE + p).then(r => r.text());
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    walk(JSON.parse(m[1].replace(/&quot;/g,'"').replace(/&amp;/g,"&")), p);
  }
}
console.log(`types used   (${seenTypes.size}): ${[...seenTypes].sort().join(", ")}`);
console.log(`props used   (${seenProps.size}): ${[...seenProps].sort().join(", ")}`);
console.log(badTypes.size ? `\nINVALID TYPES: ${[...badTypes].join(", ")}` : "\nall types valid schema.org");
console.log(badProps.size ? `INVALID PROPS: ${[...badProps].join(", ")}` : "all properties valid schema.org");
