# MVP Spec

## Purpose of this document
This document defines what the prototype should include for the first realistic, shareable version of AI Concierge. It is not a production requirements doc. It is meant to help us stay aligned on scope, core flows, and what we need to fake versus simulate realistically.

## What we are trying to prove
This prototype should help stakeholders react to a clear product idea:

Instead of sending a high-intent visitor to a static `Contact Sales` form, LinkedIn could use an AI Concierge to:
- help them understand LinkedIn Recruiter
- answer basic questions
- gather a small amount of qualifying information
- guide them toward booking time with sales

## Prototype principles
- The prototype should feel believable and polished.
- The prototype does not need real backend systems.
- We should prioritize clarity of flow over technical completeness.
- We should fake anything that is expensive or unnecessary for stakeholder feedback, as long as the experience still feels realistic.

## Intended audience for the prototype
- PMs
- Design partners
- Engineering stakeholders
- Sales or GTM stakeholders reviewing the concept

## Primary user
A high-intent prospect exploring LinkedIn Recruiter who wants to understand whether it is relevant for their hiring needs.

## MVP promise
If a user is interested in LinkedIn Recruiter, this experience should make it easier for them to:
- learn what the product is
- ask a few questions
- feel guided instead of dropped into a static form
- reach a realistic meeting-booking outcome

## In scope
- A landing page that introduces LinkedIn Recruiter and leads into the AI Concierge experience
- A `Contact Sales` trigger that opens the AI chat panel
- A chat experience that can:
  - greet the user
  - answer common Recruiter-related questions
  - ask a small number of qualification questions
  - move the user toward a meeting-booking outcome
- A happy-path meeting booking flow
- A small number of realistic alternate paths for users who are not ready to book immediately

## Out of scope
- Real production AI behavior
- Real authentication
- Real database storage
- Real CRM integration
- Real lead scoring
- Real calendar integration
- Real sales routing logic
- Real omnichannel follow-up
- Full global/regional complexity
- Full support flow coverage

## Recommended prototype approach
For this prototype, the best approach is to simulate intelligence rather than build true end-to-end systems.

### AI behavior
The AI should be mostly scripted or state-driven, with responses that feel smart and contextual. It does not need to be genuinely intelligent in the production sense. What matters is whether the conversation feels plausible and useful.

### Auth
Real sign-in is not required for this prototype. If we want to show personalization, we can fake it in one of these ways:
- assume the user is known and prefill a sample name/company
- let the user pick from a simple “demo persona”
- use a lightweight mock state inside the prototype

### Database
A real database is not required. Prototype state can live in local component state or hardcoded mock data. If we need to preserve conversation state during a session, that can still be faked locally.

### Booking
A real calendar system is not required. The prototype can end with:
- a realistic confirmation screen
- a fake calendar picker
- a “meeting booked” success state

## Core flows we need to support

### Flow 1: Landing page to chat entry
1. User lands on the LinkedIn Recruiter microsite
2. User scans the page and understands the main value proposition
3. User clicks `Contact Sales`
4. AI Concierge opens in the bottom-right chat panel

### Flow 2: Learn + qualify + book
1. AI welcomes the user
2. User asks a question or states what they need
3. AI explains LinkedIn Recruiter in a concise, useful way
4. AI asks a few lightweight questions to understand fit and intent
5. AI suggests talking to sales
6. User books a meeting
7. User sees a clear success/confirmation state

### Flow 3: Curious but not ready
1. User opens chat
2. User asks exploratory questions
3. AI answers without pushing too hard into qualification
4. AI offers a soft next step, such as:
   - talk to sales
   - learn more
   - come back later

### Flow 4: Wrong intent
1. User asks for something outside the sales path
2. AI recognizes the mismatch
3. AI redirects gracefully to a better-fit path, such as support or another destination

## Conversation requirements
The chat should not feel like a form with chat bubbles. It should feel like a helpful assistant that gradually learns enough to guide the user.

The conversation should include:
- a warm opening
- a clear explanation of LinkedIn Recruiter
- 2-4 lightweight qualification questions max in the MVP
- a clear transition into booking

The conversation should avoid:
- too many back-to-back data collection questions
- overly robotic BANT language
- feeling pushy too early
- making the user repeat information unnecessarily

## Content requirements
The prototype should help answer basic questions like:
- What is LinkedIn Recruiter?
- Who is it for?
- How can it help a hiring team?
- Why would I talk to sales instead of just browsing?

The booking push should feel earned. The user should understand why sales is the right next step before the prototype asks them to schedule time.

## UX priorities
- The experience should feel faster and more helpful than a static form
- The user should always know what is happening and what the next step is
- The first few messages should build trust quickly
- The booking moment should feel like progress, not a handoff failure
- The prototype should be easy to demo without needing perfect user input

## System assumptions for the prototype
- Use hardcoded or mocked content where needed
- Use fake personas or sample data instead of real identity
- Use deterministic conversation paths instead of real AI reasoning
- Use a fake booking flow instead of real scheduling
- Do not block progress on backend setup unless it directly improves the demo

## MVP requirements checklist
- Landing page exists and feels polished
- `Contact Sales` opens the chat panel
- Chat can answer a few Recruiter questions
- Chat can collect a few meaningful inputs
- Chat can steer the user toward booking
- Booking success state exists
- At least one non-happy-path state exists

## What success looks like for this prototype
- Stakeholders understand the concept quickly
- The prototype feels realistic enough to react to
- Reviewers can discuss flow, trust, usefulness, and business value
- We can gather feedback on whether AI Concierge is a better first step than a static form

## Open questions
- How educational should the AI be before it starts qualifying?
- How much personalization do we want to fake in the first prototype?
- Should the first demo feel more like a sales assistant or more like a product guide?
- Do we want the booking step to be fully embedded in chat or shown as a separate panel/screen?
