# Demo Framing

## Purpose
Presentation outline and talking points for the AI Concierge executive walkthrough. Use this as a guide when building slides.

Related docs:
- [persona.md](persona.md): full persona and JTBD rationale
- [project-overview.md](project-overview.md): overall product concept
- [routing-outcomes-worksheet.md](routing-outcomes-worksheet.md): the five hidden routing outcomes
- [conversation-scripts.md](conversation-scripts.md): canonical copy for all five demo routes (every bubble, chip, and artifact). This is the prototype's source of truth for words — use it when rehearsing what Jamie types and what the concierge says.
- [conversation-blueprint.md](conversation-blueprint.md): the principles behind the conversation shape (why each bubble exists, chip policy, opening pattern).
- [conversation-system-prompt.md](conversation-system-prompt.md): external reference for the production AI prompt. The prototype deliberately differs from this in a few places (proactive routing, pricing handling). Do not edit.

## Audience
Primary audience: product leadership.

This exec is known to:
- decide quickly in the first 2 minutes whether the problem is framed well
- prefer the bold version stated first, constraints second
- expect every design decision to be tied to a behavior hypothesis, not taste
- prefer depth on 1-2 decisions over a wide tour
- push hard on strategy if problem framing feels loose
- ask what every number on screen connects to

The presentation and demo are structured around these expectations.

## Time budget
- Presentation: 5 to 10 minutes
- Prototype demo: 40 to 50 minutes, structured around two flagship flows

## Presentation flow
1. Problem
2. Today on `/hire`
3. Solution
4. Persona and JTBD
5. Design principles
6. [Demo: Flow 1 then Flow 2, each with one deep decision]
7. What this should move

Principles are placed right before the demo on purpose, so the audience walks into the demo with a critical framework to watch through.

---

## Slide 1: Problem

### On the slide
A short opener line establishing scale, followed by one strong heading that delivers the contrast. Minimal. Let it breathe.

*$1.3B in annual bookings. LTS is 69% of web conversions from the Lobby.*

**Yet LinkedIn meets its highest-intent `/hire` visitors with a static form.**

Cite the motivation stats in small text on the slide.

### Talking points
- Marketing Websites are one of LinkedIn's most valuable demand surfaces. $1.3B in annual bookings, 20 microsites, 33 regions.
- Within that, `/hire` is 69% of web conversions from the Lobby. Hiring is our single biggest lever.
- And yet, at the moment of highest intent, the way we meet those visitors is a static Contact Sales form.
- That is the disconnect this prototype addresses. The problem is not a UX complaint about forms. It is a business problem about what LinkedIn loses at the moment of highest intent.

---

## Slide 2: Today on `/hire`

### On the slide
Two columns. Stats on the left, screenshot of the current Contact Sales form on the right.

**Left column, four bullets:**
- 55% of visitors abandon the form before submitting
- 10x less likely to convert when response takes longer than 5 minutes
- Sales time wasted on low-intent while high-intent cools off
- AI-led guidance is now table stakes; a static form signals lag

**Right column:** screenshot of the current `/hire` Contact Sales form.

Cite all stats in small text on the slide.

### Talking points
- These are the concrete consequences of the disconnect. Each bullet is a different axis of the same loss: conversion, speed, sales capacity, market positioning.
- The last bullet is the "why now." A static form at the moment of intent now reads as "LinkedIn is behind," not just "LinkedIn is cautious."
- The screenshot is here on purpose. This is the actual artifact that greets visitors today. Seeing it alongside the numbers makes the disconnect impossible to miss.

---

## Slide 3: Solution

### On the slide
**The bold version**
> Replace the Contact Sales form with a product consultant that earns the right to qualify and routes every visitor to the right outcome, from a booked AE meeting to a self-serve purchase.

Keep the slide clean, one strong sentence.

### Talking points
- The bold version first: this is what AI Concierge could be at full scale on `/hire`.
- Today's walkthrough is a prototype focused on two flagship flows. The prototype is scripted and state-driven, not production AI.
- The two flows in the demo are deliberately chosen as the two extremes of the routing model: the highest-value handoff (book meeting with AE) and the lowest-touch outcome (direct online sales). Together they demonstrate the system's range.

---

## Slide 4: Persona and JTBD

