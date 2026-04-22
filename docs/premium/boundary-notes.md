# Premium Survey Prototype Boundary Notes

## Decision

- `/prototype/premium-survey` and `/` are two different prototype projects.
- They can reuse the same UI language and shared components.
- They should not share the same product behavior underneath.

## Premium Survey Rules

- The premium survey flow should stay fully self-serve for now.
- It should only recommend plans and products.
- It can recommend adjacent products like Sales Navigator Core or Recruiter Lite.
- Those recommendations should stay in a product-recommendation context, not a sales lead qualification context.
- It should not hand off to a human rep.
- It should not enter sales lead qualification flows.
- It should not use sales-rep, live-sales, or phone-call behavior.

## Menu Rule

- The Premium survey can reuse the same small top-left `Prototype menu` visual style.
- But the premium menu should only show premium-survey-related screens and controls.
- It should feel separate from the default route, not like one shared prototype hub.

## Leakage To Watch For

- Premium FAB opens sales lead qualification behavior.
- Premium chat mentions connecting to a sales rep or booking with a rep.
- Premium route remembers or restores state from the default route.
- Premium menu links route into the default prototype project.
- Shared components bring in main-prototype logic instead of just shared UI.

## Implementation Direction

- Reuse shared presentation:
  - panel shell
  - chat styling
  - composer styling
  - recommendation cards
  - menu/drawer visual treatment
- Separate project-specific behavior:
  - conversation rules
  - state transitions
  - session storage
  - menu contents
  - launch behavior

## Short Principle

Same UI, separate brain.
