"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { AiConciergeBody } from "@/components/ai-concierge-body";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import { AiConciergePremiumPlanPanel } from "@/components/ai-concierge-premium-plan-panel";
import {
  PrototypeShellCard,
  PrototypeShellLabel,
} from "@/components/prototype-shell";
import type {
  AiConciergeAssistantTurn,
  AiConciergeConversationState,
} from "@/lib/ai-concierge-conversation";
import type {
  AiConciergeMessage,
  AiConciergeSuggestedReply,
  ConciergeContactDetails,
  PremiumPlanId,
} from "@/lib/ai-concierge-types";
import { getPremiumPlanCheckoutHref } from "@/lib/premium-plan-details";
import {
  createPremiumCandidateOneOpeningTurn,
  createPremiumCandidateTwoOpeningTurn,
  getPremiumCandidateOneAssistantTurn,
  getPremiumCandidateTwoAssistantTurn,
} from "@/lib/premium-ai-concierge-conversation";

const PANEL_EXIT_DURATION_MS = 220;

type PremiumSurveyConciergePanelProps = {
  candidate: "candidate-1" | "candidate-2";
  contactDetails: ConciergeContactDetails;
  isOpen: boolean;
  onClose: () => void;
  onClosed?: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
};

export function PremiumSurveyConciergePanel({
  candidate,
  contactDetails,
  isOpen,
  onClose,
  onClosed,
  onExpandedChange,
}: PremiumSurveyConciergePanelProps) {
  const openingTurnFactory =
    candidate === "candidate-2"
      ? createPremiumCandidateTwoOpeningTurn
      : createPremiumCandidateOneOpeningTurn;
  const assistantTurnFactory =
    candidate === "candidate-2"
      ? getPremiumCandidateTwoAssistantTurn
      : getPremiumCandidateOneAssistantTurn;
  const initialOpeningTurn = useMemo(
    () =>
      openingTurnFactory({
        contactDetails,
        openingPromptVariant: "inline-prompts",
      }),
    [contactDetails, openingTurnFactory],
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [composerDraft, setComposerDraft] = useState("");
  const [focusComposerSignal, setFocusComposerSignal] = useState(0);
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const [activePremiumPlanId, setActivePremiumPlanId] =
    useState<PremiumPlanId | null>(null);
  const [messages, setMessages] = useState<AiConciergeMessage[]>(() => [
    createAssistantMessageFromTurn(initialOpeningTurn, 1),
  ]);
  const [conversationState, setConversationState] =
    useState<AiConciergeConversationState>(initialOpeningTurn.nextState);
  const nextMessageNumberRef = useRef(2);
  const responseTimeoutRef = useRef<number | null>(null);
  const isDockedPlanSurface = activePremiumPlanId !== null && !isExpanded;
  const composerSuggestedReplies = getComposerSuggestedReplies(
    messages,
    isAssistantResponding,
  );
  const composerKey = getComposerInteractionKey(
    messages,
    isAssistantResponding,
  );
  const shouldShowComposerExampleResponses =
    activePremiumPlanId === null &&
    !isAssistantResponding &&
    composerSuggestedReplies.length > 0 &&
    composerDraft.trim().length === 0;

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setIsExpanded(false);
    clearPendingAssistantResponse(responseTimeoutRef);

    const timeoutId = window.setTimeout(() => {
      onClosed?.();
    }, PANEL_EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, onClosed]);

  useEffect(
    () => () => {
      clearPendingAssistantResponse(responseTimeoutRef);
    },
    [],
  );

  const handlePanelClose = () => {
    setActivePremiumPlanId(null);
    onClose();
  };

  const handleToggleExpand = () => {
    setIsExpanded((currentValue) => !currentValue);
  };

  const handleStopAssistantResponse = () => {
    clearPendingAssistantResponse(responseTimeoutRef);
    setIsAssistantResponding(false);
    setMessages((currentMessages) =>
      currentMessages.filter((message) => message.status !== "thinking"),
    );
  };

  const queueAssistantTurn = (
    assistantTurn: AiConciergeAssistantTurn,
    assistantMessageNumber: number,
  ) => {
    clearPendingAssistantResponse(responseTimeoutRef);
    responseTimeoutRef.current = window.setTimeout(() => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === createAssistantMessageId(assistantMessageNumber)
            ? createAssistantMessageFromTurn(assistantTurn, assistantMessageNumber)
            : message,
        ),
      );
      setConversationState(assistantTurn.nextState);
      setIsAssistantResponding(false);
    }, getThinkingDelay(assistantTurn.body));
  };

  const handleSendMessage = (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isAssistantResponding) {
      return;
    }

    const userMessageNumber = nextMessageNumberRef.current;
    const assistantMessageNumber = userMessageNumber + 1;
    const assistantTurn = assistantTurnFactory({
      contactDetails,
      input: trimmedMessage,
      state: conversationState,
    });

    nextMessageNumberRef.current += 2;
    setIsAssistantResponding(true);
    setMessages((currentMessages) => [
      ...clearSuggestedReplies(currentMessages),
      createUserMessage(trimmedMessage, userMessageNumber),
      createThinkingAssistantMessage(assistantMessageNumber),
    ]);
    setComposerDraft("");
    queueAssistantTurn(assistantTurn, assistantMessageNumber);
  };

  const handleSelectSuggestedReply = (
    suggestedReply: AiConciergeSuggestedReply,
  ) => {
    handleSendMessage(suggestedReply.label);
  };

  const handleComposerSuggestedReplySelect = (
    suggestedReply: AiConciergeSuggestedReply,
  ) => {
    setComposerDraft(suggestedReply.label);
    setFocusComposerSignal((currentValue) => currentValue + 1);
  };

  const handleOpeningPromptInsert = (prompt: string) => {
    setComposerDraft(prompt);
    setFocusComposerSignal((currentValue) => currentValue + 1);
  };

  const handlePremiumPlanSelect = (planId: PremiumPlanId) => {
    setActivePremiumPlanId(planId);
  };

  const handlePremiumPlanRedeem = (planId: PremiumPlanId) => {
    if (typeof window === "undefined") {
      return;
    }

    window.location.assign(getPremiumPlanCheckoutHref(planId));
  };

  return (
    <div
      className={[
        "fixed inset-0 z-50 transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        !isOpen
          ? "pointer-events-none bg-transparent"
          : isExpanded
            ? "bg-black/40"
            : "bg-transparent",
      ].join(" ")}
    >
      <div
        className={[
          "h-full w-full sm:flex sm:items-center sm:justify-end sm:transition-[padding] sm:duration-300 sm:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isExpanded ? "sm:p-4" : "sm:p-6",
        ].join(" ")}
      >
        {shouldShowComposerExampleResponses ? (
          <PremiumSurveyExampleResponsesCard
            isExpanded={isExpanded}
            onSelectSuggestedReply={handleComposerSuggestedReplySelect}
            suggestedReplies={composerSuggestedReplies}
          />
        ) : null}

        <section
          id="premium-survey-concierge-panel"
          role="dialog"
          aria-label="Premium plan helper"
          aria-hidden={!isOpen}
          aria-modal={isOpen && isExpanded}
          className={[
            "relative flex h-full w-full flex-col overflow-hidden border border-ai-border-faint bg-ai-surface-base transition-[border-radius,height,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none",
            "shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)]",
            isOpen
              ? "animate-[ai-concierge-panel-enter_260ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
              : "pointer-events-none animate-[ai-concierge-panel-exit_220ms_ease-in_both] motion-reduce:animate-none",
            isDockedPlanSurface
              ? "sm:rounded-[28px]"
              : isExpanded
                ? "sm:h-[calc(100vh-32px)] sm:max-h-full sm:rounded-[32px]"
                : "sm:rounded-[24px]",
            isDockedPlanSurface
              ? "sm:w-[960px] sm:translate-x-0"
              : isExpanded
                ? "sm:w-[min(1480px,calc(100vw-32px))] sm:translate-x-[calc((min(1480px,calc(100vw-32px))+32px-100vw)/2)]"
                : "sm:w-[432px] sm:translate-x-0",
          ].join(" ")}
        >
          <AiConciergeHeader
            isExpanded={isExpanded}
            onClose={handlePanelClose}
            onToggleExpand={handleToggleExpand}
          />

          <div className="flex min-h-0 flex-1 flex-col animate-[ai-concierge-chat-surface-in_320ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
            {activePremiumPlanId ? (
              <div className="flex min-h-0 flex-1 flex-col sm:grid sm:grid-cols-[420px_minmax(0,1fr)]">
                <div className="hidden min-h-0 border-r border-ai-divider bg-ai-surface-base sm:flex sm:flex-col sm:animate-[ai-concierge-chat-column-in_260ms_ease-out]">
                  <AiConciergeBody
                    messages={messages}
                    onBookAgain={noop}
                    onBookMeeting={noop}
                    onInsertOpeningPrompt={handleOpeningPromptInsert}
                    onManageBooking={noop}
                    onPremiumPlanSelect={handlePremiumPlanSelect}
                    onRecommendationPrimaryAction={noop}
                    onSelectSuggestedReply={handleSelectSuggestedReply}
                  />
                </div>
                <AiConciergePremiumPlanPanel
                  onBackToChat={() => setActivePremiumPlanId(null)}
                  onRedeem={handlePremiumPlanRedeem}
                  planId={activePremiumPlanId}
                />
              </div>
            ) : (
              <>
                <AiConciergeBody
                  isPanelExpanded={isExpanded}
                  messages={messages}
                  onBookAgain={noop}
                  onBookMeeting={noop}
                  onInsertOpeningPrompt={handleOpeningPromptInsert}
                  onManageBooking={noop}
                  onPremiumPlanSelect={handlePremiumPlanSelect}
                  onRecommendationPrimaryAction={noop}
                  onSelectSuggestedReply={handleSelectSuggestedReply}
                />
                <AiConciergeComposer
                  key={composerKey}
                  disabled={isAssistantResponding}
                  draft={composerDraft}
                  focusComposerSignal={focusComposerSignal}
                  isPanelExpanded={isExpanded}
                  isResponding={isAssistantResponding}
                  idlePlaceholder="Ask about these plans"
                  onDraftChange={setComposerDraft}
                  onSend={handleSendMessage}
                  onStartVoiceMode={noop}
                  onStopResponse={handleStopAssistantResponse}
                  onToggleDictation={noop}
                  showDictationAction={false}
                  showVoiceModeAction={false}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PremiumSurveyExampleResponsesCard({
  isExpanded,
  onSelectSuggestedReply,
  suggestedReplies,
}: {
  isExpanded: boolean;
  onSelectSuggestedReply: (suggestedReply: AiConciergeSuggestedReply) => void;
  suggestedReplies: AiConciergeSuggestedReply[];
}) {
  return (
    <div
      className={[
        "absolute left-5 right-5 bottom-[96px] z-10",
        isExpanded
          ? "lg:left-[calc(50%-360px-16px)] lg:right-auto lg:bottom-5 lg:w-[228px] lg:-translate-x-full"
          : "md:left-0 md:right-auto md:bottom-5 md:w-[228px] md:-translate-x-[calc(100%+12px)]",
      ].join(" ")}
    >
      <PrototypeShellCard className="rounded-[20px] p-2 shadow-[0_18px_36px_rgba(2,6,23,0.24)]">
        <div className="border-b border-white/10 px-2 pb-2">
          <PrototypeShellLabel className="px-0 pb-1">
            Internal only
          </PrototypeShellLabel>
          <p className="font-panel-text text-[13px] leading-none font-semibold text-white/88">
            Example responses
          </p>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {suggestedReplies.map((suggestedReply) => (
            <button
              key={suggestedReply.id}
              type="button"
              onClick={() => onSelectSuggestedReply(suggestedReply)}
              className="font-panel-text rounded-[14px] border border-transparent bg-white/[0.04] px-3 py-2.5 text-left text-[13px] leading-[1.3] font-semibold text-white/82 transition-[background-color,border-color,color] duration-150 hover:border-white/10 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            >
              {suggestedReply.label}
            </button>
          ))}
        </div>
      </PrototypeShellCard>
    </div>
  );
}

function noop() {}

function clearPendingAssistantResponse(
  responseTimeoutRef: MutableRefObject<number | null>,
) {
  if (responseTimeoutRef.current === null) {
    return;
  }

  window.clearTimeout(responseTimeoutRef.current);
  responseTimeoutRef.current = null;
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

function createAssistantMessageFromTurn(
  assistantTurn: AiConciergeAssistantTurn,
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: createAssistantMessageId(messageNumber),
    role: "assistant",
    artifact: assistantTurn.artifact,
    body: assistantTurn.body,
    openingSupport: assistantTurn.openingSupport,
    status: "complete",
    suggestedReplies: assistantTurn.suggestedReplies,
    suggestedReplyDisplay: assistantTurn.suggestedReplyDisplay,
  };
}

function createThinkingAssistantMessage(
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: createAssistantMessageId(messageNumber),
    role: "assistant",
    body: "",
    status: "thinking",
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
