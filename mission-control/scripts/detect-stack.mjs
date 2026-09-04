/**
 * What is this website built on, and what is it already wired up to?
 *
 *   node scripts/detect-stack.mjs https://example.com [more urls...]
 *
 * Fetches each page ONCE, the same as opening it in a browser, and reads
 * the metadata: the generator tag, the script and stylesheet hosts, a few
 * response headers. No crawling, no second page, no login walls.
 *
 * Two things come out of it. The platform tells you what you would be
 * working on or replacing. The tools tell you what is already in the
 * business, which is the more useful half: a salon on Vagaro already
 * pays for online booking, and a shop on Square already has the payment
 * side handled. Tools that appear on the tool-integration service page
 * are marked, because those are the ones Sebastian already connects.
 *
 * It also answers a few plain questions a person would ask by looking:
 * does it work on a phone, is there a form, is there an email address.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** One winner: what the site is built on. Order matters, first hit wins. */
const PLATFORMS = [
  ["Shopify", [/cdn\.shopify\.com/i, /myshopify\.com/i, /Shopify\.theme/i]],
  ["Squarespace", [/squarespace[-.]cdn\.com/i, /static1\.squarespace\.com/i, /generator"\s+content="Squarespace/i]],
  ["Wix", [/wixstatic\.com/i, /Wix\.com Website Builder/i, /_wixCssImports/i]],
  ["Webflow", [/assets\.website-files\.com/i, /generator"\s+content="Webflow/i, /uploads-ssl\.webflow\.com/i]],
  ["GoDaddy Website Builder", [/img1\.wsimg\.com/i, /Starfield Technologies/i]],
  ["Weebly", [/generator"\s+content="Weebly/i, /editmysite\.com/i, /weeblysite\.com/i]],
  ["Duda", [/irp\.cdn-website\.com/i, /Duda Website Builder/i, /dudaone/i]],
  ["Framer", [/framerusercontent\.com/i, /generator"\s+content="Framer/i]],
  ["Google Sites", [/sites\.google\.com\/embed/i, /googleusercontent\.com\/sites/i]],
  ["Joomla", [/generator"\s+content="Joomla/i]],
  ["Drupal", [/generator"\s+content="Drupal/i, /\/sites\/default\/files\//i]],
  ["Next.js", [/\/_next\/static\//i, /__NEXT_DATA__/i]],
  ["Hugo", [/generator"\s+content="Hugo/i]],
  ["Jekyll", [/generator"\s+content="Jekyll/i]],
  // WordPress last: plenty of the above can sit on top of it, and the
  // wp- paths show up in embeds on sites that are not WordPress at all
  ["WordPress", [/\/wp-content\//i, /\/wp-includes\//i, /generator"\s+content="WordPress/i, /\/wp-json\//i]],
];

/** Many: what the business already runs on. */
const TOOLS = [
  // Booking and scheduling
  ["Vagaro", "Booking", [/vagaro\.com/i]],
  ["Squire", "Booking", [/getsquire\.com/i]],
  ["Booksy", "Booking", [/booksy\.com/i]],
  ["Boulevard", "Booking", [/joinblvd\.com/i, /blvd\.co\b/i]],
  ["Mindbody", "Booking", [/mindbodyonline\.com/i, /mindbody\.io/i]],
  ["Calendly", "Booking", [/calendly\.com/i]],
  ["Acuity Scheduling", "Booking", [/acuityscheduling\.com/i, /squarespacescheduling\.com/i]],
  ["Square Appointments", "Booking", [/squareup\.com\/appointments/i]],
  ["Setmore", "Booking", [/setmore\.com/i]],
  ["Schedulicity", "Booking", [/schedulicity\.com/i]],
  ["StyleSeat", "Booking", [/styleseat\.com/i]],
  ["Fresha", "Booking", [/fresha\.com/i]],
  ["OpenTable", "Booking", [/opentable\.com/i]],
  ["Resy", "Booking", [/resy\.com/i]],
  ["Tock", "Booking", [/exploretock\.com/i]],
  ["SevenRooms", "Booking", [/sevenrooms\.com/i]],
  // Ordering, point of sale, shop
  ["Toast", "Ordering", [/toasttab\.com/i]],
  ["Clover", "Ordering", [/clover\.com/i]],
  ["Square Online", "Ordering", [/square\.site/i, /squareup\.com\/store/i]],
  ["ChowNow", "Ordering", [/chownow\.com/i]],
  ["GloriaFood", "Ordering", [/gloriafood\.com/i]],
  ["Slice", "Ordering", [/slicelife\.com/i]],
  ["WooCommerce", "Shop", [/woocommerce/i, /wp-content\/plugins\/woocommerce/i]],
  ["Ecwid", "Shop", [/ecwid\.com/i]],
  ["BigCommerce", "Shop", [/bigcommerce\.com/i]],
  ["Etsy", "Shop", [/etsy\.com\/shop/i]],
  // Money
  ["Stripe", "Payments", [/js\.stripe\.com/i]],
  ["PayPal", "Payments", [/paypal\.com\/sdk/i, /paypalobjects\.com/i]],
  ["Square", "Payments", [/squarecdn\.com/i, /web\.squarecdn\.com/i]],
  // Email and marketing
  ["Mailchimp", "Email", [/list-manage\.com/i, /mailchimp\.com/i, /chimpstatic\.com/i]],
  ["Klaviyo", "Email", [/klaviyo\.com/i]],
  ["Constant Contact", "Email", [/constantcontact\.com/i, /ctctcdn\.com/i]],
  ["ConvertKit", "Email", [/convertkit\.com/i]],
  // Talking to customers
  ["Intercom", "Chat", [/intercom\.io/i, /intercomcdn\.com/i]],
  ["Tawk.to", "Chat", [/tawk\.to/i]],
  ["Crisp", "Chat", [/crisp\.chat/i]],
  ["Drift", "Chat", [/drift\.com/i]],
  ["Podium", "Reviews", [/podium\.com/i]],
  ["Birdeye", "Reviews", [/birdeye\.com/i]],
  // Forms and CRM
  ["Typeform", "Forms", [/typeform\.com/i]],
  ["Jotform", "Forms", [/jotform\.com/i]],
  ["Gravity Forms", "Forms", [/gravityforms/i]],
  ["HubSpot", "CRM", [/hs-scripts\.com/i, /hubspot\.com/i]],
  // Measurement
  ["Google Analytics", "Analytics", [/googletagmanager\.com\/gtag/i, /google-analytics\.com/i]],
  ["Google Tag Manager", "Analytics", [/googletagmanager\.com\/gtm/i]],
  ["Meta Pixel", "Analytics", [/connect\.facebook\.net/i]],
];

/**
 * Social profiles, by hostname. These are the business's own presence,
 * often the main one for a consumer-facing shop, so they are worth
 * recording beside the website. Order sets which name a shared host maps
 * to (twitter.com and x.com both read as X). Detection copies these; the
 * display names live in mission-control/lib/socials.ts.
 */
const SOCIALS = [
  ["Instagram", /^(?:www\.)?instagram\.com$/i],
  ["Facebook", /^(?:www\.|[a-z-]+\.)?facebook\.com$/i],
  ["Facebook", /^(?:www\.)?fb\.com$/i],
  ["LinkedIn", /^(?:www\.|[a-z]{2}\.)?linkedin\.com$/i],
  ["X", /^(?:www\.)?(?:twitter|x)\.com$/i],
  ["YouTube", /^(?:www\.|m\.)?youtube\.com$/i],
  ["TikTok", /^(?:www\.)?tiktok\.com$/i],
  ["Yelp", /^(?:www\.)?yelp\.com$/i],
  ["Pinterest", /^(?:www\.)?pinterest\.com$/i],
];

/**
 * Paths that are a share/follow widget or a tracker, not the business's
 * own profile. A "share to Facebook" button links facebook.com/sharer;
 * recording that as their page would be wrong.
 */
const NOT_A_PROFILE = [
  /\/sharer\b/i,
  /\/share\b/i,
  /\/shareArticle\b/i,
  /\/plugins?\//i,
  /\/intent\//i,
  /\/dialog\//i,
  /^\/tr\/?$/i, // facebook.com/tr is the Meta Pixel beacon, not a page
  /^\/?$/, // the bare homepage of the network, no handle
];

/** Tools Sebastian already lists as ones he connects */
function knownTools() {
  const file = path.join(ROOT, "content", "services", "tool-integration.mdx");
  if (!fs.existsSync(file)) return new Set();
  const block = fs.readFileSync(file, "utf8").match(/^tools:\n([\s\S]*?)^\w/m);
  if (!block) return new Set();
  return new Set(
    [...block[1].matchAll(/^\s*-\s*"([^"]+)"/gm)].map((m) => m[1].toLowerCase())
  );
}

function match(patterns, haystack) {
  return patterns.some((re) => re.test(haystack));
}

async function fetchPage(url) {
  const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const res = await fetch(target, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: {
      // A normal browser string. This makes one request for one page, the
      // same thing a person opening the site does; plenty of small-business
      // hosts return 403 to anything that doesn't look like a browser,
      // which reads as "no website" and would be wrong.
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
  });
  const html = await res.text();
  return { res, html, finalUrl: res.url || target };
}

export async function detect(url) {
  const out = {
    url,
    ok: false,
    status: 0,
    finalUrl: "",
    platform: "",
    generator: "",
    tools: [],
    mobileReady: false,
    hasForm: false,
    emails: [],
    title: "",
    googleMapsLink: "",
    lat: null,
    lng: null,
    socials: [],
    note: "",
  };

  let html = "";
  let headerBlob = "";
  try {
    const { res, html: body, finalUrl } = await fetchPage(url);
    html = body;
    out.status = res.status;
    out.finalUrl = finalUrl;
    headerBlob = [...res.headers.entries()]
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    if (!res.ok) {
      // Whatever came back describes the block page, not the business.
      // Reading a viewport tag off a Cloudflare challenge and calling it
      // "works on phones" would be a lie in the file.
      out.note = `The site answered ${res.status}, so nothing was read from it. Open it in a browser and check by hand.`;
      return out;
    }
    out.ok = true;
  } catch (err) {
    out.note = `Could not reach it: ${err instanceof Error ? err.message : String(err)}`;
    return out;
  }

  const blob = `${html}\n${headerBlob}`;

  const generator = html.match(
    /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i
  );
  out.generator = generator ? generator[1].trim() : "";

  const platform = PLATFORMS.find(([, patterns]) => match(patterns, blob));
  out.platform = platform ? platform[0] : "";

  const known = knownTools();
  out.tools = TOOLS.filter(([, , patterns]) => match(patterns, blob)).map(
    ([name, category]) => ({
      name,
      category,
      alreadyIntegrated: known.has(name.toLowerCase()),
    })
  );

  // A link or embed pointing at Google Maps is a decent sign the
  // business has a Business Profile, and gives the research something
  // concrete to check rather than guess at.
  const mapsLink = html.match(
    /https?:\/\/(?:www\.)?google\.[a-z.]+\/maps\/[^"'\s<>]+|https?:\/\/maps\.app\.goo\.gl\/[^"'\s<>]+|https?:\/\/goo\.gl\/maps\/[^"'\s<>]+/i
  );
  out.googleMapsLink = mapsLink ? mapsLink[0].replace(/&amp;/g, "&") : "";

  // Google's embed URLs carry the pin's own coordinates as !2d<lng>!3d<lat>.
  // When a site embeds its own map that is the business's actual spot,
  // which beats geocoding the middle of the town.
  const coords = out.googleMapsLink.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (coords) {
    out.lng = Number(coords[1]);
    out.lat = Number(coords[2]);
  }

  // Their own social profiles: links out to Instagram, Facebook and the
  // rest. Keep the first real profile URL per network, skipping the
  // share/follow widgets and trackers that use the same hosts.
  const byNetwork = new Map();
  for (const m of html.matchAll(/https?:\/\/[^"'\s<>()]+/gi)) {
    const raw = m[0].replace(/&amp;/g, "&").replace(/[.,)]+$/, "");
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      continue;
    }
    const hit = SOCIALS.find(([, re]) => re.test(parsed.hostname));
    if (!hit) continue;
    const [name] = hit;
    if (byNetwork.has(name)) continue;
    if (NOT_A_PROFILE.some((re) => re.test(parsed.pathname))) continue;
    byNetwork.set(name, `${parsed.origin}${parsed.pathname}`.replace(/\/$/, ""));
  }
  out.socials = [...byNetwork.values()];

  out.mobileReady = /<meta[^>]+name=["']viewport["']/i.test(html);
  out.hasForm = /<form[\s>]/i.test(html);
  out.emails = [
    ...new Set(
      [...html.matchAll(/mailto:([^"'?>\s]+@[^"'?>\s]+)/gi)].map((m) =>
        m[1].toLowerCase()
      )
    ),
  ];
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  out.title = title ? title[1].trim().slice(0, 120) : "";

  return out;
}

function report(r) {
  const lines = [`\n${r.url}`];
  if (r.note) lines.push(`  ! ${r.note}`);
  if (!r.ok) return lines.join("\n");

  if (r.title) lines.push(`  Title:     ${r.title}`);
  lines.push(`  Built on:  ${r.platform || "nothing recognisable"}${r.generator ? `  (generator: ${r.generator})` : ""}`);

  if (r.tools.length) {
    lines.push("  Running:");
    for (const t of r.tools) {
      lines.push(
        `    - ${t.name} (${t.category})${t.alreadyIntegrated ? "  [on your tool list]" : ""}`
      );
    }
  } else {
    lines.push("  Running:   nothing recognisable");
  }

  lines.push(`  On a phone: ${r.mobileReady ? "yes, has a viewport tag" : "NO VIEWPORT TAG, likely broken on phones"}`);
  lines.push(`  A form:     ${r.hasForm ? "yes" : "none on the homepage"}`);
  if (r.googleMapsLink) {
    lines.push(`  Google Maps link on the page: ${r.googleMapsLink}`);
    lines.push("    (so they very likely have a Business Profile; open it and confirm)");
  }
  if (r.lat !== null && r.lng !== null) {
    lines.push(`  Pin on their own map: ${r.lat}, ${r.lng}`);
  }
  if (r.emails.length) lines.push(`  Published:  ${r.emails.join(", ")}`);
  if (r.socials.length) {
    lines.push("  Social:");
    for (const url of r.socials) lines.push(`    - ${url}`);
  }

  // Paste-ready for the prospect file
  lines.push("  ---");
  lines.push(`  platform: ${r.platform ? `'${r.platform}'` : "''"}`);
  if (r.googleMapsLink) lines.push("  googleProfile: yes");
  if (r.lat !== null && r.lng !== null) {
    lines.push(`  lat: ${r.lat}`);
    lines.push(`  lng: ${r.lng}`);
  }
  if (r.tools.length) {
    lines.push("  stack:");
    for (const t of r.tools) lines.push(`    - ${t.name}`);
  } else {
    lines.push("  stack: []");
  }
  if (r.socials.length) {
    lines.push("  socials:");
    for (const url of r.socials) lines.push(`    - ${url}`);
  } else {
    lines.push("  socials: []");
  }
  return lines.join("\n");
}

const invoked = process.argv[1] && process.argv[1].endsWith("detect-stack.mjs");
if (invoked) {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.error("Usage: node scripts/detect-stack.mjs <url> [url...]");
    process.exit(1);
  }
  const results = await Promise.all(urls.map((u) => detect(u)));
  for (const r of results) console.log(report(r));
  console.log("");
}
