# Conversational UX Principles

## Purpose
This document captures the UX principles and best practices for how AI Concierge structures its conversations.

Use it to answer:
- why the conversation is designed the way it is
- when the assistant should use prompt chips vs. open text
- what makes a good opening message
- how to balance helping the user with qualifying the lead

Related docs:
- [conversation-strategy.md](conversation-strategy.md)
- [conversation-blueprint.md](conversation-blueprint.md)
- [project-overview.md](project-overview.md)

## Three approaches to conversation structure

There are three common models for how conversational AI products handle user input.

### Open field
The user types whatever they want with no guidance.
- Feels powerful when the user already knows what to ask.
- Creates blank-canvas anxiety when they don't.
- Hard to steer toward business outcomes.
- Used by general-purpose assistants like ChatGPT.

### Guided chips only
The user picks from a set of predefined options at every step.
- Easy to design for. Predictable routing.
- Feels robotic and low-trust. Users sense they are being funneled.
- Common in older chatbots and support bots.

### Hybrid: chips + open input
The user sees suggested chips but can also type freely.
- Reduces blank-canvas anxiety while still respecting the user's own framing.
- Harder to design because both paths need to work.
- Used by the strongest modern conversational products.

**AI Concierge uses the hybrid model.** The question is where to lean at each moment.

## When to use chips vs. open text

The guiding principle: **chips reduce cognitive load at decision points; open text respects the user's own framing.**

| Moment | Prefer chips | Prefer open text | Why |
|---|---|---|---|
| Opening | Yes, 2-3 situational chips | Still allow typing | Reduces "what do I even say" anxiety |
| Diagnostic middle | Yes, 3-4 options | Allow typing as escape hatch | Keeps momentum, prevents long answers that are hard to route |
| User asks a question | No | Let them type freely | Chips feel dismissive when the user has a real question |
| After a long AI answer | Yes, 1-2 follow-up chips | Allow typing | Gives the user a "what's next" nudge |
| Near handoff | Yes, clear action chips | Less open text | The goal is commitment, not drift |

The most common mistakes:
- Using chips everywhere makes the experience feel like a phone tree.
- Using chips nowhere makes the experience feel like talking into a void.

## The opening message

The opening message is the highest-leverage moment in the conversation. It determines whether the user engages or bounces.

### What a good opening does
1. **Orients.** Tells the user what this experience can do, and implicitly, what it can't.
2. **Personalizes lightly.** Uses the name or company from onboarding so the form didn't feel pointless.
3. **Reduces blank-canvas anxiety.** Gives the user a clear first move.
4. **Sets the tone.** Consultative, not salesy. Capable, not generic.

### What to avoid in the opening
- Listing everything the assistant can do. That feels like a feature dump.
- Asking a question in the opening message. The user just arrived. Let them choose their entry, not answer a question.
- Being so open that the user has no idea what to say.
- Being so narrow that it feels like a multiple-choice quiz.

### Keep it short
Most users will skim the opening message and go straight to the chips. One clear sentence plus the chips is usually better than a paragraph. Let depth emerge through the conversation.

## Situational chips vs. topic chips

There are two styles of opening chip:

### Situational chips (recommended)
These describe where the user is, not what they want to learn about.
- `We're not sure which hiring solution fits`
- `We need help with harder-to-fill roles`
- `We have questions about pricing`

Why these work:
- They sound like things a real person would say.
- They give the assistant diagnostic signal, not just a topic to talk about.
- They put the user in "help me" mode instead of "research" mode.

### Topic chips (not recommended for this product)
These describe a subject the user wants to explore.
- `Tell me about Recruiter`
- `Compare hiring products`

Why these are weaker here:
- They don't reveal the user's situation.
- They make the assistant feel like a FAQ, not a consultant.
- They don't produce useful qualification signal.

### First-person voice
Chips should sound like something the user would actually say. "We need help with harder-to-fill roles" is better than "Harder-to-fill roles" because it primes the user to think of the conversation as their own.

### Number of chips
Three chips is a good default. Four is fine. Five starts to feel like a menu. Consider including one lower-commitment option for users who aren't ready to declare a need, such as `I'm just getting started`.

## Balancing helpfulness with qualification

The central design tension: the assistant needs to be genuinely helpful while also gathering signals the business needs for lead routing.

### The "answer, then pivot" pattern
Every AI response should do two things:
1. Actually answer or acknowledge what the user said.
2. End with one natural follow-up that moves the conversation forward.

The follow-up should feel like it helps the user, not the system. If the user can see why the question makes their answer better, they will answer willingly. If it feels like a non-sequitur, it feels like a form.

Example — user asks about pricing:
- **Weak:** "Pricing depends on your needs. How many people are on your team?"
  This feels like a trap. The user asked about pricing and got a qualification question back.
- **Strong:** "Pricing usually depends on hiring volume and how proactive your team's sourcing needs are. To give you a more useful answer — is this for ongoing hiring across your org, or more for a specific set of roles?"
  This feels like the question is serving the user's interest.

### One question at a time
Never ask two questions in one message. This is the single most common mistake in conversational AI. One question per turn, always.

### Don't complete the checklist
Two strong qualification signals are usually enough to route well. Don't keep asking questions just to fill in missing fields. If there is enough information to recommend something, recommend it.

### Earn the right to ask
The conversation should deepen gradually:
- **Turn 1:** Orient and offer. Don't ask anything yet.
- **Turn 2:** The user has shared something. One clarifying question is earned.
- **Turn 3:** Answer or reflect. A slightly deeper question is now natural.
- **Turn 4+:** The user has invested enough that specific questions feel appropriate.

Rushing this progression makes the conversation feel extractive.

## Additional principles

### Reflect before advancing
Before asking the next question, briefly echo what was understood. This builds trust, gives the user a chance to correct, and makes the conversation feel more human.

### Keep AI messages short
A 2-sentence answer plus 1 follow-up question is almost always better than a 4-paragraph answer. Long messages push chips off-screen and make the user feel like they are reading documentation.

### Progressive disclosure
Don't show everything the assistant can do up front. Let the user discover depth through the conversation. Early turns should feel simple. Later turns can feel more sophisticated.

### Graceful off-ramps
Users who are wrong-intent, not ready, or just exploring should still have a good experience. The assistant should never make someone feel like they failed a screening.

## How this connects to hidden qualification

The user-facing conversation focuses on guidance, diagnosis, and recommendation. The hidden system interprets the same conversation for qualification signals.

Practical mapping:
- **Need** is captured through the user's starting situation, hiring motion, and use case. This is the strongest signal and the one most naturally gathered through helpful conversation.
- **Authority** is mostly inferred from onboarding context like role and seniority.
- **Timeline** is inferred from urgency language and from which next step the user chooses.
- **Budget** is hinted at through pricing interest but never asked directly.

The assistant should never try to visibly "complete BANT." The goal is to gather enough signal through a natural conversation, not to check every box.

## Summary
- Use the hybrid model: chips at decision points, open text as an escape hatch.
- Keep the opening short, oriented, personalized, and chip-driven.
- Use situational chips that sound like real user statements, not topic menus.
- Answer before asking. One question per turn.
- Earn deeper questions through the conversation, don't front-load them.
- Two strong signals are enough to route. Don't over-qualify.
- Keep AI messages short. Reflect before advancing. Let depth emerge over turns.
