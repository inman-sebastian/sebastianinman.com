# Invoice template

Fill every `{{...}}`. Numbering: `INV-{{YEAR}}-{{NNN}}`, sequential
across the year (check existing drafts and Sebastian's records for the
last number; when in doubt, ask him). Two standard invoices per
project: the deposit invoice (due on receipt, sent with the signed
agreement) and the final invoice (due within 14 days of delivery, sent
with the walkthrough email). Amounts must match the proposal exactly;
double-check that line items sum to the total. No signatures
frontmatter on invoices.

---

# Invoice INV-{{YEAR}}-{{NNN}}

**Billed to** {{CLIENT_NAME}}, {{CLIENT_BUSINESS}}\
**Project** {{PROJECT_SHORTNAME}}\
**Date** {{DATE}}\
**Due** {{DUE: "On receipt" for deposits, "Within 14 days" for finals}}

| Description | Amount |
| --- | ---: |
| {{LINE_ITEM: e.g. "Order automation: deposit (half of $750 flat quote)"}} | ${{AMOUNT}} |
| **Total due** | **${{TOTAL}}** |

## How to pay

{{PAYMENT_INSTRUCTIONS: keep current with however Sebastian actually
accepts payment (bank transfer details, card link, or check). Ask him
if unset; never invent payment details.}}

Questions about this invoice? Call or text {{PHONE}}, or just reply to
the email it came with.

Thanks for the work; I appreciate it.
