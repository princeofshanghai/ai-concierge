export type PrototypeScenarioAuthState =
  | "signed-out"
  | "linkedin-connected";

export type PrototypeScenarioEntryVariant = "guided-onboarding";

export type PrototypeScenarioOpeningPromptVariant =
  | "inline-prompts"
  | "helper-examples"
  | "topic-picker";

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
  openingPromptVariant: PrototypeScenarioOpeningPromptVariant;
  playbackRoute: PrototypePlaybackRoute;
};

export const DEFAULT_PROTOTYPE_SCENARIO: PrototypeScenario = {
  authState: "linkedin-connected",
  entryVariant: "guided-onboarding",
  openingPromptVariant: "topic-picker",
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

export function getPrototypeScenarioAuthLabel(
  authState: PrototypeScenario["authState"],
) {
  return authState === "linkedin-connected" ? "Signed in" : "Signed out";
}

export function getPrototypeScenarioAuthGroupLabel() {
  return "Identity";
}

export function getPrototypeScenarioAuthHelperText() {
  return "Changes whether the welcome shows Sign in to LinkedIn or Continue as Jamie.";
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
