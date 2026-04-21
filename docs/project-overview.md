# Project Overview

## What this project is
AI Concierge is a prototype conversational layer for LinkedIn Hire.

Instead of sending visitors straight to a static `Contact sales` form, the experience starts with AI-led guidance that helps users:
- understand which LinkedIn hiring solutions may fit their needs
- ask product and fit questions
- share enough context for lead qualification in the background
- get routed to the right next step

This is grounded in the real `/hire` experience:
- [business.linkedin.com/hire](https://business.linkedin.com/hire)

That page spans multiple hiring products, including:
- Recruiter + Hiring Assistant for consistent hiring
- Hiring Pro for occasional hiring
- Career Pages for awareness and employer brand

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
BANT is useful for the business side of the system, but it should not become the visible conversation script.

The model:
- visible conversation: guidance, diagnosis, recommendation, next step
- hidden interpretation: BANT-like signals plus product-fit and hiring-motion signals

In practice:
- `Need` is the strongest and most important signal in this MVP. Captured through starting situation, hiring motion, use case, and complexity.
- `Authority` is usually inferred from onboarding context like role, company, and seniority.
- `Timeline` is inferred from urgency language and next-step behavior.
- `Budget` stays soft through pricing interest and is never asked directly.

The assistant should never try to visibly "complete BANT." Two strong signals are usually enough to route well.

## Target routing model
The broader model is a multi-outcome routing system, not just `book a meeting` or `do nothing`.

The 5-endings model:
1. `AE booking` (high value, high confidence): route directly to AE and book.
2. `SDR live handoff` (medium value, SDR online): hand off live to a human SDR in-thread.
3. `SDR booking` (medium value, SDR offline): book time with SDR.
4. `Lower-touch / direct purchase` (low value, high confidence): route to a direct purchase or lower-touch path.
5. `Redirect / no-sales` (no value): redirect to a better-fit destination or end the sales path.

This routing model stays hidden from the user. The visible conversation should feel like guidance, not scoring. Users should not see `AE` or `SDR`. `Representative` is the user-facing umbrella term.

## MVP scope

### What we are trying to prove
Instead of sending a high-intent visitor straight to a static `Contact sales` form, LinkedIn could use AI Concierge to provide helpful guidance first, qualify the lead in the background, and route the user to the right next step.

### In scope
- A `/hire` landing-page context with AI Concierge entry from sales CTAs
- A lightweight onboarding / prefill step before chat
- A guide-first chat experience that can:
  - greet the user with known context
  - help the user get oriented
  - answer common fit and product questions
  - ask a small number of lightweight follow-up questions
  - narrow toward the likely-fit product
  - suggest a representative when that feels earned
- Representative handoff flows (AE booking, SDR booking, SDR live)
- A lower-touch / direct purchase recommendation path
- A believable booking flow
- Alternate branches for curious-but-not-ready, pricing interest, and wrong intent

### Out of scope
- Real production AI behavior
- Real authentication or CRM integration
- Real lead scoring or calendar integration
- Real SDR / AE availability systems
- Full regional / market complexity
- Omni-channel follow-up

### What should feel real
- The landing page and chat entry
- The onboarding / prefill step
- The first few chat turns
- The sense that the assistant understands the user's situation
- The representative recommendation
- The booking transition and confirmation

### What can be faked
- Identity and prefill
- Lead classification
- Representative availability
- Booking inventory
- Routing logic
- Sales operational systems

## Core experience flow
1. A user lands on LinkedIn Hire.
2. They click a `Contact sales` or AI-led entry point.
3. They confirm or enter basic details.
4. AI Concierge begins a guided conversation.
5. The assistant helps identify the user's challenge, hiring motion, and likely fit.
6. The system classifies the lead in the background.
7. The user is routed to the best next step.

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
- The prototype is realistic enough for stakeholders to critique and discuss trust, usefulness, and routing quality.

## Post-MVP direction
Important longer-term ideas not required for the current prototype:
- multi-channel entry and handoff (chat, voice, phone call)
- region-dependent channel behavior
- SDR availability-aware routing
- state persistence across follow-up channels
- omni-channel re-engagement after incomplete qualification

## Related docs
- [conversation-blueprint.md](conversation-blueprint.md): how the conversation works and why
- [conversation-system-prompt.md](conversation-system-prompt.md): external production AI spec (reference only)
- [persona.md](persona.md): default demo persona
- [routing-outcomes-worksheet.md](routing-outcomes-worksheet.md): detailed routing design
- [implementation-plan.md](implementation-plan.md): build phases and status
