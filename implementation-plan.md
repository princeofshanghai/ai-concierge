# Implementation Plan

## Purpose of this document
This document tracks the phased implementation plan for the AI Concierge MVP.

It is meant to answer:
- what has already been built
- what is next
- where review checkpoints should happen
- how to phase the work so each review is meaningful without building too much at once

This plan is written for a design-led workflow, where the goal is to build in chunks that are large enough to react to, but small enough to adjust before too much code accumulates.

## Related documents
- [project-overview.md](project-overview.md)
- [mvp-spec.md](mvp-spec.md)
- [conversation-strategy.md](conversation-strategy.md)
- [persona.md](persona.md)
- [conversation-blueprint.md](conversation-blueprint.md)

## Current status
We are past the first implementation pass of **Phase 2**.

That means:
- the core happy-path chat has been implemented and refined around `/hire`
- the conversation now includes a bridge step before specialist handoff
- the next-step surface is built for specialist booking and fake callback
- the prototype shell now supports more than one next-step mode
- the remaining work is to build the other routing outcomes

## Build philosophy
The right pacing for this project is:
- not polishing every tiny thing before moving on
- not building massive chunks before review

The sweet spot is to build one complete, user-visible slice at a time.

Each phase should create something that is:
- coherent enough to review
- small enough to change
- tied to a real product question

## Phases

### Phase 0: Technical foundation
Status: Completed

What this included:
- review the relevant Next.js app-router/compiler docs in `node_modules/next/dist/docs/`
- establish a simple state-driven conversation structure
- keep the conversation logic editable rather than scattering it through UI components

Why this mattered:
- it reduced the risk of hardcoding the prototype in a way that would be painful to revise

### Phase 1: Core happy-path chat
Status: Implemented and refined

What was built:
- personalized opening using Jamie + Northstar context
- situation-led starting prompts
- hiring-motion diagnosis before product specificity
- reflected recommendation and next-step choice
- bridge step before specialist handoff
- inline and composer-based suggestion patterns for different stages

Primary implementation files:
- [src/lib/ai-concierge-conversation.ts](src/lib/ai-concierge-conversation.ts)
- [src/components/ai-concierge-panel.tsx](src/components/ai-concierge-panel.tsx)
- [src/components/ai-concierge-body.tsx](src/components/ai-concierge-body.tsx)

What this phase still does not fully cover:
- all five routing outcomes
- production-level free-text robustness
- complete wrong-intent handling

Review questions for this phase:
- Does the opening feel smart but not creepy?
- Does the pacing from help to qualification feel natural?
- Does the role reflection feel specific enough?
- Does the specialist CTA feel earned?

Current refinement focus:
- keep the visible chat guide-first while hidden qualification becomes clearer
- make the logic easier to explain by message purpose, not exact copy
- ensure the conversation stays coherent with [persona.md](persona.md) and [conversation-blueprint.md](conversation-blueprint.md)

Verification completed:
- `npm run lint`
- `npm run build`

### Phase 2: Booking experience
Status: Implemented, in polish

Goal:
- turn the specialist CTA into a believable next-step flow

What is built:
- when the user chooses `Talk to a Recruiter specialist`, the assistant now shows a bridge step first
- the bridge uses inline blue bubbles:
  - `See available times`
  - `Request a phone call`
  - `Keep exploring`
- desktop opens a right-side next-step surface
- mobile replaces the chat body within the same panel
- the next-step surface supports:
  - meeting booking
  - lightweight callback request
  - confirmation
  - `Back to chat`
- the shell supports both docked and expanded presentation states

What to keep reviewing in this phase:
- Does the handoff feel continuous?
- Does the bridge step make the transition feel less abrupt?
- Does the next-step surface feel like one consistent shell rather than a one-off booking card?
- Do booking and callback both feel believable without becoming heavy?

What not to over-polish yet:
- final motion
- edge-case scheduling logic
- production-level calendar complexity

### Phase 3: Routing outcome variants
Status: Next

What should be built:
- explicit outcome variants inside the shared next-step shell:
  - `SDR booking`
  - `AE booking`
  - `Lower-touch / direct purchase`
  - `Redirect / no-sales`
  - `SDR live handoff`

What to review after Phase 3:
- Do the outcomes feel like one coherent system rather than separate flows?
- Does each outcome have a clear user-facing purpose?
- Does the visible experience stay helpful while the hidden routing gets richer?

What not to over-polish yet:
- live presence complexity for SDR handoff
- production integration details
- perfect commercial copy for every route

Recommended build order inside Phase 3:
1. `SDR booking`
2. `Lower-touch / direct purchase`
3. `Redirect / no-sales`
4. `AE booking`
5. `SDR live handoff`

### Phase 4: Demo hardening
Status: Planned

What should be built:
- visual polish
- mobile cleanup
- smoother transitions
- spacing and scroll cleanup
- resilience for demos

What to review after Phase 4:
- Can the prototype be demoed smoothly in a short walkthrough?
- Does anything feel brittle or confusing?
- Are there obvious rough edges that distract from the concept?

## Recommended review checkpoints
To keep the pacing healthy, reviews should happen at these moments:

1. After Phase 1
2. After Phase 2
3. After Phase 3

This avoids reviewing every tiny implementation detail while still making sure we do not disappear for too long and come back with a giant chunk that is hard to redirect.

## Why this order

### UX reasoning
- The conversation is the core product claim.
- Booking only matters if the handoff feels earned.
- Alternate paths matter, but they should come after the main story works.

### System reasoning
- It is cleaner to establish the chat state model first.
- Booking should layer on top of working conversation state.
- Alternate paths are easier once the core flow structure exists.

## Immediate next step
The next recommended build step is **Phase 3: Routing outcome variants**.

Why this is the right next chunk:
- the shell pattern now exists
- the project needs to show more than one business outcome
- this is the clearest way to connect the prototype back to the hidden 5-endings model

Immediate implementation focus:
- formalize the five routing outcomes in code
- reuse the current next-step shell for different outcome variants
- start with `SDR booking` as the lightest extension of the current specialist flow

## Quick reminder
If work pauses and resumes later, the shortest summary is:

- strategy, persona, and conversation blueprint are defined
- the core happy-path chat is built and aligned to `/hire`
- the next-step surface is built for booking and callback
- the next major task is implementing the other routing outcomes inside that shared shell
