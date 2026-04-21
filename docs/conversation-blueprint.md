# Conversation Blueprint

## Purpose
This document defines how the AI Concierge conversation works and why it is designed that way.

Use it to answer:
- what the assistant should do in the first few turns
- why each message exists
- when to use chips vs open text
- how qualification and helpfulness work together
- how the visible conversation connects to hidden lead routing

For project context, BANT approach, and the routing model, see [project-overview.md](project-overview.md).

## Design rationale

### Conversation structure: the hybrid model
AI Concierge uses a hybrid model: suggested chips plus open text input.

- **Open field only** creates blank-canvas anxiety when users don't know what to ask.
- **Guided chips only** feels robotic and low-trust.
- **Hybrid** reduces anxiety while still respecting the user's own framing.

The guiding principle: chips reduce cognitive load at decision points; open text respects the user's framing.

| Moment | Prefer chips | Prefer open text | Why |
|---|---|---|---|
| Opening | Yes, 2-3 situational chips | Still allow typing | Reduces "what do I even say" anxiety |
| Diagnostic middle | Yes, 3-4 options | Allow typing as escape hatch | Keeps momentum, prevents long answers that are hard to route |
| User asks a question | No | Let them type freely | Chips feel dismissive when the user has a real question |
| After a long AI answer | Yes, 1-2 follow-up chips | Allow typing | Gives the user a "what's next" nudge |
| Near handoff | Yes, clear action chips | Less open text | The goal is commitment, not drift |

Common mistakes:
- Using chips everywhere makes the experience feel like a phone tree.
- Using chips nowhere makes the experience feel like talking into a void.

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

### Situational chips over topic chips
Opening chips should describe where the user is, not what they want to learn about.

**Situational (recommended):**
- `We're not sure which hiring solution fits`
- `We need help with harder-to-fill roles`

**Topic (not recommended):**
- `Tell me about Recruiter`
- `Compare hiring products`

Situational chips sound like things a real person would say, give diagnostic signal, and put the user in "help me" mode. Topic chips make the assistant feel like a FAQ.

Chips should use first-person voice. Three chips is a good default, four is fine. Include one lower-commitment option for users who aren't ready.

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

## Primary persona
The default walkthrough persona is Jamie Chen from [persona.md](persona.md):
- Director of Talent Acquisition, Northstar Health
- Hiring across multiple functions
- Dealing with some harder-to-fill roles
- High intent, but not immediately ready for a handoff

## Message-by-message flow

### Step 1: Opening
Example (prefill):

> Hi Jamie, I can help you figure out which hiring solutions could make sense for Northstar Health, answer questions about how they fit different hiring needs, and connect you with a representative if that becomes useful.
>
> Here are a few ways to get started:

Example (manual entry):

> Hi Jamie, thanks for sharing your details. I can help you figure out which hiring solutions could make sense for Northstar Health, answer questions about how they fit different hiring needs, and connect you with a representative if that becomes useful.
>
> Here are a few ways to get started:

Visible purpose: orient the user, show the onboarding mattered, reduce blank-chat anxiety.
Hidden signal: confirmed persona and company context.

### Step 2: Starting situation
User chooses one of the opening prompts.

Visible purpose: help the user start without writing a full prompt.
Hidden signal: `starting_situation`.

### Step 3: Hiring motion diagnosis
This is the most important middle step.

If the user starts with `We're not sure which hiring solution fits`:

> I can help with that. The right fit usually depends on whether your team is hiring consistently across teams, needs more proactive sourcing for harder-to-fill roles, or is looking for a lighter-touch option.
>
> Which is closer to your situation right now?

Suggested replies:
- `We hire consistently across teams`
- `We need help with harder-to-fill roles`
- `We're hiring occasionally`
- `We're still figuring that out`

Visible purpose: help before qualifying, give the user a simple decision lens.
Hidden signal: `hiring_motion`.

### Step 4: Specific fit diagnosis
Once hiring motion is clearer, the assistant asks for role or team context.

If `We hire consistently across teams`:

