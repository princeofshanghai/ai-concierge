# Phase 1 Flow Notes

## Purpose
This document captures the current thinking for refining Phase 1 of the AI Concierge conversation flow.

It is meant to help us:
- reason about the logic behind each message
- explain the flow clearly to PMs and stakeholders
- connect the visible conversation to the hidden qualification model

Related docs:
- [project-overview.md](project-overview.md)
- [conversation-strategy.md](conversation-strategy.md)
- [conversation-blueprint.md](conversation-blueprint.md)
- [implementation-plan.md](implementation-plan.md)

## Core reminder
The current product philosophy is:
- guide-first
- generic at entry
- diagnostic in the middle
- specific by later turns
- helpful guidance on the surface
- lead qualification in the background

The visible conversation should feel like a product consultant.
The hidden system should still gather enough signals to support routing.

## Main issue with the current Phase 1 flow
Right now the chat moves a little too quickly from:
- broad orientation
to
- narrow qualification
to
- specialist suggestion

The result is that the flow can feel compressed, especially when the user starts with a broad fit question like:
- `Which hiring solution is right for us?`

The current jump to:
- `What kinds of roles are you hiring for right now?`

is not wrong, but it skips an important middle step:
- diagnosing the user's hiring motion

## Main recommendation
Do not add more visible qualification questions just to slow the flow down.

Instead, add one more meaningful diagnostic layer in the middle.

The recommended visible structure is:
1. opening
2. starting situation
3. hiring motion diagnosis
4. specific fit diagnosis
5. recommendation plus next step

This gives the conversation more room without making it feel like a form.

## Opening prompt philosophy
The opening chips should capture the user's starting situation.

They should not:
- mix questions and statements
- feel like routing choices
- expose the backend logic

Recommended rule:
- all opening chips should be situation-led

Suggested direction:
- `We're not sure which hiring solution fits`
- `We hire consistently across teams`
- `We need help with harder-to-fill roles`
- `We'd like pricing guidance`

Why this is better:
- all 4 chips are the same type of input
- all 4 sound like real user starting situations
- all 4 support guide-first diagnosis
- none of them jump too early to a product or channel choice

## What the opening chips are doing

### `We're not sure which hiring solution fits`
Visible purpose:
- broad orientation

Hidden signal:
- user needs solution guidance, not just product detail

Why it matters:
- this should trigger a decision-framework response, not a sales push

### `We hire consistently across teams`
Visible purpose:
- establish hiring motion

Hidden signal:
- ongoing hiring, potentially stronger commercial value

Why it matters:
- consistent hiring often points toward more structured and proactive solutions

### `We need help with harder-to-fill roles`
Visible purpose:
- establish a concrete hiring challenge

Hidden signal:
- sourcing complexity, stronger Recruiter relevance

Why it matters:
- this is one of the clearest paths toward proactive sourcing products

### `We'd like pricing guidance`
Visible purpose:
- acknowledge commercial interest

Hidden signal:
- possible buying intent, but not necessarily sales-readiness

Why it matters:
- pricing should help diagnose fit, not force an immediate handoff

## Recommended Phase 1 logic

### Step 1: Opening
Purpose:
- communicate broad capability
- show the onboarding mattered
- reduce blank-state anxiety

### Step 2: Starting situation
Purpose:
- understand what kind of help the user wants first

This is where the opening chips should live.

### Step 3: Hiring motion diagnosis
Purpose:
- understand whether the user is hiring consistently, hiring occasionally, dealing with sourcing complexity, or mostly exploring

This is the missing middle layer in the current flow.

It matters because hiring motion is often a stronger predictor of product fit and lead value than role names alone.

### Step 4: Specific fit diagnosis
Purpose:
- understand which teams or roles are most affected
- understand whether the problem is broad or concentrated

This is where role and complexity questions should come in.

### Step 5: Recommendation plus next step
Purpose:
- turn what the assistant learned into a likely-fit recommendation
- then offer the next best step

Recommended pattern:
- recommend first
- ask readiness or next-step preference second

This feels more natural than asking for readiness too early.

## How this should work in practice

### If user says `We're not sure which hiring solution fits`
Assistant purpose:
- explain the decision lens at a high level
- then ask about hiring motion

Why:
- this is a broad fit question
- asking about roles immediately is too tactical too soon

### If user says `We hire consistently across teams`
Assistant purpose:
- validate that pattern
- explain why that matters
- then ask which teams or roles are most affected

### If user says `We need help with harder-to-fill roles`
Assistant purpose:
- explain proactive sourcing
- connect the challenge to likely-fit solutions
- then ask which roles are hardest to fill

### If user says `We'd like pricing guidance`
Assistant purpose:
- answer at a high level
- clarify that pricing depends on context
- use pricing to diagnose fit

## Mapping to the 5-endings model
The opening prompts are not the endings.
They are the first diagnostic signal.

The hidden system can use:
- starting situation
- hiring motion
- role complexity
- onboarding context
- readiness

to support the target routing model from [project-overview.md](project-overview.md):
1. high value -> AE
2. medium value + SDR online -> live SDR
3. medium value + SDR offline -> book SDR
4. low value -> lower-touch purchase
5. no value -> redirect

The visible conversation should stay focused on guidance.
The hidden system should handle routing.

