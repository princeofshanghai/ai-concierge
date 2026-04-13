import type { DemoLinkedInAccountId } from "@/lib/ai-concierge-fixtures";
import type { PrototypeScenario } from "@/lib/prototype-scenario";

export type PrototypeLinkedInAuthReason = "sign-in" | "switch-account";

type PrototypeLinkedInAuthState = {
  accountId?: DemoLinkedInAccountId;
  currentAccountId: DemoLinkedInAccountId;
  prototypeScenario: PrototypeScenario;
  reason: PrototypeLinkedInAuthReason;
  returnPath: string;
  status: "completed" | "pending";
};

export const PROTOTYPE_LINKEDIN_AUTH_RETURN_PARAM = "prototypeLinkedInAuth";
export const PROTOTYPE_LINKEDIN_SIGN_IN_PATH = "/prototype/linkedin-sign-in";

const PROTOTYPE_LINKEDIN_AUTH_STORAGE_KEY = "prototype-linkedin-auth-state";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredPrototypeLinkedInAuthState() {
  if (!isBrowser()) {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(
    PROTOTYPE_LINKEDIN_AUTH_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as PrototypeLinkedInAuthState;
  } catch {
    window.sessionStorage.removeItem(PROTOTYPE_LINKEDIN_AUTH_STORAGE_KEY);
    return null;
  }
}

function writeStoredPrototypeLinkedInAuthState(
  state: PrototypeLinkedInAuthState,
) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    PROTOTYPE_LINKEDIN_AUTH_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function beginPrototypeLinkedInAuth(state: {
  currentAccountId: DemoLinkedInAccountId;
  prototypeScenario: PrototypeScenario;
  reason: PrototypeLinkedInAuthReason;
  returnPath?: string;
}) {
  writeStoredPrototypeLinkedInAuthState({
    currentAccountId: state.currentAccountId,
    prototypeScenario: state.prototypeScenario,
    reason: state.reason,
    returnPath: state.returnPath ?? "/",
    status: "pending",
  });
}

export function readPrototypeLinkedInAuthState() {
  return readStoredPrototypeLinkedInAuthState();
}

export function completePrototypeLinkedInAuth(accountId: DemoLinkedInAccountId) {
  const currentState = readStoredPrototypeLinkedInAuthState();

  if (!currentState) {
    return null;
  }

  const completedState: PrototypeLinkedInAuthState = {
    ...currentState,
    accountId,
    status: "completed",
  };

  writeStoredPrototypeLinkedInAuthState(completedState);
  return completedState;
}

export function consumeCompletedPrototypeLinkedInAuth() {
  const currentState = readStoredPrototypeLinkedInAuthState();

  if (!currentState || currentState.status !== "completed") {
    return null;
  }

  if (isBrowser()) {
    window.sessionStorage.removeItem(PROTOTYPE_LINKEDIN_AUTH_STORAGE_KEY);
  }

  return currentState;
}

export function clearPrototypeLinkedInAuth() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(PROTOTYPE_LINKEDIN_AUTH_STORAGE_KEY);
}

export function getPrototypeLinkedInSuggestedAccountId(
  state: Pick<PrototypeLinkedInAuthState, "currentAccountId" | "reason"> | null,
): DemoLinkedInAccountId {
  if (state?.reason === "switch-account") {
    return state.currentAccountId === "alex-rivera"
      ? "jamie-chen"
      : "alex-rivera";
  }

  return "jamie-chen";
}
