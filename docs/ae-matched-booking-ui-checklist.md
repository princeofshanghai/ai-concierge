# AE Matched Booking UI Checklist

## Purpose
This document turns the `AE booking: Matched booking` concept into a UI review artifact.

Use it to answer:
- what should appear on screen during matched booking
- which UI pieces need to exist
- what each piece needs to say and do
- how the experience should behave over time
- what to review before designing or building visuals

This is not final product copy.
It is a practical checklist for shaping the prototype UI.

Related docs:
- [routing-outcomes-worksheet.md](routing-outcomes-worksheet.md)
- [conversation-blueprint.md](conversation-blueprint.md)
- [prototype-shell-ui.md](prototype-shell-ui.md)

## Working principle
The user-facing experience should feel like:
- AI Concierge is finding the right representative
- the user can keep exploring while that happens
- the system will clearly bring them back when booking is ready

The user should never feel:
- trapped in a loading state
- forced to babysit the matcher
- confused about whether anything is happening

## Recommended experience model
1. The assistant recommends talking to a representative.
2. The user agrees.
3. The shared next-step shell opens into a matching state.
4. A matching card is also visible in-thread as the durable status artifact.
5. If the user goes back to chat, matching continues in the background.
6. When ready, the in-thread card updates and a lightweight banner appears near the composer.
7. Tapping `Book meeting` opens the existing booking surface.

## Design-system pass from `design.md`

### Default implementation rules for this flow
- Reuse an existing implemented component before creating a new one.
- Use `ai-type-*` typography tokens instead of one-off text styles.
- Use `ai-*` surface, text, border, and blue tokens instead of hardcoded colors.
- Keep copy short by default.
- Do not add extra helper copy unless it is necessary for loading, empty, error, or confidence states.
- Do not use ALL CAPS.

### Recommended reuse in this repo
- Use [button.tsx](/Users/chhu/cursor-projects/ai-concierge/src/components/button.tsx) for `Book meeting`, `Back to chat`, and other explicit actions.
- Reuse the existing booking surface in [ai-concierge-next-step-panel.tsx](/Users/chhu/cursor-projects/ai-concierge/src/components/ai-concierge-next-step-panel.tsx) instead of creating a second scheduler.
- Reuse the existing chat-thread patterns in [chat-assistant-message.tsx](/Users/chhu/cursor-projects/ai-concierge/src/components/chat-assistant-message.tsx) as the baseline for how status content sits in the thread.
- Reuse [suggested-action-prompt.tsx](/Users/chhu/cursor-projects/ai-concierge/src/components/suggested-action-prompt.tsx) only if a secondary action should visually behave like an in-thread reply chip. Otherwise prefer `Button`.
- Reuse [tag.tsx](/Users/chhu/cursor-projects/ai-concierge/src/components/tag.tsx) only for compact metadata, not as the main status treatment.

### Deliberate exceptions
- The in-thread matching card is a new component.
- The ready banner near the composer is a new component.

Why these exceptions are okay:
- no current shared component cleanly covers a durable background-status card
- no current shared component cleanly covers a contextual ready banner near the composer

Expectation for these exceptions:
- build them from existing tokens and existing action components
- keep them visually aligned with the panel system
- treat them as candidate shared patterns later if they work well

## Component inventory

| Component | Where it appears | Purpose | Must-have content | Key states |
|---|---|---|---|---|
| Assistant recommendation message | Chat thread | Explain why a representative is useful before matching starts | short rationale plus next-step framing | static |
| Matching shell state | Shared next-step shell | Give the user a premium, intentional waiting state right after they opt in | title, body, subtle motion, `Back to chat` | matching, delayed, fallback |
| In-thread matching card | Chat thread | Durable record of status that remains available even after the user returns to chat | title, body, status treatment, optional secondary action | matching started, still matching, delayed, ready, ready-no-times, failed |
| Ready banner near composer | Bottom of chat, above or near composer | Foreground prompt that brings the user back once matching is ready | title, supporting line, `Book meeting`, dismiss | hidden, visible, dismissed |
| Booking surface | Shared next-step shell | Let the user pick a day/time once matching is complete | existing booking UI | booking ready, booked |

## UI requirements by component

### 1. Assistant recommendation message

#### Purpose
- Make the human handoff feel earned before matching starts.

#### Required content
- A short reason why a representative would help.
- A soft transition into the next step.

#### Example direction
> Based on what you shared, a representative could help you think through the right setup for your team.
>
> I can help you book a meeting, or we can keep exploring first.

#### Recommended typography and components
- rationale copy:
  `ai-type-body-sm-open`
