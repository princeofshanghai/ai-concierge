import type {
  ConciergeContactDetails,
  LinkedInIdentity,
} from "@/lib/ai-concierge-types";

type StoredAiConciergeEntrySession = {
  contactDetails: ConciergeContactDetails;
  identityKey: string;
};

const AI_CONCIERGE_ENTRY_SESSION_STORAGE_KEY =
  "ai-concierge-entry-session";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAiConciergeEntryIdentityKey(args: {
  isLinkedInConnected: boolean;
  linkedInIdentity: LinkedInIdentity | null;
}) {
  if (args.isLinkedInConnected) {
    const normalizedEmail = args.linkedInIdentity?.email.trim().toLowerCase();

    return normalizedEmail
      ? `linkedin:${normalizedEmail}`
      : "linkedin:connected";
  }

  return "manual";
}

export function readStoredAiConciergeEntrySession() {
  if (!isBrowser()) {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(
    AI_CONCIERGE_ENTRY_SESSION_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as StoredAiConciergeEntrySession;
  } catch {
    window.sessionStorage.removeItem(AI_CONCIERGE_ENTRY_SESSION_STORAGE_KEY);
    return null;
  }
}

export function writeStoredAiConciergeEntrySession(
  session: StoredAiConciergeEntrySession,
) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    AI_CONCIERGE_ENTRY_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export function clearStoredAiConciergeEntrySession() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(AI_CONCIERGE_ENTRY_SESSION_STORAGE_KEY);
}
