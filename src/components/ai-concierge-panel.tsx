"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  AiConciergeBody,
  type AiConciergeMessage,
  type AiConciergeSuggestedReply,
} from "@/components/ai-concierge-body";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import {
  AiConciergeNextStepPanel,
  type BookingSelection,
} from "@/components/ai-concierge-next-step-panel";
import {
  AiConciergeOnboarding,
  type ConciergeContactDetails,
} from "@/components/ai-concierge-onboarding";
import {
  createReturnToChatTurn,
  createOpeningTurn,
  getAssistantTurn,
  type EntryMode,
  type AiConciergeConversationState,
  type NextStepMode,
} from "@/lib/ai-concierge-conversation";

type AiConciergePanelProps = {
  onClose: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
};

const EMPTY_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phoneNumber: "",
  countryRegion: "",
  role: "",
};

const PREFILLED_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "Jamie",
  lastName: "Chen",
  company: "Northstar Health",
  email: "jamie.chen@northstarhealth.com",
  phoneNumber: "(415) 555-0139",
  countryRegion: "United States",
  role: "Director of Talent Acquisition",
};

const REQUIRED_CONTACT_FIELDS: Array<keyof ConciergeContactDetails> = [
  "firstName",
  "lastName",
  "company",
  "email",
  "role",
];

