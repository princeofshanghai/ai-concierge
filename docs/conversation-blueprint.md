# Conversation Blueprint

## Purpose
This document turns the strategy into a concrete MVP conversation flow.

Use it to answer:
- what the assistant should do in the first few turns
- why each message exists
- how the visible conversation connects to hidden lead routing
- when the flow should stay in guide mode vs move toward a representative

Related docs:
- [conversation-strategy.md](conversation-strategy.md)
- [project-overview.md](project-overview.md)
- [phase-1-flow-notes.md](phase-1-flow-notes.md)
- [persona.md](persona.md)

## Context
This assistant lives on the real Hire landing page:
- [business.linkedin.com/hire](https://business.linkedin.com/hire)

Because `/hire` covers multiple hiring products, the assistant should not open as a Recruiter-only guide. It should:
- start as a guide to LinkedIn hiring solutions
- diagnose the user's hiring situation
- become more specific only after some context exists

## Core flow philosophy
The intended shape is:
1. Generic at entry.
2. Diagnostic in the middle.
3. Specific by later turns.

That means the assistant should:
- start with the user's situation, not a product pitch
- add one meaningful middle diagnostic step before narrowing
- introduce Recruiter only after enough context exists
- recommend the next best step only after the guidance feels earned

## Primary persona
The default walkthrough persona is Jamie Chen from [persona.md](persona.md):
- Director of Talent Acquisition
- Northstar Health
- hiring across multiple functions
- dealing with some harder-to-fill roles
- high intent, but not immediately ready for a handoff

## Phase 1 goal
Phase 1 is not trying to show the full routing system yet.

Its job is to prove that the assistant can:
- orient the user
- understand their starting situation
- diagnose hiring motion and fit
- make a useful recommendation
- offer a believable next step

## Outcome model
The assistant should feel like one guided conversation, not five unrelated branches.

The visible experience stays consistent:
1. guide the user
2. diagnose the hiring situation
3. recommend the next best step
4. open the right next-step surface

The hidden routing layer chooses one of five business outcomes:
1. `AE booking`
2. `SDR live handoff`
3. `SDR booking`
4. `Lower-touch / direct purchase`
5. `Redirect / no-sales`

Important distinctions:
- these are routing outcomes, not opening choices
- callback / phone is a delivery mode inside human-routed outcomes, not a separate business outcome
- the user should feel guided, not sorted

## Opening prompt philosophy
The opening prompts should capture the user's starting situation.

They should not:
- mix questions and statements
- feel like routing choices
- jump too early to channel selection

Recommended opening suggestions:
- `We're not sure which hiring solution fits`
- `We need help with harder-to-fill roles`
- `We'd like pricing guidance`

Why these work:
- they sound like real things a buyer might say
- they help the assistant diagnose before recommending
- they keep the backend routing logic hidden
- they leave some openness instead of feeling like a full menu

## Recommended Phase 1 structure
The visible flow should follow this shape:
1. broad opening
2. starting situation
3. hiring motion diagnosis
4. specific fit diagnosis
5. urgency / priority
6. reflected recommendation
7. next-step choice

This gives the conversation more room without making it feel like a form.

## Shared transition pattern
All outcomes should use the same high-level transition:
1. the assistant recommends a next step in chat
2. the user chooses whether to continue toward that step
3. the right-side next-step surface opens
4. the user can complete the action or go back to chat

Why this matters:
- it keeps the chat guide-first
- it makes handoffs feel earned instead of abrupt
- it allows different business outcomes to share one consistent shell

## Phase 1: Message by message

### Step 1: Opening
Example, manual entry:

> Hi Jamie, thanks for sharing your details. I can help you figure out which hiring solutions could make sense for Northstar Health, answer questions about how they fit different hiring needs, and connect you with a representative if that becomes useful.
>
> Here are a few ways to get started:

Example, prefill:

> Hi Jamie, I can help you figure out which hiring solutions could make sense for Northstar Health, answer questions about how they fit different hiring needs, and connect you with a representative if that becomes useful.
>
> Here are a few ways to get started:

Visible purpose:
- orient the user
- show the onboarding mattered
- reduce blank-chat anxiety

Hidden signal:
- confirmed persona and company context

### Step 2: Starting situation
User chooses one of the opening prompts.

Visible purpose:
- help the user start without writing a full prompt
- make the assistant feel guided, not blank and open-ended

Hidden signal:
- `starting_situation`

Why this step matters:
- this is the first diagnostic signal
- it tells us what kind of help the user wants first
- it should not yet decide the final route

### Step 3: Hiring motion diagnosis
This is the most important middle step.

If the user starts with `We're not sure which hiring solution fits`:

> I can help with that. The right fit usually depends on whether your team is hiring consistently across teams, needs more proactive sourcing for harder-to-fill roles, or is looking for a lighter-touch option.
>
> Which is closer to your situation right now?

Suggested replies:
- `We hire consistently across teams`
- `We need help with harder-to-fill roles`
- `We're hiring occasionally`
- `We're still figuring that out`

Visible purpose:
- help before qualifying
- give the user a simple decision lens

Hidden signal:
- `hiring_motion`

Why this step matters:
- it keeps the conversation guide-first
- it avoids jumping too quickly from broad fit to narrow role questions
- hiring motion is often a stronger predictor of fit than role names alone

### Step 4: Specific fit diagnosis
Once hiring motion is clearer, the assistant asks for role or team context.

If the user says `We hire consistently across teams`:

> That helps. Teams hiring consistently across multiple functions usually need a more structured, proactive approach than teams hiring occasionally.
>
> Which teams or roles are most affected right now?

If the user says `We need help with harder-to-fill roles`:

> That helps. When teams are struggling with harder-to-fill roles, they often need a more proactive sourcing approach instead of relying only on inbound applicants.
>
> What kinds of roles are most affected right now?

Suggested replies:
- `Engineering`
- `Sales`
- `Mix of roles`
- `Hard-to-fill roles`

Visible purpose:
- move from broad motion into concrete fit diagnosis

Hidden signals:
- `hiring_use_case`
- `hiring_complexity`

Why this step matters:
- it gives the assistant enough specificity to recommend something
- it is where Recruiter can begin to feel earned instead of predetermined

### Step 5: Urgency / priority
Once role context is clear, the assistant should add one timing signal before recommending the next step.

Recommended version:

> That gives me a better sense of the hiring pattern.
>
> How soon do you need to make progress on this?

Suggested replies:
- `This quarter`
- `In the next few months`
- `We're planning ahead`
- `Still exploring`

Visible purpose:
- add a real timing signal without sounding like sales discovery

Hidden signal:
- `timeline / urgency`

Why this step matters:
- it makes the conversation feel more commercially grounded
- it helps distinguish interesting fit from near-term need
- it captures a useful BANT-like signal without asking a blunt business-impact question

### Step 6: Reflected recommendation
Preferred version:

> It sounds like Northstar Health is hiring consistently across engineering and product, and the need is fairly near-term. A more proactive sourcing approach is usually what helps in that situation, which is where Recruiter tends to be most useful.

Fallback version:

> It sounds like you're hiring across several functions, and this feels like a real near-term priority. A more proactive sourcing approach is often useful in that situation, which is where Recruiter can become more relevant.

Visible purpose:
- reflect back what the assistant learned
- translate user context into a likely-fit recommendation

Hidden effect:
- stronger confidence in likely solution category
- stronger confidence in urgency and route quality

Why this step matters:
- it makes the assistant feel interpretive, not repetitive
- it introduces Recruiter after context exists
- it gives the user something useful before asking them to choose a next step

### Step 7: Next-step choice
Recommended question:

> Would it be more helpful to keep exploring, get pricing guidance, or talk with a representative about what this could look like for Northstar Health?

Suggested replies:
- `Keep exploring`
- `How is pricing structured?`
- `Talk to a Recruiter representative`

Visible purpose:
- offer a clear next move without forcing a handoff

Hidden signal:
- `readiness`

Why this step matters:
- readiness is captured as a consequence of guidance, not as an early qualification question
- this is where the system can begin to lean toward one of the hidden routing outcomes

### Step 8: Bridge step before handoff
If the user chooses the representative path, the assistant should not open booking immediately.

Recommended version:

> That makes sense. Based on what you shared, a short conversation with a Recruiter representative could be a useful next step for Northstar Health.
>
> I can help you book a meeting, or we can keep exploring first.

Suggested replies:
- `Book meeting`
- `Keep exploring`

Visible purpose:
- make the transition feel intentional instead of abrupt
- give the user one more chance to stay in guide mode

Hidden effect:
- stronger confidence that the user is ready for human follow-up

Why this step matters:
- the booking surface is a meaningful mode shift
- the bridge makes that shift feel earned and reversible

## Alternate entry paths

### Path: Consistent hiring
If the user starts with `We hire consistently across teams`, the assistant can skip the decision-lens step and go directly to role or team context.

Why:
- the user has already supplied the hiring motion

### Path: Harder-to-fill roles
If the user starts with `We need help with harder-to-fill roles`, the assistant can skip the broader decision lens and move into role context.

Why:
- the user has already supplied a clear pain point that strongly suggests proactive sourcing

### Path: Pricing guidance
If the user starts with `We'd like pricing guidance`, the assistant should:
- answer pricing at a high level
- explain that pricing depends on context
- use the follow-up question to understand fit

Example:

> Pricing usually depends on how a team plans to use the product, including hiring volume, role complexity, and the level of support needed. At a high level, it tends to make the most sense for teams with ongoing or harder-to-fill hiring needs rather than one-off hiring.
>
> To make this more useful, is this for broader ongoing hiring or for a smaller number of roles?

Why:
- pricing is a buying signal
- but it should still stay guide-first in the MVP

## Alternate conversation modes

### Curious but not ready
Typical user inputs:
- `What is LinkedIn Recruiter?`
- `How is it different from LinkedIn Jobs?`

Pattern:
- answer clearly first
- ask one soft context question
- keep the CTA soft

### Wrong intent
Typical user inputs:
- support
- job seeker help
- unrelated questions

Pattern:
- acknowledge the mismatch
- redirect clearly
- do not force the sales path

## How this maps to the hidden routing model
The visible conversation should stay focused on guidance.
The hidden system should use the conversation to gather routing signals.

Useful hidden inputs:
- onboarding context
- `starting_situation`
- `hiring_motion`
- `hiring_use_case`
- `hiring_complexity`
- `readiness`

These can support the target routing model from [project-overview.md](project-overview.md):
1. High value, high confidence -> AE
2. Medium value, SDR online -> live SDR handoff
3. Medium value, SDR offline -> schedule SDR
4. Low value, high confidence -> lower-touch purchase
5. No value -> redirect

Important:
- the user should not feel these routes directly in the opening or middle turns
- the assistant should feel like it is helping, not sorting

## How BANT fits
BANT is useful here as a hidden business lens, not as the visible conversation structure.

In this MVP:
- `Need` is the strongest signal
- `Authority` is mostly inferred
- `Timeline` is inferred later in the flow
- `Budget` is the weakest visible signal and should stay soft

Practical mapping:
- `Need`
  captured through `starting_situation`, `hiring_motion`, `hiring_use_case`, and `hiring_complexity`
- `Authority`
  inferred mainly from onboarding context such as role, company, and seniority
- `Timeline`
  inferred from urgency language and from the user's next-step choice, such as `Keep exploring` versus `Talk to a Recruiter representative`
- `Budget`
  hinted at through pricing interest, but not asked directly in the MVP

Important guardrails:
- the assistant should not try to visibly "complete BANT"
- not every path needs all four BANT dimensions explicitly
- direct budget or authority questions will make the conversation feel too much like a form
- hiring motion and product fit are often more useful than strict BANT phrasing on `/hire`

## Booking handoff
Booking should feel like part of the same experience, not a redirect.

Recommended pattern:
- user chooses `Talk to a Recruiter representative`
- assistant confirms why that next step is relevant
- assistant offers a short bridge choice:
  - `Book meeting`
  - `Keep exploring`
- desktop opens a right-side next-step surface
- mobile uses a step change inside the same panel

Important:
- `Keep exploring` should continue the conversation
- the shell pattern should work for more than booking

Recommended booking card:
- Headline: `Talk to a Recruiter representative`
- Supporting copy: `Based on what you shared, a short conversation can help you see whether Recruiter is a fit for hiring engineering and product talent at Northstar Health.`
- Meta: `20-minute conversation`
- Reassurance: `No prep needed`

Recommended interaction:
- short row of dates
- 3 suggested time slots
- lightweight confirmation state
- `Back to chat`

## Outcome variants

### AE booking
When to use:
- strong fit
- senior buyer or buyer-influencer
- broader or more complex hiring needs
- stronger commercial confidence

Visible purpose:
- recommend a higher-value representative conversation

Next-step surface:
- booking surface
- more decisive, premium framing

Example title:
- `Talk to an account executive`

Primary action:
- `Book meeting`

### SDR live handoff
When to use:
- medium-value lead
- human help is useful now
- live SDR is available

Visible purpose:
- offer immediate human help without scheduling

Next-step surface:
- live-connect surface, not a scheduler

Example title:
- `Connect with a representative`

Primary action:
- `Connect now`

Optional secondary actions:
- `Schedule for later`
- `Back to chat`

### SDR booking
When to use:
- medium-value lead
- human follow-up makes sense
- live SDR is not available

Visible purpose:
- offer a lighter human follow-up than AE

Next-step surface:
- booking surface

Example title:
- `Talk to a representative`

Primary action:
- `Book meeting`

### Lower-touch / direct purchase
When to use:
- lower-complexity need
- smaller scope
- high confidence that a lower-touch option is the better fit

Visible purpose:
- recommend a simpler path without making the user feel rejected

Next-step surface:
- recommendation surface, not booking

Example title:
- `A simpler option may fit better`

Primary action:
- `See recommended option`

Optional secondary actions:
- `Keep exploring`
- `Talk to a representative anyway`

### Redirect / no-sales
When to use:
- wrong audience
- support or job-seeker intent
- low or no commercial value
- high confidence that sales is not the right destination

Visible purpose:
- redirect the user to a better destination gracefully

Next-step surface:
- redirect / help surface

Example title:
- `Here’s a better place to start`

Primary action:
- `Go to the right place`

Optional secondary action:
- `Back to chat`

## How to explain this flow to stakeholders
The clearest explanation is by message purpose, not exact wording.

Use this structure:
- opening message: orientation
- opening prompts: starting situation
- first assistant response: decision lens or helpful framing
- middle question: hiring motion diagnosis
- next question: specific fit diagnosis
- recommendation: likely-fit guidance
- next-step choice: explore, pricing, or representative

This lets you speak clearly about the logic even if final AI copy changes over time.

The clearest summary of the routing story is:
- we are not designing five unrelated chats
- we are designing one guided conversation with five possible end states
- the visible experience stays consultative
- the hidden system chooses the right next-step surface
