# Instagram App Review kit (Mission Control)

Everything needed to submit `instagram_business_basic` and
`instagram_business_manage_messages` for review so the app can read DMs from
real customers (not just Instagram Testers). This covers the one-time infra,
the screencasts Meta requires, and the reviewer instructions to paste into
the submission.

Mission Control is local-only, so review is done over a temporary HTTPS
tunnel. Everyday use does not need the tunnel; the paste-a-token connect
works without it. The tunnel and OAuth flow exist so a reviewer can see the
standard "connect your Instagram professional account" flow and the app
displaying the account's profile.

## 1. One-time setup: the self-owned OAuth callback

Meta rejects a `http://127.0.0.1` redirect and Vercel cannot tunnel to the
local app, so the OAuth redirect points at an endpoint on the site we own:
`https://www.sebastianinman.com/api/instagram-callback`. It catches
Instagram's one-time code and shows it; you paste it into Mission Control,
which finishes the token exchange locally. No tunnel, no third party, and
the app secret and token never leave the machine.

1. Ship the callback route (`app/api/instagram-callback/route.ts` in the
   website repo) to production. It is inert and unlisted.
2. In the Meta App Dashboard, **Instagram → API setup with Instagram login →
   Business login settings**, set the **Valid OAuth Redirect URI** to
   exactly `https://www.sebastianinman.com/api/instagram-callback` (www, not
   apex; exact match, no trailing slash drift).
3. In the repo-root `.env.local`, set:
   - `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET` (from the same Instagram
     login setup screen), and
   - `INSTAGRAM_REDIRECT_URI` = the identical
     `https://www.sebastianinman.com/api/instagram-callback`.
4. Restart Mission Control. The `/inbox` Instagram panel now shows a
   **Connect Instagram** link and a paste-the-code box.

Connect flow: click **Connect Instagram** (opens Instagram in a new tab) →
approve → the sebastianinman.com page shows a code → copy it → paste into
the box in Mission Control → connected.

Business Verification: messaging permissions for the general public also
require the business to be verified (Meta Business settings → Security
Center / Business verification). Submit that in parallel; it can take a
few days.

## 2. Screencasts

Record with the app opened through the tunnel URL, signed into the Meta
account that owns the app. Do not show any Instagram account password.

### For `instagram_business_basic` (dependent permission)

1. Show the app at `/inbox` with Instagram not connected.
2. Click **Connect Instagram**. Show Instagram's consent screen listing the
   requested permissions.
3. Approve. Show the sebastianinman.com callback page with the code, copy
   it, return to Mission Control, and paste it into the code box.
4. Show the **profile card** that now appears in the Instagram panel: the
   profile picture, `@username`, name, account type, and follower/post
   counts. Linger on it so the reviewer sees the profile info is displayed.

### For `instagram_business_manage_messages`

1. Starting from the connected state above, show the **Check now** button.
2. Have a test Instagram account (added as a Tester, invite accepted) send a
   DM to the business account beforehand.
3. Press **Check now** and show the DM appearing in the inbox, then opening
   in the client's Conversations view. This demonstrates reading messages.
4. State in the description that sending is reply-only within Meta's window
   and the app never sends unsolicited messages.

## 3. Reviewer description (paste into the submission)

> Mission Control is a private, single-operator business tool for Sebastian
> Inman (sebastianinman.com). It connects one Instagram professional account
> and displays that account's profile, then reads the account's direct
> messages so the operator can track client conversations in one place
> alongside email.
>
> To test: open the provided app URL, go to the Inbox screen, and click
> "Connect Instagram." This runs Business Login for Instagram and requests
> `instagram_business_basic` (as a dependent permission of
> `instagram_business_manage_messages`) and
> `instagram_business_manage_messages`. After authorizing, the Inbox screen
> displays the connected account's profile information (profile picture,
> username, name, account type, follower and media counts) in the Instagram
> panel. Pressing "Check now" reads recent direct-message conversations and
> lists them, matched to the operator's client records.
>
> `instagram_business_basic` is requested only as the dependent permission
> required by `instagram_business_manage_messages`; it is used to identify
> and display the connected professional account.
>
> The app only reads messages and replies within Meta's standard messaging
> window. It never sends unsolicited or bulk messages.
>
> App credentials for connecting are provided above. No Instagram account
> credentials are included, per the instructions.

Provide the app (tunnel) URL and the App ID in the credentials section. Do
not paste any Instagram account password.

## 4. Gotchas

- The Connect link only appears when `INSTAGRAM_APP_ID/SECRET/REDIRECT_URI`
  are all set; otherwise the panel falls back to paste-a-token.
- The redirect URI must match exactly in two places: the Meta dashboard and
  `INSTAGRAM_REDIRECT_URI`. Use the canonical `www` host; a mismatch fails
  with `invalid redirect_uri`.
- The callback page reflects only the one-time `code` (escaped); it holds no
  secret and stores nothing. The token exchange happens locally in Mission
  Control, so the app secret and access token never touch the website.
- Development Mode already works fully for the operator's own account and any
  Tester; App Review only unlocks non-tester (real customer) DMs.
