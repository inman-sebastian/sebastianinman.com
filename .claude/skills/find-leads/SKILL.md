---
name: find-leads
description: Research real small businesses in Southern Oregon that would benefit from Sebastian's services, and write them up as client records in Mission Control for him to review. Use when he asks to find leads, find prospects, look for businesses to reach out to, or fill the top of the pipeline. Covers finding real businesses, checking them against observable signals, writing the records, and drafting an honest opening line.
---

# Find leads

Fills the top of the funnel. Finds real local businesses, checks what
can actually be seen from outside, and writes each qualified one to
`mission-control/data/clients/<slug>.md` at the `researched` stage, for
Sebastian to review at `/research` (port 4848), which is also where the
Find leads button lives. He decides who is worth pursuing; moving a record on is his
click, not yours.

## Hard rules

- **Only businesses you actually looked at.** Every signal records what
  was seen and the URL it was seen on. If a claim can't be checked by
  opening a link, it doesn't go in the file.
- **Open the site and click the thing.** A claim about a website is not
  recorded until it has been loaded in a real browser and the specific
  thing being claimed has been exercised: follow the booking link, open
  the contact page, resize to a phone. Reading the copy a search index
  returned is not checking a site. Of the first three records audited in
  Aug 2026, two were wrong, both because the page's words were read and
  nothing was clicked: one "dead" site was a bot wall, and one "no
  booking link" was a page covered in booking buttons that all pointed
  at the wrong place.
- **A blocked check is not a broken site.** Cloudflare and friends
  answer automated requests with a 403 or a "Just a moment..." page,
  which reads exactly like a site that is down. Never record "their
  website doesn't load" from a fetch alone: open it in a real browser
  first. This one already produced a wrong record (Waterstone Salon,
  Aug 2026) whose opening line would have told a business their working
  site was dead. A prospect can check that in five seconds, and being
  wrong about it in a first email is worse than never writing.
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
- **Never add anybody already on file.** There is one record store now
  (`mission-control/data/clients/`), and a business already in it must
  not be added again at any stage, including ones passed on: re-adding
  something already decided against quietly undoes the decision. Do not
  judge this by eye. Before writing anything:

  ```bash
  node mission-control/scripts/known-businesses.mjs
  node mission-control/scripts/known-businesses.mjs --check "Name One" "Name Two"
  ```

  `KNOWN` means skip. `MAYBE` means skip unless you can show it is a
  different business (different address, different phone). Also skip
  anything on `mission-control/data/do-not-contact.md`.
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

2. **Find real businesses.** Search for the trade plus the town. Google
   Maps and Yelp results surface the actual local operators; skip
   directories, national chains, and listicles.

   Use Firecrawl when it is there (`ToolSearch({ query: "firecrawl",
   max_results: 10 })`); its results are richer. **It is often not
   there**: MCP servers do not connect in a headless `claude -p` run,
   which is how the Find leads button in Mission Control invokes this
   skill. In that case use `WebSearch` and `WebFetch`, which do the same
   job. Check what you have rather than assuming, and do not stall if
   Firecrawl is missing.

   The user-level `site-blueprint` skill
   (`~/.claude/skills/site-blueprint/SKILL.md`, Step 2) has the search
   patterns that work for local service niches; reuse them rather than
   inventing new ones.

3. **Check each one.** Open the website if there is one, and the
   listing either way. Look for the signals below. Checking properly
   takes a couple of minutes per business, which is why the run is
   small.

   Two things to settle for every business, whether or not they have a
   site:
   - **Do they have a Google Business Profile?** Search the name plus
     the town; a profile shows as a Google Maps place result with hours
     and reviews. Record `googleProfile: yes` with the
     `googleProfileUrl`, or `no` when a search plainly turns up
     nothing. Leave it `unknown` rather than guessing. Not having one
     is a real finding: it is why nobody local can find them on a
     phone, and it is free to fix.
   - **Where are they?** Record the `city` always, and the street
     `address` when the listing shows one. This is what puts them on
     the dashboard map, and it is how the pipeline gets grouped by
     town. City alone is fine; do not invent a street address.

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

   It also reports any Google Maps link on the page. Those embeds carry
   the business's own pin as `!2d<lng>!3d<lat>`, so when one is present
   the script prints exact `lat:`/`lng:` and `googleProfile: yes`, which
   beats geocoding the middle of a town.

   Copy the `platform:`, `stack:`, `googleProfile:`, `lat:` and `lng:`
   lines it prints into the prospect's frontmatter. If it reports a non-200, it read nothing: say so in the
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
   `mission-control/data/clients/<slug>.md` in the format below. Slug is
   the business name, lowercased and hyphenated.

   A researched business and a client are the SAME record at different
   stages, not two kinds of thing. Write `stage: researched` and
   `source: outreach`; Sebastian moves it to `prospect` when he decides
   it is worth pursuing, or `lost` when it is not. Never write any other
   stage.

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
name: ''                      # a person's name, if one is published
business: Example Barbers
email: ''
phone: (541) 555-0100
city: Medford
address: 422 Bridge St
lat: ''                       # from detect-stack, or left for the app
lng: ''
stage: researched             # always this; Sebastian moves it on
website: ''
category: Salons & studios
listing: https://www.google.com/maps/place/...
googleProfile: yes            # yes | no | unknown
googleProfileUrl: https://www.google.com/maps/place/...
platform: ''
stack: []
fit: strong                   # strong | worth a look
researched: '2026-08-28'
services: [website-design, ai-assistants]
value: ''
source: outreach
nextStep: Decide whether they are worth pursuing
nextStepDue: ''
created: '2026-08-28'
updated: '2026-08-28'
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

## Timeline

### 2026-08-28 · Found by research
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
- Don't set `stage` to anything but `researched`. Moving it on is
  Sebastian's decision, recorded by the app.
- Don't skip the duplicate check because a name "looks new". The check
  is one command and it is the difference between a useful run and one
  that quietly re-adds work he already turned down.
