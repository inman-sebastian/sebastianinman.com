---
name: draft-client-paperwork
description: Draft client-facing paperwork (proposal, services agreement, or client emails) from the templates in docs/clients/, rendered by the standalone local paperwork app (paperwork-app/, port 4747) for PDF export. Use when Sebastian wants to send a quote/proposal, get an agreement ready, or reply to an inquiry, typically after a consult.
---

# Draft client paperwork

Turns consult notes into ready-to-send documents using the templates
in `docs/clients/`. Proposals and agreements become markdown drafts;
the standalone paperwork app (`paperwork-app/`) turns them into
finished PDFs headlessly: `npm --prefix paperwork-app run generate --
<slug>` writes `docs/clients/drafts/out/<slug>.pdf` (drafts with
`signatures:` frontmatter get an appended brand signing page with
REAL fillable AcroForm fields). Emails are delivered as text for
Sebastian to paste into his mail client. The preview server ("paperwork"
launch config, port 4747) is optional for on-screen checking; it
mirrors the print layout (Letter-size sheet, pinned footer) and its
`/pdf/<slug>` route serves the exact final artifact on demand.

## Hard rules

- **Drafts contain client data and NEVER get committed.**
  `docs/clients/drafts/` is git-ignored; leave it that way, and never
  copy draft contents into committed files, chat logs that become
  content, or the public site. `git status` must stay clean of drafts.
- **Sebastian sends everything.** Draft, render, tell him it's ready.
  Never email a client or submit anything on his behalf. Mission Control
  now has a send button (composer at `/clients/<slug>/email`, Resend
  behind a two-step confirm); that does not change this rule. Cowork
  fills the wording and attaches the PDF, Sebastian presses send, unless
  he says otherwise in the moment.
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
   `services-agreement.md`, `invoice-template.md`, or
   `email-templates.md` (all in `docs/clients/`). Read the template's
   header notes; they carry the rules for that document.

2. **For proposals and agreements**: write the filled document to
   `docs/clients/drafts/<client-slug>-<type>.mdx` with frontmatter
   `title`, `client`, `date` (ISO). Follow the template's structure
   exactly; every `{{...}}` resolved, no placeholders left. Voice
   guide applies in full (plain language, no em dashes, warm not
   corporate). Keep proposals to one page of content.

3. **Generate and check**: run `npm --prefix paperwork-app run
   generate -- <slug>`, then Read the output PDF
   (`docs/clients/drafts/out/<slug>.pdf`) page by page: letterhead,
   title, no leaked placeholders, no broken page breaks, and (for
   agreements) the signing page with fields present.

4. **For emails**: fill the matching template from
   `email-templates.md` and present the finished text in chat for
   copy-paste. Subject line included. Sebastian can also open the
   composer in Mission Control, which loads the same template already
   filled with the client's details and their PDFs ready to attach.

5. **Hand off**: tell Sebastian the finished PDF path
   (`docs/clients/drafts/out/<slug>.pdf`, ready to attach to the
   matching email template). For agreements, include the lawyer-review
   reminder until the template header says reviewed.

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
- Mission Control (`mission-control/`, port 4848) now wraps this same
  system for Sebastian: it starts drafts from these templates, edits
  and previews them, and generates PDFs. It does that by SHELLING OUT
  to `paperwork-app/preview.js` and `generate.js`, so this workflow and
  the CLI below stay the one implementation. Drafts did not move.
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
  (`signatures:` list of names, e.g. "Jamie Doe, Sample Bakery").
  Never write signature underscores in the markdown body. generate.js
  appends a native signing page with real fillable text fields
  (typed signature + date per signer, ESIGN-valid); recipients can
  also print it and sign with a pen. The HTML preview shows plain
  ruled lines for the same data. If audit-trail e-signing is ever
  needed, that's an e-sign service (DocuSign, DocuSeal), not this app.
- generate.js drives the INSTALLED Chrome via puppeteer-core
  (override path with PAPERWORK_CHROME) and uses
  assets/fonts/fraunces-600-static.ttf for the signing page: the
  variable-font slice the OG images use breaks letter spacing when
  embedded in PDFs; keep both files.
- Invoices: numbered INV-<year>-<NNN> sequentially (check existing
  drafts for the last number; ask Sebastian if unclear), amounts must
  match the proposal, and line items must sum to the total (verify
  the arithmetic explicitly). Payment instructions come from
  Sebastian, never invented. Deposit invoice goes with the signed
  agreement; final invoice with the delivery email.
- Prices live in `content/services/*.mdx` frontmatter
  (`startingPrice`). Default terms: half up front, remainder within 14
  days of delivery, 30-day free-fix window. Sebastian can override
  per-project.
- Sample draft `sample-bakery-proposal.mdx` (fictional) shows the
  target output; it stays in drafts as a reference.
