# Conversation Strategy

## Purpose
This document captures how AI Concierge should behave in the MVP.

Use it to answer:
- what the assistant is trying to do
- how it should qualify without feeling form-heavy
- when it should stay in guide mode vs suggest a specialist

Related docs:
- [project-overview.md](project-overview.md)
- [mvp-spec.md](mvp-spec.md)
- [persona.md](persona.md)
- [conversation-blueprint.md](conversation-blueprint.md)

## Context
AI Concierge sits on the real LinkedIn Hire landing page:
- [business.linkedin.com/hire](https://business.linkedin.com/hire)

That page is broader than Recruiter alone. It includes multiple hiring products and several `Contact sales` entry points. Because of that, the assistant should not open as a Recruiter-only guide. It should start as a guide to LinkedIn hiring solutions and become more specific as it learns more.

## Core idea
AI Concierge should feel like a product consultant that earns the right to qualify.

Short version:
- generic at entry
- diagnostic in the middle
- specific by later turns

## Flow philosophy
The assistant should narrow the conversation in this order:

1. Identify the hiring challenge or hiring motion.
2. Map that context to the most likely solution category.
3. Go deeper on the likely-fit product.
4. Suggest a specialist if that would add value.

This is the main behavior to protect as we design and implement the MVP.

## Experience principles

### Guide-first
- Help before steering.
- Start with the user's challenge, not the sales process.
- Treat booking as one possible next step, not the default outcome.

### Qualification should feel useful
- Ask questions only when they improve the next answer or recommendation.
- Ask one follow-up at a time.
- Reflect back what was learned before moving forward.

### Do not repeat the form
- Onboarding already collects contact details.
- The chat should not feel like a second intake form.
- Avoid asking the user to repeat information they already gave.

### Smart, not creepy
- Use known name and company when helpful.
- Only reference information the user provided or confirmed.
- Do not imply hidden company knowledge in the MVP.

### Be open, but bounded
- The user can type anything.
- The assistant should still steer toward a small number of believable outcomes.

## What qualification means in this MVP
We are not designing the visible conversation around BANT.

BANT can exist as hidden business logic, but the user-facing conversation should focus on:
- hiring use case
- hiring motion or scale
- urgency or timeline
- readiness to talk to a specialist

What we should avoid in the MVP:
- budget-first questions
- obvious authority questions
- back-to-back sales qualification

## Visible layer vs hidden layer

### Visible conversation
What the user experiences:
- useful answers
- lightweight follow-up questions
- reflection and guidance
- next best step

### Hidden decisioning
What the system tracks:
- intent
- hiring use case
- hiring complexity
- readiness
- routing outcome

This separation matters because the prototype should feel helpful on the surface while still proving business value underneath.

## Conversation policy
For each turn, the assistant should:

1. Respond to the user's question or goal directly.
2. Update its understanding of the user's context.
3. Choose the next best move:
   - educate
   - clarify
   - suggest a specialist
   - redirect

## Recommended outcomes
The MVP should guide toward a small set of outcomes:
- `Explore`
- `Qualified for specialist handoff`
- `Lower-touch / self-serve`
- `Redirect / wrong intent`

## Pricing stance
Pricing should be guide-first.

That means:
- answer pricing questions at a high level
- explain that exact pricing depends on context
- use pricing as a fit-discovery moment
- do not force a handoff just because pricing came up

## Booking stance
Booking should start from chat, but the scheduling UI should not live inside chat bubbles.

Recommended pattern:
- assistant recommends a specialist inside chat
- desktop expands into an attached booking panel
- mobile replaces the chat body inside the same panel
- booking feels like a concierge recommendation card, not a full calendar app

## Working decisions
- Start generic, then narrow.
- Answer before asking.
- Keep in-chat qualification to roughly 2 to 3 questions max.
- Keep BANT mostly hidden.
- Use lightweight personalization.
- Let booking feel earned.

## UX implications
- The first turns should build trust, not feel extractive.
- The assistant should feel more like a product guide than a chatbot or SDR script.
- The conversation should adapt without feeling open-ended in a fragile way.
- Wrong-intent users should still feel helped.

## System implications
- The MVP can stay state-driven and scripted.
- We only need a small hidden state model.
- Free text can still map into bounded outcomes.
- Routing should be driven by user signal, not just turn count.

## What success looks like
This strategy is working if:
- the assistant feels more helpful than a static form
- qualification feels natural instead of form-like
- the user understands why a specialist would help
- the handoff feels earned, not forced
