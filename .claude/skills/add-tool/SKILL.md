---
name: add-tool
description: Add a named tool/software (with its brand favicon) to a service page's "Use any of these?" chip grid. Use when Sebastian wants to list a new tool, program, or platform on the tool-integration service page (or add a tools list to another service). Handles the frontmatter entry, favicon download, and the eyeball check for wrong marks.
---

# Add a tool chip (name + brand favicon)

Adds a tool to a service's `tools:` frontmatter list and fetches its brand
favicon so the chip renders with the icon. The chips render as two
counter-scrolling marquee rows under "Use any of these?"
(`components/ToolMarquee.tsx`, wired in `app/services/[slug]/page.tsx`);
the frontmatter list's first half is the top row, second half the bottom
row, so insert the tool into whichever half fits it thematically (top:
money/commerce/operations; bottom: marketing/communication/productivity)
and keep the halves roughly equal in length. Chips fall back to
text-only when no icon file exists, so the favicon is an upgrade, never
a blocker. Only list tools with a real integration path; walled-garden
platforms with closed APIs (DoorDash, most salon-booking apps, Airbnb)
stay off the list no matter how recognizable they are.

## Inputs

- **Tool name** as it should appear on the chip, e.g. "Microsoft 365",
  "Housecall Pro". Use the product's own capitalization.
- **Service** (optional): defaults to `content/services/tool-integration.mdx`.
  Any service MDX can carry a `tools:` list.

## Steps

1. **Add the name** to the `tools:` YAML list in the service's MDX
   frontmatter. Keep related tools adjacent (accounting near accounting,
   etc.). One name per chip: never "X & Y" (each brand gets its own chip
   and icon; split them).

2. **Compute the icon filename**: lowercase the name, replace every run of
   non-alphanumerics with `-`, trim leading/trailing `-`, then
   `public/images/tools/<slug>.png`. ("Microsoft 365" → `microsoft-365.png`.)
   This must match `toolIcon()` in `app/services/[slug]/page.tsx`.

3. **Download the favicon** (64px PNG) from Google's favicon service:

   ```bash
   curl -sL -o public/images/tools/<slug>.png "https://www.google.com/s2/favicons?domain=<domain>&sz=64"
   ```

   - Use the product's own domain, which is not always the obvious one
     (Square lives at `squareup.com`, QuickBooks at `quickbooks.intuit.com`).
   - `-L` is required; the service 301-redirects.
   - Confirm with `file` that you got a real PNG/JPEG, not an error body.

4. **Eyeball the image** (Read the PNG) before accepting it. This step is
   the whole reason the skill exists; the service frequently returns the
   WRONG mark:
   - **Generic parent-company logo** instead of the product's (a Google
     "G" for Gmail/Sheets, Microsoft squares for Excel). Fixes that have
     worked: a more product-specific domain (`excel.cloud.microsoft`), the
     `domain_url=` variant with a full URL
     (`...favicons?domain_url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2F&sz=64`),
     or Google's product-logos CDN
     (`fonts.gstatic.com/s/i/productlogos/...`) for Google products.
   - **Rebranded marks**: `microsoft365.com` and `office.com` currently
     serve the Copilot swirl; the Microsoft 365 chip deliberately uses the
     classic four-square mark from `microsoft.com` because that is what
     customers recognize. Prefer the recognizable mark over the "current"
     one when a brand is mid-rebrand.
   - If no acceptable mark can be found, delete the PNG and ship the chip
     text-only; say so in the summary.

5. **Verify on the page**: load `/services/<service-slug>`, confirm the new
   chip shows the icon and label, and run `npm run build`.

## Constraints

- Favicons only, rendered at 18px; never inline full logos or wordmarks
  into chips, and never hotlink (always download into `public/images/tools/`).
- Voice guardrail from CLAUDE.md: the section frames these as tools
  commonly connected. Never write copy implying partnership, endorsement,
  or certification by the brand.
- New PNGs get committed with the frontmatter change (brand favicons are
  fine to commit; the never-commit rule covers AI-generated art only).
