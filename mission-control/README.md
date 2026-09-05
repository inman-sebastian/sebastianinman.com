# Mission Control

The local control center for the business. Runs on this machine only,
holds client data, and is never deployed.

```bash
npm --prefix mission-control run dev   # http://localhost:4848
```

Next.js with hot reload, so edits show up without a restart (the thing
`paperwork-app/` cannot do).

## What is here now

The CRM core: clients moving through the same arc the client
emails already follow (inquiry, consult, proposal, agreement and
deposit, build, delivered, review ask, wrapped up, or not moving
forward).

- **Dashboard** (`/`): the board by stage, plus a "waiting on you" list
- **Clients** (`/clients`): everyone, filterable by stage
- **New client** (`/clients/new`): type it in, or paste the notification
  email the website sends and let it fill the form

### What things are called

One entity, the **client**, at a **stage**. There are no prospects,
leads, or contacts as separate things; those words describe where a
client is in the arc, and `lib/stages.ts` is the only place they are
defined. `prospect` is a stage, not a section.

The URLs follow from that. Everything about one client lives under
`/clients/<slug>`, including workflow screens for it
(`/clients/<slug>/review`, `/clients/<slug>/email`). Anything that
spans many of them gets its own top-level word: `/clients`, `/research`,
`/documents`, `/blog`. Adding a screen means deciding which of those two
it is, and there is no third option.

And the document workspace: proposals, agreements, and invoices per
client (`/documents`), started from the templates in `docs/clients/`,
edited here, previewed here, and generated as branded PDFs.

## Where the data lives

One markdown file per person in `data/clients/<slug>.md`, git-ignored
twice over (here and in the repo root .gitignore). Frontmatter holds
the structured half, the body holds notes and then a `## Timeline`
section.

Hand-editing those files is a supported path, not a workaround: Cowork
can read and write them with plain file tools and the app picks the
change up on the next refresh. Two conventions to keep:

- Timeline stays the last section of the file. New entries append to
  the end, oldest first, as `### YYYY-MM-DD · What happened`.
- Dates are `YYYY-MM-DD`. Quoted or not, both parse.

`lib/clients.ts` is the only writer in the app. Anything that changes a
record goes through it, so records always come out looking the same.

## Documents

Drafts stay exactly where they have always been, in
`docs/clients/drafts/` (git-ignored), because the CLI and the
draft-client-paperwork skill both expect them there. Nothing moved.

A draft belongs to a client when its frontmatter says `record:
<client-slug>`, and failing that when the filename starts with the
client's slug, which is how the older drafts are named.

Starting one from a template fills in the facts only: their name and
business, the date, the price and half of it, the phone number, the
next invoice number, the payment terms. The writing prompts in double
braces stay put, because answering those needs the consult notes. The
count of what is left shows at the top of the document, and generating
is blocked while any remain, so nothing can go out with `{{...}}` in
it.

Preview and PDF both shell out to `paperwork-app`:

- `paperwork-app/preview.js` prints the branded HTML for the iframe
- `paperwork-app/generate.js` builds the PDF, unchanged

Running them as child processes keeps Chrome and puppeteer out of this
app's bundler, and means the button here and the CLI Cowork uses are
the same code path. The print CSS and `buildPdf()` are untouched; see
the Facts section of `.claude/skills/draft-client-paperwork/SKILL.md`
before changing any of it.

## Research

`/research` is the review queue for businesses Cowork found, plus the
button that goes looking for more. They are ordinary client records
sitting at the `researched` stage: nobody there has been in touch, and a
research run produces a batch at once, so that stage is kept off the
board until you have judged one.

Records live in `data/clients/<slug>.md` like every other client, same
only-writer rule. The `find-leads` skill writes them; it is told to
record what was actually seen and the URL it was seen on, never to
invent a contact detail, and never to write to anybody.

Reviewing one happens at `/clients/<slug>/review`, which shows what the
research found and the two decisions. Pursuing it moves the record to
the `prospect` stage and lands you on the record itself. Passing moves
it to `lost` rather than deleting it, so a later research run knows it
was already looked at and decided against.

Two stages sit at the front of the board for this: `prospect` and
`contacted`. Neither counts towards "waiting on you" unless it has a
date on it, so an afternoon of research cannot bury the people who
actually wrote in.

