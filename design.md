---
version: alpha
name: LinkedIn AI Concierge Chat
description: "A chat-only design system for a LinkedIn-native AI concierge that feels calm, trustworthy, and product-led. This file covers only the concierge panel, onboarding, conversation, handoff, booking, recommendation, and voice surfaces."
colors:
  primary: "#0A66C2"
  primary-hover: "#004182"
  on-primary: "#FFFFFF"
  surface: "#FFFFFF"
  surface-subtle: "#FAFBFD"
  surface-assistant: "#F6FBFF"
  surface-user: "#E8F3FF"
  surface-human: "#F4F2EE"
  surface-disabled: "#E8E8E8"
  border: "#E2E2E2"
  border-brand: "#AAD6FF"
  divider-subtle: "#F0F0F0"
  divider: "#EBEBEB"
  divider-strong: "#E6E6E6"
  text-primary: "#1A1A1A"
  text-secondary: "#404040"
  text-meta: "#666666"
  text-tertiary: "#8C8C8C"
  text-placeholder: "#A6A6A6"
  text-disabled: "#B3B3B3"
  success: "#01754F"
  success-hover: "#004C33"
  danger: "#CB112D"
  danger-hover: "#8A0015"
  premium-gold: "#C37D16"
  premium-gold-light: "#F9C982"
  tag-neutral: "#56687A"
  tag-caution: "#AD4601"
  tag-supportive-01: "#FDE2BC"
  tag-supportive-02: "#FFDFD6"
  tag-supportive-03: "#DAEBD1"
  tag-supportive-04: "#DDE7F1"
  tag-supportive-05: "#D9E9EC"
typography:
  display-md:
    fontFamily: System UI
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0.38px
  heading-xl:
    fontFamily: System UI
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0.38px
  heading-lg:
    fontFamily: System UI
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0.38px
  heading-md:
    fontFamily: System UI
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.32px
  heading-sm:
    fontFamily: System UI
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.15px
  body-md:
    fontFamily: System UI
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: -0.32px
  body-md-open:
    fontFamily: System UI
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.32px
  body-sm:
    fontFamily: System UI
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: -0.15px
  body-sm-open:
    fontFamily: System UI
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.15px
  body-xs:
    fontFamily: System UI
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: 0px
  label-xs:
    fontFamily: System UI
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0px
  chip-sm:
    fontFamily: System UI
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: 0px
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 18px
  xxl: 20px
  panel: 24px
  panel-docked: 28px
  panel-expanded: 32px
  full: 9999px
spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  xxl: 24px
  xxxl: 32px
  stack: 40px
  card-padding: 24px
  panel-padding: 20px
  pill-padding-inline: 16px
  button-padding-inline: 24px
  field-padding-inline: 12px
  form-gap: 16px
layout:
  panel-collapsed-width: 432px
  panel-expanded-max: 1480px
  panel-content-max: 720px
  detail-panel-max: 592px
  panel-header-height: 52px
  primary-action-height: 48px
  compact-action-height: 32px
  breakpoints:
    sm: 640px
    md: 768px
    lg: 1024px
overlays:
  text-primary: "rgba(0, 0, 0, 0.9)"
  text-secondary: "rgba(0, 0, 0, 0.75)"
  text-meta: "rgba(0, 0, 0, 0.6)"
  text-tertiary: "rgba(0, 0, 0, 0.45)"
  text-placeholder: "rgba(0, 0, 0, 0.35)"
  text-disabled: "rgba(0, 0, 0, 0.3)"
  inverse-muted: "rgba(255, 255, 255, 0.6)"
  surface-elevated: "rgba(255, 255, 255, 0.95)"
  surface-disabled: "rgba(140, 140, 140, 0.2)"
  overlay-soft: "rgba(0, 0, 0, 0.04)"
  overlay-hover: "rgba(0, 0, 0, 0.06)"
  overlay-active: "rgba(0, 0, 0, 0.08)"
  divider-subtle: "rgba(0, 0, 0, 0.06)"
  divider: "rgba(0, 0, 0, 0.08)"
  divider-strong: "rgba(0, 0, 0, 0.1)"
  border-faint: "rgba(140, 140, 140, 0.2)"
  border-strong: "rgba(0, 0, 0, 0.75)"
  border-hover: "rgba(0, 0, 0, 0.45)"
  border-focus: "rgba(0, 0, 0, 0.9)"
  blue-fill-hover: "rgba(55, 143, 233, 0.1)"
  blue-fill-active: "rgba(55, 143, 233, 0.2)"
  blue-focus-ring: "rgba(55, 143, 233, 0.08)"
  danger-focus-ring: "rgba(138, 0, 21, 0.2)"
  neutral-focus-ring: "rgba(0, 0, 0, 0.15)"
