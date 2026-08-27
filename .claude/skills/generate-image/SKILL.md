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

- **Auth does NOT survive browser restarts** (verified Aug 2026): Google
  invalidates the device session when the automation browser closes, and
  `--restore`/`--profile` cannot bring it back (the restored account
  chooser shows "Signed out"). Practical model: each WORK SESSION starts
  with Sebastian signing in once in a `--headed` window; after that,
  generate as many images as the session needs before closing. Batch
  image work accordingly (all of a post's/page's images in one session).
- Sign-in account: hello@sebastiancodes.com. A "Sign in with Google"
  button or account chooser may appear mid-session; clicking through a
  LIVE account is fine, but an account marked "Signed out", an email or
  password field, or any challenge means STOP and hand it to Sebastian.
- Flow is organized to mirror the site's structure: one root project
  with dedicated collections per content area. Open the MOST SPECIFIC
  collection for the image being generated (generating inside it keeps
  the style influence and saves clicking through):
  - Root project ("Small Business Automation Illustrations"; use for
    anything without a dedicated collection):
    `https://labs.google/fx/tools/flow/project/6e0d7078-a2db-40dc-99e7-31537267854e`
  - **Blog Posts** collection (all `public/images/blog/` art):
    `https://labs.google/fx/tools/flow/project/6e0d7078-a2db-40dc-99e7-31537267854e/collection/7533d242-7c52-45a2-9c79-471027dcdb3e`
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
   add the entry to IMAGES.md in the same change.

2. **Open the target collection headed and get Sebastian signed in**
   (URL per Session facts; Blog Posts collection shown here):

   ```bash
   agent-browser --session flow --headed open \
     "https://labs.google/fx/tools/flow/project/6e0d7078-a2db-40dc-99e7-31537267854e/collection/7533d242-7c52-45a2-9c79-471027dcdb3e"
   ```

   Snapshot (`agent-browser --session flow snapshot -i -c`). If the
   collection loaded (media grid + "What do you want to create?"
   textbox), proceed. If it's a sign-in page: ask Sebastian to sign in
   using the headed window on his desktop, and wait for his go-ahead
   (per the hard rules, this step is always his). Keep the browser open
   for ALL of the session's generations; auth dies with the browser.

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
   (screens, signs, notebooks are text magnets), prompt intent realized.
   Fail -> back to step 4 (a fresh generation; optionally reworded
   prompt, updating IMAGES.md to match). Two failures -> show Sebastian
   both candidates and ask.

9. **Finish**: check off the IMAGES.md entry, `agent-browser --session
   flow close`, restart the dev server fresh if it was running
   (`npm run dev:fresh` — new files are safe, but replaced ones hit the
   Turbopack stale-image cache), verify the page renders the art, build,
   commit (the never-commit-AI-images rule is satisfied by the eyeball
   check having passed).
