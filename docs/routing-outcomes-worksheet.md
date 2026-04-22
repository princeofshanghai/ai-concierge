# Routing Outcomes Worksheet

> **Status: historical working notes.**
> The prototype (`src/lib/ai-concierge-conversation.ts`) is the canonical source for which outcomes are actually implemented, and [conversation-blueprint.md](conversation-blueprint.md) describes how they appear in the conversation. This worksheet captures earlier design exploration — matching card states, timeout behavior, ready-banner patterns, and the AE-vs-SDR distinction — that may still inform future iterations but is no longer authoritative.

## Purpose
This document is a working design worksheet that explored the five hidden routing outcomes originally proposed for AI Concierge.

It is still useful for:
- detailed design thinking on the matching state, timeouts, and ready banner
- the in-thread AI-to-human handoff pattern
- open design questions on lower-touch and redirect paths

It is no longer the source of truth for:
- which outcomes exist in the prototype today
- the user-facing copy for any outcome
- which surface opens for each outcome

Related docs:
- [project-overview.md](project-overview.md) — strategic framing, including the aspirational 5-outcome model
- [conversation-blueprint.md](conversation-blueprint.md) — outcomes as implemented in the prototype
- [implementation-plan.md](implementation-plan.md)

## Current working decisions
- `AE` and `SDR` should stay hidden from the user.
- User-facing language should stay generic, such as `representative` or `hiring representative`.
- The visible experience should still feel like one consistent guided conversation.
- `SDR live handoff` means the human joins the existing AI Concierge chat and starts typing in-thread.
- `AE booking` may require a short matching step before booking is shown.
- `Lower-touch / direct purchase` and `Redirect / no-sales` are real target outcomes, but they still need more design detail.

## Worksheet

| Hidden Outcome | UX Scenario | Trigger Signals | User-Facing Copy | Next-Step UI | Unresolved Design Questions |
|---|---|---|---|---|---|
| `AE booking` | `Instant booking` | High-value account, strong fit, high intent, and the system can immediately identify a bookable representative or bookable pool | Assistant recommends talking to `a representative` without exposing AE language. Recommended pattern: explain why that step is relevant, then move toward booking. | Shared booking surface opens immediately. | Should this look nearly identical to `SDR booking`, or should there be subtle cues that it is a higher-touch path? |
| `AE booking` | `Matched booking` | High-value account, strong fit, high intent, but routing needs 1-2 minutes to identify the right representative before showing times | Assistant still recommends talking to `a representative`, but the next step includes a concierge-style `finding the right representative` moment before booking appears. | Shared next-step shell first shows a matching state, then transitions into booking when ready. | How should the matching delay appear? Should the user wait in the shell, return to chat while matching continues, or both? How premium can this feel without feeling fake or slow? |
| `SDR live handoff` | `Human joins chat now` | Medium-value but valid sales lead, enough intent to benefit from a person now, SDR available live | Assistant offers to bring `a representative` into the conversation now. The copy should make the transition feel immediate and useful, not like escalation theater. | The existing AI Concierge thread stays open, then a human joins and types into the same chat. The transition from AI to human should be explicit. | How do we show the human has joined? Do we change avatar, header state, or system message? What happens if the SDR is slow to respond after the user agrees? |
| `SDR booking` | `Book later with representative` | Medium-value valid lead, good fit for sales follow-up, but no live SDR available | Assistant recommends a short conversation with `a representative` and opens scheduling, similar to the current prototype handoff. | Shared booking surface. This is the cleanest extension of the current prototype. | Should this look identical to `AE instant booking` from the user perspective? If identical, how do we keep the internal distinction clean? |
| `Lower-touch / direct purchase` | `Best-fit lighter path` | Smaller scope, lighter hiring need, more occasional hiring, or enough confidence that a heavier sales path is unnecessary | Assistant frames this as the best-fit option, not as a downgrade. Recommended pattern: explain why a lighter-touch option may make more sense, then guide the user there. | A lower-touch destination, purchase path, plan comparison, or product recommendation card inside the shared shell. Exact artifact still TBD. | What is the concrete destination in the prototype? Should this feel like a recommendation card, a mini comparison, or a CTA to another flow? How do we make it feel helpful rather than dismissive? |
| `Redirect / no-sales` | `Wrong destination` | Wrong intent, such as support, job seeker help, or unrelated questions, or low-value traffic that should not enter the sales path | Assistant clearly acknowledges the mismatch and points the user to the right place. The tone should stay helpful and respectful. | Redirect card or destination options inside the shared shell, or a clean in-chat redirect if that feels lighter. Exact pattern still TBD. | How much effort should the prototype spend here? Should this be a polished destination card or a simple redirect message? What are the minimum destinations we need to make it feel complete? |

