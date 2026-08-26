# Images needed

Running checklist of images the site expects. Until a file exists at its
path, the site shows a styled placeholder with the prompt text. To swap one
in: generate the image, save it to the path below (exact filename), refresh.
Check items off as they're done.

**Replacing an image that's already been viewed:** the dev server's build
cache (Turbopack) can keep serving old optimized copies of a same-named file
even after restarts and hard refreshes. If a replaced image won't update,
stop the dev server and run `npm run dev:fresh` (it clears `.next` before
starting). Then hard-refresh the browser (Cmd+Shift+R).

Style note for all illustrations: friendly modern flat illustration style,
earthy cream background (#faf6ef), deep pine green (#234f3e) and terracotta
(#c05f33) accents. Warm and approachable, for small-business owners rather
than a tech crowd.

**Aspect ratio: generate illustrations at 4:3**, with two exceptions: the
home hero splash is **16:9** (it renders as a full-width background), and
the headshot is a real portrait photo. Every other illustration slot is a
4:3 box. The site crops anything else to fit (`object-cover`), so off-ratio
uploads lose their edges.

## Photos

- [ ] `public/images/headshot.jpg` (~600×700, portrait): Sebastian's professional headshot. Already exists, just drop it in. Used on Home + About.

## Illustrations

- [ ] `public/images/home-hero.jpg` (**16:9**, e.g. 2560×1440): Full-width splash. A peaceful Southern Oregon valley at golden hour with pine-covered hills and soft mountain silhouettes. The LEFT HALF must be calm open sky and gentle fields with almost no detail (hero text sits there). On the RIGHT, one small business owner stands relaxed in front of a modest storefront, coffee in hand, while three or four paper envelopes drift gently upward on their own. One clear focal point, uncluttered, generous negative space. (Keep it simple: earlier busier versions with calendars and chat bubbles were overwhelming at display size.)
- [x] `public/images/services/website-design.jpg` (4:3, e.g. 1200×900): A small storefront business (like a local bakery or hardware store) with its website shown on a laptop beside it.
- [x] `public/images/services/workflow-automation.jpg` (4:3, e.g. 1200×900): A relaxed small business owner having coffee while paperwork flows neatly by itself between an inbox, a calendar, and a filing cabinet.
- [x] `public/images/services/tool-integration.jpg` (4:3, e.g. 1200×900): Everyday business tools (calculator/accounting book, calendar, envelope, cash register) connected by warm glowing lines into one tidy network.
- [ ] `public/images/services/ai-assistants.jpg` (4:3, e.g. 1200×900): A cozy small shop interior at night, closed sign on the door and moonlight in the window, with a laptop glowing softly on the counter showing a simple friendly chat conversation where a customer's question is getting a helpful reply. (No mascot characters or thought bubbles; earlier versions read strangely.)
- [x] `public/images/services/ai-insights.jpg` (4:3, e.g. 1200×900): A small business owner looking at a simple, friendly dashboard with a gently rising chart and plain sticky-note style callouts, warm morning light.
