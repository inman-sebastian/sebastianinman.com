# Images needed

Running checklist of images the site expects. Until a file exists at its
path, the site shows a styled placeholder with the prompt text. To swap one
in: generate the image, save it to the path below (exact filename), refresh.
Check items off as they're done.

Each entry has a **Prompt** (copy it verbatim into the generator; it matches
what the site's placeholder displays) and **Notes** (context and lessons for
humans and Claude only; never paste notes into the generator).

**Replacing an image that's already been viewed:** the dev server's build
cache (Turbopack) can keep serving old optimized copies of a same-named file
even after restarts and hard refreshes. If a replaced image won't update,
stop the dev server and run `npm run dev:fresh` (it clears `.next` before
starting). Then hard-refresh the browser (Cmd+Shift+R).

**Aspect ratio: generate illustrations at 4:3**, with two exceptions: the
home hero splash is **16:9** (it renders as a full-width background), and
the headshot is a real portrait photo. Every other illustration slot is a
4:3 box. The site crops anything else to fit (`object-cover`), so off-ratio
uploads lose their edges.

**Style baseline for all illustration prompts** (already baked into each
prompt below; keep it in any new ones): friendly modern flat illustration
style, earthy cream background (#faf6ef), deep pine green (#234f3e) and
terracotta (#c05f33) accents. Warm and approachable, for small-business
owners rather than a tech crowd.

## Photos

- [x] `public/images/headshot.jpg` (~600×700, portrait)
  - **Prompt:** none. Real photo of Sebastian; already exists, just drop it in.
  - **Notes:** used on Home + About.

## Illustrations

- [x] `public/images/home-hero.jpg` (**16:9**, e.g. 2560×1440)
  - **Prompt:** "Wide 16:9 splash illustration, warm friendly flat style: one continuous, peaceful Southern Oregon valley landscape at golden hour with an asymmetrical composition. A big calm cream sky and gently rolling golden fields fill most of the frame, and layered pine-covered hills with soft mountain silhouettes rise gradually along the right side, where a winding dirt road drifts into the distance and a few soft wildflowers sit in the lower corner. A low horizon and generous open sky keep the scene serene and uncluttered. No people, no animals, no buildings, no signs, no words or lettering anywhere. Earthy cream sky, deep pine green and terracotta accents."
  - **Notes:** renders full-width behind the hero text on the homepage AND
    every /services/<slug> page (the prompt also lives in `content/site.ts`
    as `heroImage.prompt`; keep the two identical). The text overlays the
    open-sky side, so that area must stay calm. Do NOT phrase that as "left
    half empty" in a prompt: explicit half-by-half instructions make
    generators draw a literal seam down the middle; describe one scene with
    asymmetric weight instead. Concept history: v1 had a signed storefront
    ("The Valley Post") that read like the business name; v2's floating
    envelopes felt postal and ungrounded; v3 is pure landscape, the headline
    carries the message. Check results for sneaky lettering before uploading.

- [x] `public/images/services/website-design.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Warm, inviting illustration of a small storefront business (like a local bakery or hardware store) with its website shown on a laptop beside it, matching earthy cream, pine green, and terracotta color palette, friendly modern flat illustration style"
  - **Notes:** done (Oak & Crumb Bakery version).

- [x] `public/images/services/workflow-automation.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Friendly flat illustration of a relaxed small business owner having coffee while paperwork flows neatly by itself between an inbox, a calendar, and a filing cabinet, earthy cream, pine green, and terracotta palette"
  - **Notes:** done.

- [x] `public/images/services/tool-integration.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Flat illustration of several everyday business tools (calculator/accounting book, calendar, envelope, storefront cash register) connected by warm glowing lines into one tidy network, earthy cream, pine green, and terracotta palette"
  - **Notes:** done.

- [x] `public/images/services/ai-assistants.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Warm flat illustration of a cozy small shop interior at night, closed sign on the door and moonlight in the window, with a laptop glowing softly on the counter showing a simple friendly chat conversation where a customer's question is getting a helpful reply, earthy cream, pine green, terracotta palette"
  - **Notes:** no mascot characters or thought bubbles; v1's chat-bubble
    character read strangely.

- [x] `public/images/services/ai-insights.jpg` (4:3, e.g. 1200×900)
  - **Prompt:** "Flat illustration of a small business owner looking at a simple, friendly dashboard with a gently rising chart and plain sticky-note style callouts, warm morning light, earthy cream, pine green, terracotta palette"
  - **Notes:** done.
