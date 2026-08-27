---
name: write-blog-post
description: Write and publish a complete blog post for sebastianinman.com, including its illustration. Use when Sebastian asks for a new blog post/article (with or without a topic). Covers topic choice, the MDX post file, the image prompt, generating the art via the generate-image skill, verification, and commit.
---

# Write a blog post (end to end)

Produces a finished post: MDX file, IMAGES.md entry, generated
illustration, verified page, commit. The editorial rules live in
CLAUDE.md ("Write a blog post" recipe) and the voice guide; this skill
is the workflow that applies them.

## Steps

1. **Pick the topic** (if Sebastian didn't give one). Good topics teach
   one applicable thing: a test the reader can run, a mistake to avoid,
   a decision framed honestly. Check existing posts in `content/blog/`
   to avoid overlap, and prefer topics that deepen a service page's
   subject over generic AI-industry commentary.

2. **Research before writing** (surface-level is fine; skipping it is
   not). A few web searches, three goals:
   - **Ground the angle in reality**: what small-business owners
     actually ask or struggle with on this topic, so the post answers a
     real question instead of an imagined one.
   - **Validate every checkable fact** the draft will state: a tool's
     capability or pricing, a deadline, a regulation, a local event or
     date. Primary sources first (the vendor's own site, the official
     org), reputable secondary sources otherwise. A claim that can't be
     traced to one gets cut or reworded as opinion/experience; the
     no-invented-stats rule is the backstop, not the substitute, for
     this step.
   - **Pick up real local color** where relevant (festival dates,
     seasonal rushes): verified only, never plausible-sounding.
   Then REWRITE, don't paraphrase: the research informs what the post
   says, but every sentence is original and in the site's voice. No
   quoting or close-tracking of any source's structure or phrasing, no
   "according to" content-farm scaffolding, and no external links in
   the body (the one-soft-link rule stays internal). If research
   contradicts the planned thesis, change the thesis; honesty is the
   brand.

3. **Write `content/blog/<url-slug>.mdx`** per the CLAUDE.md recipe:
   frontmatter (`title` as a natural sentence, `description` 1-2
   sentences, `date` today in ISO, `image`/`imagePrompt`/`imageAlt`/
   `imageCaption` for `/images/blog/<slug>.jpg`), body ~400-700 words
   using the MDX kit (CheckList/Callout earn their keep; don't force
   all of them). One soft link max, woven into the close. Voice guide
   applies in full (no em dashes, you-to-I ratio, no hype, no
   condescension).

4. **Write the image prompt** in the series style (IMAGES.md header has
   the baseline) depicting the post's core idea as a warm scene, with
   the "No text or lettering anywhere" guard. Add the IMAGES.md entry
   (Blog post illustrations section) with matching verbatim prompt and
   a Notes line tying scene to thesis.

5. **Generate the illustration**: invoke the `generate-image` skill and
   follow it exactly (its hard rules included: no credentials, stop at
   challenges, mandatory eyeball check). Blog art is generated in the
   dedicated **Blog Posts** Flow collection; open its URL directly
   (listed in the generate-image skill's Session facts) instead of the
   root project. If generation is blocked (auth
   expired, Flow down), ship the post with its placeholder and tell
   Sebastian; a post may launch imageless, but never with an unchecked
   image.

6. **Verify**: the post renders at `/blog/<slug>` (hero, art, prose,
   components), appears on the /blog index and in `/feed.xml`, and
   `npm run build` is clean.

7. **Commit** post + IMAGES.md + image together, and summarize for
   Sebastian: topic, the takeaway a reader leaves with, what the
   research validated (with sources), and the image.