## Detailed Working Patterns

### `AE booking`: Instant booking

#### Recommended visible pattern
1. The assistant explains why a representative would be useful.
2. The user chooses to continue.
3. The booking surface opens right away into booking.
4. The user books without seeing any internal routing language.

Example direction:

> Based on what you shared, a representative could help you think through the right setup for your team.
>
> I can help you book a meeting, or we can keep exploring first.

#### UX implications
- Loading state:
  Keep this path feeling immediate. If the system already knows the match, do not introduce fake progress or artificial delay.
- Empty state:
  If no times are available, the UI should not collapse. It should gracefully explain that times are not available yet and offer a clear fallback path.
- Error state:
  If scheduling data fails to load, the user should get a calm explanation and an alternate next step instead of a dead-end panel.
- Mobile and responsive behavior:
  This should use the same shared booking surface pattern as the current prototype so the path feels familiar on both desktop and mobile.
- Accessibility:
  The transition from chat to booking should be announced clearly, with a descriptive heading and consistent focus management.
- Analytics:
  Track recommendation acceptance, booking-surface open rate, slot selection, booking completion, and abandonment.

#### System implications
- The system needs a confident route and immediate access to bookable availability.
- This is the cleanest high-touch path because it does not require a long-lived intermediate matching state.
- If availability fetch fails, the system still needs a fallback outcome rather than silently dropping the route.

#### Main risk
- If this looks too different from `SDR booking`, users may feel segmented.
- If it looks identical, internal teams may still need a clean way to tell the routes apart without affecting the user-facing experience.

### `AE booking`: Matched booking

#### Recommended visible pattern
1. The assistant explains why a representative would be useful.
2. The user agrees to continue.
3. The shared shell opens into a concierge-style matching state:
   `I'm finding the right representative for your situation. This usually takes about 1-2 minutes.`
4. The user can either stay on that surface or return to chat while matching continues.
5. A persistent in-chat matching card remains visible while the system works in the background.
6. When matching completes, that card updates into a ready state with a primary CTA:
   `Book meeting`
7. If the user is deeper in the thread or actively chatting, a lightweight ready banner appears near the composer:
   `Your representative is ready` plus `Book meeting`
8. Tapping the CTA opens the shared booking surface directly.

Recommended stance:
- Do not pretend the match is instant if it is not.
- Do not expose internal language like `routing to AE`.
- Make the wait feel intentional and premium, not broken.
- If the user keeps chatting, do not make them hunt for the ready state later.

#### Recommended return pattern when the user keeps exploring
- Keep one persistent matching card in-thread so there is always a durable record of status.
- When matching completes, update that card in place to a clear ready state.
- Also show a temporary but noticeable banner near the composer so the user sees the update without needing to scroll.
- The banner CTA should open booking directly, not just jump the user to the old card.
- If the banner is dismissed, the updated in-thread card still remains as the durable fallback.

#### Mini-spec: in-chat card states

##### State 1: Matching started
- Trigger:
  The user agrees to talk to a representative and matching begins.
- Card title:
  `Finding the right representative`
- Card body:
  `I'm looking for the best match for your situation. This usually takes about 1-2 minutes.`
- Primary action:
  none
- Secondary action:
  `Keep exploring`
- Visual direction:
  Calm animated status treatment such as a soft pulse, shimmer, or orbiting dots. Avoid percentage progress.

##### State 2: Still matching
- Trigger:
  Matching is still running after about 30 seconds.
- Card title:
  `Still finding the right representative`
- Card body:
  `I'm checking fit and availability. You can keep chatting while I work on it.`
- Primary action:
  none
- Secondary action:
  `Keep exploring`
- Visual direction:
  Same card, same placement, subtle motion continues.

##### State 3: Delayed
- Trigger:
  Matching is still running after about 90 seconds.
- Card title:
  `This is taking a bit longer than usual`
