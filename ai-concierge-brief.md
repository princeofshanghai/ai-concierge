# AI Concierge — Project Brief

Context for an agent starting on a fresh rebuild of this prototype. This file is a product brief, not an implementation guide. Design system, tech stack, and prior code are intentionally left out so the new project can decide those fresh.

## What this is
**AI Concierge** is a prototype conversational layer for the **LinkedIn Hiring solutions marketing site** — the public-facing site where businesses learn about LinkedIn's hiring products and decide whether to talk to sales. See the real product lineup at [business.linkedin.com/hire/product-overview](https://business.linkedin.com/hire/product-overview).

It replaces the static `Contact sales` form at the moment of highest intent with a guide-first AI conversation that helps visitors understand which LinkedIn hiring solution fits them, answers product and fit questions, and routes them to the right next step.

It is a **scripted, state-driven prototype** — not production AI. The goal is to pressure-test the experience pattern, not the model.

## Scope
The concierge only talks about **LinkedIn Hiring solutions**. It does not cover LinkedIn's other business lines (Learning, Sales, Marketing, Premium, etc.). Off-topic questions should be politely redirected.

The hiring product lineup the concierge needs to understand:

**Top products**
- **LinkedIn Recruiter + Hiring Assistant** — the enterprise hiring platform with agentic AI, for recruiters who hire consistently and need advanced sourcing, automation, and ATS integrations.
- **LinkedIn Hiring Pro** — the hiring tool built for people who aren't recruiters, for occasional hiring where the user still needs a qualified shortlist fast.
- **LinkedIn Career Pages** — a media-rich company page for brand awareness, storytelling, and spotlighting open roles.

**Additional products** (reference only; less prominent in early conversations)
- Job Slots, Recruiter Lite, Talent Insights, Hiring Integrations, Landing Pages.

## Why it exists
- The hiring site is one of LinkedIn's most valuable demand surfaces, yet it meets its highest-intent visitors with a form.
- The current Contact Sales form is abandoned often, slow to respond, and signals that LinkedIn is behind on AI-led guidance.
- Visitors often can't tell which hiring product fits them (Recruiter vs. Hiring Pro vs. something lighter), so they bounce or submit a form without really knowing what they need.
- A helpful first conversation can improve trust, improve lead quality, and make every visitor's next step clearer — including visitors who shouldn't be routed to sales at all.

## Core idea
The concierge should feel like a **product consultant that earns the right to qualify**.
- Generic at entry → diagnostic in the middle → specific by the later turns.
- Helpful on the surface. Qualifying underneath.

## Three design principles
The visitor-facing rules. Every screen and every turn should be defensible against these.

1. **Heard, not qualified.** Behind the scenes, the concierge qualifies. On the surface, it helps. Visitors answer because it sharpens the next answer, not because we asked them to submit.
2. **Help first, then commit.** Lead with help. Ask one gentle question at a time. When the fit is clear, commit to a specific next step — never offer a menu in place of a recommendation.
3. **Every route is a good route.** Sales meeting, direct purchase, or helpful redirect. Every visitor leaves with a clear next step, not a dead end.

## Primary persona
**Jamie Chen** — Director of Talent Acquisition at **Northstar Health**, a ~1,500-person digital health company that just closed a funding round. Leads a team of 8 recruiters. Hiring plan: ~40 roles in 2 quarters, already slipping.

**Mindset:**
- High intent, not fully decided.
- Open to learning, but time-pressured.
- Willing to answer questions *if* they clearly improve the recommendation.
- Skeptical of anything that feels like a disguised lead form.
- Not trying to avoid sales, but not ready for a discovery call before knowing if the product fits.

**JTBD:** *"As a talent leader under pressure to hire faster, I want to quickly understand which LinkedIn hiring solution fits my team's situation, so I can take the right next step with confidence — whether that means exploring on my own or talking to a rep who already knows my context."*

Jamie is a buyer-influencer, not the final signer. The persona is deliberately problem-led ("my team is behind") rather than product-led ("I want Recruiter").

## Hidden qualification: BANT, quietly
The system qualifies in the background using a BANT-style model, but the **user never sees it**.

- **Need** — strongest signal. Captured through starting situation, hiring motion, use case, complexity.
- **Authority** — inferred from onboarding context (role, company, seniority).
- **Timeline** — inferred from urgency language and next-step behavior.
- **Budget** — stays soft through pricing interest. Never asked directly.

