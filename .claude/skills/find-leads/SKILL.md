---
name: find-leads
description: Research real small businesses in Southern Oregon that would benefit from Sebastian's services, and write them up as prospects in Mission Control for him to review. Use when he asks to find leads, find prospects, look for businesses to reach out to, or fill the top of the pipeline. Covers finding real businesses, checking them against observable signals, writing the prospect files, and drafting an honest opening line.
---

# Find leads

Fills the top of the funnel. Finds real local businesses, checks what
can actually be seen from outside, and writes each qualified one to
`mission-control/data/prospects/<slug>.md` for Sebastian to review at
`/prospects` (port 4848). He decides who is worth pursuing; promoting a
prospect is his click, not yours.

## Hard rules

- **Only businesses you actually looked at.** Every signal records what
  was seen and the URL it was seen on. If a claim can't be checked by
  opening a link, it doesn't go in the file.
- **Never invent contact details.** No guessed emails
  (`info@theirdomain.com` is a guess), no reconstructed phone numbers.
  Blank is correct when you didn't find one; Sebastian can call.
- **Published business details only.** The business's own listed email,
  phone, address, and website. No personal or home details about owners,
  no research into individuals, no LinkedIn digging, no data brokers.
- **Never contact anyone.** This skill researches and drafts. Sebastian
  sends, from his own inbox. Never send, submit a contact form, or
  message anyone on his behalf, and never suggest an automated blast.
- **Quality over volume.** Roughly 10 to 20 qualified per run. If four
  qualify, report four. A long list of weak leads is worse than a short
  list of real ones; it just moves the sorting work onto him.
- **Skip anyone already known**: a file in `mission-control/data/clients/`
  or `mission-control/data/prospects/` (any status, including `passed`),
  or a match on `mission-control/data/do-not-contact.md`. Read all three
  before writing anything.
- **The voice guide applies to every drafted word** (CLAUDE.md). The
  hardest one here: never condescend about their current setup. A dated
  website is not a failing, and the opening line must not imply it is.
  No big-company comparisons, no em dashes.

## Steps

1. **Get the brief.** Business type and town. If he didn't say, default
   to the uncontested targeting in `docs/market-research.md`:
   restaurants and cafés, lodging and inns, salons and studios,
   boutiques and retail, farms and producers, contractors and trades,
   across Medford, Ashland, Grants Pass, Central Point, Jacksonville,
   Talent, and Phoenix. Local competitors chase professional services,
   so the consumer-facing side is open.

2. **Find real businesses.** Load Firecrawl with
   `ToolSearch({ query: "firecrawl", max_results: 10 })`, then search
   for the trade plus the town. Google Maps and Yelp results surface
   the actual local operators; skip directories, national chains, and
   listicles. The user-level `site-blueprint` skill
   (`~/.claude/skills/site-blueprint/SKILL.md`, Step 2) has the search
   patterns that work for local service niches; reuse them rather than
   inventing new ones.

3. **Check each one.** Open the website if there is one, and the
   listing either way. Look for the signals below. Checking properly
   takes a couple of minutes per business, which is why the run is
   small.

4. **Read the site's stack.** For anyone with a website, run:

   ```
   node mission-control/scripts/detect-stack.mjs <url> [more urls...]
   ```

   It fetches each page once and reports what the site is built on
   (WordPress, Shopify, Squarespace, Wix, and the rest) plus the tools
   already wired into it: booking, ordering, payments, email, chat,
   analytics. Tools marked `[on your tool list]` are ones the
   tool-integration service page already claims, which makes them
   something concrete to talk about.

   It also answers, from the page itself, whether there is a viewport
   tag (no tag means it is very likely broken on a phone), whether the
   homepage has a form, and any published mailto address. That last one
   is a real email you may use; anything else is a guess and stays out.

   Copy the `platform:` and `stack:` lines it prints into the prospect's
   frontmatter. If it reports a non-200, it read nothing: say so in the
   file and check by hand, rather than recording an absence as a fact.

   What the stack means for the pitch:
   - A builder platform (Wix, Squarespace, GoDaddy) with no booking tool
     is usually a website conversation.
   - A booking or ordering tool present but not linked from the homepage
     is the best kind of lead: they already pay for it.
   - Several tools that plainly do not talk to each other is the
     tool-integration conversation.
   - No analytics at all means nobody can answer "is this working", which
     is the AI-insights conversation.

5. **Write the qualified ones** to
   `mission-control/data/prospects/<slug>.md` in the format below. Slug
   is the business name, lowercased and hyphenated.

6. **Report back**: how many were looked at, how many qualified, the
   two or three standouts and why, and anything the research couldn't
   settle. Then stop. Reviewing is his job.

## What counts as a signal

Each one maps to a service and its starting price from
`content/services/*.mdx`. Record the specific observation, never the
category name.

Amounts below are written without a dollar sign on purpose: a dollar
followed by a digit gets swallowed as a positional argument when this
skill is invoked with arguments. Check the live numbers in
`content/services/*.mdx` anyway; those are the source of truth.

| What you can see | Points at | Starts at (USD) |
|---|---|---|
| No website; a listing or a Facebook page only | Website design | 2,000 |
| Site is broken on a phone, badly dated, or has no way to get in touch | Website design | 2,000 |
| "Call to book" only, in a trade where booking online is normal | Workflow automation | 750 |
| Phone only, no form, nothing that answers after hours | AI assistants | 1,000 |
| Separate booking, ordering, and point-of-sale tools that clearly don't talk | Tool integration | 500 |
| Reviews mentioning nobody answered, double bookings, or lost orders | Workflow automation or AI assistants | 750 / 1,000 |

Rate the fit `strong` or `worth a look`. Nothing else; no invented
scores out of 100. Strong means two or more concrete signals, or one
unmissable one (no website at all for a business that plainly needs
one). A busy, well-run business with a good site and online booking is
not a lead, and saying so is useful.

## The file

```markdown
---
business: Example Barbers
city: Medford
category: Salons & studios
website: ''
phone: (541) 555-0100
email: ''
listing: https://www.google.com/maps/place/...
platform: ''
stack: []
fit: strong
services: [website-design, ai-assistants]
researched: '2026-08-28'
status: new
---

## What I saw

- No website. The Google listing links to a Facebook page whose last
  post is from 2023. (https://...)
- Hours aren't listed anywhere I could find, and three reviews mention
  turning up when they were closed. (https://...)

## Why it's a fit

Someone looking for a barber in Medford on their phone can't find out
when they're open. That's a small website's whole job.

## Opening line

I went looking for your hours on my phone last week and ended up on a
Facebook page from 2023.
```

The opening line is the part that matters. It is the true, specific
thing that proves a person looked at their business. If it could be
said to any business in town, it isn't specific enough, and a generic
one is worse than no email at all.

## What not to do

- Don't scrape or compile lists of contact details for their own sake.
  The unit of work is a researched business with evidence, not an
  address book.
- Don't write more than one prospect for the same business, and don't
  re-add one that was already passed on.
- Don't infer signals from the outside that you can't see. "They
  probably still use paper timesheets" is a guess; leave it out.
- Don't set `status` to anything but `new`. Promoted and passed are
  Sebastian's decisions, recorded by the app.
