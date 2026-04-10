export type PrototypeScenarioAuthState =
  | "signed-out"
  | "linkedin-connected";

export type PrototypeScenarioEntryVariant =
  | "welcome-first"
  | "confirm-details-first"
  | "profile-aware-opening";

export type PrototypeScenarioOpeningPromptVariant =
  | "inline-prompts"
  | "helper-examples"
  | "topic-picker";

export type PrototypeScenario = {
  authState: PrototypeScenarioAuthState;
  entryVariant: PrototypeScenarioEntryVariant;
  openingPromptVariant: PrototypeScenarioOpeningPromptVariant;
};

export const DEFAULT_PROTOTYPE_SCENARIO: PrototypeScenario = {
  authState: "linkedin-connected",
  entryVariant: "profile-aware-opening",
  openingPromptVariant: "inline-prompts",
};

export type PrototypeScenarioEntryState = "manual" | "prefill" | "welcome";

export function getPrototypeScenarioEntryState(
  scenario: PrototypeScenario,
): PrototypeScenarioEntryState {
  if (scenario.entryVariant !== "confirm-details-first") {
    return "welcome";
  }

  return scenario.authState === "linkedin-connected" ? "prefill" : "manual";
}

export function getPrototypeScenarioAuthLabel(
  authState: PrototypeScenario["authState"],
) {
  return authState === "linkedin-connected" ? "Signed in" : "Signed out";
}

export function getPrototypeScenarioAuthGroupLabel() {
  return "Identity";
}

export function getPrototypeScenarioAuthHelperText(
  entryVariant: PrototypeScenario["entryVariant"],
) {
  if (entryVariant !== "profile-aware-opening") {
    return null;
  }

  return "Changes whether the opening shows LinkedIn sign-in or Continue as Jamie.";
}

export function getPrototypeScenarioEntryLabel(
  entryVariant: PrototypeScenario["entryVariant"],
) {
  switch (entryVariant) {
    case "confirm-details-first":
      return "Confirm details first";
    case "profile-aware-opening":
      return "Profile-aware opening";
    case "welcome-first":
      return "Welcome first";
  }
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