### What a site is running

```bash
node scripts/detect-stack.mjs https://example.com [more urls...]
```

Fetches each page once, the same as opening it in a browser, and reads
the metadata: the generator tag, the script and stylesheet hosts, a few
response headers. No crawling and no second page.

It reports the platform (WordPress, Shopify, Squarespace, Wix, Webflow,
GoDaddy, Weebly, Duda, and the rest) and the tools already wired in:
booking, ordering, payments, email, chat, analytics. Anything that also
appears on the tool-integration service page is marked, because those
are the ones already claimed as work. It also answers whether the page
has a viewport tag (none usually means it is broken on phones), whether
there is a form, any published mailto address, and the business's own
social profiles (Instagram, Facebook, LinkedIn…), skipping the share
buttons and trackers that live on those same hosts.

The `platform:`, `stack:` and `socials:` lines it prints go straight
into a record's frontmatter, and its review page shows them. A non-200
means it read nothing at all and says so, rather than reporting an
absence as a fact; a Cloudflare challenge page is not evidence about
anybody's website.

### Where they are, and the map

Research records a `city` for every business it finds and a street `address`
where the listing shows one, plus whether they have a Google Business
Profile (`googleProfile: yes | no | unknown`). Not having one is a real
finding rather than a blank: it is why nobody local finds them on a
phone, and it costs nothing to fix.

`detect-stack.mjs` helps here too. A Google Maps embed on their own site
carries the business's pin as `!2d<lng>!3d<lat>`, so when one is present
the script prints exact coordinates, which beats geocoding the middle of
a town.

The dashboard shows everyone with coordinates on a Mapbox map, whatever
stage they are at, with a popup linking to the record. Pins are coloured
by the four phases in `lib/stages.ts` (`PHASES`): not contacted, in
conversation, working together, closed. Twelve colours would be a decoder
ring, so stages that mean the same thing at a glance share one, and every
stage has to belong to exactly one phase or the build fails.

Above the map is one row of chips: Everyone, then a chip per stage
anybody is actually at, with its count and the colour its pins are drawn
in. The row is the filter and the key at once, which is the point;
clicking a chip narrows the map to that stage, clicking it again goes
back to everyone. That filter is what makes "everyone" readable: a
research run can put thirty pins up, and the two you are building for get
lost in them. It runs in the browser, since the pins are already there.

Anything with a town but no coordinates is geocoded through `lib/geo.ts`
on its own when the dashboard loads, and the result is written into the
record, so it is a one-time cost per business and nothing has to be
pressed. It runs after the page has rendered rather than during it,
because the pipeline has to be readable on a bad connection. Businesses
Mapbox has nothing for are remembered for the life of the server, so an
unplaceable record is not looked up again on every visit.

Pins are usually town-level, and the map says so. Records sharing a town
get a small deterministic offset so six businesses in Medford read as
six pins rather than one. `MAPBOX_API_KEY` lives in the repo root's
`.env.local` and is a public `pk.` token, which is the kind meant to be
used from a browser.

`data/do-not-contact.md` is a plain list, one business, domain, or
address per line. Research skips them and the app refuses to write to
them. Add anyone who asks, the day they ask.

## What the website is doing

The dashboard's top panel reads Vercel Web Analytics through the public
API (`lib/analytics.ts`), so the numbers match what the Vercel dashboard
shows. Last seven days: visitors, page views, pages per visitor, the
busiest routes, and how many people reached `/contact` against how many
actually got in touch. That last pair is deliberate: a form submission
becomes a client record here, which is a truer measure of the form
working than a click could be.

`VERCEL_API_TOKEN` goes in the repo root's `.env.local`, same place as
the Resend and Mapbox keys, and wants only read access. `VERCEL_PROJECT_ID`
and `VERCEL_TEAM_ID` are optional overrides; the project defaults to
sebastianinman.com, and the team id is only needed if a bare token gets
refused.

Our own traffic never reaches these numbers: the site filters it in
`components/SiteAnalytics.tsx` before sending, covering Sebastian's
browser (via a `va-disable` flag in localStorage) and the browser
automation used to build and check the site.

Two limits come from the Hobby plan and are worth knowing before adding
to this panel:

