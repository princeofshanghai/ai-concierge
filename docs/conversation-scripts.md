# Conversation Scripts

## Purpose
This is the canonical source of truth for exact AI Concierge copy, route by route. It covers every assistant bubble, every suggested chip, every recommendation artifact, and every visible transition.

Use it to answer:
- what exact words the assistant says in each route
- which chips are shown at each step
- what artifact appears at the recommendation or handoff moment
- how each route ends

For the design reasoning behind the flow shape, see [conversation-blueprint.md](conversation-blueprint.md).
For product naming, topic boundaries, and the pricing prohibition, see [conversation-language-rules.md](conversation-language-rules.md).
For the routing model at a product level, see [project-overview.md](project-overview.md).

> **Status note:** All five routes are locked and canonical (Shared opening + Routes 1-5). The shared opening currently defaults to **flat chips** (`inline-prompts` variant); the four-pill topic picker remains available as an alternate variant in the shell UI for comparison.

## Persona in every script
All five scripts use Jamie Chen from [persona.md](persona.md):
- Director of Talent Acquisition at Northstar Health
- LinkedIn-connected, contact details pre-filled

Medium and low value routes are a slight stretch for Jamie. That's intentional: leadership can focus on one persona and the presenter narrates the route context instead of juggling multiple personas.

## Conventions
- `Assistant:` is a bubble the AI posts, in the exact wording used.
- `Pill:` is one of the four topic pills shown below the opening bubble.
- `Starter prompt:` is the text inserted into the composer when the visitor taps a prompt inside a pill's dropdown. The visitor can edit before sending, but the demo uses the exact inserted text.
- `Chips (composer):` are suggested reply chips shown near the composer after an assistant question. Optional scaffolding — the composer is always open to free typing.
- `User (pill + prompt):` means the visitor tapped a pill and then a specific starter prompt from its dropdown. That prompt becomes the first user message.
- `User (chip):` is a user turn triggered by tapping a chip.
- `User (typed):` is a freeform reply, included here because the reflection in the next assistant turn depends on it.
- `Artifact:` is an in-chat card, rendered below the final bubble that owns it.
- `Next-step surface:` is the booking or matched-rep surface that takes over the right pane.

### Voice rules for user lines
- **No em dashes** in user lines. Em dashes feel AI-authored; real users rarely type them.
- **Imperfect grammar is fine.** Sentence fragments, missing commas, casual abbreviations (eng, CS, ~40) are encouraged when they make the reply feel human.
- Assistant lines follow the production spec voice (em dashes allowed). This rule only applies to `User (typed)` lines.

### When to use in-chat suggested-reply chips
In-chat chips are UI the visitor would see in the real product (distinct from the shell UI, which is presenter scaffolding). Offer chips only when:
- The answer space is **genuinely bounded** (e.g., timeline bucket, yes/no), AND the specifics of a typed answer wouldn't add qualification signal
- OR the moment is a **branch decision** (which direction to go next — chat live vs schedule, keep exploring vs exit)

