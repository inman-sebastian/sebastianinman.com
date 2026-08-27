# Images needed

Running checklist of images the site expects. Until a file exists at its
path, the site shows a styled placeholder with the prompt text. To swap one
in: generate the image, save it to the path below (exact filename), run
`npm run optimize:images` (downscales and recompresses the source; the
generator's raw output is ~2MB where ~200KB is needed), then refresh.
Check items off as they're done.

Each entry has a **Prompt** (copy it verbatim into the generator; it matches
what the site's placeholder displays) and **Notes** (context and lessons for
humans and Claude only; never paste notes into the generator).

**Replacing an image that's already been viewed:** the dev server's build
cache (Turbopack) can keep serving old optimized copies of a same-named file
even after restarts and hard refreshes. If a replaced image won't update,
stop the dev server and run `npm run dev:fresh` (it clears `.next` before
starting). Then hard-refresh the browser (Cmd+Shift+R).

**Aspect ratio: generate illustrations at 4:3**, with two exceptions: the
CTA band treetops are **16:9** (rendered as a full-width background), and
the headshot is a real portrait photo. Every other illustration slot is a
4:3 box. The site crops anything else to fit (`object-cover`), so
off-ratio uploads lose their edges.

**Style baseline for all illustration prompts** (already baked into each
prompt below; keep it in any new ones): friendly modern flat illustration
style, earthy cream background (#faf6ef), deep pine green (#234f3e) and
terracotta (#c05f33) accents. Warm and approachable, for small-business
owners rather than a tech crowd.

## Photos

- [x] `public/images/headshot.jpg` (~600×700, portrait)
  - **Prompt:** none. Real photo of Sebastian; already exists, just drop it in.
  - **Notes:** used on Home + About.

## Illustrations

- ~~`public/images/home-hero.jpg`~~ **RETIRED (Aug 2026): the hero is now
  a flat deep-pine background with no image.**
  - **Notes:** Sebastian dropped the hero image entirely: the dusk-river
    art no longer matched, and the site was already image-heavy. The
    hero keeps its light-on-dark styling (cream text, light CTA variant)
    over flat `pine-dark`; if a hero image ever returns, revive the
    lessons that lived here: no explicit "left half empty" phrasing
    (generators draw a literal seam; describe one scene with asymmetric
    weight instead), no storefronts with signs (v1's "The Valley Post"
    read as the business name), and always check results for sneaky
    lettering before uploading.

- [x] `public/images/cta-treetops.jpg` (**16:9**, e.g. 2560×1440)
  - **Prompt:** "Wide 16:9 flat illustration used as a background: a solid deep pine green field (#234f3e) with a silhouetted skyline of pine treetops rising from the bottom edge in a slightly darker green (#18382c), and one or two subtle layered ridgelines behind them. The upper two thirds are completely plain solid deep pine green with no detail. Flat vector style, no texture, no text or lettering anywhere."
  - **Notes:** background of the "Not sure where to start?" CTA band that
    appears at the bottom of most pages. Bottom-anchored (`object-bottom`)
    and cropped to a short wide strip, so only the treetop skyline shows;
    the CTA text sits over the plain upper area. Keep the tones close to
    the band's pine green so the white text stays readable. Replaced an
    earlier attempt at programmatic SVG leaves that didn't read as leaves.

- [x] `public/images/services/website-design.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Warm, inviting illustration of a small storefront business (like a local bakery or hardware store) with its website shown on a laptop beside it, matching earthy cream, pine green, and terracotta color palette, friendly modern flat illustration style"
  - **Notes:** done (Oak & Crumb Bakery version).

- [x] `public/images/services/workflow-automation.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Friendly flat illustration of a relaxed small business owner having coffee while paperwork flows neatly by itself between an inbox, a calendar, and a filing cabinet, earthy cream, pine green, and terracotta palette"
  - **Notes:** done.

- [x] `public/images/services/tool-integration.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Flat illustration of several everyday business tools (calculator/accounting book, calendar, envelope, storefront cash register) connected by warm glowing lines into one tidy network, earthy cream, pine green, and terracotta palette"
  - **Notes:** done.

- [x] `public/images/services/ai-assistants.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Warm flat illustration of a cozy small shop interior at night, closed sign on the door and moonlight in the window, with a laptop glowing softly on the counter showing a simple friendly chat conversation where a customer's question is getting a helpful reply, earthy cream, pine green, terracotta palette"
  - **Notes:** no mascot characters or thought bubbles; v1's chat-bubble
    character read strangely.

- [x] `public/images/faq.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Friendly modern flat illustration of two people having a relaxed conversation at a small wooden cafe table: one is a business owner with a notebook full of scribbled questions, the other listens warmly over coffee with a laptop open between them, morning light through a window, a few plants, earthy cream, pine green, and terracotta palette. No text or lettering anywhere; notebook scribbles abstract."
  - **Notes:** the FAQ page's sticky illustration; the scene is the free
    consult itself (coffee, questions, listening) to echo the page's
    "just ask me" message and the coffee's-on-me line from About. Watch
    the notebook and laptop for sneaky lettering.

- [x] `public/images/services/ai-insights.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Flat illustration of a small business owner looking at a simple, friendly dashboard with a gently rising chart and plain sticky-note style callouts, warm morning light, earthy cream, pine green, terracotta palette"
  - **Notes:** done.

- [x] `public/images/services/mix-and-match.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Flat illustration of two friendly hands assembling four large rounded puzzle pieces on a warm wooden workshop table so they click together into one neat square, each piece decorated with a simple picture: a laptop showing a small storefront website, a chat bubble, two connected gears, and a little rising chart, earthy cream, pine green, and terracotta palette. No text or lettering anywhere."
  - **Notes:** the "Need more than one?" bundle card on /services (the
    sixth card in the grid, terracotta-tinted). The four puzzle-piece
    pictures stand for the services: website, AI assistant, integration/
    automation, insights. Same friendly flat series as the other service
    illustrations; watch for lettering sneaking onto the laptop screen.

## Blog post illustrations

Optional per post (posts render fine without one), 4:3, path
`public/images/blog/<post-slug>.jpg`, same friendly flat series.

- [ ] `public/images/blog/busywork-worth-automating.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of a small business owner at a wooden desk sorting a pile of paper tasks into two neat trays, one tray glowing softly warm and one plain, a cup of coffee and a small plant nearby, morning light, earthy cream, pine green, and terracotta palette. No text or lettering anywhere; papers blank."
  - **Notes:** seed post about which busywork to automate; the two trays
    are the post's whole thesis (worth it / leave it alone).

## Area cards (About page "Areas I serve")

A matched series in the SAME friendly flat style as the service
illustrations: one recognizable landmark scene per town, real landmarks
only. All 4:3 (e.g. 1200×900). Generate in one session if possible so the
series stays consistent. Watch for the generator adding readable signage;
every prompt demands blank signs and no lettering. (History: v1 was
abstract topographic contour art; retired because it was busy and nothing
tied any card to its actual town.)

- [x] `public/images/areas/medford.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of Medford, Oregon: rows of pear orchard trees in bloom in the foreground, a small warm downtown cluster behind them, and the rounded ridge of Roxy Ann Peak rising in the distance, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere."
  - **Notes:** pears = Harry & David / Pear Blossom heritage; Roxy Ann is the town's backdrop peak.
- [x] `public/images/areas/ashland.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of Ashland, Oregon: an outdoor Elizabethan-style theater with timber balconies beside a leafy park with a small creek, a deer grazing calmly at the park's edge, forested hills rising behind, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere."
  - **Notes:** the Elizabethan theater (Shakespeare Festival) + Lithia Park; the deer is a local in-joke every Ashlander will get.
- [x] `public/images/areas/grants-pass.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of Grants Pass, Oregon: a cheerful raft with paddlers riding gentle whitewater on a wide green river, pine-covered banks on both sides and a small bridge in the distance, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere."
  - **Notes:** Rogue River rafting is the town's identity. Skipped the "It's the Climate" arch because it requires legible text.
- [x] `public/images/areas/central-point.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of Central Point, Oregon: a cozy small creamery storefront with big cheese wheels stacked in the window, and two distinctive flat-topped mesa buttes (the Table Rocks) on the horizon behind open farmland, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere; storefront sign left blank."
  - **Notes:** Rogue Creamery + the Table Rocks, both genuinely Central Point-adjacent.
- [x] `public/images/areas/jacksonville.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of a present-day summer evening concert at a hillside outdoor amphitheater in Jacksonville, Oregon: people relaxing on blankets and low lawn chairs on a terraced lawn beneath tall ponderosa pines, a small warmly lit wooden stage pavilion below, soft string lights between the trees, and the rooftops of a charming historic downtown just visible beyond, earthy cream dusk sky, deep pine green and terracotta accents. No text or lettering anywhere; all signs left blank."
  - **Notes:** the Britt Festival hillside. v1 prompted "historic 1880s
    main street" and the generator produced literal period scenes; when a
    town's charm is historic, anchor the prompt in a PRESENT-DAY activity
    (concerts, people, string lights) and use era words only for
    architecture, never for the scene.
- [x] `public/images/areas/talent.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of Talent, Oregon: a cozy little depot-style restaurant sitting right beside old railroad tracks, with picnic tables, potted plants, and string lights out front, a server carrying plates to a table of happy locals, vineyard-covered hills rising behind, warm late afternoon light, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere; all signs and chalkboards left blank."
  - **Notes:** an homage to Sweet Beet Station, the trackside restaurant
    in downtown Talent (a personal favorite of Sebastian's; keep this
    anchor unless he says otherwise). Depot building + tracks are the
    recognizable elements; the name never appears (no-lettering rule
    keeps signs blank anyway). v1 was generic storefronts + vineyards;
    v2 was the Camelot Theatre, replaced by this homage.
- [x] `public/images/areas/phoenix.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of Phoenix, Oregon: a tall graceful heron standing in a shallow tree-lined creek beside a paved greenway path, a cyclist pedaling past, and pear orchards with a few small rooftops stretching toward valley hills in the distance, warm morning light, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere."
  - **Notes:** Blue Heron Park and the Bear Creek Greenway are Phoenix's
    real anchors; the heron is the park's namesake. (v1 was a generic
    "rebuilt storefronts" scene: on-narrative but placeless, so it was
    retired. The rebuild story lives in the page copy instead.)

## Campaign page art

Same friendly flat series, but these render ONLY beside the body of
their campaign landing page (campaign pages get no About-page card).
Concepts deliberately avoid landmarks already claimed by a city card
(Table Rocks → Central Point, Rogue rafting → Grants Pass). All 4:3.

- [ ] `public/images/areas/jackson-county.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of the Rogue Valley in Jackson County, Oregon: a wide valley floor quilted with pear orchard rows and vineyard blocks, a river winding through, a few small clusters of rooftops, and the tall snow-capped cone of Mount McLoughlin rising on the horizon, warm afternoon light, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere."
  - **Notes:** Mt. McLoughlin is the county-wide landmark no city card
    uses; the valley quilt reads "whole county" rather than any one town.
- [ ] `public/images/areas/josephine-county.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration of the Oregon Caves area in Josephine County: a cozy rustic timber lodge with warm glowing windows nestled deep in a forested mountain canyon, tall firs all around, a winding footpath leading to a dark marble cave entrance in the hillside, soft evening light, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere."
  - **Notes:** the Oregon Caves National Monument (and its historic
    chateau) is Josephine County's landmark beyond Grants Pass, whose
    card already owns the rafting scene.
- [ ] `public/images/areas/southern-oregon.jpg` (4:3)
  - **Prompt:** "Friendly modern flat illustration: an open laptop on a wooden cafe table on an outdoor patio, the screen showing a simple cheerful website layout made of plain colored blocks, and beyond the railing a sweeping Southern Oregon valley view with a small town, vineyard hills, and pine ridgelines at golden hour, earthy cream sky, deep pine green and terracotta accents. No text or lettering anywhere; website shown as abstract blocks only."
  - **Notes:** for the websites campaign page, so it blends service +
    region (laptop in a Southern Oregon setting) instead of a pure
    landmark. Distinct from the website-design service card (bakery
    storefront scene). Watch the laptop screen for sneaky lettering;
    the prompt demands abstract blocks only.
