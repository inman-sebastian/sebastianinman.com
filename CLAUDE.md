# sebastianinman.com

Portfolio/services site for **Sebastian Inman**: automation & AI integration
for small businesses. Primary market: Southern Oregon, but serving small
businesses anywhere in the US.

**This project is content-first by design.** Nearly every task (new pages,
new copy, price changes, new marketing pages) is a content-file edit, not a
code change. Follow the recipes below before touching components.

## Run it

```bash
npm run dev              # dev server at http://localhost:3000
npm run build            # production build (also the best "did I break it?" check)
npm run optimize:images  # run after adding images to public/images (needs bun)
```

## Voice guide (applies to ALL site copy)

The reader is a busy small-business owner, **not** a technical person.

- **Plain language, always.** If a technical term is unavoidable, explain it
  in one everyday sentence. BUT never use the literal phrase "plain English"
  in customer-facing copy; it can read as English-speakers-only. Say "no
  jargon," "clear plan," or "a straight answer" instead.
- **Never condescend, infantilize, or assume.** Talk like one normal person
  to another. Some customers are tech literate, most probably aren't, and
  the copy must respect both without betting on either. The right mental
  model: the reader is smart and busy. They run a business well; they've
  heard of AI but may not know what it is, how to use it, or how it helps
  them, and that's not a deficiency, it just isn't their domain. Frame
  clarity as the tech industry's jargon problem, never the reader's
  comprehension problem. Banned patterns: "you'll actually understand,"
  "reports you'll actually read," "explained in everyday words," or
  anything implying the reader is usually confused. "No jargon" blames the
  jargon; that's the right direction. In short: layman's terms, without
  ever calling the customer a layman to their face.
- **Lead with the problem solved, never the technology.**
  - ✅ "Stop retyping the same customer info into three different programs."
  - ❌ "Leveraging API-driven integrations for seamless data synchronization."
- **No AI hype.** Honest, grounded claims. It's fine to say when something
  *isn't* worth doing.
- **No em dashes (—).** They read as AI-written, which undercuts the whole
  pitch. Rewrite with a period, comma, colon, or parentheses instead. This
  applies to all copy: site content, docs, comments, everything.
