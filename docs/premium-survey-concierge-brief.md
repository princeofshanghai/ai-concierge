# Premium Survey AI Concierge Brief

## Goal

Create an internal-only prototype for adding AI Concierge to LinkedIn Premium's survey page.

The goal is to quickly compare different concierge conversation styles, not to build production-ready architecture.

## Agreed Direction

- Stay in this repo for speed.
- Add a separate Premium survey prototype route instead of modifying the current recruiter prototype in place.
- Reuse the existing AI Concierge side-panel UI.
- Keep the survey page mostly static but believable.
- Treat the survey as the entry point only. The AI chat does not read or use survey answers in this prototype.

## Entry Pattern

- Show a blue floating action button in the bottom-right corner of the survey page.
- Clicking it opens the AI Concierge side panel over the survey.
- The survey remains visible behind the panel.

## Internal Review Controls

- Use one Premium survey prototype route with a page-level internal switcher.
- Candidate mode should live in the URL:
  - `?candidate=1`
  - `?candidate=2`
- Launcher mode can also live in the URL:
  - `?launcher=bubble`
  - `?candidate=3` as a shortcut for Candidate 3
- Keep the switcher outside the chat UI by reusing the prototype shell pattern.
- Switching candidates should reset any open chat or plan-detail state so each review starts clean.

## Default Persona

- Persona name: `Alex Kim`
- Persona: founder of a startup with 10 employees

## Candidate Prototypes

### Candidate 1: Proactive SKU Recommendations

- Assumes hidden user signals already exist.
- AI opens with a more personalized first message.
- Show 1 primary recommendation first.
- Show 2 secondary recommendations below it.
- Default ranking direction:
  - `All-in-one`
  - `Business`
  - `Recruiter Lite`

### Candidate 2: Consultative Q&A + Guided Conversion

- AI opens as a general assistant.
- Use clickable prompt chips for both user turns.
- Keep the flow to 2 user responses:
  - AI welcome
  - user chooses a goal
  - AI asks a follow-up question
  - user chooses a priority
  - AI gives a recommendation
- Default first-turn directions:
  - `Find clients and leads`
  - `Grow my network`
  - `Hire the right people`
  - `Build my brand`
- Follow-up chips should narrow the main goal instead of collecting detailed profile data.
- Final recommendation should feel earned and slightly shift based on the selected path.

### Candidate 3: Proactive Bubble Messaging

- One bubble-copy experiment only.
- This is an entry variation layered on top of Candidate 1, not a fully separate chat model.
- Proposed default bubble copy: `Find the right Premium plan`
- Internal review behavior:
  - Candidate 3 keeps Candidate 1 as the underlying conversation mode.
  - Only the launcher changes from the default FAB to a bubble + FAB entry treatment.

## Plan Detail Panel

- Reuse the existing booking side-panel pattern.
- Replace booking content with plan-detail content.
- Keep the recommendation flow inside the AI Concierge panel.
- Open the plan detail side by side with chat, using the existing close/back affordance.
- Keep the panel concise and balanced between AI-tailored guidance and product detail.
- Use this section structure:
  - plan name + positioning line
  - `Why this fits you`
  - `What you get`
  - offer + CTA
- Include one CTA only:
  - `Redeem 1 month for $0`
- CTA leads to a generic placeholder checkout page.
- Product copy now comes from `docs/premium-plan-copy-reference.md`.

## SKU Set

- `Career`
- `Business`
- `All-in-one`
- `Sales Navigator Core`
- `Recruiter Lite`

## Pricing and Trial Assumptions

- Free trial is available to everyone in the prototype.
- Trial language: `Redeem 1 month for $0`
- Monthly prices:
  - `Career`: `$19.99`
  - `Business`: `$44.99`
  - `All-in-one`: `$74.99`
  - `Sales Navigator Core`: `$89.99`
  - `Recruiter Lite`: `$139.99`

## Prototype Simplifications

- No real personalization logic.
- No real survey-to-chat data passing.
- No voice mode, dictation, or phone-call request UI in the Premium survey variant.
- One generic placeholder checkout template.
- Premium survey background can be static for now.
- Candidate 1 recommendation cards use the whole card as the tap target rather than an in-card CTA button.
- Candidate 1 opener should frame the recommendation around the user's Premium needs before naming the top plan.
- Candidate 1 should not use a hardcoded intermediary label between the top recommendation and narrower alternatives.
- Candidate 2 should stay chip-driven rather than relying on freeform intelligence for the prototype.

## Current Open Items

- Plan-detail panel screenshot and exact content
- Any final copy tweaks for Candidate 1 and Candidate 2
- Any screenshots or references for the Premium survey page shell

## Build Plan

1. Create a new Premium survey prototype page shell.
2. Add the bottom-right floating AI entry point.
3. Reuse the existing AI Concierge panel for Premium-specific flows.
4. Implement Candidate 1 and Candidate 2 as separate conversation variants.
5. Implement Candidate 3 as a bubble-copy entry variant for Candidate 1.
6. Reuse the side-panel pattern for plan details.
7. Add a generic placeholder checkout page.