### On the slide
**Persona**
Jamie Chen, Director of Talent Acquisition at Northstar Health. A ~1,500-person digital health company that just closed a funding round. Hiring ~40 roles in two quarters. Team is already behind.

**JTBD**
> As a talent leader under pressure to hire faster, I want to quickly understand which LinkedIn hiring solution fits my team's situation, so I can take the right next step with confidence, whether that means exploring on my own or talking to a rep who already knows my context.

### Talking points
- Jamie is a credible buyer-influencer, not the sole approver. Her hiring pressure is real and dated.
- She is not a LinkedIn Recruiter customer yet. Today she uses Jobs, referrals, and an ATS.
- The JTBD is problem-led, not product-led. She starts with "my team is behind," not "I want Recruiter."
- "Exploring on my own or talking to a rep" keeps multiple outcomes legitimate and previews the two flows we are about to demo.

---

## Slide 5: Design principles

### On the slide
Three cards, each a headline and one short line of supporting copy. Cover beginning, middle, and end of the visitor experience (qualification, conversation, routing).

1. **Heard, not qualified**
   Behind the scenes, the concierge qualifies. On the surface, it helps. Visitors answer because it sharpens the next answer, not because we asked them to submit.

2. **Help first, then commit**
   The concierge leads with help and asks one gentle question at a time. When the fit is clear, it commits to a specific next step instead of asking permission. Visitors see a recommendation, never a menu in place of one.

3. **Every route is a good route**
   Sales meeting, direct purchase, or helpful redirect. Every visitor leaves with a clear next step, not a dead end.

### Talking points
- These three principles are the lens to watch the demo through. Each covers a different part of the visitor experience:
  - Principle 1 is about how qualification *feels* to the visitor. If at any moment the demo starts feeling like a form in disguise, that is a failure of Principle 1.
  - Principle 2 is about the rhythm of the conversation AND the moment of recommendation. The concierge acknowledges, answers, and asks one gentle question when it needs context. When the fit is clear, it commits to a specific next step, not a "would you like to?" question and not a menu of options. If the demo ever feels interrogating OR ever asks permission at the moment it should commit, that is a failure of Principle 2.
  - Principle 3 is about the ending. Not every visitor gets a booked sales meeting, and that is by design. If any routing path ever feels like a rejection, that is a failure of Principle 3.
- All three principles describe what the visitor *experiences*, not what the system does under the hood. They are design principles, not implementation rules.
- The commit behavior on Principle 2 is concrete and demonstrable. In Flow 1, watch for the recommendation card appearing inline with a single "Get connected" CTA, no "would you like to book?" question in front of it. That card is the commit in action.

---

## Demo structure

Two flagship flows. One deep design decision per flow, presented with alternatives considered and a behavior hypothesis.

### Flow 1: Book meeting with AE (the bold path)

#### Happy path walkthrough
Walk through the full flow at normal pace:
- Jamie enters from the `/hire` Contact Sales CTA
- Light prefill or onboarding step
- Concierge opens with a guide-first conversation
- Concierge diagnoses fit and narrows to Recruiter
- Concierge recommends a representative
- Matching state appears
- Booking surface opens
- Meeting is booked

#### Deep decision: Qualifying without a form

**The decision**
Gather qualification signals through natural conversation, not through explicit form fields.

**Alternatives considered**
- Structured multi-step form with smart defaults
- Pure open-ended chat with no guided prompts
- Progressive form that reveals fields based on earlier answers

**Why this direction won**
- A form still feels like a form, even if it is shorter or smarter
- Pure open chat puts all the work on the user and risks skipping signals the system actually needs
- The hybrid, guide-first pattern lets the assistant educate and qualify at the same time

**Behavior hypothesis**
> Users complete more qualifying signals when those signals arrive inside helpful dialogue than when the same signals arrive as form fields, even when total question count is the same.

**What to watch for in the demo**
- Moments where Jamie is being qualified without noticing
- The acknowledge-answer-ask rhythm: no stacked questions, no bare ones, one gentle follow-up at a time
- Suggested prompts that help the visitor move, never gate the conversation (the composer is always open to free typing)
- The commit moment: when the fit is clear, a recommendation card appears inline with a single "Get connected" CTA, no "would you like to book?" question in front of it
- The absence of form-field patterns