Rules:
- The assistant should never visibly "complete BANT." Two strong signals are usually enough to route well.
- The visible conversation is guidance, diagnosis, recommendation, next step. The BANT interpretation stays hidden.
- If the experience ever feels like a form in disguise, the hidden layer has leaked into the visible one.

### Lead vs. MQL (and why the distinction matters)
Two terms worth keeping straight, because they shape how the routing model maps to sales outcomes:

- **Lead** — a visitor whose contact info has been captured. Happens at onboarding/prefill, before any qualification. Giving contact info is *capture*, not *qualification*.
- **MQL (Marketing Qualified Lead)** — a lead that marketing has judged worth sales time based on fit and intent. In this prototype, the concierge's hidden BANT-style work *is* the MQL decision.

Mapping to the routing model below:
- **High-value route → strong MQL.** Sales-ready, handed to an AE.
- **Medium-value route → MQL.** Fit is there, SDR engages.
- **Low-value route → Lead, not an MQL.** Captured, but marketing is saying "not worth sales time right now." Still a successful outcome (Principle 3) — just not an MQL.

Implication: "Every route is a good route" does not mean "every route produces an MQL." The prototype's business case is **better MQL quality, not more leads** — plus a respectful experience for the leads that aren't MQLs.

## Three-tier routing model
Routing is multi-outcome, not "book a meeting or nothing." Internally, every visitor is sorted into one of three value tiers. These tier names (`high`/`medium`/`low value`) and the roles (`AE`/`SDR`) are **internal language only** — the user never sees them. **"Representative"** is the user-facing umbrella term.

| Tier | Who they talk to | How it plays out | Outcome |
|---|---|---|---|
| **High value** | AE (Account Executive) | Book a meeting with an AE. | Strong MQL, sales-ready. |
| **Medium value** | SDR (Sales Development Rep) | If an SDR is online → live chat in-thread. If not → schedule a meeting with an SDR. | MQL, SDR engages. |
| **Low value** | No rep | Point to helpful links and resources (e.g. posting a job directly, relevant product pages, case studies, learning resources). | Lead, not an MQL. |

Key points for the rebuild:

- **The medium-value tier is one conceptual route, not two.** Talking to an SDR is the outcome. Live chat vs. scheduled meeting is a surface-level detail driven by SDR availability, not a choice the user makes up front. This is a deliberate correction from earlier versions of this project.
- **Low value means "wrong fit for now,"** not "no intent" or "bad visitor." The concierge should still feel helpful and leave the door open for the visitor to come back later. Framing follows Principle 3: recommend resources as *the best fit for their situation*, never as a downgrade or rejection.
- **Direct purchase (e.g. "post a job yourself," Recruiter Lite) lives inside low-value resources.** It is one of several helpful links the concierge can surface, not its own tier.
- **Low value is intentionally loose right now.** What exactly lives in the resource set (which pages, which nurture paths, when to suggest what) is an open design question for this rebuild.

## What the prototype should prove
That LinkedIn can replace a static Contact Sales form with a product consultant that:
- diagnoses fit through natural conversation, not form fields,
- commits to a specific next step when fit is clear (no "would you like to book?" in front of a recommendation),
- and respects every visitor with a useful next step — including the ones who shouldn't be sold to.

## In scope / out of scope for the rebuild

**In scope**
- A marketing landing context for LinkedIn Hiring solutions, with entry from sales CTAs.
- A light onboarding / prefill step before chat.
- A guide-first chat that greets with context, orients the user, answers fit questions about the hiring products, asks lightweight follow-ups, narrows to a likely-fit product, and commits to a next step.
- Representative handoff flows for the three tiers: AE booking (high value), SDR live chat or scheduled meeting (medium value), and a helpful-resources path (low value).
- A believable booking flow (for AE and SDR scheduled meetings).
- Graceful handling of curious-but-not-ready, pricing interest, off-topic, and wrong-fit visitors.

**Out of scope**
- Any LinkedIn business line other than Hiring solutions.
- Real production AI behavior.
- Real auth, CRM, calendar, or lead scoring.
- Real SDR/AE availability systems.
- Full regional / market complexity.

## Tone and stance (read before writing copy)
- Consultative, not salesy.
- Educate while qualifying. Never pause education to interrogate.
- One gentle follow-up at a time. No stacked questions.
- Chips where the answer is genuinely bounded or the user is making a branch decision. Open text everywhere else (especially diagnostic turns like "what kind of roles?").
- At the recommendation moment, commit. Don't ask permission to recommend.