gradients:
  welcome-panel: "radial-gradient(circle at top, rgba(10,102,194,0.14), rgba(10,102,194,0.04) 28%, rgba(255,255,255,0) 54%), linear-gradient(180deg, #F2F7FF 0%, #F7FAFF 34%, #FFFFFF 100%)"
  premium-brand: "linear-gradient(0deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.12) 100%), linear-gradient(97deg, #0A66C2 0.8%, rgba(116,229,192,0.8) 85.7%)"
  premium-brand-hover: "linear-gradient(0deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.18) 100%), linear-gradient(97deg, #0A66C2 0.8%, rgba(116,229,192,0.86) 85.7%)"
  premium-brand-active: "linear-gradient(0deg, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.24) 100%), linear-gradient(97deg, #0A66C2 0.8%, rgba(116,229,192,0.72) 85.7%)"
  premium-surface: "linear-gradient(180deg, rgba(255,255,255,0.985) 0%, rgba(255,255,255,0.995) 100%), linear-gradient(97deg, rgba(10,102,194,0.03) 0.8%, rgba(116,229,192,0.045) 85.7%)"
shadows:
  panel-rest: "0px 0px 1px rgba(140,140,140,0.2), 0px 4px 12px rgba(140,140,140,0.2)"
  panel-voice-entry: "0px 0px 1px rgba(140,140,140,0.2), 0px 8px 24px rgba(10,102,194,0.18)"
  tooltip: "0px 0px 1px rgba(140,140,140,0.2), 0px 4px 12px rgba(0,0,0,0.3)"
  voice-dock-idle: "0 10px 24px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)"
  voice-dock-thinking: "0 12px 28px rgba(15,23,42,0.1), 0 2px 8px rgba(15,23,42,0.04)"
  voice-dock-live: "0 14px 34px rgba(15,23,42,0.12), 0 3px 10px rgba(15,23,42,0.05)"
  floating-action: "0px 4px 12px rgba(0,0,0,0.3), 0px 0px 1px rgba(0,0,0,0.16)"
  inset-card: "inset 0 0 0 1px rgba(0,0,0,0.08)"
elevation:
  cards: "Use subtle inset or ambient shadows. Most hierarchy should come from border, tint, and spacing before shadow."
  panel: "The concierge panel is the clearest elevated object, especially when expanded or transitioning into voice mode."
  overlay: "Dialogs, tooltips, and floating launchers may step up in density, but should still feel refined and short-range."
  voice: "The voice dock carries the strongest lift, glow, and pulse in the system."