Do **not** offer chips when:
- The question is diagnostic and the specifics of a typed reply carry signal (which roles, what's driving growth, what industry)
- The turn is open-ended discovery

Rule of thumb: chips appear where a tap is the right interaction, not as generic scaffolding after every question. In playback mode, chips are stripped from all but the final bubble anyway (see `src/lib/ai-concierge-playback.ts`), so this rule primarily governs the design intent and live-mode experience.

### When to name products in assistant copy
- **Routes ending in a human handoff (1, 2, 3)** — do *not* name specific products (Recruiter, Hiring Pro) in the commit bubble. Defer product introduction to the specialist so the conversation feels like "I'm matching you with the right person" rather than "I'm pitching you."
- **Routes ending in a self-serve card (Route 4)** — name the product directly on the card, since there is no human to introduce it.
- **Route 5 (redirect)** — no product naming; the visitor is too early-stage for a product match.

This rule does not prevent the assistant from *answering* product questions when the visitor asks (e.g., under pill "Find the right fit"). It governs the **commit / handoff moment** only.

## Shared opening (all five routes)

### Opening bubble
Every route starts with the same assistant bubble. This matches the production spec in [conversation-system-prompt.md](conversation-system-prompt.md).

**Assistant (opening):**
> Hi Jamie, glad you're here. I'm your AI hiring guide for Northstar Health. Tell me what your team is working through and I'll help you find the right fit.

The opening bubble carries three flat chips inline. No helper tail ("Here are a few ways to get started:" is removed), no questions in the bubble itself. The composer is always open to free typing.

### Opening chips (flat, one-tap)

Three chips, verb-led and user-native. Tapping a chip submits the chip label as the user's first message — no dropdown, no second tap. Each chip deterministically routes to one Phase-A entry point; the AI's first clarifying question is where BANT signal collection begins.

| Chip | Routes to | Why this wording |
|---|---|---|
| `Discuss my hiring challenges` | Route 1 — AE booking (high value) | Pain-led, urgent framing. Matches Jamie's persona (Series C, 40 roles, hard-to-fill specialized roles). Jamie's canonical demo click. |
| `Find the right solution for me` | Routes 2/3 — SDR live / SDR booking (medium value) | Solution-seeking but less urgent than a pain-led entry. The live-vs-book split happens later at the two-CTA card. |
| `Show me success stories` | Route 5 — redirect / nurture off-ramp (low value) | Peer-validation browsing. Matches the exploratory readiness Route 5 is built for. |

### Route 4 entry (typed paraphrase only)
Route 4 (product card / Hiring Pro) is reachable via typed paraphrase (e.g., *"Is this meant for teams my size?"*) or from the playback shell's pre-rendered transcript. Keeping the flat-chip set to three chips prioritizes one-tap clarity on the dominant three value tiers; the `isRoute4FitIntent` classifier still routes typed fit questions correctly.

### Why three flat chips instead of four topic pills

- **Less friction.** One tap vs. two (pill → dropdown → prompt). Matches the flat-chip opening pattern on ChatGPT, Claude, and Meta AI.
- **Follow-ups carry the weight.** Each chip is deliberately abstract; the AI's first clarifying question surfaces the specifics. Matches Principle 1 ("Heard, not qualified") — we don't make the visitor self-classify before we've listened.
- **No "Pricing" or "Talk to sales" chip.** Pricing is handled through conversation if a visitor types about it; a dedicated chip would signal a pricing-led product we aren't. "Talk to sales" as a chip shortcuts the concierge pattern.
- **Typed paraphrases still route correctly.** Legacy classifiers stay intact, so off-chip phrasings still land on the right route — including Route 4.
- **Topic-picker pills preserved as an alternate.** The four-pill variant remains selectable in the shell UI for side-by-side comparison during stakeholder reviews.

---

## Route 1 — High value (AE booking)

Why this route. Strong fit for LinkedIn Recruiter: scaling hiring across multiple functions, specialized hard-to-fill roles, near-term deadlines tied to milestones. This is Jamie's canonical flow and the demo's Flow 1. Ends with a matched AE and booking surface.

### Demo click
Chip **`Discuss my hiring challenges`**.

The chip is pain-led and high-intent — a direct match for Jamie's persona (urgent growth, hard-to-fill roles). It signals that the visitor has a real problem without pre-naming the shape (funding, specialization, timeline, driver). The AI's first clarifying question does the diagnostic work, which is the beat the exec demo is built to show.

### Script

**Assistant (opening):** see "Shared opening" above. Three chips visible: `Discuss my hiring challenges` · `Find the right solution for me` · `Show me success stories`.

**User (chip):** `Discuss my hiring challenges`

---

**Assistant (bubble 1 — warm, direct challenge probe):**
> Happy to help. What's been the hardest part of hiring for you lately?

*No chips. Composer open for typed reply. The question is short and warm by design — Jamie's first reply is deliberately vague, which lets the AI's next turn demonstrate warming an unclear input into real context.*

**User (typed):** `too many open roles rn`

*Short, chunky, lowercase — matches how a real visitor types mid-call. The ambiguity is the point: no scope, no driver, just a vibe.*

---

**Assistant (bubble 2 — ack + scope/driver clarifier):**
> That's a real pressure to be under. What's driving it usually shapes what's worth trying. Is this a recent ramp, or has it been building?

*Single bubble (no priorBubble). The acknowledge is minimal and leads straight into a clarifier because the previous reply was vague. The binary framing ("recent vs. building") invites Jamie to volunteer driver context without making her pick a pre-baked option.*

**User (typed):** `pretty recent. Series C closed in Feb. ~40 roles across eng, clinical, sales, ops over 2 quarters.`

*The detail unlock. Jamie volunteers the funding round, volume, spread, and timeframe — all signals the downstream bubbles need.*

---

**Assistant (bubble 3 — acknowledgment-only, no question):**
> Makes sense. Post-funding growth hiring across multiple functions tends to stretch teams fast, especially when the roles don't all look the same.

*This is an intentional no-question turn. It demonstrates Principle 1 ("Heard, not qualified") by showing the concierge listening without immediately asking the next thing.*

---

**Assistant (bubble 4 — one question, specialization probe):**
> In a mix that wide, it's common for a few roles to stay open longer than the rest. Any of the ones you mentioned sitting in that bucket for a while?

*No chips. This is a diagnostic turn — specifics matter more than a bucketed chip answer.*

**User (typed):** `Yeah a few. ML engineers, clinical informatics, couple senior sales leaders. Open a while now.`

---

**Assistant (bubble 5 — reflect + timeline question):**
> Those are roles where active search usually works better than waiting on inbound. And you're working on a tight runway. Is the timing tied to specific milestones, or is it more of a general urgency?

**Chips (composer):**
- `Specific milestones`
- `General urgency`
- `Both`
- `Still flexible`

**User (chip):** `Both`

---

**Assistant (bubble 6 — reflect + commit, no permission question):**
> Given the scale, the specialized roles, and the timeline, this is exactly the kind of hiring setup a specialist can help with. Here's a quick way to set up time with one.

**Artifact (recommendation card, rep handoff):**
- Title: `Meet with a hiring specialist`
- Body: `Talk with someone who knows situations like this`
- CTA: `Find a time`

*The card appears inline with the bubble, with a single `Find a time` CTA. No chip fork between live chat and scheduling — AE handoffs are always scheduled meetings. No "would you like to book?" question in front of the card. This is the commit moment Principle 2 calls for.*

**User action:** taps `Find a time` on the card.

---

**Assistant (bubble 7):**
> I'm working on that now.

**Artifact (matching):**
- Title: `Connecting you with the right person`
- Body: `This usually takes a minute or two. You can keep chatting in the meantime.`
- Status: matching → ready

**Next-step surface:** matched rep surface opens with a booking form prefilled for Jamie. Internally this rep is an AE.

### Bubble count and rhythm
7 assistant bubbles + 4 user turns + 1 card CTA tap before the booking surface opens.

- Bubble 1: warm, direct challenge probe → user types (vague)
- Bubble 2: ack + scope/driver clarifier → user types (detail unlock)
- Bubble 3: acknowledge-only (no question)
- Bubble 4: specialization question → user types
- Bubble 5: reflect + timeline question → user taps chip
- Bubble 6: reflect + commit + card (single `Find a time` CTA, no chip fork) → user taps CTA on card
- Bubble 7: "I'm working on that now" + matching → booking surface opens

Rhythm is **acknowledge → answer → ask**, with two intentional pacing moves:
- **Bubble 2** exists to slow the conversation down and let the AI earn the rich reply instead of receiving it on turn one.
- **Bubble 3** is the no-question pause that demonstrates Principle 1 ("Heard, not qualified").

One gentle follow-up at a time. The card ends the conversational phase — no chip fork, because AE handoffs are always scheduled meetings.

### Hidden signals captured (BANT)
- **Budget (proxy):** 40 roles + post-funding scale → enterprise-tier signal.
- **Authority:** Director of Talent Acquisition + "just closed a funding round" → senior, likely buyer-influencer.
- **Need:** multi-function volume + specialized roles with long time-to-fill → fits an advanced sourcing workflow.
- **Timeline:** 2 quarters, milestone-tied → urgent enough for a scheduled specialist conversation.

Each signal is harvested inside natural dialogue, never as a form field. The specialist (internally an AE) receives these signals with the booking and uses them to shape the call.

### Why this ends in a scheduled meeting, not a product card or live chat
This visitor is a clear high-value fit: real budget proxy, decision-making seniority, specialized needs, and urgent timeline. The right next step is a scoped conversation with a specialist who can walk through a custom rollout. Live chat isn't the right shape for a conversation this big, and a self-serve product card would undersell the fit. Product recommendation cards live in Route 4 (low-value); live chat is the Route 2 choice (medium-value, immediate SDR).

### What the exec should see in this flow
- **Bubble 2 (ack + clarifier)** is the pacing moment — the concierge warms a vague input ("too many open roles rn") into real context by asking a narrow, earnable follow-up instead of accepting the vibe at face value.
- **Bubble 3 (acknowledge-only)** is the Principle 1 proof moment — the concierge listens without turning every turn into a question.
- **Bubble 6 (commit + card, no permission question)** is the Principle 2 proof moment — the concierge commits instead of asking "would you like to book?"
- **The whole flow** is the Flow 1 "Qualifying without a form" deep decision from demo-framing.md — BANT signals harvested through dialogue, not through form fields.

---

## Route 2 — Medium value · Live chat with SDR

Why this route. Real hiring pain, narrower than Route 1. A few stuck roles rather than enterprise-wide volume. The visitor wants to talk *now*, not schedule a future meeting. Internally this is an SDR handoff; to the visitor it's just "a hiring specialist."

For Jamie specifically, this is a stretch context: she's shown here in early-exploration mode asking about a focused pain point (specific hard-to-fill roles) rather than the full 40-role story from Route 1. Presenter narrates that context.

### Demo click
Chip **`Find the right solution for me`**.

Solution-seeking entry. The chip is broad and exploratory; the AI's first clarifying question ("what's been hardest") probes *what kind* of challenge, which surfaces the specific-role / volume / speed signal that separates Routes 2/3 from Route 4.

### Script

**Assistant (opening):** see "Shared opening" above. Three chips visible.

**User (chip):** `Find the right solution for me`

---

**Assistant (bubble 1 — acknowledge + diagnostic):**
> Happy to help you figure that out. The right kind of support depends a lot on what's getting in the way. What's been toughest lately?

*No chips. Diagnostic turn — specifics matter.*

**User (typed):** `Senior nursing and clinical informatics mostly. Few of them have been open for months.`

---

**Assistant (bubble 2 — acknowledge-only, no question):**
> That tracks. Senior nursing and clinical informatics are both narrow talent pools, and waiting on inbound tends to drag those vacancies out.

*Principle 1 proof moment. Listening beat, no question.*

---

**Assistant (bubble 3 — reflect + timeline question):**
> That's the kind of gap where active outreach usually moves the needle faster than waiting on inbound. How soon do you need to see real progress?

**Chips (composer):**
- `This quarter`
- `In the next few months`
- `We're planning ahead`
- `Still exploring`

**User (chip):** `In the next few months`

---

**Assistant (bubble 4 — reflect + commit + card, no permission question):**
> Roles like these usually need a proactive sourcing approach, and a couple of months is enough time to make real progress. A hiring specialist can help you figure out the right setup.

**Artifact (recommendation card, rep handoff — two-CTA variant):**
- Title: `Talk to a hiring specialist`
- Body: *(none — the two CTAs together already explain the choice, and the preceding assistant bubble frames the handoff. Adding a body line duplicated the "hiring specialist can help..." framing from the bubble above.)*
- CTAs (two buttons on the card):
  - `Chat live now`
  - `Schedule for later`

*The card carries both CTAs directly — no separate chip row. This is the branch-decision variant of the handoff card (contrast Route 1's single-CTA variant, which keeps a body line because one button alone can't carry the full context).*

**User action:** taps `Chat live now` on the card.

---

**Assistant (bubble 5 — handoff to live chat):**
> Got it — finding someone available right now.

**Artifact (matching):**
- Title: `Connecting you now`
- Status: matching

The matching card resolves to a live chat with a named representative who takes over the thread inline. From there the experience is the existing live-agent thread.

### Bubble count and rhythm
5 assistant bubbles + 2 user typed + 2 card/chip taps before the live chat takes over.

- Bubble 1: diagnostic (which roles) → user types
- Bubble 2: acknowledge-only (no question)
- Bubble 3: timeline question → user taps chip
- Bubble 4: reflect + commit + two-CTA card → user taps `Chat live now` on the card
- Bubble 5: matching → live chat takes over

Tighter than Route 1 (5 vs 7 bubbles). The narrower pain justifies less diagnostic runway — no pacing pause, no separate driver probe, since "hard-to-fill roles" is itself the diagnostic entry.

### Hidden signals captured
- **Need:** narrow healthcare talent pool (senior nursing, clinical informatics), long time-to-fill.
- **Timeline:** next few months — urgent enough to act, not fire-drill.
- **Budget/Authority:** intentionally thin. SDR qualifies these in the live chat.
- **Handoff preference:** live chat → signal of exploration / immediate availability.

### Why this ends in SDR live chat, not AE booking or product card
Narrower pain, less-urgent timeline, thinner budget/authority signals, and a handoff preference that says "I want a quick answer now" together map to an SDR live touch — not a scoped AE meeting, not a self-serve product card.

### What the exec should see in this flow
- **Bubble 2 (acknowledge-only)** is the same Principle 1 proof as Route 1.
- **Bubble 4 (commit + two-CTA card)** is the Principle 2 proof — commit without pitching, and without dumping all the UX choices into a chip row.
- **The card shape itself** shows the design system accommodates both single-action handoffs (Route 1) and branch-decision handoffs (Routes 2/3).

---

## Route 3 — Medium value · Book meeting with SDR

Why this route. Same fit profile as Route 2 — narrower hiring pain, exploratory — but the visitor prefers to put time on the calendar instead of chatting live right now.

### Demo click
Same as Route 2: Chip **`Find the right solution for me`**.

### Script

Identical to Route 2 through bubble 4 (the two-CTA card). The difference is which card CTA the visitor taps.

**Artifact (recommendation card, rep handoff — two-CTA variant):**
- Title: `Talk to a hiring specialist`
- Body: *(none — see note in Route 2.)*
- CTAs:
  - `Chat live now`
  - `Schedule for later`

**User action:** taps `Schedule for later` on the card.

---

**Assistant (bubble 5 — handoff to booking):**
> I'm working on that now.

**Artifact (matching):**
- Title: `Connecting you with the right person`
- Body: `This usually takes a minute or two. You can keep chatting in the meantime.`
- Status: matching → ready

**Next-step surface:** matched rep surface opens with a booking form prefilled for Jamie. Internally this rep is an SDR; the booking surface is identical to Route 1's AE booking surface.

### Why chat copy is identical to Routes 1 and 2 at this point
The visitor should never be able to tell whether the meeting is with an AE or an SDR — both are "a hiring specialist" at the UX layer. Internally we route by fit strength; the booking surface is the same component in both cases.

### Hidden signals captured
- **Need:** narrow healthcare talent pool (senior nursing, clinical informatics), long time-to-fill.
- **Timeline:** next few months.
- **Handoff preference:** scheduled — more deliberate than Route 2's "chat now."

---

## Route 4 — Low value · Product card (Hiring Pro)

Why this route. Occasional hiring, not enough signal to justify a human handoff. The concierge listens, diagnoses modest volume, and recommends a self-serve product. This route is the proof that the concierge doesn't force every visitor through sales.

For Jamie specifically, this is a larger stretch than Routes 2/3. Presenter narrates that Jamie is shown earlier in her exploration — before the 40-role conversation — checking whether LinkedIn has something right-sized for her team.

### Demo click
Typed paraphrase (no chip): **`Is this meant for teams my size?`**.

Route 4 isn't bound to a flat chip — its entry is a typed fit question. The `isRoute4FitIntent` classifier matches "is this meant for teams my size," "team size," and similar volume-framed paraphrases. Playback mode remains the reliable demo path for this route.

### Script

**Assistant (opening):** see "Shared opening" above. Three chips visible.

**User (typed):** `Is this meant for teams my size?`

---

**Assistant (bubble 1 — acknowledge the question + turn diagnostic):**
> Good question. The right fit depends on how much hiring you typically do. What does a usual year look like for your team?

*No chips. Diagnostic turn.*

**User (typed):** `Pretty light on our end. Maybe 3-4 hires a year. Mostly sales and CS roles.`

---

**Assistant (bubble 2 — acknowledge-only, no question):**
> Got it. For teams at that volume, a lighter-touch option usually fits better than a full sourcing workflow.

*Principle 1 proof moment. Begins setting up the recommendation shape without naming the product yet.*

---

**Assistant (bubble 3 — reflect + urgency question):**
> One more thing that tends to shape what fits best. When a role opens up, how fast do you usually need to fill it?

**Chips (composer):**
- `Right away`
- `Within a couple months`
- `Depends on the role`
- `We're flexible`

**User (chip):** `Depends on the role`

---

**Assistant (bubble 4 — reflect + commit + product card):**
> For 3-4 hires a year, there's a lighter-touch option designed exactly for this.

**Artifact (product recommendation card):**
- Tag: `Recommended for you`
- Title: `Hiring Pro`
- Body: `Best for occasional hiring and attracting inbound candidates`
- CTA: `Explore all plans` *(opens external plans page)*

*Script ends on the card. No escape chips, no rep handoff, no booking surface. The composer remains open; if the visitor types a rep request explicitly, the concierge can re-route organically.*

### Bubble count and rhythm
4 assistant bubbles + 1 user typed + 1 chip tap + 1 card CTA tap (optional) before the route terminates.

- Bubble 1: diagnostic (annual hiring volume) → user types
- Bubble 2: acknowledge-only (no question)
- Bubble 3: urgency question → user taps chip
- Bubble 4: reflect + commit + product card → user either taps CTA or ends

Shortest flow in the system. The narrower fit story justifies less diagnostic runway, and the lighter-touch recommendation deserves a lighter-touch delivery.

### Hidden signals captured
- **Need:** modest volume, narrow role mix (sales + CS), no specialized pain.
- **Timeline:** flexible / role-dependent → not urgent.
- **Budget/Authority:** intentionally thin — Hiring Pro is self-serve, no need to qualify further.
- **Motion:** inbound-friendly cadence → Hiring Pro-shaped.

### Why this ends in a product card, not a human handoff
Low volume + non-urgent + no specialized pain + fit-question framing → self-serve is right-sized. Forcing a rep conversation would feel mismatched, waste sales resources, and undermine the premise that the concierge routes based on fit.

### Why no escape chip to a rep
Offering a one-tap rep shortcut would contradict the routing decision the concierge just made and drain sales resources on low-fit visitors. User agency is preserved through the open composer — if a visitor genuinely wants a rep, they can type it and the concierge can re-route. That's an organic override, not a UI-advertised one.

### What the exec should see in this flow
- **Bubble 2 acknowledge-only:** same Principle 1 proof as other routes.
- **Bubble 4 commits to a product without human handoff:** Principle 3 proof ("Every route is a good route") — the concierge declines to involve sales when the fit isn't there.
- **Shortest flow in the system:** proof the concierge doesn't over-qualify when the signal is clear.

---

## Route 5 — Low value · Redirect link (nurture off-ramp)

Why this route. Visitor is so early-stage that any product recommendation would be premature. The concierge respects that, points them at a reference page, and ends. This is the only route with no sales motion attached — neither Field Sales (Routes 1-3) nor Online Sales (Route 4). It's pure nurture / informational.

For Jamie specifically, this is the biggest stretch of any route. Presenter narrates: "Early exploration — Jamie before Northstar had a hiring plan, or researching for her boss. No concrete hiring need yet."

### Demo click
Chip **`Show me success stories`**.

Peer-validation seeking — a natural lead-in for someone who isn't sure they even need a solution yet. The chip routes directly into Route 5's company-context diagnostic; the typed paraphrase "do companies like mine use this" still routes here too via the legacy `isRoute5CustomerStoriesIntent` classifier.

### Script

**Assistant (opening):** see "Shared opening" above. Three chips visible.

**User (chip):** `Show me success stories`

---

**Assistant (bubble 1 — acknowledge + open diagnostic):**
> Plenty of teams use LinkedIn for hiring, and the most relevant examples depend on your setup. What kind of team are we talking about?

*No chips. Open diagnostic.*

**User (typed):** `Startup, 15ish people. Haven't really hired much yet, but figuring we might need to soon.`

---

**Assistant (bubble 2 — acknowledge-only, no question):**
> Totally fair. At that stage, the useful question usually isn't *which tool*, it's what kind of hiring you'll actually need first.

*Principle 1 proof moment. Sets up the "not ready yet" conclusion without forcing it.*

---

**Assistant (bubble 3 — gentle context probe):**
> When you say you might need to soon, do you have a sense of what that looks like? Specific role in mind, or still up in the air?

*No chips. Open probe, not a qualifier.*

**User (typed):** `Honestly still up in the air. Maybe engineering and sales? No concrete plan yet.`

---

**Assistant (bubble 4 — reflect + commit + redirect):**
> That's a pretty common spot to be in. Here's a good starting point to browse what LinkedIn has for hiring. Come back anytime.

**Artifact (redirect — minimal styled link):**
- Single clickable element: `LinkedIn hiring products →`
- No body copy, no tag, no separate CTA button
- Target: `business.linkedin.com/hire/product-overview`

*Renders as a styled link, not a rich card. Visually distinct from Route 4's product recommendation card. Feels like a polite bookmark rather than a pitch.*

*Script ends on the link. No handoff, no product match, no escape chip. The composer remains open; if the visitor types a specific question, the concierge can continue the conversation.*

### Bubble count and rhythm
4 assistant bubbles + 2 user typed turns + 1 link tap (optional).

- Bubble 1: diagnostic (company context) → user types
- Bubble 2: acknowledge-only (no question)
- Bubble 3: gentle context probe → user types
- Bubble 4: reflect + commit + redirect link

Same length as Route 4, but different shape: zero **visitor-facing** chips anywhere in the route (Route 4 has visitor chips on Bubble 3). Reinforces "low-structure, exploratory conversation." The composer-level sample replies on Bubbles 1 and 3 are presenter scaffolding for live-mode demos (same pattern as Routes 1-4) and don't change the visitor experience.

### Hidden signals captured
- **Need:** nascent, undefined (maybe engineering and sales).
- **Timeline:** undefined ("might need to soon").
- **Budget/Authority:** not surfaced — intentional.
- **Readiness:** low.

### Why this ends in a reference link, not a product or a rep
Every signal reads as "too early." Recommending a product would frustrate the visitor; routing to a rep would waste sales time on a lead that isn't one. A reference page respects where they actually are — browse, come back when things come into focus.

### Why the destination is a product overview page, not a plans page
Route 5 is not driving a purchase. Sending a pre-hiring visitor to a Premium plans page (Route 4 territory) would create the wrong kind of pressure. The product overview page is informational: lists what LinkedIn offers for hiring, no buy-now pressure.

### What the exec should see in this flow
- **Bubble 2 acknowledge-only:** same Principle 1 proof as every route.
- **Bubble 4 actively declines to pitch** ("Here's a good starting point to browse..."): the concierge's most restrained moment. Principle 3's hardest test — willingness to send the visitor away gracefully without a product or a meeting.
- **Minimal styled link, zero visitor-facing chips, zero product names:** visually proves the concierge is not "every-visitor-is-a-lead."

---

## Route summary at a glance

| Route | Sales motion | Demo click (flat chip) | Bubbles | Terminal artifact | Chips |
|---|---|---|---|---|---|
| 1 — AE booking | Field Sales | `Discuss my hiring challenges` | 7 | Single-CTA card → booking surface | B5 timeline |
| 2 — SDR live chat | Field Sales | `Find the right solution for me` | 5 | Two-CTA card → live chat takeover | B3 timeline |
| 3 — SDR booking | Field Sales | `Find the right solution for me` | 5 | Two-CTA card → booking surface | B3 timeline |
| 4 — Hiring Pro card | Online Sales (Premium) | Typed paraphrase: `Is this meant for teams my size?` | 4 | Product card, terminal | B3 urgency |
| 5 — Redirect | Neither (nurture) | `Show me success stories` | 4 | Minimal styled link, terminal | None |

## Divergences to remember
- **Routes 2 and 3 share copy through Bubble 4's two-CTA card** and only differ in which CTA the visitor taps (`Chat live now` vs `Schedule for later`) and the handoff bubble that follows.
- **Routes 4 and 5 are the only routes without a human handoff.** Route 4 hands off to a self-serve product page (Online Sales / Premium). Route 5 hands off to a pure reference page (nurture, no sale).
- **Three distinct card artifacts are in play:**
  1. Single-CTA rep card (Route 1, `Find a time`)
  2. Two-CTA rep card (Routes 2/3, `Chat live now` + `Schedule for later`)
  3. Product recommendation card (Route 4, `Explore all plans`)
  4. Minimal styled link (Route 5, `LinkedIn hiring products →`)
- **No route quotes a price**, per [conversation-language-rules.md](conversation-language-rules.md). If a visitor asks about pricing, the assistant acknowledges, captures the budget signal silently, and offers to connect them with a specialist — without asking a scoping sub-question.
- **Only Route 4 names a product in the flow** (on the card, not in bubble copy). All other routes either defer product introduction to a human (Routes 1-3) or avoid product naming entirely (Route 5).

## Related docs
- [conversation-blueprint.md](conversation-blueprint.md): why the flow is shaped this way (principles only; copy lives here)
- [conversation-language-rules.md](conversation-language-rules.md): naming, topic boundaries, acronyms, pricing prohibition
- [project-overview.md](project-overview.md): project context, BANT, and the five-outcome routing model
- [persona.md](persona.md): Jamie Chen persona
- [routing-outcomes-worksheet.md](routing-outcomes-worksheet.md): historical working notes