- Card body:
  `I'm still working on it. You can keep exploring and I'll let you know the moment it's ready.`
- Primary action:
  none
- Secondary action:
  `Keep exploring`
- Visual direction:
  Motion becomes quieter, with more emphasis on honest status text than animation.

##### State 4: Ready
- Trigger:
  Matching is complete and booking can begin.
- Card title:
  `Your representative is ready`
- Card body:
  `I found the right representative for your situation.`
- Primary action:
  `Book meeting`
- Secondary action:
  `Keep exploring`
- Visual direction:
  Replace the animated treatment with a ready state, such as a check, glow, or accent shift that feels noticeable but not celebratory.

##### State 5: Ready, but no meeting times yet
- Trigger:
  Matching is complete but booking data is unavailable or empty.
- Card title:
  `Your representative is identified`
- Card body:
  `I found the right representative, but meeting times aren't ready yet. You can keep exploring while I keep working on it.`
- Primary action:
  none for now
- Secondary action:
  `Keep exploring`
- Visual direction:
  Keep the card stable and informative rather than making it look like an error.

#### Mini-spec: ready banner near composer

##### Banner purpose
- Bring the user back to the ready state if they kept chatting and may not be looking at the original matching card.
- Act as a foreground prompt, while the updated in-thread card remains the durable record.

##### Banner copy
- Title:
  `Your representative is ready`
- Supporting line:
  `Book a meeting whenever you're ready.`
- Primary action:
  `Book meeting`
- Secondary action:
  dismiss

##### Banner behavior
- Show only when matching completes and the user is not already inside the booking surface.
- Anchor it near the composer so it is visible without covering the main thread.
- If the user dismisses it, do not show it again immediately unless the booking state meaningfully changes.
- If the user taps `Book meeting`, open booking directly.
- If the user ignores it, the updated in-thread card remains available.

#### Mini-spec: timeout behavior

##### 0 to 30 seconds
- Show `Finding the right representative`.
- No extra interruption beyond the main card.
- If the user stays on the shell, keep them there calmly.
- If the user returns to chat, keep the matching card visible in-thread.

##### Around 30 seconds
- Update the card to `Still finding the right representative`.
- Keep the experience non-blocking.
- Do not escalate to a banner yet unless matching has actually completed.

##### Around 90 seconds
- Update the card to `This is taking a bit longer than usual`.
- Set expectation that the system will keep working in the background.
- If the user is still in the shell, offer a clear path back to chat without making them feel they are abandoning the process.

##### 2 minutes and beyond
- Do not keep pretending this is a short wait.
- Keep the card visible, but switch to a more explicit background-processing stance:
  `I'm still working on this and I'll let you know as soon as it's ready.`
- If matching eventually completes, show the ready banner and update the in-thread card.
- If matching ultimately fails, convert the card into a clear fallback state rather than leaving it in limbo.

#### UX implications
- Loading state:
  This path needs a real matching state. A blank spinner for 1-2 minutes will feel broken. The experience should set expectation clearly and reassure the user that progress is happening.
- Empty state:
  If matching succeeds but there are no times, the shell should convert into a clear `representative identified, scheduling follow-up next` state rather than dumping the user back to chat.
- Error state:
  If matching fails or times cannot be retrieved, the user needs a believable fallback, such as continued chat guidance or a promised follow-up path.
- Mobile and responsive behavior:
  The matching state should be readable and calm in a smaller viewport, not a dense operational status panel. The ready banner should not cover the composer or feel like a toast ad.
- Accessibility:
  The shell should announce when matching starts and when booking becomes ready. Avoid motion-only feedback. The ready banner and updated card should both use clear text.
- Analytics:
  Track match-start, time-to-match, match-complete, match-fail, return-to-chat during matching, ready-banner impression, ready-banner clickthrough, and conversion after match completion.

#### System implications
- This route likely needs an intermediate hidden state such as `finding representative`.
- Matching completion has to update the active session cleanly, whether the user is still in the shell or has returned to chat.
- Matching completion needs to trigger both a durable state update in the thread and a temporary foreground notification near the composer.
- The system needs timeout behavior. If matching exceeds expectation, the product should decide whether to keep waiting, apologize, or switch to a follow-up pattern.

#### Main risk
- Waiting 1-2 minutes is long enough to feel fragile.
- The strongest UX pattern is likely non-blocking matching, where the user can keep exploring while the system works in the background.

