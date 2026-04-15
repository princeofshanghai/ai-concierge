export type PrototypeScenarioAuthState =
  | "signed-out"
  | "linkedin-connected";

export type PrototypeScenarioEntryVariant = "guided-onboarding";

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
  entryVariant: "guided-onboarding",
  openingPromptVariant: "inline-prompts",
};

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
  return "Changes whether the welcome shows Sign in with LinkedIn or Continue as Jamie.";
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
