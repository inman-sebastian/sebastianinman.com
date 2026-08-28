---
name: draft-client-paperwork
description: Draft client-facing paperwork (proposal, services agreement, or client emails) from the templates in docs/clients/, rendered by the standalone local paperwork app (paperwork-app/, port 4747) for PDF export. Use when Sebastian wants to send a quote/proposal, get an agreement ready, or reply to an inquiry, typically after a consult.
---

# Draft client paperwork

Turns consult notes into ready-to-send documents using the templates
in `docs/clients/`. Proposals and agreements become markdown drafts
rendered by the standalone paperwork app (`paperwork-app/`, port 4747:
brand letterhead, print-to-PDF, no website chrome); emails are
delivered as text for Sebastian to paste into his mail client. Start
the app with the "paperwork" launch config (or
`npm --prefix paperwork-app start`).

## Hard rules

- **Drafts contain client data and NEVER get committed.**
  `docs/clients/drafts/` is git-ignored; leave it that way, and never
  copy draft contents into committed files, chat logs that become
  content, or the public site. `git status` must stay clean of drafts.
- **Sebastian sends everything.** Draft, render, tell him it's ready.
  Never email a client or submit anything on his behalf.
- **Never quote below the service page's starting price** or change
  payment terms without Sebastian saying so explicitly.
- The agreement template is **not lawyer-reviewed** until its header
  says otherwise; remind Sebastian of that any time an agreement draft
  is produced.

## Inputs

Consult notes from Sebastian: who the client is, the problem in their
words, what he plans to build, the price, the timeline. Missing
pieces: ask, don't invent. Client quotes/details in the proposal must
come from his notes, never from imagination.

## Steps

1. **Pick the template**: `proposal-template.md`,
   `services-agreement.md`, or `email-templates.md` (all in
   `docs/clients/`). Read the template's header notes; they carry the
   rules for that document.

2. **For proposals and agreements**: write the filled document to
   `docs/clients/drafts/<client-slug>-<type>.mdx` with frontmatter
   `title`, `client`, `date` (ISO). Follow the template's structure
   exactly; every `{{...}}` resolved, no placeholders left. Voice
   guide applies in full (plain language, no em dashes, warm not
   corporate). Keep proposals to one page of content.

3. **Render and check**: start the paperwork app ("paperwork" launch
   config), open `http://localhost:4747/doc/<slug>`, confirm it
   renders cleanly (letterhead, title, no leaked placeholders), and
   screenshot it for Sebastian.

4. **For emails**: fill the matching template from
   `email-templates.md` and present the finished text in chat for
   copy-paste. Subject line included.

5. **Hand off**: tell Sebastian the draft is at
   `http://localhost:4747/doc/<slug>` and that Cmd+P saves the PDF. For agreements, include the
   lawyer-review reminder until the template header says reviewed.

## Facts

- The print layout is deliberately built on an invisible table frame
  (thead/tfoot spacer rows repeat on every printed page = per-page
  vertical margins) with @page margin 0 (full-bleed background, no
  browser date/URL stamps). Verified working Aug 2026 after simpler
  approaches failed: element padding only pads the first/last page,
  @page margins print as white bands against the tinted background,
  and position:fixed backgrounds clip to the content area in current
  Chrome. Don't "simplify" this structure without re-testing a
  multi-page PDF.
- The paperwork app is plain Node with NO hot reload: after any edit
  to `paperwork-app/server.js`, RESTART the server (style.css is read
  per-request and needs no restart). A stale server serves stale
  markup and makes CSS changes look broken.
- The paperwork app is a separate local-only server (never deployed;
  it lives in `paperwork-app/` and binds to 127.0.0.1) and drafts are
  git-ignored: two walls between client data and the public site. It
  reads brand contact info live from `content/site.ts` and renders
  plain markdown, so drafts can be `.md` or `.mdx` with no components.
- Documents needing signatures declare them in frontmatter
  (`signatures:` list of names, e.g. "Jamie Doe, Sample Bakery"); the
  app renders ruled signing blocks with date lines after the body.
  Never write signature underscores in the markdown body. The printed
  lines are signed with pen or PDF markup tools (Preview, Fill &
  Sign); browser print-to-PDF cannot produce interactive form fields,
  and that's fine: marked-up signatures are ESIGN-valid. If real
  audit-trail e-signing is ever needed, that's an e-sign service
  (DocuSign, DocuSeal), not this app.
- Prices live in `content/services/*.mdx` frontmatter
  (`startingPrice`). Default terms: half up front, remainder within 14
  days of delivery, 30-day free-fix window. Sebastian can override
  per-project.
- Sample draft `sample-bakery-proposal.mdx` (fictional) shows the
  target output; it stays in drafts as a reference.