#### Pressure-test questions
- What should happen at 30 seconds, 90 seconds, and 2+ minutes?
- If the user leaves the matching surface, how do we notify them that booking is ready?
- If no exact representative can be matched, is the fallback still booking, or does the route change?

### `SDR live handoff`

#### Recommended visible pattern
1. The assistant explains why talking to a representative now would help.
2. The user agrees to continue now.
3. A clear system-style transition message appears:
   `Bringing a representative into this chat now.`
4. The user sees a short connection state while waiting.
5. The human joins the same thread and starts typing.
6. The AI steps back so the user does not feel like two agents are competing.

Example direction:

> A representative can jump into this chat now and help you talk through the right next step.
>
> If you want, I can bring them in here.

#### UX implications
- Loading state:
  This path needs an explicit `connecting you now` moment. Without that, the user may think the chat stalled.
- Empty state:
  If the representative does not respond quickly, the experience should not leave the user staring at silence. It needs a fallback state.
- Error state:
  If live handoff fails, the assistant should apologize plainly and convert the route into `SDR booking`.
- Mobile and responsive behavior:
  This path is naturally strong on mobile because it stays in one thread rather than opening a side surface.
- Accessibility:
  The transition from AI to human should be announced with clear text, not only avatar or color changes.
- Analytics:
  Track handoff offer rate, accept rate, time to representative join, first human response time, successful connection, fallback-to-booking rate, and drop-off during waiting.

#### System implications
- The system needs live availability, human assignment, presence state, and transcript continuity.
- Once the human joins, the system should define whether the AI is fully silent, partially assistive, or still present in a background role.
- A no-show or delayed-response threshold needs to convert the live-handoff route into a different outcome instead of leaving it ambiguous.

#### Main risk
- This route can feel magical when it works and broken when it does not.
- The UX has to make the handoff unmistakable without making it feel like the user was passed around.

#### Pressure-test questions
- What should the user see if the SDR joins but does not type for 20-30 seconds?
- Should the human have a visible name and title like `Taylor, hiring representative`, or stay more generic?
- Should the AI ever re-enter the thread after the human has joined?

## Cross-cutting UX notes

### Keep sales roles hidden
- Users should not see `AE` or `SDR`.
- Exposing those labels risks making users feel ranked or lower value.
- `Representative` is the safest current umbrella term.

### Make the recommendation feel earned
- The assistant should explain why the next step is helpful before opening the next-step surface.
- The visible pattern should stay consistent across outcomes:
  1. guidance
  2. diagnosis
  3. recommendation
  4. next-step surface

### Design the transition moments
- `SDR live handoff` needs a clear AI-to-human transition.
- `AE booking` may need a clear waiting or matching transition.
- `Lower-touch` and `Redirect` need to feel like intentional outcomes, not dead ends.

### Prototype shell expectation
- The long-term goal is one shared next-step shell that can present different outcome variants.
- The user should feel one system, not five separate mini-products.

## Cross-cutting system notes

### Hidden routing can still distinguish paths
- The user-facing experience can stay generic while the backend still routes to `AE` vs `SDR`.
- This means the system needs a hidden route label even when the visible copy is identical.

### `AE booking` likely needs an intermediate state
- If representative matching takes 1-2 minutes, this is not a simple instant-booking route.
- The system may need an intermediate `matching representative` or `finding representative` state before booking is shown.

### `SDR live handoff` is not just copy
- It needs presence, handoff timing, and state transition behavior.
- It is meaningfully different from booking, even if the recommendation language stays similar.

### `Lower-touch` and `Redirect` remain underdefined
- These should stay in scope as real outcomes.
- But they should not block near-term work on the more defined representative paths.

## Recommended next design sequence
1. Decide the UX pattern for `AE booking` when representative matching is not instant.
2. Design the in-thread transition for `SDR live handoff`.
3. Define the minimum viable prototype artifact for `Lower-touch / direct purchase`.
4. Define the minimum viable prototype artifact for `Redirect / no-sales`.

## Quick reminder
The working principle is:

- hidden system: `AE`, `SDR live`, `SDR booking`, `Lower-touch`, `Redirect`
- visible experience: `the next best representative or solution step`

That separation is the key to making the experience feel helpful instead of scored.