### Flow 2: Direct online sales (the lower-touch path)

#### Happy path walkthrough
Brief setup that this user's signals point to a different route. Walk through the flow at normal pace:
- Concierge diagnoses fit
- Concierge recognizes the situation does not warrant a sales conversation
- Concierge offers a direct purchase or lower-touch recommendation
- User converts into a purchase path without a rep handoff

#### Deep decision: Framing lower-touch as best fit, not as downgrade

**The decision**
When the system routes a user to a lower-touch path, the recommendation is framed as the best fit for their situation, not as "you don't qualify for sales."

**Alternatives considered**
- Route everyone to a rep by default, treat self-serve as a fallback
- Hide the self-serve option and only surface it after the user explicitly asks
- Surface self-serve as a neutral alternative, without a recommendation

**Why this direction won**
- Defaulting to a rep is greedy and erodes trust
- Hiding self-serve punishes users whose real fit is self-serve
- A neutral alternative is honest but passive; a recommendation is honest and helpful

**Behavior hypothesis**
> Users routed to lower-touch complete their next action at a higher rate when the routing is framed as a recommendation than when it is framed as a neutral alternative or a downgrade.

**What to watch for in the demo**
- The moment the concierge decides not to sell
- The tone of the recommendation
- Whether it feels like the system is respecting the user or brushing them off

---

## [Demo transition]

Short verbal segue:
> With that framing, let's watch Jamie go through the high-value path first, then look at what happens with a different visitor whose signals point elsewhere.

Then move into Flow 1, followed by Flow 2.

---

## Closing slide: What this should move

### On the slide
Four short lines:
- Better MQL quality, not just more leads
- Faster path from interest to qualified handoff
- Context preserved across handoff, so reps do not start from scratch
- Respect for users who are not a fit, so they still get a useful next step

### Talking points
- The headline business outcome is lead quality. When a rep conversation happens, the rep walks in with context and fit signals, not a cold form submission.
- The self-serve path is not a loss, it is a trust-preserving outcome that keeps `/hire` credible for everyone.

---

## Handling common questions

### "What about users who are not Jamie?"
The JTBD describes who we are designing for. The routing model describes how the system behaves across everyone who lands on `/hire`. Flow 2 in the demo is exactly this answer in action.

### "Isn't this just a prettier Contact Sales form?"
No. A prettier form would still be extractive. The concierge's job is to be useful first. In Flow 2 we explicitly show the system deciding not to sell, which no form does.

### "How real is the AI here?"
Scripted and state-driven, not production AI. The prototype is meant to pressure-test the experience pattern, not the model. Every line of copy in the demo is authored in [conversation-scripts.md](conversation-scripts.md), which is the prototype's source of truth. The production LLM will be guided by [conversation-system-prompt.md](conversation-system-prompt.md), which is an external reference from another team — the prototype deliberately diverges from it in a few narrow places (proactive routing at the commit moment, the pricing flow).

### "Why these two flows and not others?"
They are the two extremes of the routing model. Together they demonstrate that the system can handle both the highest-value path and the path where the system chooses not to sell. Everything in between is a variation of these two.

### "What behavior does this actually change?"
Each deep-decision section has an explicit hypothesis. That is the right unit of answer, not a dashboard of numbers. Production metrics require real traffic and real handoff infrastructure, which the prototype does not have.

---

## Pre-presentation checklist

Based on the exec's known preferences, verify before the session:

- Every stat on every slide has a visible source.
- Every number or count shown in the UI during the demo can be explained. If a count has no meaning, remove it.
- Every design decision in both flows can be defended with an alternative considered and a behavior hypothesis.
- The bold version is stated before any prototype caveats.
- The problem slide answers "what" and "why now" explicitly.
- The deep-decision sections can be entered in any order, in case the exec pushes into Flow 2 before Flow 1 finishes.

## Open items for later iteration
- Decide whether Flow 2 needs a brief alternative persona introduced at the start, or can be framed as "a different visitor" without a named persona.
- Add the actual `/hire` Contact Sales form screenshot on Slide 2. Placeholder reserved at `public/presentation/contact-sales-form.png`.
- Confirm Slide 5 uses the three-card layout from the existing template.
- Decide whether the closing slide stays qualitative or includes directional numbers.