- inline response actions:
  existing suggested reply pattern from the chat system

#### UX implications
- Keep it short. The card and shell do the heavier lifting after the user agrees.
- This should feel like guidance, not qualification theater.

### 2. Matching shell state

#### Purpose
- Give the user an immediate, intentional visual transition after they opt in.
- Prevent the experience from feeling like a dead pause.

#### Required content
- Title:
  `Finding the right representative`
- Body:
  `I'm looking for the best match for your situation. This usually takes about 1-2 minutes.`
- Persistent back affordance:
  `Back to chat`

#### Recommended typography and tokens
- title:
  `ai-type-heading-xl`
- body:
  `ai-type-body-md-open`
- surface:
  `ai-surface-panel-subtle` or `ai-surface-base`
- text:
  `ai-text-primary` plus `ai-text-meta`
- border/divider:
  `ai-divider-subtle` or `ai-divider`
- action:
  existing `Button`

#### Visual guidance
- Calm, premium, service-like.
- Subtle animation only.
- No fake progress bar unless progress is truly known.
- Avoid operational or internal routing language.
- Keep the layout sparse rather than filling the shell with explanatory text.

#### UX implications
- Loading state:
  This is the most important loading state in the flow. It should feel alive and trustworthy.
- Empty state:
  If no booking data arrives, do not leave the shell blank. Convert it to a fallback state.
- Error state:
  If matching fails, the shell should say so plainly and give the user a clear next step.
- Mobile and responsive behavior:
  This should remain lightweight and readable in a small viewport.
- Accessibility:
  The state change into matching should be announced clearly with text.

#### System implications
- The shell needs a `matching` state separate from `booking ready`.
- The user must be able to leave the shell without canceling matching.

### 3. In-thread matching card

#### Purpose
- Act as the durable home base for the matched-booking process.
- Stay visible in the thread so the user always has a place to return to.

#### Required anatomy
- Status treatment area:
  icon, pulse, shimmer, orbiting dots, or similar
- Title
- Body text
- Primary action when ready
- Secondary action when useful

#### Recommended typography and components
- card title:
  `ai-type-heading-md`
- card body:
  `ai-type-body-sm-open`
- primary action:
  `Button` using the smallest size that still feels important
- secondary action:
  `Button` with lower emphasis by default
- optional compact metadata:
  `Tag`

#### Required states

##### State: Matching started
- Title:
  `Finding the right representative`
- Body:
  `This usually takes about 1-2 minutes.`
- Primary action:
  none
- Secondary action:
  `Keep exploring`

##### State: Still matching
- Title:
  `Still finding the right representative`
- Body:
  `Checking fit and availability. You can keep chatting while I work.`
- Primary action:
  none
- Secondary action:
  `Keep exploring`

##### State: Delayed
- Title:
  `This is taking a bit longer than usual`
- Body:
  `I'm still working on it. I'll let you know when it's ready.`
- Primary action:
  none
- Secondary action:
  `Keep exploring`

##### State: Ready
- Title:
  `Your representative is ready`
- Body:
  `I found the right representative for your situation.`
- Primary action:
  `Book meeting`
- Secondary action:
  `Keep exploring`

##### State: Ready, but no meeting times yet
- Title:
  `Your representative is identified`
- Body:
  `I found the right representative, but meeting times aren't ready yet.`
- Primary action:
  none
- Secondary action:
  `Keep exploring`

##### State: Matching failed
- Title:
  `I couldn't finish that just yet`
- Body:
  `I'm having trouble finishing the match right now.`
- Primary action:
  none for now
- Secondary action:
  `Keep exploring`

#### Visual guidance
- The card should feel more substantial than a chat bubble, but lighter than a full-screen modal.
- The ready state should feel noticeably different from matching, but not celebratory.
- Avoid status colors that make the experience feel like error monitoring software.
- Do not use the internal-only prototype shell visuals for this user-facing card.
- Prefer calm panel surfaces like `ai-surface-tint`, `ai-surface-base`, or `ai-surface-panel-subtle`.

#### UX implications
- This card is the durable fallback if the banner is missed or dismissed.
- It should still make sense if it is seen later out of context.

### 4. Ready banner near composer

#### Purpose
- Pull the user back at the exact moment booking becomes available.
- Reduce the chance that the user misses the matched result while actively chatting.

#### Required content
- Title:
  `Your representative is ready`
- Supporting line:
  `Book a meeting whenever you're ready.`
- Primary action:
  `Book meeting`
- Secondary action:
  dismiss

#### Recommended typography and components
- title:
  `ai-type-heading-sm`
- supporting line:
  `ai-type-body-sm-open`
