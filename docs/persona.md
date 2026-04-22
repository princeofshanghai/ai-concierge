# Persona

## Purpose of this document
This document captures the current target user framing and the primary demo persona for the AI Concierge MVP.

It complements:
- [project-overview.md](project-overview.md), which explains the overall product concept
- [conversation-blueprint.md](conversation-blueprint.md), which defines how the conversation works and why

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

## Primary JTBD
The job-to-be-done for this user, stated from their perspective:

> As a talent leader under pressure to hire faster, I want to quickly understand which LinkedIn hiring solution fits my team's situation, so I can take the right next step with confidence, whether that means exploring on my own or talking to a rep who already knows my context.

### Why this JTBD is scoped this way
- It is problem-led, not product-led. Jamie is not starting with "I want LinkedIn Recruiter." She is starting with "my team is behind on hiring."
- It keeps multiple outcomes valid. Self-serve exploration and talking to a representative are both legitimate next steps, which maps to the full routing model.
- It reframes the sales conversation as valuable, not as friction. The concierge is not helping users avoid reps. It is helping reps walk into warmer, more qualified conversations.
- It stays focused on the target user. Wrong-intent visitors are handled by the routing model, not by stretching the JTBD.

## Primary demo persona

### Snapshot
- Name: Jamie Chen
- Role: Director of Talent Acquisition
- Company: Northstar Health
- Company type: Healthcare software / digital health
- Company size: About 1,500 employees
- Stage: Recently closed a new funding round, actively scaling
- Team: Leads a team of 8 recruiters
- Region: United States

### Hiring context
- Northstar Health is planning to hire about 40 roles over the next 2 quarters, driven by the new funding round.
- The hiring plan is already slipping. The team is behind, and the pressure is real.
- The team is hiring across engineering, product, sales, and customer success.
- Jamie's team already uses Hiring Pro, referrals, and an ATS.
- The biggest pain point is proactive sourcing for harder-to-fill roles, especially specialized ones like ML engineering, clinical informatics, and enterprise sales.

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
- how it differs from Hiring Pro
- whether it would help the team fill harder-to-fill roles more effectively
- whether the value is strong enough to justify talking to a representative

## Likely mindset when entering the flow
Jamie is:
- high intent, but not fully decided
- open to learning
- under real time pressure, with a hiring plan that is already slipping
- willing to answer a few questions if they clearly improve the recommendation
- likely skeptical of anything that feels like a disguised lead form
- not trying to avoid sales, but not ready to sit through a discovery call before knowing if the product fits

## Example opening questions Jamie might ask
- What is LinkedIn Recruiter?
- How is Recruiter different from Hiring Pro?
- Would this actually help with specialized hiring?
- Is this meant for teams like mine, or mostly for large enterprises?
- Can I see whether this would fit before talking to sales?

Product names follow [conversation-language-rules.md](conversation-language-rules.md). Avoid legacy names like "LinkedIn Jobs" even in reference copy.

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
- The assistant helps Jamie learn, asks a few lightweight follow-ups, and commits to a specific recommendation once the fit is clear, rather than asking Jamie to pick from a menu of options.

## Working decisions
- Use Jamie Chen as the default walkthrough persona.
- Keep Northstar Health as the default company.
- Frame Northstar Health as a healthcare software or digital health company at about 1,500 employees.
- Anchor the demo story in a recent funding round, a ~40-role hiring plan, and a team that is already behind.
- Treat Jamie as a buyer-influencer rather than the final decision maker.
- Use this persona as the reference point for the first conversation blueprint and demo flow.
- Use the JTBD statement above as the single-sentence framing for executive walkthroughs.

## Open questions
- Do we want a second alternate persona later for a lower-intent or wrong-intent path?
- Should the prototype visibly acknowledge Jamie's role and company in the first chat message, or keep the opening more neutral?
