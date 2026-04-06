# MVP Spec

## Purpose
This document defines what the first realistic, shareable AI Concierge prototype should include.

It is not a production PRD. It is meant to keep us aligned on:
- what story the prototype should tell
- what flows must feel believable
- what we should fake versus simulate
- what is in scope now versus part of the broader target model

Related docs:
- [project-overview.md](project-overview.md)
- [conversation-strategy.md](conversation-strategy.md)
- [conversation-blueprint.md](conversation-blueprint.md)
- [persona.md](persona.md)
- [implementation-plan.md](implementation-plan.md)

## Product context
This prototype sits on the real LinkedIn Hire experience:
- [business.linkedin.com/hire](https://business.linkedin.com/hire)

That means the assistant should not behave like a Recruiter-only bot from the first turn. It should start as a guide to LinkedIn hiring solutions, then narrow toward the likely-fit product as it learns more.

## What we are trying to prove
This prototype should help stakeholders react to one clear idea:

Instead of sending a high-intent visitor straight to a static `Contact sales` form, LinkedIn could use AI Concierge to:
- provide helpful guidance first
- qualify the lead in the background
- route the user to the right next step

The prototype should prove that helpful guidance and lead qualification can happen at the same time.

## Core prototype philosophy
- Guide-first, not sales-first
- Generic at entry
- Diagnostic in the middle
- Specific by later turns
- Helpful on the surface, qualification-aware underneath

The chat should feel like a product consultant that earns the right to qualify.

## How BANT fits in the MVP
BANT is relevant, but it should stay behind the scenes.

The visible conversation should not be structured as:
- budget question
- authority question
- timeline question
- handoff

Instead, the prototype should gather BANT-like signals naturally through a more useful conversation:
- `Need`
  mainly through starting situation, hiring motion, role context, and hiring complexity
- `Authority`
  mainly through onboarding role and company context
- `Timeline`
  mainly through urgency language and next-step choice
- `Budget`
  only as a soft pricing signal, not an explicit qualification step

This matters because the prototype is trying to prove that AI Concierge can educate and qualify at the same time without feeling like a second form.

## Intended audience for the prototype
- PMs
- Design partners
- Engineering stakeholders
- Sales / GTM stakeholders

## Primary user
A high-intent hirer, recruiter, or talent leader on `/hire` who wants help understanding which LinkedIn hiring solution may fit their needs.

## MVP promise
If a user is interested enough to click `Contact sales`, this experience should make it easier for them to:
- get oriented
- ask questions
- understand likely fit
- feel guided instead of dropped into a form
- reach a believable next step

## Target routing model
The broader target model is a hidden multi-outcome routing system:
1. High value, high confidence -> route to AE
2. Medium value, SDR online -> hand off live to SDR
3. Medium value, SDR offline -> book with SDR
4. Low value, high confidence -> direct purchase / lower-touch path
5. No value -> redirect

This model is important context for the MVP, but the prototype does not need to fully implement all five endings.

## Prototype scope
The current prototype should focus on a narrower, believable subset of the larger model.

### In scope
- A `/hire` landing-page context with AI Concierge entry from sales CTAs
- A `Contact sales` trigger that opens the AI chat panel
- A lightweight onboarding / prefill step before chat
- A guide-first chat experience that can:
  - greet the user with known context
  - help the user get oriented
  - answer common fit and product questions
  - ask a small number of lightweight follow-up questions
  - narrow toward Recruiter when appropriate
  - suggest a representative when that feels earned
- A happy-path representative handoff
- A believable booking flow
- A small number of alternate branches:
  - curious but not ready
  - pricing interest
  - wrong intent / redirect

### Out of scope
- Real production AI behavior
- Real authentication
- Real CRM integration
- Real lead scoring
- Real SDR / AE availability systems
- Real calendar integration
- Real routing across all 5 target outcomes
- Real omni-channel follow-up
- Full regional / market complexity

## What should feel real
- The landing page and chat entry
- The onboarding / prefill step
- The first few chat turns
- The sense that the assistant understands the user's situation
- The representative recommendation
- The booking transition and confirmation

## What can be faked
- Identity and prefill
- Lead classification
- Representative availability
- Booking inventory
- Routing logic
- Sales operational systems

## Core flows

### Flow 1: Landing page to chat
1. User lands on LinkedIn Hire
2. User clicks `Contact sales` or the AI-led CTA variant
3. AI Concierge opens
4. User confirms or enters basic details
5. Chat begins

### Flow 2: Guide + qualify + representative handoff
1. AI opens with a broad hiring-solutions framing
2. User picks a starting situation or types a question
3. AI gives a useful response first
4. AI asks 1 to 2 lightweight follow-ups
5. AI narrows toward the most relevant solution
6. AI suggests a representative if the handoff feels earned
7. User books time and sees confirmation

### Flow 3: Curious but not ready
1. User asks exploratory questions
2. AI stays in guide mode
3. AI offers a soft next step

### Flow 4: Wrong intent
1. User asks for something outside the sales path
2. AI recognizes the mismatch
3. AI redirects gracefully

## Conversation requirements
The conversation should:
- feel helpful, not like a form in disguise
- start broad enough for `/hire`
- become more specific as context increases
- answer before asking
- use only a small number of follow-up questions
- qualify in the background without sounding like visible BANT

The conversation should avoid:
- repeating onboarding details
- back-to-back qualification questions
- overly robotic sales language
- pushing booking too early

## Content requirements
The prototype should be able to help with:
- broad hiring-solution fit questions
- Recruiter questions
- pricing questions at a high level
- “is this right for us?” questions
- wrong-intent redirection

## Booking requirements
The booking handoff should:
- start from chat
- feel earned
- expand into an attached booking surface rather than living inside chat bubbles
- end in a believable confirmation state

## UX priorities
- The experience should feel more helpful than a static form
- The opening should reduce blank-chat anxiety
- The assistant should feel guide-first, not screening-first
- The user should feel guided, not trapped
- The prototype should be easy to demo without requiring perfect user input

## System assumptions
- Use scripted or state-driven conversation logic
- Use mocked or hardcoded data where needed
- Keep the hidden state model small
- Route based on user signals, not complex backend systems
- Preserve flexibility for richer routing later

## MVP checklist
- Landing page exists and feels believable
- `Contact sales` opens the chat panel
- Onboarding / prefill step exists
- Chat supports a guide-first happy path
- Chat supports at least a few realistic alternate paths
- Representative handoff exists
- Booking flow exists
- Confirmation state exists

## What success looks like
- Stakeholders understand the concept quickly
- The prototype feels realistic enough to critique
- Reviewers can discuss trust, usefulness, qualification, and routing quality
- The prototype demonstrates that AI Concierge could be a better first step than a static form

## Post-MVP direction
Important longer-term ideas that are not required for the current prototype:
- voice / phone channel options
- regional channel variation
- SDR online / offline behavior as a live system
- full implementation of all 5 routing endings
- state persistence across channels
- omni-channel follow-up and re-engagement