- primary action:
  compact or small `Button`
- dismiss:
  low-emphasis button treatment, not plain text if it hurts tapability

#### Behavior
- Show only when matching completes and the user is not already in booking.
- Anchor it near the composer so it is visible without hiding the thread.
- If dismissed, do not immediately reshow unless the underlying booking state changes.
- Tapping `Book meeting` opens booking directly.

#### Visual guidance
- More prominent than a toast, less dominant than a modal.
- Should feel like a context-aware concierge nudge, not an ad unit.
- Should not cover the composer or block typing.
- Keep this visually lighter than the main card so it feels like a prompt, not a second destination.

#### UX implications
- Loading state:
  Do not use this banner during active matching. Save it for readiness only.
- Mobile and responsive behavior:
  The banner has to coexist with the composer comfortably on smaller screens.
- Accessibility:
  The banner needs clear text and keyboard focus behavior if it appears while the user is typing.

#### System implications
- Matching completion must trigger both:
  - a durable thread update
  - a temporary foreground prompt

### 5. Booking surface

#### Purpose
- Reuse the existing scheduling mechanism once the representative is ready.

#### Required behavior
- Open directly from either:
  - the ready banner
  - the in-thread ready card
- Preserve the matched context so the user feels this is the result of the matching flow, not a generic scheduler.

#### UX implications
- This should feel continuous with the matching state that came before it.
- The transition should not feel like a brand-new flow.

#### System implications
- Reuse the existing booking surface in [ai-concierge-next-step-panel.tsx](../src/components/ai-concierge-next-step-panel.tsx).
- The only new work should be the matched-booking entry states and transitions.

#### Recommended typography and token check
- stay inside the existing next-step panel system
- do not introduce one-off heading or body styles
- do not fork the scheduler into a second visual system just for matched booking

## Timeout and transition checklist

| Timing | User should see | Product behavior | Review focus |
|---|---|---|---|
| `0-30s` | matching shell or matching card | start matching, no extra interruption yet | does the wait feel active and calm? |
| `~30s` | `Still finding the right representative` | update status copy only | does it still feel trustworthy? |
| `~90s` | `This is taking a bit longer than usual` | shift to more honest background-processing tone | does it still feel premium, not broken? |
| `2+ min` | persistent delayed state | keep background matching, avoid fake “almost there” loops | what is the fallback if the wait keeps going? |
| `ready` | updated card plus ready banner | allow direct entry into booking | is it impossible to miss? |
| `ready, no times` | updated card, no booking CTA yet | stay informative and stable | is this helpful or frustrating? |
| `failed` | fallback state | stop pretending progress is happening | what is the graceful recovery path? |

## Motion guidance

### Matching motion
- Use subtle, loopable motion that can survive a longer wait.
- Good directions:
  shimmer, breathing glow, orbiting dots, soft pulse
- Consider adapting the tone of the existing assistant-thinking motion instead of inventing a completely different animation language.
- Avoid:
  fake percentage progress, loud looping illustrations, countdown timers

### Ready motion
- Use a clear state-change moment:
  accent shift, check, glow settle, brief elevation change
- The user should notice the transition without feeling interrupted.

### Reduced motion
- Every animated state needs a reduced-motion fallback.
- Status must still be understandable with no motion at all.

## Accessibility checklist
- Matching start is announced with clear text.
- Ready state is announced with clear text.
- Banner is reachable by keyboard without stealing focus unexpectedly.
- Dismiss is accessible and labeled.
- Thread card and banner both make sense to screen-reader users on their own.
- Color is never the only signal for state.

## Analytics checklist
- recommendation shown
- recommendation accepted
- matching started
- matching duration
- returned to chat while matching
- delayed state reached
- ready banner shown
- ready banner clicked
- ready banner dismissed
- in-thread card CTA clicked
- booking opened
- booking completed
- no-times fallback reached
- matching failed

## UX review questions
- Does the matching card feel premium or overly operational?
- Does the ready banner feel helpful or pushy?
- Is `Book meeting` the right level of specificity, or does it feel too abrupt?
- Does the experience make it obvious that matching continues even if the user keeps chatting?
- Is the delayed state honest enough without making the product feel weak?
- Does the booking transition feel like one continuous flow?
- Are we keeping the copy as short as possible without losing clarity?
- Are we reusing enough of the existing system, or are we drifting into one-off UI too early?

## System review questions
- What event should mark matching as truly complete?
- How will the session update the card and banner if the user is actively typing?
- What is the fallback when a representative is identified but times are unavailable?
- At what point do we stop background matching and switch to recovery behavior?
