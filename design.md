# Design Implementation Rules

## Purpose
This file is the default design-system guidance for this repo.

Some UI was built quickly before the more intentional design primitives were implemented.

Going forward, the newer implemented components, typography tokens, and color tokens should be the default source of truth.

## Default Rule
When designing, updating, or implementing UI in this project:

1. Reuse an existing implemented component before creating a new one.
2. Use the implemented typography tokens before introducing one-off text styling.
3. Use the implemented color tokens before introducing one-off colors.
4. Prefer minimalist, concise UI copy and layouts when possible.
5. Add helper text, secondary explanation text, or extra instructional copy only when it is truly necessary.
6. Avoid ALL CAPS styling.

This is the default expectation even if an older quick component or earlier styling pattern already exists in the repo.

## Source Of Truth
Prefer these sources in this order:

- existing shared UI components in `src/components/`
- implemented typography guidance in `docs/design/typography.md`
- implemented typography and color tokens in `src/app/globals.css`

In plain English:

- if a component already exists, start there
- if a text style already exists, use that token
- if a color already exists, use that token
- if the UI works without extra explanation, keep it simple
- if text can be shorter and still clear, make it shorter
- do not default to ALL CAPS labels or headings

## Content Style
The default content style for this project should be minimalist and concise.

That means:

- prefer shorter labels and shorter supporting copy
- do not add helper text by default just because there is space for it
- do not add secondary explanation text unless it meaningfully helps comprehension
- keep interfaces visually calm and direct

Helper text is still appropriate when it prevents confusion or improves usability.

Good reasons to include it:

- the user may not understand what a field or action means without it
- the UI needs to explain a loading, empty, error, or success state
- the user needs context to make an informed choice
- accessibility or clarity would suffer without it

If the interface is already understandable without extra copy, leave the extra copy out.

## Confirmation Dialogs
For AI concierge confirmation dialogs, default to the existing panel typography system:

- dialog title: `ai-type-heading-lg`
- dialog body copy: `ai-type-body-sm`

This keeps confirmation moments visually lighter than full panel page titles while still feeling clear and intentional.

## What To Avoid
Avoid creating new UI by default when the existing system already covers the need.

That means we should generally avoid:

- duplicating an existing component with slightly different styling
- hardcoding one-off text sizes, weights, or line heights when an `ai-type-*` token already works
- hardcoding one-off color values when an existing token already works
- preserving older quick patterns just because they were built first
- adding helper text or secondary explanation text that is nice-to-have but not necessary
- using ALL CAPS for labels, buttons, tags, headings, or navigation text by default

## Exceptions Are Allowed
It is okay to diverge when:

- no suitable component exists yet
- the existing component would require awkward compromises
- the UX intentionally needs a different treatment
- we are exploring something new and do not want to prematurely force it into the system
- extra explanatory copy is necessary for clarity or confidence
- a specific text treatment is intentionally different and the reason is clear

If we diverge deliberately, call it out clearly.

That callout should include:

- what diverged
- why we diverged
- whether the divergence is temporary or should become part of the shared system later
- whether the extra copy or text treatment is essential, or just a preference

## UX Implications
Following this rule should improve:

- visual consistency across the product
- clearer hierarchy and readability
- more predictable loading, empty, and error states because the same patterns and copy rules get reused
- mobile and responsive behavior because fewer one-off components need special fixes
- accessibility because shared components and tokens are easier to improve centrally
- stronger signal-to-noise ratio because only necessary supporting copy is shown

If a deliberate exception creates a UX compromise, say that explicitly.

## System Implications
Following this rule should reduce:

- design drift between older and newer screens
- duplicated implementation work
- maintenance cost when styles change
- inconsistent behavior between similar components
- copy bloat that makes screens harder to scan and maintain

The tradeoff is that the system should guide decisions without blocking progress.

If the system does not support a valid need yet, move forward and document the gap instead of forcing a bad fit.

## Practical Review Checklist
Before shipping UI work, quickly check:

- did we reuse an existing component where possible?
- did we use the implemented typography tokens?
- did we use the implemented color tokens?
- did we keep the copy as concise as possible?
- did we avoid extra helper text unless it was actually needed?
- did we avoid ALL CAPS styling?
- if not, did we clearly call out the exception?

## Summary
Default to the design system that exists now, not the quick patterns that came first.

Reuse what is already implemented.

Keep the UI concise and minimalist by default.

Do not add extra helper copy or ALL CAPS styling unless there is a clear reason.

If a component does not exist yet, or if a deliberate divergence is the right choice, that is okay, but call it out explicitly.
