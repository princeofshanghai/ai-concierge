import {
  createOpeningTurn,
  getAssistantTurn,
  type AiConciergeAssistantTurn,
  type AiConciergeConversationState,
} from "@/lib/ai-concierge-conversation";
import {
  createAssistantMessageFromTurn,
  createAssistantMessagesFromTurn,
  createUserMessage,
} from "@/lib/ai-concierge-assistant-playback";
import type {
  AiConciergeMessage,
  ConciergeContactDetails,
} from "@/lib/ai-concierge-types";
import type { PrototypePlaybackRoute } from "@/lib/prototype-scenario";

// The playback mode pre-renders a complete conversation for presentations,
// without the user interacting with chips or the composer. Each route is a
// deterministic transcript: a sequence of canned user inputs run through the
// same `getAssistantTurn` pipeline the live mode uses, so every assistant
// bubble, chip row, and artifact is produced by the real conversation code
// rather than duplicated in a mock.
//
// Scripts live in docs/conversation-scripts.md and must stay in sync with the
// user inputs below.

type PlaybackScript = {
  userInputs: string[];
};

const PLAYBACK_SCRIPTS: Record<
  Exclude<PrototypePlaybackRoute, "live">,
  PlaybackScript
> = {
  "high-ae-booking": {
    // Route 1 (High value, AE booking). Jamie taps the "Help with hiring"
    // pill, picks "We're hiring a lot right now", then types the canned
    // driver + specialization replies and picks a timeline bucket. The
    // card CTA tap (B5) is driven by playback finalization, not a chat
    // message — see `finalizeTranscript`.
    userInputs: [
      "We're hiring a lot right now",
      "Just closed a funding round. About 40 roles to hire across eng, product, sales, and CS over the next 2 quarters.",
      "Yeah a few. ML engineers, clinical informatics, couple of senior sales leaders. Been open a while.",
      "Specific milestones",
    ],
  },
  // Route 2 (Medium value, SDR live chat). Routes 2 and 3 share the same
  // transcript up to the two-CTA card (B4) — the branch happens when the
  // presenter taps a CTA on the card during demo. "Chat live now" triggers
  // the live-sales handoff; "Schedule for later" triggers the booking flow.
  // See `docs/conversation-scripts.md` Route 2 / Route 3.
  "medium-sdr-live": {
    userInputs: [
      "We have hard-to-fill roles",
      "Senior nursing and clinical informatics mostly. Few of them have been open for months.",
      "In the next few months",
    ],
  },
  "medium-sdr-booking": {
    userInputs: [
      "We have hard-to-fill roles",
      "Senior nursing and clinical informatics mostly. Few of them have been open for months.",
      "In the next few months",
    ],
  },
  "low-product-card": {
    // Jamie's canonical Route 4 click + two typed/chipped follow-ups. Script
    // ends on the Hiring Pro product card — the CTA opens the external plans
    // page (handled by the panel's openRecommendationLink), not another bubble,
    // so no further inputs are needed.
    userInputs: [
      "Is this meant for teams my size?",
      "Pretty light on our end. Maybe 3-4 hires a year. Mostly sales and CS roles.",
      "Depends on the role",
    ],
  },
  "low-redirect-link": {
    // Jamie's canonical Route 5 click + two typed diagnostic turns. Script
    // ends on the inline redirect link embedded in the final assistant bubble
    // — no artifact, no chips, no handoff. See Route 5 in
    // `docs/conversation-scripts.md`.
    userInputs: [
      "Do companies like mine use this?",
      "Startup, 15ish people. Haven't really hired much yet, but figuring we might need to soon.",
      "Honestly still up in the air. Maybe engineering and sales? No concrete plan yet.",
    ],
  },
};

// Each assistant turn's `suggestedReplies` should only stay attached to the
// most recent assistant message. In live mode, `clearSuggestedReplies` strips
// chips from prior turns every time the user replies. We replicate that here
// so the playback looks the same as a finished real conversation.
function finalizeTranscript(
  messages: AiConciergeMessage[],
): AiConciergeMessage[] {
  const lastAssistantIndex = (() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === "assistant") {
        return index;
      }
    }
    return -1;
  })();

  return messages.map((message, index) => {
    if (message.role !== "assistant") {
      return message;
    }

    if (index === lastAssistantIndex) {
      return message;
    }

    if (!message.suggestedReplies && !message.openingSupport) {
      return message;
    }

    return {
      ...message,
      openingSupport: undefined,
      suggestedReplies: undefined,
      suggestedReplyDisplay: undefined,
    };
  });
}

export function buildPlaybackTranscript({
  contactDetails,
  route,
}: {
  contactDetails: ConciergeContactDetails;
  route: Exclude<PrototypePlaybackRoute, "live">;
}): AiConciergeMessage[] {
  const script = PLAYBACK_SCRIPTS[route];
  const messages: AiConciergeMessage[] = [];

  const openingTurn: AiConciergeAssistantTurn = createOpeningTurn({
    contactDetails,
    openingPromptVariant: "inline-prompts",
  });

  let assistantMessageNumber = 1;
  let userMessageNumber = 1;
  messages.push(
    createAssistantMessageFromTurn(openingTurn, assistantMessageNumber),
  );
  assistantMessageNumber += 2;

  let state: AiConciergeConversationState = openingTurn.nextState;

  for (const userInput of script.userInputs) {
    messages.push(
      createUserMessage(userInput, messages.length + userMessageNumber),
    );
    userMessageNumber += 1;

    const assistantTurn = getAssistantTurn({
      contactDetails,
      input: userInput,
      state,
    });

    const assistantMessages = createAssistantMessagesFromTurn(
      assistantTurn,
      assistantMessageNumber,
    );
    messages.push(...assistantMessages);
    // Reserve numbering slots for each assistant message (prior bubble +
    // main) so ids stay unique across the transcript.
    assistantMessageNumber += assistantMessages.length * 2;

    state = assistantTurn.nextState;
  }

  return finalizeTranscript(messages);
}
