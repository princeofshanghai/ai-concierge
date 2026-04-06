# Persona

## Purpose of this document
This document captures the current target user framing and the primary demo persona for the AI Concierge MVP.

It complements:
- [project-overview.md](project-overview.md), which explains the overall product concept
- [mvp-spec.md](mvp-spec.md), which defines the prototype scope
- [conversation-strategy.md](conversation-strategy.md), which defines how the assistant should behave in conversation
- [conversation-blueprint.md](conversation-blueprint.md), which defines the concrete MVP chat flow for this persona

This document is meant to give the team a concrete person to design around and a believable story to use when walking through the experience for feedback.

## Important distinction
For this project, we should separate:
- the target user, which is the broader audience the product is for
- the demo persona, which is the single example person we use to make the prototype feel concrete and coherent

The target user should stay broad enough to reflect the real opportunity. The demo persona should be specific enough that every screen, question, and recommendation has a reason to exist.

## Target user
The target user for the MVP is:

- a hiring decision-influencer at a mid-market or enterprise company
- actively evaluating how to hire more effectively
- interested in LinkedIn Recruiter, but not necessarily ready to talk to sales immediately
- looking for guidance, product clarity, and the right next step

This user may be:
- a recruiter
- a recruiting manager
- a director of talent acquisition
- a talent leader who is exploring tools on behalf of a broader hiring organization

## Primary demo persona

### Snapshot
- Name: Jamie Chen
- Role: Director of Talent Acquisition
- Company: Northstar Health
- Company type: Healthcare software / digital health
- Company size: About 1,200 employees
- Team: Leads a team of 8 recruiters
- Region: United States

### Hiring context
- Northstar Health is planning to hire roughly 25 to 35 roles over the next 2 quarters.
- The team is hiring across engineering, product, sales, and customer success.
- Jamie's team already uses LinkedIn Jobs, referrals, and an ATS.
- The biggest pain point is proactive sourcing for harder-to-fill roles, especially specialized roles.

### Buying context
- Jamie is senior enough to evaluate solutions and recommend a direction.
- Jamie is likely not the only approver and may still need VP People, finance, or procurement sign-off.
- Jamie is a credible buyer-influencer, not just an end user and not necessarily the final signer.

## Why this persona is the right fit
This persona is a strong default for the MVP because:

- Jamie is senior enough that a sales conversation feels justified.
- Jamie is still close enough to the hiring work that product questions feel natural.
- The hiring need is meaningful and urgent without turning the story into a complex enterprise procurement flow.
- The scenario makes it believable for the user to want both product education and tailored guidance.

## Why this company profile works
Northstar Health works well as a demo company because it is:

- large enough that hiring pain is real
- small enough that a web-to-conversation journey still feels plausible
- broad enough in hiring needs to justify LinkedIn Recruiter
- specific enough to make the story memorable

Using a healthcare software company is also more flexible than using a hospital or clinical staffing scenario, which could introduce extra ambiguity about whether the prototype is really about LinkedIn Recruiter fit.

## What Jamie is trying to figure out
Jamie is not looking for a generic sales pitch.

Jamie is trying to understand:
- what LinkedIn Recruiter actually helps with
- how it differs from LinkedIn Jobs
- whether it would help the team fill harder-to-fill roles more effectively
- whether the value is strong enough to justify talking to a representative

## Likely mindset when entering the flow
Jamie is:
- high intent, but not fully decided
- open to learning
- somewhat time-constrained
- willing to answer a few questions if they clearly improve the recommendation
- likely skeptical of anything that feels like a disguised lead form

## Example opening questions Jamie might ask
- What is LinkedIn Recruiter?
- How is Recruiter different from LinkedIn Jobs?
- Would this actually help with specialized hiring?
- Is this meant for teams like mine, or mostly for large enterprises?
- Can I see whether this would fit before talking to sales?

## Why not other default personas

### Not an individual recruiter
An individual recruiter is realistic from a usage perspective, but may be less convincing as the primary sales-oriented demo persona because they are often not the buyer or recommender.

### Not a VP or Head of People
A VP or Head of People is credible as a buyer, but can feel less believable as someone browsing a microsite and asking foundational product questions.

### Not a very small startup founder
A startup founder can make the experience feel more self-serve and reduce the case for guided qualification and sales handoff.

### Not a very large Fortune 100 buyer
A very large enterprise buyer raises expectations around existing account teams, procurement, and relationship-based selling that the MVP does not need to simulate.

## How to use this persona in design reviews
When walking through the prototype, we should frame the story like this:

- Jamie lands on the LinkedIn Recruiter microsite because the team is actively hiring and is struggling with proactive sourcing.
- Jamie is interested, but not ready to jump straight into a sales conversation.
- Jamie opens AI Concierge to understand whether Recruiter fits the team's hiring needs.
- The assistant helps Jamie learn, asks a few lightweight follow-ups, and earns the right to recommend a conversation with a representative.

## Working decisions
- Use Jamie Chen as the default walkthrough persona.
- Keep Northstar Health as the default company.
- Frame Northstar Health as a healthcare software or digital health company.
- Treat Jamie as a buyer-influencer rather than the final decision maker.
- Use this persona as the reference point for the first conversation blueprint and demo flow.

## Open questions
- Do we want a second alternate persona later for a lower-intent or wrong-intent path?
- Should the prototype visibly acknowledge Jamie's role and company in the first chat message, or keep the opening more neutral?
