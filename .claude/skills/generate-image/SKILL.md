---
name: generate-image
description: Generate a site illustration in Google Flow (Nano Banana 2) via agent-browser, using Sebastian's authenticated collection so the art style stays consistent. Use when a SiteImage placeholder needs real art (new blog post, landing page, service, FAQ-style page) and the prompt already exists in IMAGES.md or frontmatter. Covers generation, candidate selection, download, optimization, and the mandatory eyeball check.
---

# Generate a site illustration via Google Flow

Drives Sebastian's own Google Flow account (browser automation on his
machine, `agent-browser` CLI) to generate images inside the site's
collection, which style-matches new art to the existing series. Proven
end to end Aug 2026.

## Hard rules (non-negotiable)

- **Never enter Google credentials.** If Flow is signed out, or shows a
  sign-in page, captcha, or any verification challenge: STOP, close
  nothing, and ask Sebastian to complete it in the (headed) window.
- **Human-paced, low volume.** One generation at a time, no batch loops.
  This is a consumer UI, not an API.
- **The eyeball check is mandatory** before an image ships (step 8).
  Automation must never skip the quality gate.
- Always `agent-browser --session flow close` when finished.

## Session facts

- **Auth persists in the profile directory** (verified Aug 2026):
  ALWAYS pass `--profile ~/.agent-browser-profiles/flow` together with
  `--session flow`. That path is a full Chrome user-data dir holding the
  Google login (including the device-bound session keys); sign-in
  survives complete browser restarts, and even the 4:3 aspect setting
  sticks. Do NOT use `--restore` alone or a bare profile NAME; state
  files carry only cookies/localStorage, which Google rejects after a
  restart (learned the hard way).
- Sign-in account: hello@sebastiancodes.com. If the profile's session
  has expired (Google will do this eventually) and a sign-in page,
  account chooser showing "Signed out", email/password field, or any
  challenge appears: STOP, reopen `--headed`, and hand it to Sebastian.
  One headed sign-in re-arms the profile for the long term.
- Flow is organized to mirror the site's structure: one root project
  with dedicated collections per content area. Open the MOST SPECIFIC
  collection for the image being generated (generating inside it keeps
  the style influence and saves clicking through):
  - Root project ("Small Business Automation Illustrations"; use for
    anything without a dedicated collection):
    `https://labs.google/fx/tools/flow/project/6e0d7078-a2db-40dc-99e7-31537267854e`
  - **Blog Posts** collection (all `public/images/blog/` art):
    `https://labs.google/fx/tools/flow/project/6e0d7078-a2db-40dc-99e7-31537267854e/collection/7533d242-7c52-45a2-9c79-471027dcdb3e`
  - **Services** collection (all `public/images/services/` art):
    `https://labs.google/fx/tools/flow/project/6e0d7078-a2db-40dc-99e7-31537267854e/collection/b32a0786-84e8-4fa5-9e2c-e20b6de42362`
  - Callers (e.g. the write-blog-post skill) may pass a collection URL;
    if Sebastian adds new collections, list them here.
- Model: **Nano Banana 2**, aspect **4:3** (`crop_landscape`), outputs
  **x2** (two candidates to choose from). The aspect RESETS to 16:9
  every new session; always check it (step 3). Downloads at **2K
  Upscaled** come out 2400x1792, matching every existing source image.

## Steps

1. **Get the prompt** from IMAGES.md / the page's frontmatter. Use it
   VERBATIM (prompts are written to generator-safe rules; see IMAGES.md
   header). If writing a new prompt first, follow the style baseline and
   add the entry to IMAGES.md in the same change. Any person in a new
   prompt must be cast explicitly (gender, age, skin tone/ethnicity)
   per the IMAGES.md casting rule; unspecified characters come out as
   young white women and skew the series.

2. **Open the target collection** (URL per Session facts; Blog Posts
   collection shown here). The persistent profile normally lands you in
   already signed in, headless:

   ```bash
   agent-browser --profile ~/.agent-browser-profiles/flow --session flow open \
     "https://labs.google/fx/tools/flow/project/6e0d7078-a2db-40dc-99e7-31537267854e/collection/7533d242-7c52-45a2-9c79-471027dcdb3e"
   ```

   Snapshot (`agent-browser --session flow snapshot -i -c`). If the
   collection loaded (title textbox + "What do you want to create?"
   box), proceed. If it's a sign-in surface instead, follow the expired-
   session procedure in Session facts (headed + Sebastian).

3. **Check the model button** (reads like "🍌 Nano Banana 2
   crop_landscape x2"). If aspect isn't `crop_landscape`, click the
   button, click the "4:3" tab in the panel, and confirm.

4. **Fill and submit**: click the create textbox, then use
   `agent-browser --session flow keyboard type "<prompt>"` (real
   keystrokes; programmatic `fill` sometimes fails to enable the Create
   button). Re-snapshot and confirm "arrow_forward Create" is no longer
   `[disabled]`, then click it. Remember refs go stale after the
   settings panel interaction; re-snapshot before clicking.

5. **Wait ~45s total** (renders show a % overlay; screenshot to check
   progress rather than polling snapshots).

6. **Pick the better candidate**: screenshot the grid, Read it, and judge
   both against the prompt and the series (palette, warmth, composition).
   Open the winner's detail view (click its "Generated image" button).

7. **Download at 2K**: click the "download Download" button, then use the
   `download` command on the "2K Upscaled" menu item with an ABSOLUTE
   path (relative paths resolve against agent-browser's own cwd, not the
   repo):

   ```bash
   agent-browser --session flow download @<ref> \
     /Users/sebastian/Projects/sebastianinman.com/public/images/<dest>.jpg
   ```

8. **Optimize + eyeball**: run `npm run optimize:images`, then Read the
   final file and check: series style match, no sneaky lettering
   (screens, signs, notebooks are text magnets), prompt intent realized,
   and the characters match what the prompt cast (the generator
   sometimes reverts to its young-white-woman default; a mismatch is a
   fail even when the image is otherwise good).
   Fail -> back to step 4 (a fresh generation; optionally reworded
   prompt, updating IMAGES.md to match). Two failures -> show Sebastian
   both candidates and ask.

9. **Finish**: check off the IMAGES.md entry, `agent-browser --session
   flow close`, verify the page renders the art (dev serves images
   unoptimized straight from public/, so a plain refresh shows new and
   replaced files alike; no restart needed), build, commit (the
   never-commit-AI-images rule is satisfied by the eyeball check having
   passed).
