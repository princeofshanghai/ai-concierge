# Stakeholder Talk Track

Use this as a private speaker-notes doc alongside:
- [public/stakeholder-notes-slides.html](/Users/chhu/cursor-projects/ai-concierge/public/stakeholder-notes-slides.html)

Recommendation:
- keep the slides clean
- keep the speaking notes in this file
- if needed, put this on a second monitor or split screen while presenting

## Slide 1: Overview
Short version:
- This is an AI Concierge for the LinkedIn Hire experience.
- It is a guided experience that feels consultative to the user while qualifying and routing behind the scenes.

What to emphasize:
- not “AI for the sake of AI”
- better user guidance
- better lead routing
- one experience serving both user value and business value

## Slide 2: Design Principles
Short version:
- qualify without feeling like a form
- start broad, then narrow
- make the next step feel earned

What to emphasize:
- the user should feel guided by a product consultant, not interrogated by a lead form
- we still care about qualification, but we infer it through natural conversation
- the same conversation framework can later route to AE, SDR, lower-touch, or redirect

## Slide 3: Persona
Short version:
- Jamie Chen is our default walkthrough persona
- Director of Talent Acquisition at Northstar Health
- leading hiring across a 1,200-person healthcare software company
- needs help figuring out which hiring solution fits a team hiring across multiple functions, including harder-to-fill roles
- high intent, but not fully decided
- skeptical of anything that feels like a disguised lead form

What to emphasize:
- this is a demo persona, not the entire market
- Jamie is senior enough to be commercially relevant
- but still hands-on enough that product questions feel natural
- Northstar Health is large enough that the problem is meaningful, but still small enough that a web-to-conversation journey feels plausible

## Slide 4: JTBD
Short version:
- As a hiring leader, I’m struggling with hard to fill roles and want to understand what LinkedIn solutions are right for my team.

What to emphasize:
- this aligns directly to the happy path we built
- the user is looking for clarity, not just a demo
- the assistant’s job is to help them get to a better decision, not just push them to sales
- a representative conversation can still be the right outcome, but it should feel relevant and earned

## Transition Into The Happy Path
Suggested setup line:
- “From here, I’ll show the primary happy path we designed around that job to be done.”

## Happy Path Click Sequence
1. `Use LinkedIn profile`
2. `We’re not sure which hiring solution fits`
3. `We hire consistently across teams`
4. `Engineering and product`
5. `Talk to a Recruiter representative`
6. `Book meeting`
7. pick a date and time
8. `Confirm time`

## What To Say During The Happy Path
### Welcome screen
- We intentionally do not jump straight into a form.
- This creates a softer on-ramp.
- It explains why we need a little context first.
- It also gives us enough information to personalize the conversation.

### Intro message
- The intro is broad on purpose because this lives on `/hire`, not a Recruiter-only page.
- We want to position the assistant as a hiring-solutions guide first.
- It should feel capable, but not overly scripted.

### Suggested prompts
- These are starting situations, not routing choices.
- They reduce blank-state anxiety.
- They also give us the first hidden signal about what kind of help the user needs.

### Middle questions
- The next questions are there to diagnose hiring motion and role complexity.
- This is where we’re learning “What kind of hiring problem is this?”
- We’re helping and qualifying at the same time, but not in an obvious BANTy way.

### How BANT fits
- Need is the strongest signal and comes through most clearly.
- Authority is mostly inferred from role and company context.
- Timeline shows up later through urgency and next-step behavior.
- Budget stays soft through pricing interest.
- So BANT is there, but it’s hidden inside a more natural product-guidance conversation.

### Recommendation + handoff
- We only introduce Recruiter after the assistant has enough context to earn it.
- We also added a bridge step before booking so the handoff doesn’t feel abrupt.
- That bridge gives the user one more choice: see times or keep exploring.

## Important Accuracy Note
The current booking prototype is a representative-booking pattern, not yet a fully explicit AE-only route.

Good phrasing:
- “This shows the human-handoff pattern for a high-intent path.”

Avoid saying:
- “This is already the final AE routing logic.”

## If Stakeholders Ask About The Bigger Model
You can say:
- the long-term model has five possible end states
- AE booking
- SDR live handoff
- SDR booking
- lower-touch recommendation
- redirect

And:
- “The key idea is that we’re not designing five unrelated chats. We’re designing one guided conversation that can route to different next-step surfaces.”
