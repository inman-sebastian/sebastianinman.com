# sebastianinman.com

Portfolio/services site for **Sebastian Inman**: automation & AI integration
for small businesses. Primary market: Southern Oregon, but serving small
businesses anywhere in the US.

**This project is content-first by design.** Nearly every task (new pages,
new copy, price changes, new marketing pages) is a content-file edit, not a
code change. Follow the recipes below before touching components.

## Run it

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # production build (also the best "did I break it?" check)
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
- **Warm and neighborly, not corporate.** First person ("I", not "we").
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
| Image checklist / prompts | `IMAGES.md` |
| Content loaders | `lib/content.ts` |
| Components (header, footer, CTA band, form, SiteImage) | `components/` |
| Routes | `app/` (landing pages via `app/[slug]/page.tsx`, service pages via `app/services/[slug]/page.tsx`) |

Design tokens (colors, fonts) are CSS variables in `app/globals.css`
(`@theme` block). Palette: cream background, pine green primary, terracotta
accent. Fonts: Fraunces (headings), Inter (body). Headings use
`text-wrap: balance` and body text uses `text-wrap: pretty` globally, so
don't hand-tune line breaks.

## Recipes

### Add or edit a service
Create/edit `content/services/<slug>.mdx`; each file becomes a dedicated
landing page at `/services/<slug>`. Frontmatter: `title`, `summary`, `order`
(sort position), `startingPrice` (number, whole dollars), `image`,
`imagePrompt`, `imageAlt`, plus optional `heroCardsTop` / `heroCardsBottom`:
lists of rotating hero example cards. Each card is either a notification
(`icon` of check/calendar/star/sync/chart/mail/clock/globe, `title`, `sub`)
or a chat (`question`, `answer`, `caption`). Keep card copy plain-English
and service-specific.

Cards also show a "Best for" line from `bestFor` (3-4 short business
types, e.g. "Contractors & trades"; pick types that genuinely fit the
service). The page's designed sections come from frontmatter, NOT prose: `busywork`
(5-8 SHORT phrases, 2-4 words each, rendered as poppable floating chips
under "Sound familiar?"; keep them concrete time-eaters, not sentences),
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
- `<StatRow stats={[{ icon: "clock", value: "3 hrs", label: "saved weekly" }]} />`:
  stat tiles; optional `icon` from the hero-card icon set (check, calendar,
  star, sync, chart, mail, clock, globe, users, tag). Convention: users for
  populations, tag for prices, clock for the free consult
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
  code edits). Location pages also need `image`, `imagePrompt`, `imageAlt`
  (abstract topographic map art; see the Area cards section of IMAGES.md
  for the series style; NEVER street maps or literal geography) and
  `areaBlurb` (one short local phrase for the card). Never list a
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
real census-based numbers in "N+" format (e.g. "21,000+"), ALWAYS rounded
DOWN so the "+" stays literally true (Jacksonville's 2,899 renders as
"2,800+", never "3,000+"). Not "~": most readers don't know it means
"about". Use the MDX design components
(StatRow, CheckList, Callout, ChatBubble) to keep bodies visual, not
walls of text. No find-and-replace city swaps. Slugs must include
"oregon" when the city name is ambiguous nationally (phoenix,
jacksonville, talent, central-point); unambiguous names (grants-pass,
medford, ashland) can omit it.

### Change contact info, tagline, or booking link
Edit `content/site.ts`. Setting `bookingUrl` makes every "Book a free
consult" button link there (empty string = buttons go to /contact) and
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
prop in code identical to the IMAGES.md Prompt. Sebastian generates the
images and drops them in; never commit AI-generated images yourself.
**All image slots are 4:3** (Sebastian's generator outputs 4:3); keep any new
`SiteImage` width/height props at a 4:3 ratio (the component defaults to
1200×900) and note 4:3 in the IMAGES.md entry. Exceptions: the CTA band
treetops are a 16:9 full-width background (`SiteImage` with `fill`) and the
headshot is a real portrait photo. The hero (`HeroSplash`) is deliberately a
flat `pine-dark` background with NO image; don't add one back without
Sebastian asking.

### Add a static page
Create `app/<name>/page.tsx` (copy the shape of `app/about/page.tsx`), put
long-form copy in `content/pages/<name>.mdx`, add a nav link in
`components/Header.tsx` + `components/Footer.tsx`, and add the path to
`app/sitemap.ts`.

## Deferred tasks (not yet done; check before assuming)

- [ ] **Vercel deployment + domain**: site is local-only so far
- [ ] **hello@sebastianinman.com inbox**: displayed on site but not yet set up
- [ ] **Resend**: contact form logs to server console until `RESEND_API_KEY`
      is set; also switch the `from:` address in `app/contact/actions.ts` to a
      verified domain sender
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
- [ ] **About page bio facts are drafted, not verified**: `{/* VERIFY */}`
      comments in `content/pages/about.mdx` mark invented claims ("over a
      decade", personal story) awaiting Sebastian's corrections
- [ ] **Images**: all placeholders; see `IMAGES.md`
