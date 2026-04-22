# Conversation Blueprint

## Purpose
This document defines how the AI Concierge conversation is *shaped* and *why*. It is the principles doc.

For the exact copy in each route (every assistant bubble, every chip, every artifact), see [conversation-scripts.md](conversation-scripts.md). This doc deliberately avoids duplicating that copy so there is only one source of truth for words.

Use this doc to answer:
- what the assistant should do in the first few turns
- why each message exists
- when to use chips vs open text
- how qualification and helpfulness work together
- how the visible conversation connects to hidden lead routing

For project context, BANT approach, and the routing model, see [project-overview.md](project-overview.md).
For product naming, topic boundaries, acronym handling, and the pricing prohibition, see [conversation-language-rules.md](conversation-language-rules.md). Those rules apply to all assistant copy and are not repeated here.

## Design rationale

### Conversation structure: the hybrid model
AI Concierge uses a hybrid model: suggested chips plus open text input.

- **Open field only** creates blank-canvas anxiety when users don't know what to ask.
- **Guided chips only** feels robotic and low-trust.
- **Hybrid** reduces anxiety while still respecting the user's own framing.

The guiding principle: chips reduce cognitive load at decision points; open text respects the user's framing.

| Moment | Prefer chips | Prefer open text | Why |
|---|---|---|---|
| Opening | Yes, 3 flat chips (one tap, submits the label) | Still allow typing | Reduces "what do I even say" anxiety |
| Pure diagnostic middle ("what kind of roles?" / "what does a usual year look like?") | No | Yes, typed | Routing the user through chips on open diagnostics feels like a form; free typing is what surfaces real signal |
| Bounded-answer middle (urgency, timeline) | Yes, 3-4 options | Allow typing as escape hatch | Keeps momentum when the answer space is genuinely small |
| User asks a question | No | Let them type freely | Chips feel dismissive when the user has a real question |
| Near handoff / branch decision | Yes, clear action buttons on a card | No typing in this moment | The goal is commitment; the two-CTA handoff card is the clearest shape |

This is sometimes called a **surgical chip policy**: chips only appear where the answer is genuinely bounded or where the user is making a branch decision. Everywhere else, the visitor types. See [conversation-scripts.md](conversation-scripts.md) for the exact moments each route uses chips.

Common mistakes:
- Using chips everywhere makes the experience feel like a phone tree.
- Using chips nowhere makes the experience feel like talking into a void.
- Using chips on open diagnostic turns ("what kind of roles?") hides real signal behind canned answers.

### Opening message principles
The opening message is the highest-leverage moment in the conversation.

A good opening:
1. **Orients.** Tells the user what this experience can do.
2. **Personalizes lightly.** Uses name or company from onboarding.
3. **Reduces blank-canvas anxiety.** Gives the user a clear first move.
4. **Sets the tone.** Consultative, not salesy.

What to avoid:
- Listing everything the assistant can do (feature dump).
- Asking a question in the opening (let them choose their entry).
- Being so open the user has no idea what to say.
- Being so narrow it feels like a multiple-choice quiz.

Keep it short. Most users skim the opening and go straight to the chips.

