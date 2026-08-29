# Marketing materials

Things Sebastian shows a room or hands to somebody, as opposed to the
client paperwork in `docs/clients/` (proposals, agreements, invoices)
which goes to one named person after a consult.

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
