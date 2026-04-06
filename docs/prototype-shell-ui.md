# Prototype Shell UI

Prototype shell UI is an internal-only interface layer used by employees and stakeholders to navigate, compare, explain, and inspect the prototype.

It is not part of the intended customer-facing experience.

## Purpose

- make prototype states and scenarios easier to understand without narration
- make important comparisons easy, such as `v1 vs v2` or `logged out vs logged in`
- support notes, toggles, and internal controls without blending into the product UI

## Principles

- shell UI should be clean, minimal, and calm
- shell UI should look clearly different from the actual product UI
- shell UI should help the viewer, not compete with the main experience
- shell UI should be collapsible or hideable
- shell UI should use consistent patterns across the prototype
- shell UI should scale beyond one-off controls

## Approved Patterns

- view switchers
- logged-in and logged-out state toggles
- notes and annotations
- scenario selectors
- reset or replay controls
- docked helper cards for internal guidance, such as example responses

## System Rules

- treat shell UI as a shared prototype layer, not page-specific custom widgets
- prefer reusable shell components over one-off controls
- prefer URL-driven state when practical so specific prototype states can be shared and revisited
- keep shell concerns separate from the actual product experience

## Starter Library

The starter library for React shell UI should live in:

- `src/components/prototype-shell.tsx`

The standalone notes page should mirror the same visual system with matching shell classes so the shell feels consistent across prototype surfaces.

Start with these reusable primitives:

- shell card
- shell micro label
- shell chip row
- shell chip / link chip
- shell action button
- composed switcher

When adding shell features later:

- compose from these primitives before creating a one-off control
- keep shell state styling inside the primitive itself, not scattered across page components
- keep one shared selected-state pattern for shell chips and toggles

## Text Rules

- shell labels should use one consistent micro-label style: small, muted, sentence case, system sans
- shell chips and shell action buttons should use one consistent text style: small, semibold, centered, system sans
- shell helper copy and menu titles should use sentence case, not all caps
- selected shell chips must swap both background and text color together
- do not rely on conflicting text color classes layered on the same chip for selected vs unselected state
- shell typography should stay visually separate from the customer-facing page typography
- avoid using product-like highlights or focus treatments to reveal shell guidance when a dedicated shell card would be clearer

## Anti-Patterns

- shell UI that looks like shipped product UI
- shell UI that is always visible by default when it does not need to be
- shell UI that is implemented differently on every page
- shell UI that adds clutter without helping tell the story
