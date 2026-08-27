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
lists of rotating hero example cards. Each card is either a notification
(`icon` of check/calendar/star/sync/chart/mail/clock/globe, `title`, `sub`)
or a chat (`question`, `answer`, `caption`). Keep card copy plain-English
and service-specific.

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
**Notes** lines. The Prompt is copy-pasted verbatim into the image generator,
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
(newest first by `date`). Frontmatter: `title`, `description` (1-2
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

### Add a static page
Create `app/<name>/page.tsx` (copy the shape of `app/about/page.tsx`), put
long-form copy in `content/pages/<name>.mdx`, add a nav link in
`components/Header.tsx` + `components/Footer.tsx`, and add the path to
`app/sitemap.ts`.

## Deferred tasks (not yet done; check before assuming)

- [ ] **Vercel deployment + domain**: site is local-only so far
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