- **Custom events are Pro-only.** `events/count` answers 402, so "did
  somebody click that button" is not askable. Anything expressible as a
  route is, because page views are automatic.
- **The reporting window is one month**, so there is no year-over-year
  to build here.

The panel renders inside Suspense and everything else on the dashboard
renders without waiting for it. It is the only part of this app that
depends on somebody else's server being up, and a slow Vercel must not
hold up the pipeline. Answers are held for five minutes, since these
numbers move slowly and the dashboard gets refreshed without thinking.

## Sending

The composer (`/clients/<slug>/email`) opens the right template for the
stage, filled with the facts it can resolve, with their generated PDFs
ready to attach.

For first contact it is **channel-aware**: not every lead has an email,
and some live on Instagram. `lib/channels.ts` reads the record and offers
a picker of the channels actually open (email, plus an Instagram or
Facebook DM when that profile is in `socials`). Email keeps its template;
a DM has none by design and is generated from the record by
`draftMessage()` in `lib/drafting.ts`, short and subject-less and without
a signature, still built around the checked opening line. A DM is always
copy-only, the same handover as outreach email, since the app has no way
to send one.

**Sebastian sends everything.** Writing and sending are two separate
screens on purpose. The second one shows the exact sender, recipient,
subject, attachments, and message, and only the button on that screen
reaches Resend. Sending is blocked while any `{{...}}` remain. Nothing
in this app sends on a schedule, on a save, or on any other trigger,
and Cowork never presses the button without Sebastian saying so in the
moment. `lib/send.ts` is the only file that talks to the outside world;
keep it that way.

**Outreach never goes through Resend.** Their acceptable use policy bans
cold outreach outright, and that account also carries the website's
contact form and every client email, so a prospecting complaint would
take down the mail the business actually runs on. Records with
`source: outreach` get a Copy button instead of a Send button, and
`sendBlockReason()` in `lib/send.ts` is checked again inside the send
action, because a UI guard is a suggestion. One function, both places;
do not let them drift.

Credentials come from the repo root's `.env.local` (`RESEND_API_KEY`,
`RESEND_FROM`), read by `lib/env.ts`. Next only loads env files from
its own folder, so this reads the root file directly rather than
keeping a second copy of the key on the machine. The wording lives in
`docs/clients/email-templates.md`; edit it there and it changes here.

## Blog

`/blog` lists `content/blog/*.mdx` with where each post stands: not on
the site, edited since it went up, committed but not pushed, or live.

**Saving and publishing are two different buttons, and they must stay
that way.** Saving writes the file and touches nothing else. Publishing
commits and pushes, and because main auto-deploys, that IS putting the
post on sebastianinman.com. It sits behind the same two-step confirm as
the email composer, and the confirm screen names the files, the message,
and the branch.

The commit is scoped by pathspec to the post and its illustration, so
whatever else is dirty in the working tree never rides along. Never
change that to a `git add -A`.

### Illustrations

The Illustration panel on a post shows the current image, a Generate
button, and a file picker. Clicking any image opens it full size.

**Generate runs the real pipeline.** It shells out to Claude Code in
headless mode (`claude -p "/generate-image ..."`), which runs the
generate-image skill: Sebastian's Flow collection for style influence,
two candidates, a 2K download, the eyeball check. That is deliberate.
The skill drives a browser through agent-browser and a web request
cannot, so this does not reimplement the pipeline, it invokes it. It
also means generation bills against the Claude subscription rather than
a second metered key, and the pipeline stays one implementation.

The run is scoped hard: `Bash(agent-browser:*)`, `Read`, `Glob`, `Grep`
and nothing else. No writes into the repo, no optimizer, and explicitly
no git, because main auto-deploys and a button must never be able to
ship anything.

**Nothing it makes goes near the website.** Output lands in the
git-ignored `data/image-candidates/` and waits. Choosing one copies it
to `public/images/blog/<slug>.jpg`, sets the frontmatter, and runs
`npm run optimize:images` (2.4MB down to about 200KB in practice). The
image it replaces is kept as another candidate labelled "was on the
post", so a picture that was liked is never simply gone.

Runs take minutes, so they go in the background and leave their state on
disk in `data/image-jobs/`: a log, and an exit-code file written at the
end. The panel polls `/blog/<slug>/job`, which survives this server
restarting mid-run.

