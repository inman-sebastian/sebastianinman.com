# Client email templates

The standard replies, in the site voice. Rules: reply to every inquiry
within one business day (the site promises it), no jargon, no em
dashes, one clear next step per email. Fill `{{...}}`, personalize the
first line to what they actually wrote, and cut anything that doesn't
apply. Send from hello@sebastianinman.com.

**End on a sign-off, never on contact details.** Both paths already add
the signature from `docs/marketing/email-signature.html`: Mission
Control appends it to anything it sends, and Gmail appends it to
template 6, which gets copied into a Gmail compose. A template that
signs off with a phone number and a web address prints them twice.

## 1. New inquiry reply (contact form submission)

**Subject:** Re: your note about {{THEIR_TOPIC}}

Hi {{FIRST_NAME}},

Thanks for reaching out. {{ONE_SENTENCE_REACTION: respond to the
specific thing they described, in normal words. "Retyping orders into
QuickBooks every night is exactly the kind of thing that shouldn't be
a person's job."}}

The next step is a free conversation, about 30 minutes, where you tell
me how this actually works day to day and I tell you honestly whether
it's worth fixing and roughly what that costs. If it isn't worth
fixing, I'll say that too.

You can grab a time that suits you here: {{CAL_LINK}}
Or just reply with a couple of times that work and I'll make one fit.

Talk soon,
Sebastian

## 2. Post-consult, sending the proposal

**Subject:** Your proposal: {{PROJECT_SHORTNAME}}

Hi {{FIRST_NAME}},

Good talking with you {{WHEN}}. As promised, the proposal's attached:
one page, one flat number, and a plain list of what you get.

The short version: {{TWO_SENTENCE_SUMMARY: the problem and the fix,
their words.}} {{FLAT_PRICE}}, about {{TIMELINE}}.

Read it over, and if something's off or the number doesn't work, tell
me straight; there's usually a smaller version of the project worth
doing. If it looks right, reply "let's go" and I'll send over the
one-page agreement and the deposit invoice.

Sebastian

## 3. Go-ahead received: agreement + deposit

**Subject:** Next steps for {{PROJECT_SHORTNAME}}

Hi {{FIRST_NAME}},

Great. Two things to get us rolling, both attached (or linked):

1. The agreement: one page of ground rules in normal English. The
   short version: flat price, you own everything when we're done, and
   if something I built breaks in the first {{SUPPORT_WINDOW}}, I fix
   it free.
2. The deposit invoice for {{DEPOSIT_AMOUNT}}.

Once both are done I'll get started. First thing I'll need from you:
{{FIRST_ASK}}.

Sebastian

## 4. Project delivered

**Subject:** {{PROJECT_SHORTNAME}} is live

Hi {{FIRST_NAME}},

It's done and running. {{TWO_SENTENCES: what they can now see or stop
doing, concretely.}}

I'd like to walk you through it so you and your staff can run
everything without me: {{WALKTHROUGH_PROPOSAL: a time, or the Cal
link}}. The final invoice is attached; and remember, if anything
doesn't work the way we said it would in the next {{SUPPORT_WINDOW}},
that's on me to fix, free.

Sebastian

## 5. Review ask (send ~1 week after delivery, once per client, only
when the project genuinely went well)

**Subject:** One small favor

Hi {{FIRST_NAME}},

Hope {{THE_THING}} is still saving you time. If you've got two
minutes, a short Google review would genuinely help other local
business owners find me: {{REVIEW_LINK}}

A sentence about what changed for you is perfect. And if anything's
NOT working the way you expected, skip the review and reply to this
email instead; I'd rather fix it.

Thanks either way,
Sebastian

## 6. First contact (outreach, sent by hand)

**SEND THIS ONE FROM YOUR OWN INBOX, NOT THROUGH THE APP.** Resend's
acceptable use policy bans cold outreach, and that account also carries
the website's contact form and every client email; a complaint there
takes all of it down. Mission Control drafts this and blocks sending it.
One at a time, never in bulk, and only to a business you would genuinely
be glad to help. If they don't reply, that's the answer; no second email.

**There is deliberately no fixed prose in this one.** Every sentence is
written for the business it is going to. An earlier version carried two
standing paragraphs, a stock introduction and a stock sign-off, and they
did two kinds of damage: they read as a form letter sitting next to a
researched opening line, and the introduction described the wrong
problem about half the time. It talked about retyping information and
missed calls to a salon whose actual trouble was a booking button
pointing at the wrong page. If a sentence would be identical in every
email, it is either wrong for most of them or not worth sending.

**Subject:** {{SPECIFIC_THING}}

Hi{{FIRST_NAME_IF_KNOWN}},

{{OPENING_LINE: the true, specific thing noticed about THIS business,
taken from the research and already checked against their actual site.
"I went looking for your hours on my phone and ended up on a Facebook
page from 2023." If it could be said to any business in town it is not
specific enough, and the email should not go.}}

{{WHO_I_AM: one sentence, and only the part of what Sebastian does that
bears on what was just described. A salon with a broken booking link
does not need to hear about spreadsheets. Never a list of services and
never a pitch: this is the sentence that answers "who is writing to
me", nothing more. **Do not say where he is based.** They are in
Southern Oregon too, so "I'm Sebastian, based in Southern Oregon" tells
them nothing and announces that the sentence was written for everybody.
Being local shows in knowing something true about their business, which
the line above already did.}}

{{THE_OFFER: something small and concrete he would actually do, honest
that they may well not need it, ending in a way that makes ignoring
this email completely fine. One thought, not an offer with a disclaimer
bolted on the end. "Happy to tell you what I would change and roughly
what it would cost, whether or not you ever hire me, and if it is not
something you are thinking about just say so and I will leave you to
it."}}

Sebastian
