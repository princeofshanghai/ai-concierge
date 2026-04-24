export type PrototypeScenarioAuthState =
  | "signed-out"
  | "linkedin-connected";

export type PrototypeScenarioEntryVariant = "guided-onboarding";

export type PrototypeScenarioOpeningPromptVariant =
  | "inline-prompts"
  | "helper-examples"
  | "topic-picker";

// `direct-to-chat` (default) is the low-friction happy path: after the
// welcome screen the user lands straight in chat. Name/company are implied
// from LinkedIn identity and email/phone are collected just-in-time when
// an action requires them (e.g. booking a meeting). `confirm-details`
// preserves the legacy flow where the user sees and confirms a filled-in
// contact form before starting the conversation. `welcome-contact-form`
// keeps the welcome copy but combines it with a shorter first-name /
// last-name / work-email / phone-number form before chat starts.
export type PrototypeScenarioOnboardingStyle =
  | "direct-to-chat"
  | "confirm-details"
  | "welcome-contact-form";

// `live` is the default interactive experience. The other five values tell the
// panel to render a fully pre-built transcript for a scripted route, skipping
// onboarding and the composer. This is the presenter-only playback mode used
// in leadership demos.
export type PrototypePlaybackRoute =
  | "live"
  | "high-ae-booking"
  | "medium-sdr-live"
  | "medium-sdr-booking"
  | "low-product-card"
  | "low-redirect-link";

export type PrototypeScenario = {
  authState: PrototypeScenarioAuthState;
  entryVariant: PrototypeScenarioEntryVariant;
  onboardingStyle: PrototypeScenarioOnboardingStyle;
  openingPromptVariant: PrototypeScenarioOpeningPromptVariant;
  playbackRoute: PrototypePlaybackRoute;
};

export const DEFAULT_PROTOTYPE_SCENARIO: PrototypeScenario = {
  authState: "linkedin-connected",
  entryVariant: "guided-onboarding",
  onboardingStyle: "direct-to-chat",
  openingPromptVariant: "inline-prompts",
  playbackRoute: "live",
};

export function getPrototypePlaybackRouteLabel(route: PrototypePlaybackRoute) {
  switch (route) {
    case "live":
      return "Live";
    case "high-ae-booking":
      return "High value";
    case "medium-sdr-live":
      return "Live chat with SDR";
    case "medium-sdr-booking":
      return "Book meeting with SDR";
    case "low-product-card":
      return "Product card";
    case "low-redirect-link":
      return "Redirect link";
  }
}

export function getPrototypePlaybackRouteHelperText() {
  return "Playback routes show the full transcript for presenters. Leave on Live to use the interactive flow.";
}

export function isPrototypePlaybackMode(scenario: PrototypeScenario) {
  return scenario.playbackRoute !== "live";
}

export type PrototypeScenarioEntryState = "manual" | "prefill" | "welcome";

export function getPrototypeScenarioEntryState(
  _scenario: PrototypeScenario,
): PrototypeScenarioEntryState {
  void _scenario;
  return "welcome";
}

export function getPrototypeScenarioOnboardingStyleGroupLabel() {
  return "Start flow";
}

export function getPrototypeScenarioOnboardingStyleHelperText() {
  return "Choose whether the first screen jumps into chat, confirms full details, or collects just first name, last name, work email, and phone.";
}

export function getPrototypeScenarioOnboardingStyleLabel(
  onboardingStyle: PrototypeScenarioOnboardingStyle,
) {
  switch (onboardingStyle) {
    case "direct-to-chat":
      return "Direct to chat";
    case "confirm-details":
      return "Confirm details first";
    case "welcome-contact-form":
      return "Welcome + 4 fields";
  }
}

export function getPrototypeScenarioAuthLabel(
  authState: PrototypeScenario["authState"],
) {
  return authState === "linkedin-connected" ? "Signed in" : "Signed out";
}

export function getPrototypeScenarioAuthGroupLabel() {
  return "Identity";
}

export function getPrototypeScenarioAuthHelperText() {
  return "Changes whether entry details start blank or prefilled from LinkedIn, depending on the selected start flow.";
}

export function getPrototypeScenarioEntryLabel(
  _entryVariant: PrototypeScenario["entryVariant"],
) {
  void _entryVariant;
  return "Consolidated flow";
}

export function normalizePrototypeScenario(
  scenario: PrototypeScenario,
): PrototypeScenario {
  return {
    ...scenario,
    entryVariant: "guided-onboarding",
    onboardingStyle: scenario.onboardingStyle ?? "direct-to-chat",
    playbackRoute: scenario.playbackRoute ?? "live",
  };
}

export function getPrototypeScenarioOpeningPromptLabel(
  openingPromptVariant: PrototypeScenario["openingPromptVariant"],
) {
  switch (openingPromptVariant) {
    case "inline-prompts":
      return "Option 1: Suggested prompts";
    case "helper-examples":
      return "Option 2: Helper text";
    case "topic-picker":
      return "Option 3: Topic pills";
  }
}
