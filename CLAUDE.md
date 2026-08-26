# sebastianinman.com

Portfolio/services site for **Sebastian Inman**: automation & AI integration
for small businesses. Primary market: Southern Oregon (Jackson County), but
serving small businesses anywhere in the US.

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

- **Plain English, always.** If a technical term is unavoidable, explain it in
  one everyday sentence.
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
- Prefer "Southern Oregon" phrasing in customer-facing descriptions; "Jackson
  County" for the specific home-base detail.

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
and `goodFit` (one sentence, rendered as a callout with the CTA).
Body = ONLY the short intro: one `##` headline plus 2-3 paragraphs. Never
put walls of text or the lists back into the body. The service appears
automatically on the homepage cards, the /services overview, the footer,
and the sitemap.

### Use design components inside MDX bodies
Every MDX body (services, landing pages, about) can embed these components,
defined in `components/mdx.tsx` (add new ones there and document them here):
- `<Callout title="...">text</Callout>`: terracotta-tinted aside
- `<CheckList items={["...", "..."]} />`: green checkmark list
- `<ChatBubble question="..." answer="..." caption="..." />`: chat exchange
- `<StatRow stats={[{ value: "3 hrs", label: "saved weekly" }]} />`: stat tiles
Use them to break up prose (nobody wants a wall of text). Any numbers in a
`StatRow` must be real or clearly illustrative; no invented claims.

### Add an SEO landing page (e.g. "Grants Pass automation")
Create `content/landing/<url-slug>.mdx`. The filename becomes the URL
(`grants-pass-small-business-automation.mdx` → `/grants-pass-small-business-automation`).
Frontmatter: `title` (short label for footer links), `metaTitle` (full SEO
title), `metaDescription`, `heroHeadline`, `heroSubline`, `city`, plus
optional `heroCardsTop` / `heroCardsBottom` (rotating hero example cards,
same format as services; write them for the city's business mix, e.g.
lodging and restaurants for Ashland). Body = markdown sections following
the pattern in the existing files: local pain points → concrete examples →
why local. It's automatically added to the
sitemap and the footer "Areas we serve" list. Keep each page's copy genuinely
specific to the place/service. No find-and-replace city swaps.

### Change contact info, tagline, or booking link
Edit `content/site.ts`. Setting `bookingUrl` makes every "Book a free
consult" button link there (empty string = buttons go to /contact).

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
1200×900) and note 4:3 in the IMAGES.md entry. Exceptions: the home hero is a
16:9 full-width background (`SiteImage` with `fill`, left half of the image
kept calm for text overlay) and the headshot is a real portrait photo.

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
- [ ] **Booking URL**: `bookingUrl` in `content/site.ts` is empty (buttons
      fall back to /contact) until Sebastian sets up Cal.com/Calendly
- [ ] **Starting prices are unconfirmed placeholders**, set by Claude and
      needing Sebastian's sign-off: website $1,500 / workflow automation $750 /
      tool integration $500 / AI assistants $1,000 / AI insights $750
- [ ] **"Best for" business types are Claude's educated guesses**, based on
      service-to-pain reasoning and the general Southern Oregon business
      mix, not real lead data. Revisit the `bestFor` frontmatter lists once
      actual inquiries show which niches respond.
- [ ] **About page bio facts are drafted, not verified**: `{/* VERIFY */}`
      comments in `content/pages/about.mdx` mark invented claims ("over a
      decade", personal story) awaiting Sebastian's corrections
- [ ] **Images**: all placeholders; see `IMAGES.md`