- **Talk about small businesses, never against big ones.** No big-company
  comparisons anywhere ("big companies have IT departments", "help only
  big companies can afford"); they read as pompous positioning. Every
  sentence stays focused on the reader's business. Also never call
  Sebastian a "neighbor" in copy; even though it's literally true, it
  reads hokey and try-hard. Say local, nearby, based in Southern Oregon.
- **With them, not for them.** Frame the work as two kinds of expertise
  meeting: the reader knows their business, Sebastian knows the tools.
  Watch the you-to-I ratio; a run of "I do X, I built Y" sentences reads
  egotistical even when the content is humble, and must never shade into
  "I do this because you can't." The homepage about blurb ("You know
  your business. I know the tools.") is the reference example.
- **Warm and neighborly in tone, not corporate.** First person ("I", not "we").
  Contractions are good. Local trust signals are good ("Based in Jackson
  County, Oregon, working with small businesses everywhere").
- **Location: always "Southern Oregon," never a specific county** for where
  Sebastian is based (it covers Jackson and Josephine counties without
  saying where he lives). County or city names are fine ONLY as the
  geographic target of an SEO landing page (e.g. "AI for Jackson County
  small businesses" describes who is served, not where Sebastian lives).

## Where everything lives

| What | Where |
|---|---|
| Site-wide info (name, tagline, email, phone, booking URL, SEO defaults) | `content/site.ts` |
| Client reviews (verbatim; which service each speaks to) | `content/testimonials.ts` |
| Services (one MDX file each) | `content/services/*.mdx` |
| SEO landing pages (one MDX file each; filename = URL slug) | `content/landing/*.mdx` |
| Long-form pages (About) | `content/pages/*.mdx` |
| Blog posts (one MDX file each; filename = URL slug) | `content/blog/*.mdx` |
| FAQ questions & answers | `content/pages/faq.mdx` frontmatter (`faqs` list; rendered as accordions + FAQPage structured data by `app/faq/page.tsx`) |
| Image checklist / prompts | `IMAGES.md` |
| Content loaders | `lib/content.ts` |
| Components (header, footer, CTA band, form, SiteImage) | `components/` |
| Routes | `app/` (landing pages via `app/[slug]/page.tsx`, service pages via `app/services/[slug]/page.tsx`) |

Design tokens (colors, fonts) are CSS variables in `app/globals.css`
(`@theme` block). Palette: cream background, pine green primary, terracotta
accent. Fonts: Fraunces (headings), Inter (body). Headings use
`text-wrap: balance` and body text uses `text-wrap: pretty` globally, so
don't hand-tune line breaks.

### Typography scale (follow this; no other sizes)

Every piece of text belongs to one of these roles. Headings are Fraunces
automatically (base layer); body is Inter.

| Role | Classes | Where |
|---|---|---|
| Display | `text-4xl sm:text-5xl font-semibold leading-none` | hero h1 ONLY |
| Section heading | `text-3xl font-semibold` | every section h2 (prose h2 matches at 1.875rem) |
| Card title, large | `text-xl font-semibold` | grid cards (ServiceCard, BundleCard); prose h3 matches at 1.25rem |
| Card title, small | `font-serif text-lg font-semibold` | compact/stacked cards (promise rows, step cards, AreaCard, strip headings) |
| Lead body | `text-lg leading-relaxed` | hero sublines, section intros, about blurb |
| Body | (base, 16px) | prose, checklist items |
| Support | `text-sm` | card body copy, subs, buttons, form labels, footer |
| Caption | `text-xs` | tags, chip labels, hero-card captions |
| Eyebrow, page | `text-sm font-semibold uppercase tracking-wide` | hero eyebrows, callout titles, contact-info labels |
| Eyebrow, card | `text-xs font-semibold uppercase tracking-wide` | in-card labels ("Best for", "Popular combos") |

Rules: never `text-2xl` (the 3xl -> xl jump is deliberate), never arbitrary
pixel sizes (`text-[11px]`), and don't invent a new tier for one spot; pick
the nearest role. If a design genuinely needs a new tier, add it to this
table in the same change.

## Recipes

### Add or edit a service
Create/edit `content/services/<slug>.mdx`; each file becomes a dedicated
landing page at `/services/<slug>`. Frontmatter: `title`, `summary`, `order`
(sort position), `startingPrice` (number, whole dollars), `image`,
`imagePrompt`, `imageAlt`, `imageCaption` (short editorial figcaption
shown under the intro illustration; a warm one-liner that complements
the alt text, never repeats it), plus optional `heroCardsTop` / `heroCardsBottom`:
lists of rotating hero example cards. Each card is a notification
(`icon` of check/calendar/star/sync/chart/mail/clock/globe, `title`, `sub`),
a chat (`question`, `answer`, `caption`), a voicemail transcription
(`duration` like "0:14", `text` = the transcript, `caption`), or a
translation (`original` = the message in its original language,
`translated`, `caption`; the translation renders as an outlined bubble
from the same speaker, deliberately not a reply bubble). Keep card copy
plain-English and service-specific.

Cards also show a "Best for" line from `bestFor` (3-4 short business
types, e.g. "Contractors & trades"; pick types that genuinely fit the
service). The page's designed sections come from frontmatter, NOT prose: `busywork`
(5-8 SHORT phrases, 2-4 words each, rendered as static notification-style
cards under "Sound familiar?" via `BusyworkCards`, terracotta icons to
read as tasks-waiting versus the hero cards' work-handled; keep them
concrete time-eaters, not sentences. The interactive poppable swarm was
retired as off-language; don't bring interaction or sound back here),
`deliverables` (list, rendered as a checklist grid under "What you get"),
optional `tools` (named tools/systems, rendered as two counter-scrolling
marquee rows of chips under "Use any of these?" via `ToolMarquee`; the
list's FIRST HALF is the top row and SECOND HALF the bottom row, so keep
each half thematically grouped; the section is placed first among the
designed sections because tool recognition is the fastest hook; real product names small
businesses recognize, customer-court framing ("I can make them talk to
each other"), never partnerships or certifications; each chip shows the brand's favicon from
`public/images/tools/<slugified-name>.png` when that file exists, e.g.
"Microsoft 365" → `microsoft-365.png`, text-only otherwise — to add one,
use the `add-tool` skill in `.claude/skills/`, which covers the favicon
fetch and its pitfalls), and `goodFit` (one sentence, rendered as a
callout with the CTA).
Body = ONLY the short intro: one `##` headline plus 2-3 paragraphs. Never
put walls of text or the lists back into the body. The service appears
automatically on the homepage cards, the /services overview, the footer,
the sitemap, and the contact form's service checkboxes. Service-page CTAs
link to `/contact?service=<slug>`, which pre-checks that service's box on
the form (`ConsultButton`/`CTABand` take a `service` prop for this).

### Use design components inside MDX bodies
Every MDX body (services, landing pages, about) can embed these components,
defined in `components/mdx.tsx` (add new ones there and document them here):
- `<Callout title="...">text</Callout>`: terracotta-tinted aside
- `<CheckList items={["...", "..."]} />`: green checkmark list
- `<ChatBubble question="..." answer="..." caption="..." />`: chat exchange
- `<StatRow stats={[{ icon: "clock", title: "3 hours back every week", detail: "One supporting sentence." }]} />`:
  stacked promise cards; `title` is a short NATURAL SENTENCE ("Projects
  start at $500", never "From $500 / projects start" value-label
  mashups), optional `icon` from the hero-card icon set (check, calendar,
  star, sync, chart, mail, clock, globe, users, tag), optional `detail`
  sentence. Every card must answer a question the visitor actually has
  (cost, commitment, speed); no decorative factoids (population tiles
  were removed as meaningless) and no hyperbole ("N potential customers")
- `<PromiseRow />`: the standard price/consult/reply-time StatRow used on
  the automation landing pages; promises live once in `components/mdx.tsx`
Use them to break up prose (nobody wants a wall of text). Any numbers in a
`StatRow` must be real or clearly illustrative; no invented claims.

### Add an SEO landing page (e.g. "Grants Pass automation")
Create `content/landing/<url-slug>.mdx`. The filename becomes the URL
(`grants-pass-small-business-automation.mdx` → `/grants-pass-small-business-automation`).
Frontmatter: `title` (short label for the About page's area links),
`metaTitle` (full SEO title), `metaDescription`, `heroHeadline`,
`heroSubline`, `city`, `kind` ("location" or "campaign"; defaults to
location), plus optional `heroCardsTop` / `heroCardsBottom` (rotating hero
example cards, same format as services; write them for the city's business
mix, e.g. lodging and restaurants for Ashland). Body = markdown sections
following the pattern in the existing files: local pain points → concrete
examples → why local.

**Landing page taxonomy (keep it consistent):**
- `kind: "location"`: a literal CITY-level place (Medford, Ashland, Grants
  Pass…), covering the WHOLE service offering angled at that place's
  business mix. Automatically rendered as a card in the About page's
  "Areas I serve" grid, a city link in the footer's "Areas" column, a
  pill in the homepage areas strip, and the sitemap (all filter on
  `kind === "location"`; a new location page shows up everywhere with no
  code edits). Location pages also need `image`, `imagePrompt`, `imageAlt`,
  `imageCaption` (editorial figcaption under the illustration; warm
  one-liner, complements the alt text rather than repeating it), and
  `areaBlurb` (one short local phrase for the card). The art is a
  landmark scene in the friendly flat series (see the Area cards section
  of IMAGES.md); NEVER street maps or literal geography. Never list a
  county/region beside cities it contains; locals read that as redundant
  and auto-generated.
- `kind: "campaign"`: everything else: service+geo hybrids
  (southern-oregon-website-design) and county/region pages
  (jackson-county-ai-integration). Sitemap always; may be linked
  contextually in prose where it reads naturally (the About intro links
  the Jackson County page), but never in nav, footer, or the pill list.
- NEVER generate a service×city matrix of pages. Google treats templated
  keyword+city pages as doorway pages and demotes them. Few location
  pages, each genuinely local and worth reading, beats many thin ones.

Keep each page's copy genuinely specific to the place/service: anchor it
in real, verifiable local identity (Rogue Creamery for Central Point, the
Britt Festival for Jacksonville, the Almeda Fire rebuild for Talent and
Phoenix, rafting for Grants Pass). Population figures in StatRows must be
real and non-hyperbolic: any number in a StatRow must be literally true,
rounded DOWN if approximated ("21,000+" never "~21,000"; the tilde reads
as jargon). Population tiles were tried and retired (a resident already
knows how big their town is, and "N potential customers" is hyperbole);
landing pages use `<PromiseRow />` instead. Use the MDX design components
(StatRow, CheckList, Callout, ChatBubble) to keep bodies visual, not
walls of text. No find-and-replace city swaps. Slugs must include
"oregon" when the city name is ambiguous nationally (phoenix,
jacksonville, talent, central-point); unambiguous names (grants-pass,
medford, ashland) can omit it.

### Change contact info, tagline, or booking link
Edit `content/site.ts`. Setting `bookingUrl` makes every "Book a free
consult" button open the Cal.com calendar in an in-page modal
(`CalButton`; forced light theme, pine brand color, plain link as
fallback for new-tab clicks and blocked scripts; empty string = buttons
go to /contact) and
reveals the contact page's "Prefer to grab a time?" block, whose button
deliberately says "Pick a time on my calendar", not "Book a free
consult": every consult CTA lands on /contact, so a same-named button
there would link the page to itself.

### Request a new image
Use `<SiteImage src="/images/..." alt="..." prompt="..." />`. It renders a
placeholder showing the prompt until the file exists in `public/`. Add every
new image to `IMAGES.md` as a checklist entry with separate **Prompt** and
**Notes** lines. Prompts featuring people must cast them explicitly
(gender, age, skin tone/ethnicity) and vary the cast across the series;
see the casting rule in the IMAGES.md header (the generator's default
is a young white woman, which skewed the early art). The Prompt is copy-pasted verbatim into the image generator,
so it must contain ONLY generator instructions (scene, style, palette), never
reasoning, history, or advice; that context goes in Notes. Keep the `prompt`
prop in code identical to the IMAGES.md Prompt. Images are generated in
Sebastian's Google Flow collection, either by Sebastian by hand or by
Claude via the `generate-image` skill in `.claude/skills/` (agent-browser
automation of his authenticated Flow session; the skill's hard rules and
mandatory eyeball check apply). Never commit an AI-generated image that
hasn't passed the eyeball check.
After images land, run `npm run optimize:images` (Bun + sharp): it
downscales sources to what the layouts actually need and recompresses
(~2MB generator output -> ~200KB), skipping already-small files so it's
safe to re-run. Sources stay JPEG deliberately: next/image + Vercel
serve WebP/AVIF and per-device srcsets at request time, so converting
source files would only churn every path in content/. When adding a new
SiteImage slot, give it a `sizes` prop matching its rendered width.
**All image slots are 4:3** (Sebastian's generator outputs 4:3); keep any new
`SiteImage` width/height props at a 4:3 ratio (the component defaults to
1200×900) and note 4:3 in the IMAGES.md entry. Exceptions: the CTA band
treetops are a 16:9 full-width background (`SiteImage` with `fill`) and the
headshot is a real portrait photo. The hero (`HeroSplash`) is deliberately a
flat `pine-dark` background with NO image; don't add one back without
Sebastian asking.

### Write a blog post (a recurring Cowork job)

Create `content/blog/<url-slug>.mdx`; it becomes `/blog/<url-slug>` and
appears automatically on the index, in the sitemap, and in `/feed.xml`
(newest first by `date`). Every post also gets a branded share card
automatically (`app/blog/[slug]/opengraph-image.tsx` renders the title
on the OG frame in `lib/og.tsx`; fonts are vendored TTFs in
`assets/fonts`); nothing to do per post. Frontmatter: `title`, `description` (1-2
sentences; card text, meta description, and RSS summary), `date`
(ISO, "2026-08-27"), and optionally `image`/`imagePrompt`/`imageAlt`/
`imageCaption` (4:3, path `/images/blog/<slug>.jpg`, normal IMAGES.md
workflow; posts render fine without an image). Body = markdown with the
full MDX component kit (Callout, CheckList, ChatBubble, StatRow).

Editorial rules, on top of the voice guide:
- Every post must be USEFUL to a small business owner on its own, with a
  takeaway they can apply without hiring anyone. Posts that only exist
  to sell read as content-farm filler and hurt more than help.
- Practical, specific, honest. "Here's the test I use" beats "5 reasons
  you need AI". Saying what ISN'T worth doing is on-brand and builds
  more trust than any pitch (see the seed post's Callout).
- No invented statistics, no fake client anecdotes, no "studies show".
  Checkable facts (tool capabilities, prices, dates) are welcome when
  validated against a primary or secondary source during the research
  step (see the write-blog-post skill); anything unverifiable gets cut
  or reworded as opinion. Research informs the post, but the prose is
  always original and in the site's voice, never paraphrased from a
  source, and body links stay internal.
- End with at most ONE soft link to /contact or a service page, woven
  into a closing sentence, never a hard sales pitch.
- Titles are sentences in the site's register ("How to spot the busywork
  that's actually worth automating"), not listicle-speak.
- Local color welcome where real (seasonal rushes, festival season,
  Rogue Valley business life); never forced.

### Add or use a client review

Reviews live in `content/testimonials.ts`, quoted verbatim, and render
through `components/Testimonials.tsx` on the homepage and on any service
page whose slug appears in a review's `about` list.

The rules are not stylistic:

- **Verbatim.** Trim for length with an ellipsis, never for meaning, and
  never tidy somebody's grammar.
- **`about` is a claim, not a tag.** A review may only appear beside a
  service it actually speaks to. Every review currently on file is about
  web work, so none appears on the automation or AI pages; putting one
  there would imply an endorsement nobody gave.
- **Clients only.** A fourth 5-star review exists from a developer
  Sebastian worked alongside rather than for. It is deliberately absent:
  a colleague among client testimonials is the one move here that would
  actually mislead.
- **Say where they came from.** `testimonialSource` is the section
  intro, written in the same register and length as the other homepage
  intros rather than as a bolted-on disclaimer. It carries the two facts
  that matter: the work was freelance, and it was a couple of years ago.
  The year on each card does the rest. It deliberately no longer names
  the old business (Southern Oregon Web Design, now permanently closed),
  which told a reader nothing they needed. Do not quietly drop "freelance
  work" or the timeframe; those are the parts doing the honest work.

Screenshots of the originals are kept off-repo. The old Google profile
is closed, so nothing here is publicly verifiable anymore.

### Structured data (JSON-LD)

Everything lives in `lib/schema.ts`, built as one graph so every page
agrees about who Sebastian is. The root layout emits
`ProfessionalService` + `Person` + `WebSite` once, each with a stable
`@id` (`#business`, `#person`, `#website`); every other page references
those by id rather than describing a second Sebastian. Per page on top
of that: `Service` + `BreadcrumbList` on a service page, `OfferCatalog`
on /services, `BlogPosting` + `BreadcrumbList` on a post, `Blog` on
/blog, `WebPage` on a landing page, plus `AboutPage`, `ContactPage` and
`FAQPage`.

Three rules that are not style preferences:

- **Never add `Review` or `AggregateRating` for the testimonials.**
  Google stopped showing review rich results in 2019 where the entity
  being reviewed controls the reviews, which is exactly what quotes we
  publish about ourselves are. It earns no stars and states a rating no
  search engine will use. Stars come from a real Google Business
  Profile, which lives on Google, not here.
- **No street address, ever.** `LocalBusiness` formally requires a
  `PostalAddress`, but Sebastian works from home and that address stays
  private. The markup carries `addressRegion` and `addressCountry` only,
  and `areaServed` does the real work. The known cost is that Google
  will not grant local rich results without a full address. Publishing
  his home address to get them is not a trade worth making.
- **Never state a fact the site does not have.** No `dateModified` on
  posts (nothing tracks edits), no invented ratings, no opening hours
  that are not real.

Verify after changing it. Both checks are worth rerunning:

```bash
npm run dev            # the checks read the running site
node scripts/check-jsonld.mjs        # every page parses, right types present
node scripts/check-jsonld-vocab.mjs  # every type and property is real schema.org
```

Prices in `Offer` come from each service's `startingPrice`, so a price
change on a service page flows through automatically.

### Add a static page
Create `app/<name>/page.tsx` (copy the shape of `app/about/page.tsx`), put
long-form copy in `content/pages/<name>.mdx`, add a nav link in
`components/Header.tsx` + `components/Footer.tsx`, and add the path to
`app/sitemap.ts`.

## Client paperwork (proposals, agreements, client emails)

Templates live in `docs/clients/` (proposal, plain-language services
agreement, email replies); the `draft-client-paperwork` skill in
`.claude/skills/` turns consult notes into filled drafts. Drafts are
markdown in `docs/clients/drafts/` (GIT-IGNORED: client data never
gets committed or deployed) and render in the STANDALONE paperwork app
(`paperwork-app/`, its own package.json, port 4747, "paperwork" launch
config) with brand letterhead for print-to-PDF; the website itself has
no paperwork routes. The app parses `content/site.ts` for contact info
and mirrors the design tokens in its own stylesheet (keep in sync when
the palette changes). The agreement is not yet
lawyer-reviewed; flag that whenever one is drafted. Never quote below
a service's `startingPrice`.

## Mission Control (the local business app)

`mission-control/` is Sebastian's control center: a Next.js app with its
own package.json, port 4848, "mission-control" launch config, LOCAL ONLY
and never deployed (it holds client data). See its README for the full
picture. Built so far: the CRM core and the document workspace. Pipeline
stages live in `mission-control/lib/stages.ts` and match the arc in
`docs/clients/email-templates.md`; keep the two in step.

Records are one markdown file per person in `mission-control/data/clients/`,
git-ignored in both that folder and the repo root. Frontmatter is the
structured half (stage, contact, quote, next step), the body is notes
plus a `## Timeline` section of `### YYYY-MM-DD · What happened` entries,
oldest first, timeline last in the file. **Editing those files by hand is
a supported path**: Cowork can read and write them directly and the app
picks the change up on refresh. Inside the app, `lib/clients.ts` is the
only writer.

The app reads `content/site.ts` and `content/services/*.mdx` live (never
duplicate contact info or prices into it) and mirrors the brand tokens in
its own `app/globals.css`, same arrangement as `paperwork-app/style.css`.

Documents (proposals, agreements, invoices) are started from the
`docs/clients/` templates on a client's page, edited and previewed in the
app, and generated as PDFs. Drafts DID NOT MOVE: they stay in
`docs/clients/drafts/`, linked to a record by `record: <client-slug>`
frontmatter (or a filename that starts with the client's slug).
Templates fill in facts only (names, date, price and its half, phone,
next invoice number, terms); the `{{WRITING PROMPTS}}` stay, and
generating is blocked while any remain. Preview and PDF both shell out to
`paperwork-app` (`preview.js` and `generate.js`), so the print CSS and
`buildPdf()` stay untouched and the CLI keeps working for Cowork.

Client emails go out from the composer (`/clients/<slug>/email`), which
opens the stage's template from `docs/clients/email-templates.md` filled
with the facts, offers their generated PDFs as attachments, and splits
writing from sending into two screens: the second shows the exact
sender, recipient, subject, attachments, and body, and only its button
reaches Resend. Credentials come from the repo root `.env.local` via
`mission-control/lib/env.ts` (Next only loads env files from its own
folder). `lib/send.ts` is the ONLY thing in the app that reaches off the
machine; nothing sends on a schedule, a save, or any other trigger.
**Cowork never presses send without Sebastian saying so in the moment**,
same rule as the draft-client-paperwork skill.

Sent mail is multipart: HTML plus a plain-text twin. The signature on it
is read live from `docs/marketing/email-signature.html`, the same file
Sebastian pastes into Gmail, so app mail and hand-typed mail match. The
seam to know about: an edit to that file reaches the app immediately and
Gmail not at all, so Gmail has to be re-pasted by hand (the marketing
README spells this out). Templates in `email-templates.md` therefore end
on a sign-off and never on contact details, or they print twice.

The blog CMS (`/blog`) creates and edits `content/blog/*.mdx` and shows
where each post stands (not on the site, edited since it went up,
committed but not pushed, live). **Save and publish are two separate
buttons and must stay that way**: save writes the file, publish commits
and pushes, and pushing IS deploying. The commit is scoped by pathspec to
the post and its image, so nothing else in the working tree rides along;
never make that a `git add -A`. `mission-control/lib/validate.ts` blocks
publishing on missing frontmatter, MDX that will not compile, an unknown
component (checked against `components/mdx.tsx`), or a frontmatter image
with no file, and warns on em dashes.

The post's Illustration panel generates art by shelling out to Claude
Code headless (`claude -p "/generate-image ..."`), which runs the real
generate-image skill against Flow: same collection, same two candidates,
same eyeball check, and it bills the Claude subscription rather than a
metered image API. The run is scoped to `Bash(agent-browser:*)`, `Read`,
`Glob`, `Grep`, and is told explicitly not to run git, write into
`public/`, or touch the optimizer. **Everything it makes is staged in the
git-ignored `mission-control/data/image-candidates/`**; adopting one
copies it into `public/images/blog/`, sets the frontmatter, runs
`npm run optimize:images`, and keeps the replaced image staged so going
back is one click. Verified end to end Aug 2026.

`components/SiteAnalytics.tsx` wraps `<Analytics>` with a `beforeSend`
that drops our own traffic before it is ever sent: Sebastian's browser
when `localStorage["va-disable"]` is set (run
`localStorage.setItem("va-disable", "1")` once per browser on the live
site), plus browser automation. Automation needs all three checks:
agent-browser sets `navigator.webdriver` and reports `HeadlessChrome`,
but Claude's own browser leaves `webdriver` false and is only
identifiable by the `Claude/` token in its user agent. It has to be a
client component; the root layout is a server component and a function
prop cannot cross that boundary.

The dashboard's top panel shows what the website did in the last seven
days, read from Vercel Web Analytics through its public API
(`mission-control/lib/analytics.ts`, `VERCEL_API_TOKEN` in the repo root
`.env.local`, read-only): visitors, page views, pages per visitor, the
busiest routes, and `/contact` views against inquiries actually
received. Two Hobby-plan limits shape what can go here: custom events
are Pro-only (so no button-click tracking; `events/count` answers 402)
and the reporting window is one month. The panel renders inside Suspense
so a slow Vercel never holds up the pipeline, and answers are cached for
five minutes.

**Lead research** fills the top of the funnel. The `find-leads` skill in
`.claude/skills/` researches real local businesses, checks them against
signals that map to the services, and writes them to
`mission-control/data/clients/*.md` at the `researched` stage with
`source: outreach`; `/research` is the review queue and
`/clients/<slug>/review` is where one gets judged, which moves it on to
the `prospect` stage or to `lost`. Targeting comes from `docs/market-research.md`
(consumer-facing local businesses, which local competitors ignore).
Skill rules that matter: only businesses actually looked at, every signal
carries the URL it was seen on, never invent a contact detail, and never
contact anyone.

Research also records where a business is (`city`, optional `address`,
`lat`/`lng`) and whether they have a Google Business Profile
(`googleProfile`). The dashboard maps everyone who has coordinates, at
any stage (Mapbox, `MAPBOX_API_KEY` in the repo root `.env.local`, a
public `pk.` token); anyone with a town but no pin is geocoded
automatically on dashboard load via `mission-control/lib/geo.ts`, with
no button to press. Pins are town-level unless a street address or a
Google Maps embed gave something better, and records in the same town
are nudged apart so they do not stack into one dot. Pin colour comes
from `PHASES` in `mission-control/lib/stages.ts`, which groups the
twelve stages into four readable bands. One row of chips above the map
is both the key and the filter (Everyone, then a chip per stage in use);
clicking one narrows the map to that stage. Adding a stage without
putting it in a phase is a build error, not a miscoloured pin.

`mission-control/scripts/detect-stack.mjs <url>` reads a site's metadata
in one fetch and reports the platform (WordPress, Shopify, Squarespace,
Wix…) plus the tools already running on it (booking, ordering, payments,
email, chat, analytics), marking any that appear in the `tools` list on
`content/services/tool-integration.mdx`. It also reports a Google Maps
link on the page, and pulls the exact pin coordinates out of the embed
when there is one. Its `platform:` and `stack:`
output goes into the record's frontmatter and shows on its review
page. A non-200 reads nothing and says so; never record a block page as
evidence about a business.

**Outreach is drafted, never sent by the app.** Resend's acceptable use
policy bans cold outreach, and that account also carries the contact form
and all client email, so a complaint there takes down the mail the
business runs on. Template 6 in `docs/clients/email-templates.md` is the
first-contact email; the composer swaps Send for Copy on
`source: outreach` records, and `sendBlockReason()` in
`mission-control/lib/send.ts` is re-checked inside the send action.
`mission-control/data/do-not-contact.md` is honoured by both the research
and the composer.

Not built: payment processor (undecided; ask before wiring anything to
money) and Gmail.

## Deferred tasks (not yet done; check before assuming)

- [x] **Vercel deployment + domain** (Aug 2026): live at
      https://www.sebastianinman.com (www is canonical; apex redirects).
      Deploys are CI/CD: every merge to `main` on GitHub auto-deploys,
      so pushing main IS shipping to production. Vercel Web Analytics
      (`@vercel/analytics`) and Speed Insights (`@vercel/speed-insights`)
      are wired up in `app/layout.tsx`. `RESEND_API_KEY`/`RESEND_FROM`
      are set in Vercel and verified: a live form submission delivered
      to hello@ (Aug 2026). Env-var gotcha for the future: Vercel
      snapshots env per deployment, so changing vars requires a
      redeploy, and vars must be scoped to the Production environment
- [x] **hello@sebastianinman.com inbox** (Aug 2026): live; contact form
      test delivered to it successfully
- [x] **Resend** (Aug 2026): live and verified end to end. `RESEND_API_KEY`
      and `RESEND_FROM=hello@sebastianinman.com` in `.env.local` (domain
      verified in Resend; test submission delivered). When deploying,
      add both env vars in Vercel project settings
- [x] **Booking URL** (Aug 2026): Cal.com "free discovery call" link set in
      `content/site.ts`; consult buttons now open the calendar and the
      contact form is the written-inquiry path
- [x] **Starting prices confirmed by Sebastian** (Aug 2026): website $2,000 /
      workflow automation $750 / tool integration $500 / AI assistants
      $1,000 / AI insights $1,200. Pricing strategy: slightly undercut the
      competition while maintaining quality (see `docs/market-research.md`
      for benchmarks). Revisit as real client data comes in.
- [ ] **"Best for" business types are educated guesses**, sanity-checked
      against local competitor research (`docs/market-research.md`): local
      AI/automation competitors target professional services, so our
      consumer-facing niches (restaurants, lodging, salons, retail) are an
      uncontested differentiator. Revisit the `bestFor` frontmatter lists
      once actual inquiries show which niches respond.
- [x] **About page bio facts verified by Sebastian** (Aug 2026): 13 years
      as a senior web developer (mostly freelance, sectors from finance
      to manufacturing to e-commerce), 13 years in Southern Oregon, coffee
      offer confirmed. Results claims stay goal-framed ("scoped to pay for
      itself"), not statistical, until real client data exists. He lives
      in Talent; deliberately NOT stated in copy (privacy; location is
      always "Southern Oregon" / "Rogue Valley")
- [x] **Images** (Aug 2026): every slot has final art; `IMAGES.md` fully
      checked. New images go through `npm run optimize:images`