> That helps. Teams hiring consistently across multiple functions usually need a more structured, proactive approach than teams hiring occasionally.
>
> Which teams or roles are most affected right now?

If `We need help with harder-to-fill roles`:

> That helps. When teams are struggling with harder-to-fill roles, they often need a more proactive sourcing approach instead of relying only on inbound applicants.
>
> What kinds of roles are most affected right now?

Suggested replies:
- `Engineering`
- `Sales`
- `Mix of roles`
- `Hard-to-fill roles`

Visible purpose: move from broad motion into concrete fit diagnosis.
Hidden signals: `hiring_use_case`, `hiring_complexity`.

### Step 5: Urgency / priority
Once role context is clear, the assistant adds one timing signal.

> That gives me a better sense of the hiring pattern.
>
> How soon do you need to make progress on this?

Suggested replies:
- `This quarter`
- `In the next few months`
- `We're planning ahead`
- `Still exploring`

Visible purpose: add a timing signal without sounding like sales discovery.
Hidden signal: `timeline / urgency`.

### Step 6: Reflected recommendation
The assistant reflects what it learned and introduces the likely-fit product.

Preferred version:

> It sounds like Northstar Health is hiring consistently across engineering and product, and the need is fairly near-term. A more proactive sourcing approach is usually what helps in that situation, which is where Recruiter tends to be most useful.

Visible purpose: translate user context into a likely-fit recommendation.
Hidden effect: stronger confidence in likely solution category.

### Step 7: Next-step routing
The prototype now proactively routes based on signal strength rather than offering a generic menu.

**Strong recruiter-fit signal:** The assistant presents a recommendation card and moves directly toward connection.

> [recommendation] A quick conversation with someone on our team could help you figure out the right setup.

**Strong lighter-touch signal:** The assistant presents a product recommendation card.

> [recommendation] Here's what I'd recommend.

**Weak or unclear signal:** The assistant offers a choice.

> Would it be more helpful to keep exploring, get pricing guidance, or talk with a representative?

## Alternate entry paths

### Consistent hiring
If the user starts with `We hire consistently across teams`, skip the decision-lens step and go directly to role or team context.

### Harder-to-fill roles
If the user starts with `We need help with harder-to-fill roles`, skip the broader decision lens and move into role context.

### Pricing guidance
If the user starts with `We have questions about pricing`:
- Acknowledge the question and let them know a specialist can walk them through options tailored to their needs
- Use the follow-up to understand fit

### Just getting started
If the user starts with `I'm just getting started`:
- Respond with a relaxed, low-pressure framing
- Ask one broad question to understand their situation

## Alternate conversation modes

### Curious but not ready
Pattern: answer clearly first, ask one soft context question, keep the CTA soft.

### Wrong intent
Pattern: acknowledge the mismatch, redirect clearly, do not force the sales path.

## Outcome variants
Each outcome uses the same high-level transition:
1. The assistant recommends a next step in chat.
2. The right-side next-step surface opens.
3. The user can complete the action or go back to chat.

### AE booking
When to use: strong fit, senior buyer, broader hiring needs.
Next-step surface: booking surface with more decisive framing.

### SDR live handoff
When to use: medium-value lead, human help useful now, live SDR available.
Next-step surface: live-connect in the same chat thread.

### SDR booking
When to use: medium-value lead, good fit for follow-up, no live SDR.
Next-step surface: booking surface.

### Lower-touch / direct purchase
When to use: smaller scope, lighter hiring need, high confidence a lighter path fits.
Next-step surface: recommendation card, not booking.

### Redirect / no-sales
When to use: wrong audience, support or job-seeker intent, low commercial value.
Next-step surface: redirect card or destination.

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
- [project-overview.md](project-overview.md): project context, BANT approach, routing model, scope
- [conversation-system-prompt.md](conversation-system-prompt.md): external production AI spec (reference only)
- [routing-outcomes-worksheet.md](routing-outcomes-worksheet.md): detailed routing design
- [persona.md](persona.md): Jamie Chen persona