Before publishing, `lib/validate.ts` checks the things that actually go
wrong: missing frontmatter, MDX that will not compile, a component the
site does not have (the list is read from the site's own
`components/mdx.tsx`, so it cannot drift), a frontmatter image with no
file behind it, and em dashes. Errors block publishing; the em dash is a
warning. A broken post does not take the site down (Vercel fails that
build and the previous deploy stays live), it just quietly never appears,
which is worse to debug than to prevent.

## What it reads from the website

Nothing is duplicated by hand:

- `content/site.ts` for name, email, phone, booking link
  (`lib/site.ts`, parsed with a regex the way `paperwork-app` does it)
- `content/services/*.mdx` for the service list and each starting
  price, which is the floor for any quote (`lib/services.ts`)

Brand tokens in `app/globals.css` are a mirror of the website's, same
as `paperwork-app/style.css`. Update all three when the palette moves.

## Inbox (Gmail, read only)

`/inbox` reads mail on `hello@sebastianinman.com` and files it against
the client it is from. That address is a Workspace alias on
`hello@sebastiancodes.com`, so `lib/gmail.ts` authenticates as the
primary account and filters to the alias. Read only: the scope is
`gmail.readonly` and nothing here sends. It is the second off-machine
reach after `lib/send.ts`.

No webhook. Gmail push needs a public, always-on endpoint, which a
local-only app that is usually closed cannot offer. So the app pulls: an
incremental `historyId` sync (`fetchNew()`) runs once on dashboard load
(`MailAutoCheck`) and on the **Check mail** button. Messages go to a
single-writer store (`lib/messages.ts`, `data/messages/`), deduped by
Gmail id. Mail from someone on file attaches to their record and their
timeline; mail from anyone else waits in "to sort", where **Make a
record** creates one on purpose (never automatically).

One-time setup: an Internal OAuth app in the sebastiancodes.com Workspace
(no Google verification, permanent refresh token), gmail.readonly scope,
a Web-application client with redirect
`http://127.0.0.1:4848/api/gmail/callback`, and
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in the repo root `.env.local`.
The refresh token lives in git-ignored `data/gmail/`. The `/inbox` page
walks through this when the credentials are missing.

The paste path (`/clients/new`) still works and is the fallback when
Gmail is not connected.

`/inbox` also reads **Instagram DMs** for the business account
(`lib/instagram.ts`), the same polling model. Auth is a pasted long-lived
token (Meta rejects a localhost OAuth redirect), generated once in the
Meta App Dashboard and kept refreshed by the app. Inbound DMs match a
client by the Instagram handle in their `socials`, not by email. Every
channel shares one store and shape (`lib/message-types.ts`);
`checkInboxAction` pulls all connected channels, and `MailAutoCheck` runs
it on open plus a ~60s interval. Read only for now, and never a cold DM.

Connecting works two ways, both ending in the same long-lived token: paste
a dashboard token (everyday), or the OAuth **Connect Instagram** button
that shows when `INSTAGRAM_APP_ID/SECRET/REDIRECT_URI` are set. OAuth needs
an HTTPS redirect (Meta rejects localhost), so it points at a self-owned
route on the website, `https://www.sebastianinman.com/api/instagram-callback`,
which just shows Instagram's one-time code; you paste it back here and the
token exchange finishes locally (secret and token never touch the website).
It exists mainly so App Review can see the standard connect flow and the
profile card. The submission kit (setup, screencast shot-list, reviewer
text) is in `docs/instagram-app-review.md`. App Review + Business
Verification are what unlock reading DMs from non-tester accounts.

Replying closes the loop: a **Reply** link on an inbound message opens
the composer in reply mode (`?reply=<id>`), which reuses the whole email
send path (the confirm gate, the Resend send, every guard). It prefills
the address and a `Re:` subject and threads via In-Reply-To/References
from the original's Message-ID. The app sends through Resend, not Gmail,
so the sent reply will not come back on a sync; `recordOutbound()` stores
it in the conversation so the thread stays whole. The outbound side of a
thread therefore lives in `data/messages/`, not Gmail.

## What it deliberately does not do

No payment processor here beyond Stripe invoicing. Cold outreach never
sends from the app (see Sending); the inbox reads and replies, but the
next channels (Instagram, Facebook) are a later phase.
