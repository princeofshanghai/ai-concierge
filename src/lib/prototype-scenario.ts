export type PrototypeScenarioAuthState =
  | "signed-out"
  | "linkedin-connected";

export type PrototypeScenarioEntryVariant =
  | "welcome-first"
  | "confirm-details-first";

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
  authState: "signed-out",
  entryVariant: "welcome-first",
  openingPromptVariant: "inline-prompts",
};

export type PrototypeScenarioEntryState = "manual" | "prefill" | "welcome";

export function getPrototypeScenarioEntryState(
  scenario: PrototypeScenario,
): PrototypeScenarioEntryState {
  if (scenario.entryVariant === "welcome-first") {
    return "welcome";
  }

  return scenario.authState === "linkedin-connected" ? "prefill" : "manual";
}

export function getPrototypeScenarioAuthLabel(
  authState: PrototypeScenario["authState"],
) {
  return authState === "linkedin-connected" ? "Signed in" : "Signed out";
}

export function getPrototypeScenarioEntryLabel(
  entryVariant: PrototypeScenario["entryVariant"],
) {
  return entryVariant === "confirm-details-first"
    ? "Confirm details first"
    : "Welcome first";
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