export function AiConciergePanel({
  onClose,
  onExpandedChange,
}: AiConciergePanelProps) {
  const [panelState, setPanelState] = useState<
    "chat" | "manual" | "prefill" | "welcome"
  >("welcome");
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] =
    useState<ConciergeContactDetails>(EMPTY_CONTACT_DETAILS);
  const [messages, setMessages] = useState<AiConciergeMessage[]>([]);
  const [conversationState, setConversationState] =
    useState<AiConciergeConversationState | null>(null);
  const [conversationEntryMode, setConversationEntryMode] =
    useState<EntryMode | null>(null);
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const nextAssistantMessageNumberRef = useRef(2);
  const thinkingTimerRef = useRef<number | null>(null);
  const streamingTimerRef = useRef<number | null>(null);
  const shouldShowNextStepSurface =
    panelState === "chat" &&
    (conversationState?.stage === "booking_pending" ||
      conversationState?.stage === "callback_pending");
  const isDockedNextStepSurface = shouldShowNextStepSurface && !isExpanded;
  const isPresentationExpanded = isExpanded || shouldShowNextStepSurface;
  const isContactDetailsValid = REQUIRED_CONTACT_FIELDS.every(
    (field) => contactDetails[field].trim().length > 0,
  );
  const canRestartConversation =
    panelState === "chat" &&
    messages.length > 1 &&
    !shouldShowNextStepSurface;
  const composerSuggestedReplies = getComposerSuggestedReplies(
    messages,
    isAssistantResponding,
  );
  const composerKey = getComposerInteractionKey(
    messages,
    isAssistantResponding,
  );

  const handleBackToChat = useCallback(() => {
    if (!conversationState) {
      return;
    }

    const assistantTurn = createReturnToChatTurn({
      contactDetails,
      state: conversationState,
    });
    const assistantMessageNumber = nextAssistantMessageNumberRef.current;

    nextAssistantMessageNumberRef.current += 2;
    setConversationState(assistantTurn.nextState);
    setMessages((currentMessages) => [
      ...clearSuggestedReplies(currentMessages),
      createAssistantMessage(
        assistantTurn.body,
        assistantTurn.suggestedReplies,
        assistantTurn.suggestedReplyDisplay,
        assistantMessageNumber,
      ),
    ]);
  }, [contactDetails, conversationState]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (shouldShowNextStepSurface && !isAssistantResponding) {
          handleBackToChat();
          return;
        }

        if (isExpanded) {
          setIsExpanded(false);
          return;
        }

        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [
    handleBackToChat,
    isAssistantResponding,
    isExpanded,
    onClose,
    shouldShowNextStepSurface,
  ]);

  useEffect(() => {
    return () => {
      clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    };
  }, []);

  useEffect(() => {
    onExpandedChange?.(isPresentationExpanded);

    return () => {
      onExpandedChange?.(false);
    };
  }, [isPresentationExpanded, onExpandedChange]);

  const handleSendMessage = (body: string) => {
    const trimmedBody = body.trim();
    if (!trimmedBody || !conversationState || isAssistantResponding) {
      return;
    }

    const assistantTurn = getAssistantTurn({
      contactDetails,
      input: trimmedBody,
      state: conversationState,
    });
    const assistantMessageId = createAssistantMessageId(
      nextAssistantMessageNumberRef.current,
    );

    nextAssistantMessageNumberRef.current += 2;
    setIsAssistantResponding(true);

    setMessages((currentMessages) => {
      const nextMessages = clearSuggestedReplies(currentMessages);
      const nextMessageNumber = nextMessages.length + 1;

      return [
        ...nextMessages,
        createUserMessage(trimmedBody, nextMessageNumber),
        {
          id: assistantMessageId,
          role: "assistant",
          body: "",
          status: "thinking",
        },
      ];
    });

    const thinkingDelay = getThinkingDelay(assistantTurn.body);
    const streamingChunks = createStreamingChunks(assistantTurn.body);
    let chunkIndex = 0;

    clearResponseTimers(thinkingTimerRef, streamingTimerRef);

    thinkingTimerRef.current = window.setTimeout(() => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessageId
            ? { ...message, status: "streaming" }
            : message,
        ),
      );

      streamingTimerRef.current = window.setInterval(() => {
        chunkIndex += 1;
        const nextBody = streamingChunks.slice(0, chunkIndex).join("");
        const isComplete = chunkIndex >= streamingChunks.length;

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  body: nextBody,
                  status: isComplete ? "complete" : "streaming",
                  suggestedReplies: isComplete
                    ? assistantTurn.suggestedReplies
                    : undefined,
                  suggestedReplyDisplay: isComplete
                    ? assistantTurn.suggestedReplyDisplay
                    : undefined,
                }
              : message,
          ),
        );

        if (!isComplete) {
          return;
        }

        clearResponseTimers(thinkingTimerRef, streamingTimerRef);
        setConversationState(assistantTurn.nextState);
        setIsAssistantResponding(false);
      }, getStreamingInterval(assistantTurn.body));
    }, thinkingDelay);
  };

  const handleContactDetailChange = (
    field: keyof ConciergeContactDetails,
    value: string,
  ) => {
    setContactDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
    }));
  };

  const handleStartWithLinkedIn = () => {
    setContactDetails(PREFILLED_CONTACT_DETAILS);
    setPanelState("prefill");
  };

  const handleStartManualEntry = () => {
    setContactDetails(EMPTY_CONTACT_DETAILS);
    setPanelState("manual");
  };

  const handleBackFromDetails = () => {
    setPanelState("welcome");
  };

  const handleUseAnotherAccount = () => {
    setPanelState("welcome");
  };

  const handleStartConversation = () => {
    if (!isContactDetailsValid) {
      return;
    }

    const entryMode = panelState === "prefill" ? "prefill" : "manual";
    restartConversation(entryMode);
    setPanelState("chat");
  };

  const handleSuggestedReply = (suggestedReply: AiConciergeSuggestedReply) => {
    handleSendMessage(suggestedReply.label);
  };

  const handleRestart = () => {
    if (!conversationEntryMode) {
      return;
    }

    clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    setIsAssistantResponding(false);
    restartConversation(conversationEntryMode);
    setPanelState("chat");
  };

  const handleNextStepConfirmed = (selection: BookingSelection) => {
    const assistantMessageNumber = nextAssistantMessageNumberRef.current;
    const specialistLabel =
      conversationState?.likelySolution === "lighter_touch"
        ? "hiring specialist"
        : "Recruiter specialist";
    const isCallback = conversationState?.nextStepMode === "callback";
    const confirmationBody = isCallback
      ? `You're all set. I've requested a phone call for ${selection.dateLabel} at ${selection.timeLabel} with a ${specialistLabel} for ${contactDetails.company}.`
      : `You're all set. I've booked ${selection.dateLabel} at ${selection.timeLabel} with a ${specialistLabel} for ${contactDetails.company}.`;

    nextAssistantMessageNumberRef.current += 2;
    setMessages((currentMessages) => [
      ...currentMessages,
      createAssistantMessage(
        confirmationBody,
        undefined,
        undefined,
        assistantMessageNumber,
      ),
    ]);
  };

  const restartConversation = (entryMode: EntryMode) => {
    const openingTurn = createOpeningTurn({
      contactDetails,
      entryMode,
    });

    setConversationEntryMode(entryMode);
    setConversationState(openingTurn.nextState);
    setMessages([
      createAssistantMessage(
        openingTurn.body,
        openingTurn.suggestedReplies,
        openingTurn.suggestedReplyDisplay,
        1,
      ),
    ]);
    nextAssistantMessageNumberRef.current = 3;
  };

  const handleToggleExpand = () => {
    setIsExpanded((currentValue) => !currentValue);
  };

  return (
    <div
      className={[
        "fixed inset-0 z-50 transition-colors duration-200",
        isExpanded ? "bg-black/40" : "bg-transparent",
      ].join(" ")}
    >
      <div
        className={[
          "h-full w-full",
          isExpanded
            ? "sm:flex sm:items-center sm:justify-center sm:p-6"
            : "sm:flex sm:items-stretch sm:justify-end sm:p-6",
        ].join(" ")}
      >
        <div
          className={[
            "relative h-full w-full origin-right transition-[width,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            isDockedNextStepSurface
              ? "sm:w-[960px]"
              : isExpanded
                ? "sm:max-w-[1120px]"
                : "sm:w-[432px]",
          ].join(" ")}
        >
          {canRestartConversation ? (
            <InternalRestartControl onRestart={handleRestart} />
          ) : null}
          <section
            id="ai-concierge-panel"
            role="dialog"
            aria-label="AI Concierge"
            aria-modal={isExpanded}
            className={[
              "flex h-full w-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)] transition-[border-radius,height,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              isDockedNextStepSurface
                ? "sm:rounded-[28px]"
                : isExpanded
                ? "sm:h-[820px] sm:max-h-full sm:rounded-[32px]"
                : "sm:rounded-[24px]",
            ].join(" ")}
          >
            <AiConciergeHeader
              isExpanded={isExpanded}
              onClose={onClose}
              onToggleExpand={handleToggleExpand}
            />
            {panelState === "chat" ? (
              shouldShowNextStepSurface ? (
                <div className="flex min-h-0 flex-1 flex-col sm:grid sm:grid-cols-[420px_minmax(0,1fr)]">
                  <div className="hidden min-h-0 border-r border-black/8 bg-white sm:flex sm:flex-col sm:animate-[ai-concierge-chat-column-in_260ms_ease-out]">
                    <AiConciergeBody
                      messages={messages}
                      onSelectSuggestedReply={handleSuggestedReply}
                    />
                  </div>
                  <AiConciergeNextStepPanel
                    company={contactDetails.company}
                    hiringSummary={conversationState?.hiringSummary ?? null}
                    likelySolution={
                      conversationState?.likelySolution ?? "unknown"
                    }
                    mode={(conversationState?.nextStepMode ?? "meeting") as Exclude<
                      NextStepMode,
                      null
                    >}
                    onBackToChat={handleBackToChat}
                    onConfirmBooking={handleNextStepConfirmed}
                  />
                </div>
              ) : (
                <>
                  <AiConciergeBody
                    isPanelExpanded={isExpanded}
                    messages={messages}
                    onSelectSuggestedReply={handleSuggestedReply}
                  />
                  <AiConciergeComposer
                    key={composerKey}
                    disabled={isAssistantResponding}
                    isPanelExpanded={isExpanded}
                    onSend={handleSendMessage}
                    suggestedReplies={composerSuggestedReplies}
                  />
                </>
              )
            ) : (
              <AiConciergeOnboarding
                details={contactDetails}
                isPanelExpanded={isExpanded}
                isValid={isContactDetailsValid}
                mode={panelState}
                onBack={handleBackFromDetails}
                onChange={handleContactDetailChange}
                onContinueManual={handleStartManualEntry}
                onContinueWithLinkedIn={handleStartWithLinkedIn}
                onStartConversation={handleStartConversation}
                onUseAnotherAccount={handleUseAnotherAccount}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function InternalRestartControl({
  onRestart,
}: {
  onRestart: () => void;
}) {
  return (
    <div className="absolute left-3 top-3 z-10 sm:left-0 sm:top-0 sm:-translate-x-[calc(100%+12px)]">
      <div className="rounded-2xl border border-black/15 bg-white/95 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur">
        <p className="font-panel-text px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
          Internal only
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="font-panel-text inline-flex items-center gap-2 rounded-[10px] bg-black/[0.05] px-3 py-2 text-[13px] font-semibold text-black/75 transition-colors hover:bg-black/[0.08]"
        >
          <RestartIcon />
          Restart
        </button>
      </div>
    </div>
  );
}

function RestartIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M11.667 3.5V6.417H8.75"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.179 6.417C10.721 4.643 9.103 3.333 7.167 3.333C4.875 3.333 3 5.208 3 7.5C3 9.792 4.875 11.667 7.167 11.667C8.914 11.667 10.411 10.579 11.02 9.042"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function clearSuggestedReplies(
  currentMessages: AiConciergeMessage[],
): AiConciergeMessage[] {
  return currentMessages.map((message) =>
    message.suggestedReplies
      ? { ...message, suggestedReplies: undefined }
      : message,
  );
}

function createAssistantMessage(
  body: string,
  suggestedReplies: AiConciergeSuggestedReply[] | undefined,
  suggestedReplyDisplay: AiConciergeMessage["suggestedReplyDisplay"],
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: createAssistantMessageId(messageNumber),
    role: "assistant",
    body,
    status: "complete",
    suggestedReplies,
    suggestedReplyDisplay,
  };
}

function createUserMessage(
  body: string,
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: `user-message-${messageNumber}`,
    role: "user",
    body,
  };
}

function createAssistantMessageId(messageNumber: number) {
  return `assistant-message-${messageNumber}`;
}

function getComposerSuggestedReplies(
  messages: AiConciergeMessage[],
  isAssistantResponding: boolean,
) {
  if (isAssistantResponding) {
    return [];
  }

  const latestMessage = messages[messages.length - 1];

  if (
    !latestMessage ||
    latestMessage.role !== "assistant" ||
    latestMessage.status !== "complete" ||
    !latestMessage.suggestedReplies?.length ||
    latestMessage.id === "assistant-message-1" ||
    latestMessage.suggestedReplyDisplay === "inline"
  ) {
    return [];
  }

  return latestMessage.suggestedReplies;
}

function getComposerInteractionKey(
  messages: AiConciergeMessage[],
  isAssistantResponding: boolean,
) {
  if (isAssistantResponding) {
    return "assistant-responding";
  }

  const latestMessage = messages[messages.length - 1];

  if (
    !latestMessage ||
    latestMessage.role !== "assistant" ||
    latestMessage.status !== "complete"
  ) {
    return "composer-idle";
  }

  return `composer-${latestMessage.id}`;
}

function getThinkingDelay(body: string) {
  if (body.length > 220) {
    return 900;
  }

  if (body.length > 120) {
    return 700;
  }

  return 500;
}

function getStreamingInterval(body: string) {
  return body.length > 180 ? 70 : 55;
}

function createStreamingChunks(body: string) {
  const tokens = body.match(/\S+\s*/g) ?? [body];
  const chunkSize = tokens.length > 28 ? 3 : 2;
  const chunks: string[] = [];

  for (let index = 0; index < tokens.length; index += chunkSize) {
    chunks.push(tokens.slice(index, index + chunkSize).join(""));
  }

  return chunks;
}

function clearResponseTimers(
  thinkingTimerRef: RefObject<number | null>,
  streamingTimerRef: RefObject<number | null>,
) {
  if (thinkingTimerRef.current !== null) {
    window.clearTimeout(thinkingTimerRef.current);
    thinkingTimerRef.current = null;
  }

  if (streamingTimerRef.current !== null) {
    window.clearInterval(streamingTimerRef.current);
    streamingTimerRef.current = null;
  }
}