The exact opening line lives in [conversation-scripts.md](conversation-scripts.md#shared-opening-all-five-routes) and mirrors the production spec in [conversation-system-prompt.md](conversation-system-prompt.md).

### Opening chips: three flat, one-tap entries
The opening uses a **flat chip row** — three chips, each of which is both the label and the submitted user message. One tap, no dropdown.

The three chips:
1. `Discuss my hiring challenges` — routes to Route 1 (high-value AE booking). Pain-led, matches Jamie's persona.
2. `Find the right solution for me` — routes to Routes 2/3 (medium-value SDR live or booked). Solution-seeking, less urgent.
3. `Show me success stories` — routes to Route 5 (low-value redirect / nurture off-ramp).

Each chip is deliberately abstract. The weight of understanding the visitor's actual situation sits on the AI's first clarifying question — which is where BANT signal collection starts. That matches Principle 1 ("Heard, not qualified"): we don't ask the visitor to self-classify before we've listened.

**Why this shape rather than a two-tier topic-picker:**
- **Less friction.** One tap vs. two (pill → dropdown → prompt). Matches the flat-chip opening pattern on ChatGPT, Claude, and Meta AI.
- **Fewer forced choices.** Four topic pills with three prompts each forced twelve surface decisions; three flat chips give the visitor an easier first move.
- **Route 4 (product card) accessed by typed paraphrase.** Keeping the chip set to three prioritizes one-tap clarity on the dominant value tiers; Route 4 remains reachable via typed fit questions and in playback mode.

**Trade-offs to be honest about:**
- A tapped chip sends the message immediately, with no undo beat. That's standard chatbot behavior and fine for the demo, but worth tracking if this ships to production.
- The two-tier topic-picker (four pills × three prompts) is preserved as an alternate variant in the shell UI switcher, so stakeholders can still see the richer surface for comparison.

Common mistakes at the opening:
- Chips that pre-name a product ("Tell me about Recruiter") make the assistant feel like a FAQ rather than a consultant.
- Too many chips dilutes the pattern; 3-5 is the sweet spot.
- Chips that are too specific (naming a number, a role, a pain pattern) make the visitor feel boxed in.

See [conversation-scripts.md](conversation-scripts.md#shared-opening-all-five-routes) for the canonical chip labels, their route mappings, and the exact openers each chip triggers.

### Balancing helpfulness with qualification
Every AI response should do two things:
1. Actually answer or acknowledge what the user said.
2. End with one natural follow-up that moves the conversation forward.

The follow-up should feel like it helps the user, not the system. If the user can see why the question makes their answer better, they will answer willingly. If it feels like a non-sequitur, it feels like a form.

Rules:
- **One question at a time.** Never ask two questions in one message.
- **Don't complete the checklist.** Two strong signals are usually enough to route.
- **Earn the right to ask.** Turn 1: orient. Turn 2: one clarifying question. Turn 3: answer and go deeper. Turn 4+: specific questions feel appropriate.

### Additional principles
- **Reflect before advancing.** Before asking the next question, briefly echo what was understood.
- **Keep AI messages short.** 2 sentences plus 1 follow-up question beats a 4-paragraph answer.
- **Progressive disclosure.** Don't show everything up front. Let depth emerge through the conversation.
- **Graceful off-ramps.** Wrong-intent or not-ready users should still have a good experience.

## Flow philosophy
The conversation narrows in this order:
1. Identify the hiring challenge or hiring motion.
2. Map that context to the most likely solution category.
3. Go deeper on the likely-fit product.
4. Route to the best next step.

The intended shape:
1. broad opening
2. starting situation
3. hiring motion diagnosis
4. specific fit diagnosis
5. urgency / priority
6. reflected recommendation
7. next-step routing

[conversation-scripts.md](conversation-scripts.md) shows each step in full wording, broken down per route.

## Primary persona
The default walkthrough persona is Jamie Chen from [persona.md](persona.md):
- Director of Talent Acquisition, Northstar Health
- Hiring across multiple functions
- Dealing with some harder-to-fill roles
- High intent, but not immediately ready for a handoff

Jamie appears in all five scripted routes, even the medium and low value ones where she is slightly out of character. That is deliberate: one persona across routes keeps leadership demos focused, with the presenter narrating the context when the fit is looser.

## Outcomes in the prototype
Five routes are scripted in full in [conversation-scripts.md](conversation-scripts.md). They map onto the aspirational outcome model from [project-overview.md](project-overview.md) as follows:

| Script | Aspirational outcome | Visible artifact |
|---|---|---|
| Route 1 — High value | AE booking | Rep card → matching → booking surface |
| Route 2 — Medium · Live chat | SDR live handoff | Rep card → matching → inline live agent |
| Route 3 — Medium · Book meeting | SDR booking | Rep card → matching → booking surface |
| Route 4 — Low · Product card | Lower-touch / direct purchase | Hiring Pro recommendation card |
| Route 5 — Low · Redirect link | Redirect / no-sales | Minimal external link card |

Chat copy for Routes 1, 2, and 3 is identical up to the recommendation card; the visitor cannot tell whether they are being routed to an AE, an SDR booking, or a live SDR.

## Divergences from the production spec
The prototype intentionally differs from [conversation-system-prompt.md](conversation-system-prompt.md) in a few places. Keep these in mind when auditing:
- **Proactive routing.** The prototype proactively recommends a representative or a lighter-touch product once signals are strong enough. The production spec is more conservative — it waits for both hiring need and timeline before offering to connect. This is retained because it maps directly to the "Help first, then commit" principle in [demo-framing.md](demo-framing.md) and produces the commit moment leadership wants to see.
- **Opening message.** The prototype uses the production-spec opening line verbatim (see [conversation-scripts.md](conversation-scripts.md#shared-opening-all-five-routes)).
- **Pricing flow.** Both docs agree the assistant must never quote prices (see [conversation-language-rules.md](conversation-language-rules.md)). The prototype acknowledges the question, captures the budget signal silently, and offers a specialist — without an explicit pricing-scope sub-question.

Where the prototype follows the production spec, there should be no drift:
- product naming and terminology (see language rules)
- deflection of non-hiring topics (see language rules)
- "one question at a time," acknowledge-then-ask, and short response length

## How to explain this flow to stakeholders
The clearest explanation is by message purpose, not exact wording:
- opening message: orientation
- opening prompts: starting situation
- first assistant response: decision lens or helpful framing
- middle question: hiring motion diagnosis
- next question: specific fit diagnosis
- recommendation: likely-fit guidance
- next-step routing: appropriate handoff or recommendation

The routing story: we are not designing five unrelated chats. We are designing one guided conversation with five possible end states. The visible experience stays consultative. The hidden system chooses the right next-step surface.

## Related docs
- [conversation-scripts.md](conversation-scripts.md): canonical copy for all five routes
- [conversation-language-rules.md](conversation-language-rules.md): product naming, topic boundaries, acronyms, pricing prohibition
- [conversation-system-prompt.md](conversation-system-prompt.md): external production AI spec (reference only)
- [project-overview.md](project-overview.md): project context, BANT approach, routing model, scope
- [persona.md](persona.md): Jamie Chen persona
- [routing-outcomes-worksheet.md](routing-outcomes-worksheet.md): historical working notes