motion:
  durations:
    fast: 150ms
    overlay: 200ms
    exit: 220ms
    enter: 260ms
    standard: 300ms
    message: 320ms
    controls: 420ms
    stream: 560ms
    voice-morph: 820ms
    voice-entry: 980ms
    pulse-cycle: 1900ms
    avatar-cycle: 3900ms
  easing:
    standard: "cubic-bezier(0.22, 1, 0.36, 1)"
    expressive: "cubic-bezier(0.16, 1, 0.3, 1)"
    pulse: "cubic-bezier(0.33, 0, 0.2, 1)"
    linear: "linear"
  patterns:
    panel-enter: "Translate upward slightly and settle into place instead of zooming."
    message-stream: "Reveal assistant text phrase by phrase with soft opacity fades."
    voice-transition: "Morph the composer into the voice dock, then reveal controls after the shell settles."
    thinking: "Prefer subtle text shimmer or streamed text over spinners."
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: "{spacing.md}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: "{spacing.md}"
  button-tertiary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: "{spacing.md}"
  button-compact:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.full}"
    height: 32px
    padding: "{spacing.sm}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    height: 40px
    padding: "{spacing.md}"
  input-textarea:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm-open}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  selection-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.full}"
    height: 32px
    padding: "{spacing.sm}"
  selection-pill-selected:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.full}"
    height: 32px
    padding: "{spacing.sm}"
  suggested-prompt:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    height: 40px
    padding: "{spacing.lg}"
  chat-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm-open}"
    rounded: "{rounded.panel}"
    width: 432px
    padding: "{spacing.panel-padding}"
  chat-panel-expanded:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm-open}"
    rounded: "{rounded.panel-expanded}"
    width: 1480px
    padding: "{spacing.card-padding}"
  onboarding-panel:
    backgroundColor: "{colors.surface-assistant}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md-open}"
    rounded: "{rounded.panel}"
    width: 432px
    padding: "{spacing.panel-padding}"
  assistant-message:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm-open}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-padding}"
  user-message:
    backgroundColor: "{colors.surface-user}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm-open}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-padding}"
  representative-message:
    backgroundColor: "{colors.surface-human}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm-open}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-padding}"
  recommendation-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel-padding}"
  premium-plan-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "{spacing.panel-padding}"
  voice-dock:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    height: 48px
    padding: "{spacing.xs}"
  tooltip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 14px
---

## Overview
This design system covers the AI concierge chat product surface only. It does not define the outer landing page, marketing hero, site navigation, or any broader recruiting microsite treatment.

The concierge should feel unmistakably LinkedIn, but calmer and more guided than a traditional sales flow. The emotional target is quiet confidence: polished business software with soft conversational edges, not a futuristic AI showcase and not a decorative marketing page.

## Colors
The palette is overwhelmingly light and disciplined, with a single confident brand blue.

- **Primary blue (`#0A66C2`)** is reserved for the clearest next step, active utility states, focused affordances, and brand-forward CTA moments.
- **Dark blue (`#004182`)** is for hover and pressed emphasis, not for large surfaces.
- **White and near-white surfaces** carry most of the experience. Layering should come from tint, border, and containment before stronger color.
- **Pale blue surfaces (`#F6FBFF`, `#E8F3FF`)** signal assistant guidance, user messages, onboarding, and gentle AI framing.
- **Warm neutral (`#F4F2EE`)** is used sparingly to mark human handoff moments so the representative state feels distinct from the assistant state.
- **Premium gold (`#C37D16`)** is a supporting accent for premium-specific moments only. It should never replace the core blue brand logic.
- **Green (`#01754F`)** indicates selected, confirmed, or successful states.
- **Red (`#CB112D`)** is reserved for negative text, validation, and corrective feedback. Use it precisely rather than as a dominant surface.

## Typography
The chat UI uses a compact system-sans voice throughout. This keeps the concierge feeling native, clear, and product-led.

- **System UI** is the only normative type family in this chat system.
- Hierarchy should come from weight, spacing, and containment more than dramatic type jumps.
- Most text lives in regular (`400`) and semibold (`600`) weights.
- Body copy should remain readable, but never so loose that the interface starts to feel editorial or lifestyle-driven.
- Buttons, chips, prompts, timestamps, and helper labels should feel crisp and operational rather than expressive.

## Layout
The layout strategy is "focused conversation first, supporting detail second."

- The default panel is intentionally narrow enough to feel like a conversation rather than a dashboard.
- Expanded states may open into a wider split view when scheduling, recommendations, or richer comparison work benefits from extra space.
- Onboarding, composer, messages, handoff cards, and booking surfaces should share a steady vertical rhythm and obvious containment.
- Spacing follows a practical 4/8/12/16/24/32 rhythm.

Responsive behavior is part of the design system:

- On mobile, the concierge should become a full-height sheet or panel rather than a tiny floating widget.
- Forms should stay single-column until there is real room for side-by-side inputs.
- Prompt chips and pills should wrap or scroll before shrinking to cramped tap targets.
- Expanded desktop layouts may introduce a secondary column, but only when the added width clearly helps the task.

## Elevation & Depth
This is a low-shadow system. Hierarchy should mostly come from tone, border, and containment.

