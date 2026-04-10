# Opening Profile-Aware Entry Notes

## Purpose
This note captures a possible alternative to the current opening flow:
- skip the upfront contact form when LinkedIn sign-in can already provide the same identity details
- design the opening differently for signed-out and signed-in users
- identify the questions we still need to answer before turning this into a product or prototype decision

Related docs:
- [prototype-shell-ui.md](prototype-shell-ui.md)
- [phase-1-flow-notes.md](phase-1-flow-notes.md)
- [conversation-blueprint.md](conversation-blueprint.md)

## Plain-English framing
This is probably not best framed as:
- `remove the contact form`

It is better framed as:
- `make the opening profile-aware`

Why that framing helps:
- it focuses on user experience, not just form removal
- it makes signed-out and signed-in states feel intentional
- it leaves room for a lightweight confirmation step if some details are missing or need consent

## Why this is plausible in real life
Yes, this is a realistic pattern at LinkedIn and at other tech companies.

If a user is already authenticated and the product already has the basic profile data it needs, teams often remove or shrink the upfront form.

That said, the right decision depends on what the current contact form is actually doing.

If the form is only collecting identity details such as:
- name
- email
- company
- title

then skipping it for signed-in users is very reasonable.

If the form is also doing jobs like:
- explicit consent
- qualification
- CRM lead capture
- routing rules
- follow-up preferences

then those jobs still need to happen somewhere, even if they move later in the flow.

## Core idea
The first screen stays close to the current Welcome screen, but the action adapts to account state.

### Signed-out
Recommended opening:
- keep the Welcome screen
- primary CTA: `Sign in with LinkedIn`
- secondary path could be something like `Continue without signing in` only if anonymous exploration is allowed

Why:
- sign-in becomes the fastest path to a more personalized experience
- the screen still gives orientation and trust before redirecting the user

### Signed-in
Recommended opening:
- keep a lightweight Welcome screen instead of skipping it entirely
- personalize the message, for example:
  - `Welcome back, [First name]. We can use your LinkedIn profile to get you started.`
- primary CTA: `Continue`
- secondary CTA: `Review details`

Why:
- it preserves orientation
- it avoids the abrupt feeling of dropping the user straight into chat
- it still removes the friction of re-entering known information

## Options to discuss

### Option 1: Sign-in first
Flow:
- signed-out users see Welcome plus `Sign in with LinkedIn`
- signed-in users skip directly into the product

Why it helps:
- lowest friction
- fastest path for returning or already-authenticated users

Main tradeoff:
- can feel abrupt
- users may lose the orientation that the current Welcome screen provides

### Option 2: Profile-aware opening
Flow:
- everyone sees an opening screen
- signed-out users see `Sign in with LinkedIn`
- signed-in users see `Continue as [Name]` or `Continue`
- no full contact form for signed-in users

Why it helps:
- keeps the opening coherent
- reduces friction
- makes the system feel smarter without being surprising

Main tradeoff:
- adds one extra click for users who are already signed in

Recommendation:
- this is the strongest default option

### Option 3: First-time versus returning
Flow:
- first-time signed-in users see the lightweight opening
- returning signed-in users skip it
- signed-out users still start with sign-in

Why it helps:
- strongest long-term polish
- best balance of context and speed

Main tradeoff:
- requires more product logic
- adds more states to define, test, and explain in the prototype

## Recommended direction
The safest and most product-sound direction is:
- skip the contact form
- keep the opening
- make the opening profile-aware

In other words:
- signed-out users start with Welcome plus sign-in
- signed-in users see a personalized Welcome plus a quick `Continue`

This keeps the experience low-friction without making the entry feel abrupt.

## UX implications

### What improves
- less upfront friction for signed-in users
- less repeated data entry
- stronger sense that the product recognizes the user

### What needs careful design
- loading state:
  - the system needs a brief `checking your account` moment before it knows which opening to show
- empty state:
  - if important profile data is missing, ask only for the missing pieces instead of showing the full form
- error state:
  - sign-in failures should not strand the user without a clear next step
- mobile and responsive behavior:
  - sign-in redirects can feel more disruptive on mobile, so the return path needs to be very clear
- accessibility:
  - `Continue as [Name]` is usually clearer than a generic `Continue`
- trust and clarity:
  - if we use profile data automatically, the UI should make that visible in a calm, transparent way

## System implications

### What the system needs to know
- whether the user is signed out or authenticated
- which identity and profile fields are reliably available from sign-in
- whether any required fields are still missing

### What the system still may need to handle
- consent or permission to use profile data
- CRM or lead capture requirements
- routing logic that may currently depend on the form
- account switching or `Not you?` behavior

### Main architecture question
We need to confirm whether the current contact form is:
- only an identity collection step

or

- also doing business and system work behind the scenes

If it is only identity capture, removing it for signed-in users is straightforward.

If it also powers qualification, routing, or operational workflows, those jobs need a new home in the flow.

## Key edge cases to pressure-test
- user is signed in but important fields are missing
- user is signed in with the wrong account
- user does not want to connect LinkedIn yet
- user starts signed out on mobile and returns from sign-in mid-flow
- user is authenticated but we do not actually have permission to use the needed profile data
- internal stakeholders assume `sign-in` and `qualified lead` are the same thing when they are not

## Framing for PM discussion
Helpful framing:
- this is less about removing a screen
- it is more about making the opening smarter based on account state

Another useful way to say it:
- if the product already knows who the user is, asking them to type it again may feel unnecessary
- but if the form is doing additional product or business work, we should move that work thoughtfully rather than pretend it disappeared

## Open questions
These are the main questions to answer before committing to this direction:

1. Is the current contact form only collecting identity details, or is it also doing qualification, consent, CRM capture, or routing work?
2. For signed-in users, what exact fields can we reliably prefill from LinkedIn?
3. Are there any fields we still need to ask for, even when the user is signed in?
4. Is sign-in required for the experience, or just the preferred fast path?
5. Should signed-in users still see a lightweight Welcome screen, or should returning users skip it?
6. Do we need a `Not you?` or `Use another account` path on the signed-in opening?
7. If profile data is incomplete, what is the smallest possible fallback ask?
8. How should we measure success if the contact form goes away?

## Connection to prototype shell thinking
This idea fits the existing shell pattern in [prototype-shell-ui.md](prototype-shell-ui.md), which already separates:
- `authState`
- `entryVariant`

If we choose to prototype this, a useful new opening option could be something like:
- `profile-aware-opening`

That would let the prototype compare:
- signed-out plus sign-in CTA
- signed-in plus personalized continue CTA
- current confirm-details-first behavior
