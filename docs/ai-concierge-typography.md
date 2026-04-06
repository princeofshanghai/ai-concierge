# AI Concierge Typography

## Purpose
This document defines the typography system for the AI concierge panel.

It exists so future UI polish work stays consistent, intentional, and easy to maintain.

## Scope
This typography system applies to the AI concierge panel only.

That includes:
- welcome screen
- onboarding form
- chat thread
- composer
- next-step and success states

That does not include:
- the landing page
- the landing page hero
- the broader site typography system

The landing page should stay visually independent unless explicitly approved.

## Core Principle
For the AI concierge panel, always use the predefined typography styles.

Do not create new one-off text styles in components with ad hoc combinations like:
- `text-[15px]`
- `leading-[1.35]`
- `tracking-[0.01em]`

Instead, map the UI to the closest existing typography token first.

## Source Of Truth
The current implemented typography tokens live in:
- [src/app/globals.css](/Users/chhu/cursor-projects/ai-concierge/src/app/globals.css)

The current system is intentionally based on the Figma typography spec, but implemented using the project's system font stack instead of literal `SF Pro`.

That is intentional.

We want to match:
- hierarchy
- size
- weight
- line height
- letter spacing

We do not need to match the exact Figma font files if the implementation font stack is already close enough.

## Font Strategy
For the AI concierge panel:
- keep the existing system font stack
- do not switch panel text to literal `SF Pro`
- do not introduce a separate font-loading setup just for the panel unless explicitly approved

The current panel tokens all use the shared system stack:
- `system-ui`
- `-apple-system`
- `BlinkMacSystemFont`
- `"Helvetica Neue"`
- `sans-serif`

## Implemented Tokens
These are the currently implemented AI concierge typography tokens.

| Token | Size | Weight | Line height | Letter spacing | Intended use |
| --- | --- | --- | --- | --- | --- |
| `ai-type-body-xs` | 12px | 400 | 1.25 | 0 | timestamps, helper text, metadata |
| `ai-type-body-sm` | 14px | 400 | 1.25 | -0.15px | compact body/UI text |
| `ai-type-body-sm-open` | 14px | 400 | 1.5 | -0.15px | chat copy, secondary conversational text |
| `ai-type-body-md` | 16px | 400 | 1.25 | -0.32px | compact medium body text |
| `ai-type-body-md-open` | 16px | 400 | 1.5 | -0.32px | primary explanatory copy, composer text |
| `ai-type-body-lg` | 20px | 400 | 1.25 | 0.38px | large compact body text |
| `ai-type-body-lg-open` | 20px | 400 | 1.5 | 0.38px | large reading text |
| `ai-type-label-xs` | 12px | 600 | 1.25 | 0 | small labels, chips, micro UI labels |
| `ai-type-heading-sm` | 14px | 600 | 1.25 | -0.15px | small emphatic UI text, small button labels |
| `ai-type-heading-md` | 16px | 600 | 1.25 | -0.32px | medium emphatic UI text, primary button labels |
| `ai-type-heading-lg` | 20px | 600 | 1.25 | 0.38px | large section headings |
| `ai-type-heading-xl` | 24px | 600 | 1.25 | 0.38px | panel page titles and major headings |
| `ai-type-display-md` | 32px | 600 | 1.25 | 0.38px | welcome-title level emphasis |
| `ai-type-display-lg` | 48px | 400 | 1.25 | 0.38px | reserved display scale, not a default panel style |

## Recommended Usage
These are the default mappings we should follow unless there is a strong reason not to.

### Welcome Screen
- title: `ai-type-display-md`
- body copy: `ai-type-body-md-open`
- helper line above CTAs: `ai-type-body-xs`
- CTA labels: `ai-type-heading-md`

### Onboarding Form
- page title: `ai-type-heading-xl`
- inline helper copy: `ai-type-body-xs`
- inline action links: `ai-type-label-xs` or `ai-type-heading-sm`
- profile summary name: `ai-type-heading-sm`
- profile summary email: `ai-type-body-xs`
- field labels: `ai-type-label-xs`
- field values: `ai-type-body-md`
- field helper/error text: `ai-type-body-xs`
- submit button: `ai-type-heading-md`

### Chat UI
- timestamp: `ai-type-body-xs`
- assistant message: `ai-type-body-sm-open`
- user message: `ai-type-body-sm-open`
- suggested reply chips: `ai-type-heading-sm`

### Composer
- textarea text: `ai-type-body-md-open`
- popover title: `ai-type-label-xs`
- suggestion items: `ai-type-body-sm-open`
- hint pill text: `ai-type-label-xs`

### Next-Step And Success States
- main title: `ai-type-heading-xl`
- supporting copy: `ai-type-body-md-open`
- section labels: `ai-type-heading-md`
- date/time options: `ai-type-heading-sm` or `ai-type-heading-md`
- meta tags: `ai-type-label-xs`
- footer/support copy: `ai-type-body-sm-open`

## Implementation Rules
When working on the AI concierge panel:

1. Always use an existing `ai-type-*` token first.
2. Do not hardcode typography values in panel components unless there is a confirmed exception.
3. Keep the landing page out of scope.
4. Keep the current system font stack unless explicitly told otherwise.
5. Prefer semantic reuse over literal Figma-by-Figma duplication.

## Working With New Figma Specs
Future Figma specs may introduce text styles that look slightly different from what is already implemented.

The default rule is:
- reconcile new specs to the existing AI concierge typography system whenever the intent is clearly the same

Do not automatically add a new token just because Figma shows a slightly different style name.

First ask:
- does this map cleanly to an existing token?
- is the difference meaningful in the product, or only cosmetic in the design file?
- is this for the AI concierge panel, or for a different part of the site?

## Ask For Confirmation Before Changing The System
Ask the user to confirm before proceeding if any of these happen:

- a new Figma spec does not map clearly to an existing `ai-type-*` token
- the new spec would require creating a new typography token
- the new spec would change the system font stack
- the new spec would affect the landing page or any non-panel UI
- the new spec suggests a much more expressive display style across dense product surfaces
- the new spec conflicts with the current hierarchy in a way that changes UX meaning, not just polish

## Examples
Good:

```tsx
<h3 className="ai-type-heading-xl text-black/90">Review your details</h3>
<p className="ai-type-body-md-open text-black/90">
  Tell us about your hiring needs so we can answer your questions.
</p>
```

Avoid:

```tsx
<h3 className="text-[28px] font-semibold leading-[1.1] tracking-[0.01em]">
  Review your details
</h3>
```

## Summary
The AI concierge panel now has a scoped typography system.

That means:
- it should stay internally consistent
- it should not leak onto the landing page
- it should stay mapped to the current token set unless the user explicitly approves a change