- Standard cards and messages rely on white or near-white surfaces with restrained edge treatment.
- The chat panel is the clearest elevated object in the experience, especially when expanded.
- Tooltips, dialogs, and floating launchers may use denser shadows, but they should still feel refined rather than dramatic.
- Voice mode is the one area where glow, pulse, and layered light are allowed to become more expressive.

If a screen starts to feel shadow-heavy, pull back and re-establish hierarchy with spacing and surface contrast instead.

## Shapes
The shape language mixes soft containers with precise controls.

- **Primary buttons, prompt chips, identity chips, and voice controls** are fully pill-shaped.
- **Cards and recommendation surfaces** usually sit in the 16-20px range.
- **Main panel shells** round more aggressively at 24-32px so the concierge reads as a distinct product surface.
- **Inputs and select fields** stay tighter at 4px to keep forms precise and enterprise-like.
- **Chat bubbles** are soft but directional. They should feel rounded and supportive rather than perfectly symmetrical, with clear distinction between assistant, user, and representative surfaces.

Do not make every surface equally round. The contrast between pill controls, soft cards, and crisp inputs is part of the identity.

## Components
### Chat shell
The concierge panel should feel self-contained, trustworthy, and focused. Even when expanded, it should still read as a conversation surface first and a workflow surface second.

Welcome and onboarding states may introduce a pale blue radial wash, but the UI should still read as mostly white. The opening should never feel blank. It should offer prompt chips, identity context, or one clear next action.

### Messages
Assistant messages live on clean white or subtly tinted surfaces. User messages use pale blue. Representative or live-agent moments shift warmer and more neutral to signal a human presence without becoming visually loud.

Message copy should stay at restrained line lengths. Streaming text should feel calm and deliberate, not flashy.

### Buttons, chips, and prompts
Primary actions are filled blue pills. Secondary actions are outlined and quieter. Tertiary actions should remain visibly tappable even when subdued.

Prompt chips and suggestion pills should feel dense, useful, and neatly aligned rather than fluffy. Selected pills may use green in choice and scheduling flows, but assistive prompts should remain neutral or lightly tinted.

### Inputs and forms
Inputs use small radii, strong borders, and restrained helper text. Focus should feel visible but controlled through blue or neutral rings. Forms should prioritize clarity and familiarity over novelty.

Even in AI-led moments, the form language should feel like trustworthy enterprise software.

### Recommendations, handoff, and booking
Recommendation cards are white, lightly bordered, and action-led. Handoff moments can shift onto pale blue or warm-neutral surfaces to mark progress without becoming theatrical. Booking and next-step surfaces should feel guided, not bureaucratic.

Premium plan moments may use the blue-to-mint gradient treatment, but only inside premium-specific surfaces.

### Voice and live states
Voice mode is the only part of the system allowed to feel visibly more alive. The composer may morph into the voice dock, and the dock may carry stronger glow, motion, and pulse than the rest of the system.

Even here, the UI should still feel professional and grounded. The goal is responsive guidance, not sci-fi spectacle.

### Loading, empty, and error states
Loading states should stay calm. Prefer streamed phrase reveals, subtle text shimmer, and disabled-button states over heavy skeleton systems.

Empty states should always provide a clear way forward with prompt chips, identity context, or a single obvious CTA. Error states should be compact, specific, and confidence-preserving. Use inline notices and crisp copy before large destructive treatments.

### Accessibility
Maintain strong contrast, especially on white, blue, and premium surfaces. Major actions should land at comfortable tap heights. Focus styling must stay obvious. Voice and streaming states should communicate status through text and semantics, not motion alone.

## Do's and Don'ts
- Do make blue feel purposeful. Usually one dominant blue action per decision cluster is enough.
- Do keep the interface mostly light, with hierarchy built through tint, border, spacing, and containment.
- Do preserve the distinction between precise form controls and softer conversational surfaces.
- Do keep onboarding, messaging, handoff, and booking surfaces visually related.
- Do use premium gradients only in premium-specific moments.
- Don't let landing-page or marketing-page styling leak into the chat system.
- Don't turn ordinary assistant moments into futuristic gradient-heavy UI.
- Don't overuse gold, green, or red; they are supporting signals, not page themes.
- Don't make conversational surfaces full-width unless the task genuinely benefits from expansion.
