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

**Aspect ratio: generate illustrations at 4:3**, with three exceptions: the
home hero splash and the CTA band treetops are **16:9** (they render as
full-width backgrounds), and the headshot is a real portrait photo. Every
other illustration slot is a 4:3 box. The site crops anything else to fit
(`object-cover`), so off-ratio uploads lose their edges.

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

- [ ] `public/images/home-hero.jpg` (**16:9**, e.g. 2560×1440)
  - **Prompt:** "Wide 16:9 flat illustration in deep pine greens: layered ridgelines of silhouetted pine forest rising from the bottom of the frame, each ridge a step darker toward the foreground, from #234f3e in the far ridges down to #132c1f in the nearest trees, with soft mist drifting between the layers. Above the ridges, a calm dusk sky in muted deep greens fading from #2a5a47 near the horizon upward into #18382c fills most of the frame with almost no detail. The composition is asymmetrical: the tallest trees and richest ridge detail gather along the right side, while the left and upper areas stay smooth and calm. A few tiny warm firefly glints in soft terracotta float near the right treeline. No people, no animals, no buildings, no signs, no words or lettering anywhere. Flat vector style, no texture."
  - **Notes:** v4 direction: dark pine forest matching the CTA band and
    footer greens, so pages bookend in the same palette. IMPORTANT: the
    hero currently styles its overlay and text for the light golden-valley
    image (v3, currently uploaded); when this dark version is dropped in,
    Claude must flip the hero overlay/text to a light-on-dark scheme, so
    upload and restyle together. Renders full-width behind the hero text
    on the homepage AND every /services/<slug> page (the prompt also lives
    in `content/site.ts` as `heroImage.prompt`; keep the two identical).
    The text overlays the calm upper-left, so that area must stay smooth.
    Do NOT phrase that as "left half empty" in prompts: explicit
    half-by-half instructions make generators draw a literal seam;
    describe one scene with asymmetric weight instead. Concept history:
    v1 had a signed storefront ("The Valley Post") that read like the
    business name; v2's floating envelopes felt postal; v3 golden valley
    was liked but is being replaced for palette cohesion. Check results
    for sneaky lettering before uploading.

- [x] `public/images/cta-treetops.jpg` (**16:9**, e.g. 2560×1440)
  - **Prompt:** "Wide 16:9 flat illustration used as a background: a solid deep pine green field (#234f3e) with a silhouetted skyline of pine treetops rising from the bottom edge in a slightly darker green (#18382c), and one or two subtle layered ridgelines behind them. The upper two thirds are completely plain solid deep pine green with no detail. Flat vector style, no texture, no text or lettering anywhere."
  - **Notes:** background of the "Not sure where to start?" CTA band that
    appears at the bottom of most pages. Bottom-anchored (`object-bottom`)
    and cropped to a short wide strip, so only the treetop skyline shows;
    the CTA text sits over the plain upper area. Keep the tones close to
    the band's pine green so the white text stays readable. Replaced an
    earlier attempt at programmatic SVG leaves that didn't read as leaves.

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
