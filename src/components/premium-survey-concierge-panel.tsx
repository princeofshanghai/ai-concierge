"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
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
import {
  clearResponseTimers,
  clearSuggestedReplies,
  createAssistantMessageId,
  createThinkingAssistantMessage,
  createUserMessage,
  getComposerInteractionKey,
  getComposerSuggestedReplies,
  streamAssistantTurnPlayback,
} from "@/lib/ai-concierge-assistant-playback";
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
  presentationMode?: "overlay" | "companion";
};

type PendingAssistantResponse = {
  assistantMessageId: string;
  stopState: AiConciergeConversationState;
};

export function PremiumSurveyConciergePanel({
  candidate,
  contactDetails,
  isOpen,
  onClose,
  onClosed,
  onExpandedChange,
  presentationMode = "overlay",
}: PremiumSurveyConciergePanelProps) {
  const isCompanionMode = presentationMode === "companion";
  const contactFirstName = contactDetails.firstName.trim() || "Alex";
  const openingTurnFactory =
    candidate === "candidate-2"
      ? createPremiumCandidateTwoOpeningTurn
      : createPremiumCandidateOneOpeningTurn;
  const assistantTurnFactory =
    candidate === "candidate-2"
      ? getPremiumCandidateTwoAssistantTurn
      : getPremiumCandidateOneAssistantTurn;
  const [openingTurn] = useState<AiConciergeAssistantTurn>(() =>
    openingTurnFactory({
      contactDetails,
      openingPromptVariant: "inline-prompts",
    }),
  );
  const openingAssistantMessageId = createAssistantMessageId(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [composerDraft, setComposerDraft] = useState("");
  const [focusComposerSignal, setFocusComposerSignal] = useState(0);
  const [isAssistantResponding, setIsAssistantResponding] = useState(true);
  const [activePremiumPlanId, setActivePremiumPlanId] =
    useState<PremiumPlanId | null>(null);
  const [messages, setMessages] = useState<AiConciergeMessage[]>(() => [
    createThinkingAssistantMessage(1),
  ]);
  const [conversationState, setConversationState] =
    useState<AiConciergeConversationState>(openingTurn.nextState);
  const nextMessageNumberRef = useRef(2);
  const pendingAssistantResponseRef = useRef<PendingAssistantResponse | null>({
    assistantMessageId: openingAssistantMessageId,
    stopState: openingTurn.nextState,
  });
  const thinkingTimerRef = useRef<number | null>(null);
  const streamingTimerRef = useRef<number | null>(null);
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
    !isCompanionMode &&
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

    clearResponseTimers(thinkingTimerRef, streamingTimerRef);

    const timeoutId = window.setTimeout(() => {
      onClosed?.();
    }, PANEL_EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, onClosed]);

  useEffect(
    () => () => {
      clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    },
    [],
  );

  const streamAssistantTurn = useCallback(
    (
      assistantTurn: AiConciergeAssistantTurn,
      assistantMessageId: string,
    ) => {
      streamAssistantTurnPlayback({
        assistantTurn,
        assistantMessageId,
        onComplete: () => {
          pendingAssistantResponseRef.current = null;
          setConversationState(assistantTurn.nextState);
          setIsAssistantResponding(false);
        },
        setMessages,
        streamingTimerRef,
        thinkingTimerRef,
      });
    },
    [],
  );

  useEffect(() => {
    streamAssistantTurn(openingTurn, openingAssistantMessageId);
  }, [openingAssistantMessageId, openingTurn, streamAssistantTurn]);

  const handlePanelClose = () => {
    setActivePremiumPlanId(null);
    setIsExpanded(false);
    onClose();
  };

  const handleToggleExpand = () => {
    setIsExpanded((currentValue) => !currentValue);
  };

  const handleStopAssistantResponse = () => {
    const pendingAssistantResponse = pendingAssistantResponseRef.current;
    if (!pendingAssistantResponse) {
      return;
    }

    clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    pendingAssistantResponseRef.current = null;
    setIsAssistantResponding(false);
    setConversationState(pendingAssistantResponse.stopState);
    setMessages((currentMessages) =>
      currentMessages.flatMap((message) => {
        if (
          message.id !== pendingAssistantResponse.assistantMessageId ||
          message.role !== "assistant"
        ) {
          return [message];
        }

        if (!message.body.trim().length) {
          return [];
        }

        return [{ ...message, status: "complete" as const }];
      }),
    );
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
    pendingAssistantResponseRef.current = {
      assistantMessageId: createAssistantMessageId(assistantMessageNumber),
      stopState: conversationState,
    };
    setMessages((currentMessages) => [
      ...clearSuggestedReplies(currentMessages),
      createUserMessage(trimmedMessage, userMessageNumber),
      createThinkingAssistantMessage(assistantMessageNumber),
    ]);
    setComposerDraft("");
    streamAssistantTurn(
      assistantTurn,
      createAssistantMessageId(assistantMessageNumber),
    );
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

  const panelElement = (
    <section
      id={
        isCompanionMode
          ? "premium-survey-concierge-panel-companion"
          : "premium-survey-concierge-panel"
      }
      role={isCompanionMode ? "region" : "dialog"}
      aria-label="Premium plan helper"
      aria-hidden={isCompanionMode ? undefined : !isOpen}
      aria-modal={isCompanionMode ? undefined : isOpen && isExpanded}
      className={[
        "relative flex h-full w-full flex-col overflow-hidden border border-ai-border-faint bg-ai-surface-base transition-[border-radius,height,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none",
        "shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)]",
        isCompanionMode
          ? "min-h-[680px] rounded-[24px]"
          : isOpen
            ? "animate-[ai-concierge-panel-enter_260ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
            : "pointer-events-none animate-[ai-concierge-panel-exit_220ms_ease-in_both] motion-reduce:animate-none",
        !isCompanionMode && isDockedPlanSurface
          ? "sm:rounded-[28px]"
          : !isCompanionMode && isExpanded
            ? "sm:h-[calc(100vh-32px)] sm:max-h-full sm:rounded-[32px]"
            : !isCompanionMode
              ? "sm:rounded-[24px]"
              : "",
        !isCompanionMode && isDockedPlanSurface
          ? "sm:w-[960px] sm:translate-x-0"
          : !isCompanionMode && isExpanded
            ? "sm:w-[min(1480px,calc(100vw-32px))] sm:translate-x-[calc((min(1480px,calc(100vw-32px))+32px-100vw)/2)]"
            : !isCompanionMode
              ? "sm:w-[432px] sm:translate-x-0"
              : "",
      ].join(" ")}
    >
      <AiConciergeHeader
        isExpanded={isExpanded}
        onClose={handlePanelClose}
        onToggleExpand={isCompanionMode ? undefined : handleToggleExpand}
        recommendationAvatarFallbackSrc="/figma/avatar/entity-initials-04.svg"
        recommendationAvatarName={contactFirstName}
        recommendationTitle={
          candidate === "candidate-1"
            ? `${contactFirstName}'s recommendation`
            : undefined
        }
      />

      <div className="flex min-h-0 flex-1 flex-col animate-[ai-concierge-chat-surface-in_320ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
        {activePremiumPlanId ? (
          <div
            className={[
              "flex min-h-0 flex-1 flex-col",
              isCompanionMode
                ? ""
                : "sm:grid sm:grid-cols-[420px_minmax(0,1fr)]",
            ].join(" ")}
          >
            {!isCompanionMode ? (
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
            ) : null}
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
  );

  if (isCompanionMode) {
    return panelElement;
  }

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

        {panelElement}
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