## How to talk about the messages with PM
The clearest explanation is by message purpose, not exact wording.

Suggested framing:
- opening message: orientation
- opening chips: starting situation
- first assistant response: helpful framing
- middle diagnostic question: hiring motion
- role or complexity question: fit diagnosis
- recommendation message: likely-fit guidance
- next-step question: handoff vs keep exploring

This makes the flow easier to explain and defend, even if exact AI copy changes over time.

## Current recommendation
Refine Phase 1 toward this shape:
1. broad opening
2. situation-led chip
3. decision-lens response
4. hiring-motion question
5. role or complexity question
6. reflected recommendation
7. next-step choice

This gives the conversation enough room to feel helpful and intelligent without turning it into a long form.

## Revised happy path example
This is the recommended shape for the broadest happy-path entry.

### Message 1: Opening
Example:

> Hi Jamie, I can help you figure out which hiring solutions could make sense for Northstar Health, answer questions about how they fit different hiring needs, and connect you with a specialist if that becomes useful.
>
> Here are a few ways to get started:

Suggested replies:
- `We're not sure which hiring solution fits`
- `We hire consistently across teams`
- `We need help with harder-to-fill roles`
- `We'd like pricing guidance`

Visible purpose:
- orient the user
- show broad capability
- make the first step feel easy

Hidden signal:
- starting context comes from onboarding only

Routing impact:
- none yet, this is still orientation

### Message 2: Decision lens
If the user says `We're not sure which hiring solution fits`

Example:

> I can help with that. The right fit usually depends on whether your team is hiring consistently across teams, needs more proactive sourcing for harder-to-fill roles, or is looking for a lighter-touch option.
>
> Which is closer to your situation right now?

Suggested replies:
- `We hire consistently across teams`
- `We need help with harder-to-fill roles`
- `We're hiring occasionally`
- `We're still figuring that out`

Visible purpose:
- give the user a simple way to think about the decision
- help before qualifying

Hidden signal:
- hiring motion
- broad fit uncertainty

Routing impact:
- begins narrowing likely product category

### Message 3: Specific fit diagnosis
If the user says `We hire consistently across teams`

Example:

> That helps. Teams hiring consistently across multiple functions usually need a more structured, proactive approach than teams hiring occasionally.
>
> Which teams or roles are most affected right now?

Suggested replies:
- `Engineering`
- `Sales`
- `Mix of roles`
- `Hard-to-fill roles`

Visible purpose:
- connect hiring motion to product approach
- gather specifics without sounding like a form

Hidden signal:
- ongoing hiring
- role complexity
- likely commercial value

Routing impact:
- strengthens higher-value and specialist-fit signals

### Message 4: Recommendation
If the user says `Mix of roles` or shares multiple role types

Example:

> It sounds like your team is hiring across several functions, with some ongoing hiring complexity. In that situation, a more proactive sourcing workflow is often what matters most, which is where Recruiter tends to be strongest.

Visible purpose:
- reflect back what the assistant learned
- introduce a likely-fit product only after enough context exists

Hidden signal:
- solution fit confidence

Routing impact:
- improves confidence for specialist routing

### Message 5: Next-step choice
Example:

> Would it be more helpful to keep exploring, get pricing guidance, or talk with a specialist about what this could look like for Northstar Health?

Suggested replies:
- `Keep exploring`
- `We'd like pricing guidance`
- `Talk to a Recruiter specialist`

Visible purpose:
- offer a clear next step without making the handoff feel forced

Hidden signal:
- readiness
- buying intent

Routing impact:
- determines whether to stay in guide mode or move toward handoff

## Alternate opening chip logic

### If user says `We hire consistently across teams`
Assistant purpose:
- validate the hiring motion immediately
- skip the broad decision-lens step
- move into role and complexity diagnosis

### If user says `We need help with harder-to-fill roles`
Assistant purpose:
- explain proactive sourcing
- connect the challenge to likely-fit solutions
- then ask which roles are hardest to fill

### If user says `We'd like pricing guidance`
Assistant purpose:
- answer at a high level
- explain that pricing depends on context
- use pricing to diagnose fit rather than forcing a sales handoff

## How to explain this to PM
The easiest explanation is by message job.

### Opening message
Job:
- say what the assistant can help with
- make the interaction feel broad and low-friction

### Opening chips
Job:
- capture the user's starting situation
- not route the user directly

### Decision-lens response
Job:
- give the user a useful framework before asking for more detail

### Hiring-motion question
Job:
- understand the user's underlying need, not just their roles

### Role or complexity question
Job:
- get specific enough to recommend a likely-fit product

### Recommendation message
Job:
- translate what the assistant learned into a meaningful product recommendation

### Next-step choice
Job:
- decide whether the conversation stays in guide mode or moves toward handoff

## Important pushback
We should not try to visibly show all 5 routing endings in the chat flow itself yet.

The 5-endings model should stay mostly hidden:
- high value -> AE
- medium value + SDR online -> live SDR
- medium value + SDR offline -> book SDR
- low value -> lower-touch purchase
- no value -> redirect

The visible conversation should still feel like:
- help
- diagnose
- recommend
- route

not:
- sort
- score
- dispatch

## Practical takeaway
The Phase 1 flow should not feel shorter by adding more questions.
It should feel smarter by adding the right middle question.
