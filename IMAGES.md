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

## Photos

- [ ] `public/images/headshot.jpg` (~600×700, portrait): Sebastian's professional headshot. Already exists, just drop it in. Used on Home + About.

## Illustrations

- [ ] `public/images/home-hero.jpg` (~1080×900; landscape-ish crops best in the hero slot): Small business owner standing relaxed in front of their shop at golden hour while helpful automated elements (envelopes sending themselves, a calendar checking itself off, a chat bubble greeting a customer) float gently around the storefront. Southern Oregon mountains in the distance.
- [ ] `public/images/services/website-design.jpg` (~900×650): A small storefront business (like a local bakery or hardware store) with its website shown on a laptop beside it.
- [ ] `public/images/services/workflow-automation.jpg` (~900×650): A relaxed small business owner having coffee while paperwork flows neatly by itself between an inbox, a calendar, and a filing cabinet.
- [ ] `public/images/services/tool-integration.jpg` (~900×650): Everyday business tools (calculator/accounting book, calendar, envelope, cash register) connected by warm glowing lines into one tidy network.
- [ ] `public/images/services/ai-assistants.jpg` (~900×650): A cozy small shop interior at night, closed sign on the door and moonlight in the window, with a laptop glowing softly on the counter showing a simple friendly chat conversation where a customer's question is getting a helpful reply. (No mascot characters or thought bubbles; earlier versions read strangely.)
- [ ] `public/images/services/ai-insights.jpg` (~900×650): A small business owner looking at a simple, friendly dashboard with a gently rising chart and plain sticky-note style callouts, warm morning light.
