# Mission Control

The local control center for the business. Runs on this machine only,
holds client data, and is never deployed.

```bash
npm --prefix mission-control run dev   # http://localhost:4848
```

Next.js with hot reload, so edits show up without a restart (the thing
`paperwork-app/` cannot do).

## What is here now

The CRM core: leads and clients moving through the same arc the client
emails already follow (inquiry, consult, proposal, agreement and
deposit, build, delivered, review ask, wrapped up, or not moving
forward).

- **Dashboard** (`/`): the board by stage, plus a "waiting on you" list
- **Clients** (`/clients`): everyone, filterable by stage
- **New lead** (`/clients/new`): type it in, or paste the notification
  email the website sends and let it fill the form

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

## Prospects

`/prospects` is the review queue for businesses Cowork found by
research. They are deliberately not clients: nobody here has been in
touch, and a research run produces a batch at once, so they stay out of
the pipeline until you promote one.

Records live in `data/prospects/<slug>.md`, same format and same
only-writer rule as the client records. The `find-leads` skill writes
them; it is told to record what was actually seen and the URL it was
seen on, never to invent a contact detail, and never to write to
anybody.

Promoting creates a pipeline record at the `prospect` stage with
`source: outreach`, the research as its notes, and a timeline entry
saying where it came from. Passing marks the file `passed` and keeps it,
so a later research run knows it was already looked at.

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
there is a form, and any published mailto address.

The `platform:` and `stack:` lines it prints go straight into a
prospect's frontmatter, and the prospect page shows them. A non-200
means it read nothing at all and says so, rather than reporting an
absence as a fact; a Cloudflare challenge page is not evidence about
anybody's website.

`data/do-not-contact.md` is a plain list, one business, domain, or
address per line. Research skips them and the app refuses to write to
them. Add anyone who asks, the day they ask.

## Sending

The composer (`/clients/<slug>/email`) opens the right template for the
stage, filled with the facts it can resolve, with their generated PDFs
ready to attach.

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

## What it deliberately does not do

No payment processor and no Gmail. The processor is undecided; ask
Sebastian before wiring anything to money.
