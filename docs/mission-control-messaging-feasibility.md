# Phase D feasibility: Instagram & Facebook messaging in Mission Control

Focused feasibility plan for bringing Instagram and Facebook direct
messages into Mission Control's communication hub, the way Gmail came in
(Phases B and C). Written against Meta's platform rules as verified from
`developers.facebook.com` in early 2026; those rules change, so re-check
the sourced links before building.

## Why this is worth doing now

Two things changed the picture since the earlier "hard, gated on infra"
note:

1. **Mission Control is open most of the workday**, and the goal is for it
   to replace most non-development tools. That makes it a primary comms
   surface, and it makes a *polling* design (pull when open, on an
   interval) a natural fit rather than a compromise.
2. **Instagram and Facebook DMs can be READ by polling the Graph API**, on
   demand, with no webhook and no public URL. That is the blocker that
   made this look infeasible for a local-only app, and it turns out not to
   apply to reading.

So the shape that fits Mission Control is the same one Gmail uses: pull on
open and on an interval, file against the client, reply from the composer.

## The headline findings

- **Reading works without a public endpoint.** IG (via the "Instagram API
  with Instagram Login" path) and FB Page Messenger both expose
  conversations and messages over the Graph API, read on demand with just
  an access token. No webhook subscription required to read.
  <br>Source: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/conversations-api/ , https://developers.facebook.com/docs/graph-api/reference/page/conversations/
- **Sending is reply-only, inside a window.** You may only message a person
  who messaged you first, within a 24-hour window (each new inbound resets
  it); the `HUMAN_AGENT` tag extends that to 7 days for human-written
  replies. Cold/unsolicited DMs over the API are prohibited. This is the
  same posture as the app's existing outreach rule, so **first-contact IG
  DMs stay the Phase A copy-and-send-by-hand flow**; the API is for warm,
  ongoing threads.
  <br>Source: https://developers.facebook.com/documentation/business-messaging/messenger-platform/policy
- **You can build and test the whole thing with no App Review.** In an
  app's Development Mode, every messaging permission works against accounts
  that hold a role on the app (you, plus a second account added as a
  Tester). App Review + Business Verification is required only to message
  the *general public*, i.e. real customers with no role on your app.
  <br>Source: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/
- **Webhooks (real-time push) still need a public HTTPS URL**, and there is
  no Meta-hosted pull-queue alternative. For a local-only machine that
  means a tunnel (Cloudflare Tunnel, ngrok). But polling makes this
  optional, not a prerequisite.
  <br>Source: https://developers.facebook.com/docs/messenger-platform/webhooks

## What Meta requires (the real constraints)

| Concern | Instagram | Facebook Page Messenger |
|---|---|---|
| Account | Professional (Business or Creator); personal accounts cannot use the API | A Facebook Page |
| Facebook Page needed? | **No**, on the "Instagram API with Instagram Login" path (Page-free) | n/a |
| Scopes | `instagram_business_basic` + `instagram_business_manage_messages` (renamed from `business_*` on 2025-01-27; use the new names) | `pages_messaging` (+ `pages_read_engagement`, `pages_manage_metadata`) |
| Read by polling | `GET /me/conversations`, then the conversation's `messages`, then a message by id | `GET /{page-id}/conversations?platform=messenger` (or `instagram`), then `/messages` |
| Token | Instagram User access token | Page access token |

- **Use a Business Manager System User token.** It does not expire and is
  not tied to a person's login, which is what an always-open unattended
  tool needs. Long-lived Page/User tokens report "never expires" but still
  silently die on password change, permission change, or the ~90-day
  `data_access_expires_at` inactivity clock. Plan a connection-health check
  regardless.
  <br>Source: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/
- **No delta feed when polling.** There is no "messages since X"; you list
  conversations and diff on `updated_time` / `message_count` yourself.
  Fine for a single operator polling a handful of threads every 30 to 60
  seconds; that is comfortably inside rate limits.
- **Gotchas:** messages read via API are not marked "Read" until you reply;
  IG message requests older than 30 days drop out of API results; IG has
  no group threads; three legacy message tags start erroring 2026-04-27
  (irrelevant if we stay reply-only); pin a current Graph API version in
  URLs.

## How it fits Mission Control (architecture)

This mirrors the Gmail phases almost exactly, and reuses most of what is
already built.

- **Per-channel connector modules**, one off-machine reach each, same shape
  as `lib/gmail.ts`: `lib/instagram.ts` (then `lib/facebook.ts`), exposing
  `authUrl`/`exchangeCode`/`isConnected`, `fetchNew()` (poll + normalize to
  the existing message shape), and `sendReply()`. Tokens and sync cursors
  in git-ignored `data/instagram/` etc., secrets read via `lib/env.ts`
  like the rest.
- **Reuse the message store.** `lib/messages.ts` already stores per-client
  messages, dedupes by id, matches by counterparty, logs the timeline, and
  drives `/inbox` and the per-client Conversations panel. Widen
  `StoredMessage.channel` from `"gmail"` to `"gmail" | "instagram" |
  "facebook"`; almost everything else is channel-agnostic already.
- **Matching inbound to a client by handle.** We backfilled every record's
  `socials`, and `lib/socials.ts` already maps a URL to a network and
  handle. Match an inbound IG/FB sender to the record whose `socials`
  carry that handle; unknown senders fall into the same "to sort" queue as
  unmatched Gmail.
- **Polling triggers, reusing the Gmail pattern.** The on-open
  `MailAutoCheck` and the "Check mail" button already exist; add these
  channels to the same check. Because you are always open, a gentle
  background interval (say 60s) is now reasonable and policy-safe, with the
  existing `notify()` surfacing a new DM the way it does research runs.
- **Replies through the composer, window-gated.** Extend the composer's
  reply mode to an IG/FB channel. Sending goes through the connector's
  `sendReply()`, **not** Resend. Add a messaging-window check to the
  send-guard (like `sendBlockReason`): if the 24h/7d window is closed, the
  app blocks the send with a clear reason and offers the copy-and-send-by-
  hand fallback, so it can never attempt a non-compliant send.

Net new code is roughly one connector per platform plus the channel-union
widening and a window guard. The store, matching, inbox UI, per-client
thread view, and composer reply flow are already in place.

## Recommended phasing

- **D1 - Instagram read (poll). DONE.** IG-Login (Page-free) path, a pasted
  dashboard-generated long-lived token that the app auto-refreshes,
  Development Mode against your own account. No webhook, no App Review.
  Built in `lib/instagram.ts`, reusing the shared message store; matches
  clients by their Instagram handle in `socials`.
- **D2 - Instagram reply.** Reply-only within the window, with a visible
  window state and the block-or-copy fallback when it is closed. Reuses the
  composer reply flow from Phase C.
- **D3 - Facebook Page Messenger.** Same connector shape, read then reply.
- **D4 (optional) - real-time push.** Only if on-open + interval polling
  ever feels too slow. The only official route is a public HTTPS webhook,
  which for this machine means a tunnel; given always-open polling, likely
  unnecessary.
- **Go-live for real customers.** App Review + Business Verification, done
  only when an actual client uses IG/FB to talk to you. Everything above is
  buildable and usable against your own/test accounts before this.

## The public-endpoint question, resolved

Because you poll and you are open through the workday, the core hub needs
**no public endpoint and no tunnel**. Webhooks become optional polish for
instant delivery, not a gate. That is the single biggest change from the
earlier assessment.

## Effort and risk

- **Effort:** per platform, comparable to a Gmail phase, plus a fiddlier
  one-time Meta setup (Business Portfolio, an app, a System User token, the
  IG-Login product configured). Google's OAuth was gentler; Meta's console
  is the harder part, not the code.
- **Risks:** token silent-death (mitigate with a System User token and a
  connection-health line in `/inbox`); Meta API churn (pin the Graph
  version, watch scope renames); the policy line (stay reply-only; cold
  stays on the copy-paste path). None of these block a build.
- **Because this becomes a primary inbox:** missed-message risk matters
  more than it did for a secondary tool. Add a connection-health indicator
  and lean on the existing `notify()` so a new DM is as visible as a new
  email.

## Decisions to confirm before building D

1. Is the business Instagram already a **Professional** account? (Required;
   free to switch in the IG app.)
2. Willing to create a **Meta app + Business Portfolio + System User
   token** once? (The main setup cost.)
3. **Instagram-only to start, or Facebook Page too?** IG-only is simpler
   and Page-free; Facebook can follow as D3.
4. **Closed-window reply UX:** hard-block the send with a reason (policy
   safe) and offer the copy-and-send fallback, versus something else.
   Recommended: block plus copy.
5. **Polling cadence** while open (recommended: on-open check plus a ~60s
   interval).

## Recommendation

Feasible, and well aligned with the always-open, replace-my-tools goal.
The earlier blocker (needing a public endpoint) does not apply to reading,
and reading is most of the value. Start with **D1 (Instagram read by
polling)**: pure upside, no webhook, no App Review, and it reuses the hub
that already exists. Add reply (D2), then Facebook (D3). Treat webhooks/
tunnel and App Review as later, conditional steps rather than
prerequisites.

## Sources

- Instagram API with Instagram Login (overview, messaging, conversations):
  https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/ ,
  https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/ ,
  https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/conversations-api/
- Page conversations / Messenger conversations:
  https://developers.facebook.com/docs/graph-api/reference/page/conversations/ ,
  https://developers.facebook.com/docs/messenger-platform/conversations/
- Webhooks: https://developers.facebook.com/docs/messenger-platform/webhooks
- Messaging policy / window: https://developers.facebook.com/documentation/business-messaging/messenger-platform/policy
- Access tokens: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/
- Development vs Live Mode / App Review: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/
