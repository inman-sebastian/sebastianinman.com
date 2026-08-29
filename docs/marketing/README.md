# Marketing materials

Things Sebastian shows a room or hands to somebody, as opposed to the
client paperwork in `docs/clients/` (proposals, agreements, invoices)
which goes to one named person after a consult.

| File | What it is |
|---|---|
| `rogue-valley-talk.pptx` | A 15 to 20 minute talk for a room |
| `leave-behind.md` -> `out/leave-behind.pdf` | One page to hand over or email |

## The leave-behind

`leave-behind.md` is the generic one-pager: who he is, what the five
services cost, how a job goes, and what he will not do. Nothing in it is
specific to one client, so it can be handed to anybody, printed in a
stack for a talk, or emailed to someone deciding.

It answers the two questions nobody can recall after a meeting: what
does this cost, and what happens next. That is why the price table and
the steps get most of the page.

It goes through the same renderer as the proposals, so it carries the
same letterhead:

```bash
cd paperwork-app
PAPERWORK_DRAFTS=docs/marketing npm run generate -- leave-behind
```

The `PAPERWORK_DRAFTS` override exists for exactly this: the app
normally reads `docs/clients/drafts/`, which is git-ignored because it
holds client data. This is not client data and should be committed.

**Keep it to one page.** It is currently a few lines short of spilling,
and a two-page leave-behind is a brochure nobody reads. Check the page
count after any edit:

```bash
pdftoppm -png -r 90 docs/marketing/out/leave-behind.pdf /tmp/lb && ls /tmp/lb*
```

One known cosmetic quirk: the last row of the price table gets extra
space and no divider. That is `.content tr:last-child td` in
`paperwork-app/style.css`, meant for an invoice's total row. Since the
table runs cheapest to dearest it just emphasises the website, which is
fine. Do not "fix" it in the shared stylesheet; proposals and invoices
depend on that rule.

## The talk

`rogue-valley-talk.pptx` is a 15 to 20 minute talk for a room of local
business owners: Chamber of Commerce, a business group, a workshop. Ten
slides, one idea each, big type, because he is speaking over them and
the slides are not the talk.

Its structure is deliberate and worth keeping if it gets rewritten:

1. Title
2. What this is, and the promise that it is not a pitch
3. The problem in their own words, taken from the `busywork` lists on
   the service pages
4. What automation actually means, in one sentence with no jargon
5. **The test**: three questions for spotting a job worth automating.
   This is the takeaway, and the reason the talk is worth attending
6. What it looks like in practice, three before and afters
7. **What is not worth automating.** The trust slide. Saying plainly
   that most of what gets sold is not worth it for a business this size
   is the thing that separates him from whoever spoke last month
8. Real prices, because most of the room assumes they cannot afford this
9. What to do Monday morning, which needs nobody's help
10. One soft ask

The room is full of exactly who he targets, so the deck has to be worth
their time even if nobody ever calls. Every slide before the last is
useful on its own; there is one ask and it is at the end.

## Do not judge it in Finder Preview

QuickLook (spacebar in Finder) renders this deck **wrong**: it composites
shapes from one slide onto another, so cards and arrows appear on slides
that do not contain them. The file is fine. Open it properly in Keynote,
PowerPoint or Google Slides before believing anything is broken.

This cost a round of pointless debugging once already. The XML was
verified correct while the preview looked mangled.

## Regenerating it

Slides are generated, not hand-edited, so the brand stays in step with
the website:

```bash
cd /tmp && mkdir -p deckbuild && cd deckbuild
npm install pptxgenjs
cp /path/to/repo/docs/marketing/rogue-valley-talk.build.js build.js
node build.js
```

Colours come from `app/globals.css` and prices from the `startingPrice`
in each `content/services/*.mdx`. **If prices change on the site, slide 8
changes too**, and nothing enforces that but this sentence.

Editing the `.pptx` by hand is fine for a one-off (a specific room, a
specific date). Anything worth keeping goes back into the build script,
or the next regeneration silently throws it away.

## House rules that apply here

- The voice guide in `CLAUDE.md` covers this as much as the website: no
  em dashes, no jargon, never condescending, no big-company
  comparisons, and no AI hype.
- **Never quote below a service's `startingPrice`.** An earlier draft of
  slide 8 said "a smaller job costs less", which quietly broke that
  rule in front of a whole room.
- Prices shown are starting points and the slide says so.
- **Nothing says "based in Southern Oregon".** The room is Southern
  Oregon. They know.
- Every card is ONE object with its text inside, never a shape with a
  separate text box on top. Half the objects, and nothing stacked.
