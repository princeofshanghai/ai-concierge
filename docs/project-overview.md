# Project Overview

## What this project is
AI Concierge is a prototype conversational layer for LinkedIn Hire.

Instead of sending visitors straight to a static `Contact sales` form, the experience starts with AI-led guidance that helps users:
- understand which LinkedIn hiring solutions may fit their needs
- ask product and fit questions
- share enough context for lead qualification in the background
- get routed to the right next step

This is no longer just a Recruiter-only microsite concept. It is grounded in the real `/hire` experience:
- [business.linkedin.com/hire](https://business.linkedin.com/hire)

That page spans multiple hiring products, including:
- Recruiter + Hiring Assistant for consistent hiring
- Hiring Pro for occasional hiring
- Career Pages for awareness and employer brand

Related docs:
- [conversation-strategy.md](conversation-strategy.md)
- [conversation-blueprint.md](conversation-blueprint.md)
- [persona.md](persona.md)
- [implementation-plan.md](implementation-plan.md)

## Why this project exists
- The current `Contact sales` flow is too form-heavy and slow.
- Visitors on `/hire` often still need help understanding which product fits.
- A helpful first conversation can reduce friction and improve trust.
- Sales teams benefit when lead quality and routing are stronger before human handoff.

## Core idea
AI Concierge should feel like a product consultant that earns the right to qualify.

The intended flow is:
1. start broad
2. diagnose the user's hiring challenge or hiring motion
3. narrow to the most relevant solution or product
4. route to the best next step

Short version:
- generic at entry
- diagnostic in the middle
- specific by later turns

## Primary goal
Create a faster, more helpful path from hiring interest to the right next step, while qualifying the lead in the background.

That next step may be:
- a representative handoff
- an SDR handoff
- a lower-touch purchase path
- a redirect to another destination

## MVP goals
- Help users understand which LinkedIn hiring solution may fit their situation.
- Reduce friction compared with a static `Contact sales` flow.
- Capture enough context to understand intent and likely lead value.
- Demonstrate that helpful AI guidance and lead qualification can happen at the same time.
- Route users toward an appropriate next step rather than treating every conversation as the same sales path.

## Audiences

### Primary audience
- Hirers, recruiters, and talent leaders on `/hire`
- Prospects actively evaluating hiring solutions
- Users who may not yet know which LinkedIn hiring product they need

### Secondary audience
- AEs and SDRs who receive qualified leads
- Internal teams evaluating conversion quality, routing quality, and user experience

## Experience model

### Visible experience
What the user sees:
- a helpful, guide-first conversation
- lightweight follow-up questions
- product and fit guidance
- a recommendation for the next best step

### Hidden system behavior
What happens in the background:
- intent detection
- qualification signal gathering
- lead classification
- routing to the appropriate outcome

This separation is important. The experience should feel helpful and human on the surface, without exposing the sales logic too directly.

## How BANT fits
BANT is still useful for the business side of the system, but it should not become the visible conversation script.

The cleaner model for this project is:
- visible conversation: guidance, diagnosis, recommendation, next step
- hidden interpretation: BANT-like signals plus product-fit and hiring-motion signals

In practice:
- `Need` is the strongest and most important signal in this MVP
- `Authority` is usually inferred from onboarding context
- `Timeline` is usually inferred from urgency and next-step behavior
- `Budget` should stay soft and should not drive the visible flow

This is why the experience should not feel like a BANT questionnaire. The assistant should gather useful signals naturally while helping the user understand which hiring solution may fit.

## Target routing model
The broader model for AI Concierge is a multi-outcome routing system, not just `book a meeting` or `do nothing`.

The target 5-endings model is:
1. `High value, high confidence`
   Route directly to AE and book with AE.
2. `Medium value, SDR online`
   Hand off live to a human SDR.
3. `Medium value, SDR offline`
   Book time with SDR.
4. `Low value, high confidence`
   Route to a direct purchase or lower-touch path.
5. `No value`
   Redirect to a better-fit destination or end the sales path.

This routing model should stay mostly hidden from the user. The visible conversation should still feel like guidance, not scoring.

## Core experience flow
1. A user lands on LinkedIn Hire.
2. They click a `Contact sales` or AI-led entry point.
3. They confirm or enter basic details.
4. AI Concierge begins a guided conversation.
5. The assistant helps identify the user's challenge, hiring motion, and likely fit.
6. The system classifies the lead in the background.
7. The user is routed to the best next step.

## Key product capabilities
- Guide users across the broader LinkedIn Hire product landscape
- Answer product and fit questions
- Capture lightweight qualification signals
- Classify leads in the background
- Route users to AE, SDR, lower-touch, or redirect outcomes
- Support a human handoff when it adds value

## Current prototype scope
The current prototype is narrower than the full target model.

Today it focuses on:
- the `/hire` landing-page context
- an AI chat panel triggered from sales CTAs
- a guide-first conversation
- a simplified happy path that narrows toward Recruiter-oriented guidance
- a representative-handoff flow

It does not yet fully implement all 5 routing endings. Those should be treated as the target model the prototype is building toward.

## Post-MVP direction
The broader PRD points to a larger experience beyond the current prototype.

Post-MVP directions include:
- multi-channel entry and handoff, such as chat, voice, and phone call
- region-dependent channel behavior
- SDR availability-aware routing, such as SDR online vs offline
- state persistence across follow-up channels
- omni-channel re-engagement after incomplete qualification

These are important to the long-term vision, but they should not be confused with the narrower scope of the current prototype.

## UX implications
- The conversation should feel helpful, not like a form in disguise.
- The first turns should build trust and momentum.
- The assistant should educate while qualifying, not pause education to interrogate the user.
- The user should feel guided, not screened.
- Wrong-intent users should still have a graceful experience.

## System implications
- The prototype can stay state-driven and scripted.
- Qualification should happen in the background.
- The system only needs a small hidden state model for MVP.
- Routing should be driven by user signal, not only by turn count.
- The architecture should leave room for richer routing, channel logic, and state persistence later.

## What success looks like
- More users engage successfully than in the static form flow.
- Users understand the right product or next step faster.
- Qualification feels natural instead of extractive.
- High-intent users reach stronger handoff outcomes.
- The experience improves both user experience and routing quality.

## Open questions
- How much of the 5-endings model should be visible in the first prototype?
- When should the experience move from guide mode into handoff mode?
- Which lower-touch or direct-purchase path is most realistic to demonstrate?
- Which parts of the post-MVP channel model should remain implicit versus visible in future versions?
