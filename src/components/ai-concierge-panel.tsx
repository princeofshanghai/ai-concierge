"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { AiConciergeBody } from "@/components/ai-concierge-body";
import { AiConciergeConfettiOverlay } from "@/components/ai-concierge-confetti-overlay";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeMeetingCancelDialog } from "@/components/ai-concierge-meeting-cancel-dialog";
import { AiConciergeMicrophoneNotice } from "@/components/ai-concierge-microphone-notice";
import { AiConciergeVoiceDock } from "@/components/ai-concierge-voice-dock";
import { AiConciergePhoneCallDialog } from "@/components/ai-concierge-phone-call-dialog";
import { AiConciergePhoneCallPrompt } from "@/components/ai-concierge-phone-call-prompt";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import { AiConciergeNextStepPanel } from "@/components/ai-concierge-next-step-panel";
import { AiConciergeRepresentativeReadyBanner } from "@/components/ai-concierge-representative-booking";
import { AiConciergeOnboarding } from "@/components/ai-concierge-onboarding";
import {
  createRepresentativeMatchingTurn,
  createReturnToChatTurn,
  createOpeningTurn,
  createVoiceModeIntro,
  getAssistantTurn,
  type AiConciergeAssistantTurn,
  type AiConciergeConversationState,
} from "@/lib/ai-concierge-conversation";
import {
  DEFAULT_REPRESENTATIVE_NAME,
  EMPTY_CONTACT_DETAILS,
  LINKEDIN_IDENTITY,
  PREFILLED_CONTACT_DETAILS,
  REQUIRED_CONTACT_FIELDS,
} from "@/lib/ai-concierge-fixtures";
import type {
  AiConciergeMessage,
  AiConciergeSuggestedReply,
  ConciergeContactDetails,
} from "@/lib/ai-concierge-types";
import {
  createRepresentativeRebookingDraft,
  useRepresentativeFlow,
} from "@/lib/use-ai-concierge-representative-flow";
import { useLiveSalesFlow } from "@/lib/use-ai-concierge-live-sales-flow";
import { usePhoneCallFlow } from "@/lib/use-ai-concierge-phone-call-flow";
import { useVoiceFlow } from "@/lib/use-ai-concierge-voice-flow";
import {
  PrototypeShellActionButton,
  PrototypeShellCard,
  PrototypeShellLabel,
} from "@/components/prototype-shell";
import {
  DEFAULT_PROTOTYPE_SCENARIO,
  getPrototypeScenarioEntryState,
  type PrototypeScenario,
} from "@/lib/prototype-scenario";

type AiConciergePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onClosed?: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
  onPrototypeScenarioChange?: (scenario: PrototypeScenario) => void;
  prototypeScenario?: PrototypeScenario;
};

type PendingAssistantResponse = {
  assistantMessageId: string;
  stopState: AiConciergeConversationState | null;
};

const PANEL_EXIT_DURATION_MS = 220;

type AiConciergePanelState = "chat" | "manual" | "prefill" | "welcome";

function getContactDetailsForScenario(
  scenario: PrototypeScenario,
): ConciergeContactDetails {
  return scenario.authState === "linkedin-connected"
    ? { ...PREFILLED_CONTACT_DETAILS }
    : { ...EMPTY_CONTACT_DETAILS };
}

export function AiConciergePanel({
  isOpen,
  onClose,
  onClosed,
  onExpandedChange,
  onPrototypeScenarioChange,
  prototypeScenario = DEFAULT_PROTOTYPE_SCENARIO,
}: AiConciergePanelProps) {
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(
    prototypeScenario.authState === "linkedin-connected",
  );
  const [panelState, setPanelState] = useState<AiConciergePanelState>(
    getPrototypeScenarioEntryState(prototypeScenario),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] = useState<ConciergeContactDetails>(
    getContactDetailsForScenario(prototypeScenario),
  );
  const [messages, setMessages] = useState<AiConciergeMessage[]>([]);
  const [conversationState, setConversationState] =
    useState<AiConciergeConversationState | null>(null);
  const [composerDraft, setComposerDraft] = useState("");
  const [focusComposerSignal, setFocusComposerSignal] = useState(0);
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const [threadScrollSignal, setThreadScrollSignal] = useState(0);
  const nextAssistantMessageNumberRef = useRef(2);
  const thinkingTimerRef = useRef<number | null>(null);
  const streamingTimerRef = useRef<number | null>(null);
  const closeVoiceModeRef = useRef<(clearCaptions?: boolean) => void>(() => {});
  const shouldShowNextStepSurfaceRef = useRef(false);
  const bookingVoiceGuidanceKeyRef = useRef<string | null>(null);
  const pendingAssistantResponseRef =
    useRef<PendingAssistantResponse | null>(null);
  const appendStandaloneBookingConfirmation = useCallback(
    (body: string) => {
      const assistantMessageNumber = nextAssistantMessageNumberRef.current;

      nextAssistantMessageNumberRef.current += 2;
      setMessages((currentMessages) => [
        ...currentMessages,
        createAssistantMessage(
          body,
          undefined,
          undefined,
          undefined,
          assistantMessageNumber,
        ),
      ]);
    },
    [],
  );
  const hasCompletedOpeningMessage =
    messages[0]?.id === "assistant-message-1" &&
    messages[0]?.status === "complete";
  const appendVoiceAssistantMessage = useCallback((body: string) => {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return null;
    }

    const assistantMessageNumber = nextAssistantMessageNumberRef.current;
    const messageId = createAssistantMessageId(assistantMessageNumber);

    nextAssistantMessageNumberRef.current += 2;
    setMessages((currentMessages) => [
      ...currentMessages,
      createAssistantMessage(
        trimmedBody,
        undefined,
        undefined,
        undefined,
        assistantMessageNumber,
      ),
    ]);

    return messageId;
  }, []);
  const ensureVoiceIntroMessage = useCallback(
    (body: string) => {
      const trimmedBody = body.trim();

      if (!trimmedBody) {
        return null;
      }

      const shouldReplaceOpeningAssistantMessage =
        messages.length === 1 &&
        messages[0]?.id === "assistant-message-1" &&
        messages[0]?.role === "assistant" &&
        messages[0]?.status === "complete";

      if (shouldReplaceOpeningAssistantMessage) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === "assistant-message-1" && message.role === "assistant"
              ? {
                  ...message,
                  artifact: undefined,
                  body: trimmedBody,
                  openingSupport: undefined,
                  status: "complete",
                  suggestedReplies: undefined,
                  suggestedReplyDisplay: undefined,
                }
              : message,
          ),
        );

        return "assistant-message-1";
      }

      const assistantMessageNumber = nextAssistantMessageNumberRef.current;
      const messageId = createAssistantMessageId(assistantMessageNumber);

      nextAssistantMessageNumberRef.current += 2;
      setMessages((currentMessages) => [
        ...currentMessages,
        createAssistantMessage(
          trimmedBody,
          undefined,
          undefined,
          undefined,
          assistantMessageNumber,
        ),
      ]);

      return messageId;
    },
    [messages],
  );

  const replaceAssistantArtifact = useCallback(
    (messageId: string, artifact: AiConciergeMessage["artifact"]) => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId && message.role === "assistant"
            ? {
                ...message,
                artifact,
                suggestedReplies: undefined,
                suggestedReplyDisplay: undefined,
              }
            : message,
        ),
      );
    },
    [],
  );
  const {
    clearLiveSalesTimers,
    isLiveAgentReplyPending,
    liveSalesChatStatus,
    queueLiveSalesReply,
    resetLiveSalesChatFlow,
    startLiveSalesHandoffFlow,
  } = useLiveSalesFlow({
    closeVoiceMode: () => closeVoiceModeRef.current(),
    contactFirstName: contactDetails.firstName,
    setFocusComposerSignal,
    setMessages,
  });
  const {
    activeVoiceAssistantMessageId,
    clearAwaitedVoiceAssistantMessage,
    clearDictateStatusMessage,
    clearMicrophoneBlockedNotice,
    clearVoiceFlowSideEffects,
    closeVoiceMode,
    dictateStatusMessage,
    handleFinishVoiceTurn,
    playVoiceGuidanceMessage,
    handleRetryVoiceMode,
    handleStopAssistantPlayback,
    handleStartVoiceMode,
    handleToggleDictation,
    handleToggleVoicePlayback,
    isDictating,
    isMicrophoneBlocked,
    isVoiceModeActive,
    isVoicePlaybackMuted,
    registerVoiceMessageSender,
    resetVoiceFlow,
    resetVoiceFlowState,
    stopDictationRecognition,
    voiceErrorMessage,
    voiceModeStatus,
    voiceUserCaption,
  } = useVoiceFlow({
    appendVoiceAssistantMessage,
    composerDraft,
    getShouldShowNextStepSurface: () => shouldShowNextStepSurfaceRef.current,
    isAssistantResponding,
    liveSalesChatStatus,
    messages,
    panelState,
    setComposerDraft,
    ensureVoiceIntroMessage,
    voiceIntroMessage: createVoiceModeIntro({
      contactDetails,
    }),
  });

  const {
    bookingCelebrationTrigger,
    clearRepresentativeFlowTimers,
    closeMatchedBookingSurface,
    closeMeetingCancelDialog,
    dismissRepresentativeReadyBanner,
    handleConfirmMeetingCancellation,
    handleNextStepConfirmed,
    handleRecommendationPrimaryAction,
    isMatchedBookingSurfaceVisible,
    isMeetingCancelDialogOpen,
    isMeetingCancelSubmitting,
    isRepresentativeReadyBannerVisible,
    isRepresentativeReadyCardVisible,
    openMatchedBookingSurface,
    openMeetingCancelDialog,
    pendingRecommendationMessageId,
    representativeBookingDraft,
    representativeBookedSelection,
    representativeMatchStatus,
    resetRepresentativeFlowState,
    resetRepresentativeMatchFlow,
    setRepresentativeBookingDraft,
    setRepresentativeReadyCardVisible,
    startRepresentativeMatchFlow,
  } = useRepresentativeFlow({
    appendStandaloneBookingConfirmation,
    clearDictateStatusMessage,
    conversationState,
    isAssistantResponding,
    isLiveAgentReplyPending,
    isLiveSalesChatConnecting: liveSalesChatStatus === "connecting",
    replaceAssistantArtifact,
    resetLiveSalesChatFlow,
    setConversationState,
    setMessages,
    setThreadScrollSignal,
    stopDictationRecognition,
  });
  const shouldShowNextStepSurface =
    panelState === "chat" && isMatchedBookingSurfaceVisible;
  const shouldShowPhoneCallHeaderAction =
    panelState === "chat" && liveSalesChatStatus === "idle";
  const shouldDelayPhoneCallPromptReveal =
    isOpen &&
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    hasCompletedOpeningMessage;
  const {
    clearPhoneCallTimers,
    dismissAvailablePhoneCallPrompt,
    dismissPhoneCallPrompt,
    handleClosePhoneCallDialog,
    handleConfirmPhoneCall,
    handleOpenPhoneCallDialog,
    isPhoneCallDialogOpen,
    isPhoneCallPromptVisible,
    isPhoneCallSubmitting,
    phoneCallNumberDraft,
    phoneCallPromptState,
    resetPhoneCallFlow,
    resetPhoneCallTransientState,
    setPhoneCallNumberDraft,
  } = usePhoneCallFlow({
    canOpenPhoneCallDialog: shouldShowPhoneCallHeaderAction,
    contactPhoneNumber: contactDetails.phoneNumber,
    isOpen,
    setContactDetails,
    shouldDelayPromptReveal: shouldDelayPhoneCallPromptReveal,
  });
  const handleStartLiveSalesHandoff = useCallback(
    (messageId: string) => {
      dismissPhoneCallPrompt();
      startLiveSalesHandoffFlow(messageId);
    },
    [dismissPhoneCallPrompt, startLiveSalesHandoffFlow],
  );
  const isLiveSalesChatActive = liveSalesChatStatus === "active";
  const isLiveSalesChatConnecting = liveSalesChatStatus === "connecting";
  const isDockedNextStepSurface = shouldShowNextStepSurface && !isExpanded;
  const isPresentationExpanded = isExpanded || shouldShowNextStepSurface;
  const isContactDetailsValid = REQUIRED_CONTACT_FIELDS.every(
    (field) => contactDetails[field].trim().length > 0,
  );
  const canRestartConversation =
    panelState === "chat" && messages.length > 1 && !shouldShowNextStepSurface;
  const composerSuggestedReplies = getComposerSuggestedReplies(
    messages,
    isAssistantResponding || isLiveAgentReplyPending,
  );
  const composerKey = getComposerInteractionKey(
    messages,
    isAssistantResponding || isLiveAgentReplyPending,
  );
  const shouldShowComposerExampleResponses =
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    !isLiveSalesChatActive &&
    !isVoiceModeActive &&
    composerSuggestedReplies.length > 0 &&
    composerDraft.trim().length === 0;
  const shouldShowPhoneCallPromptEntryPoint =
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    liveSalesChatStatus === "idle" &&
    hasCompletedOpeningMessage;
  const shouldShowRepresentativeReadyBanner =
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    representativeMatchStatus === "ready" &&
    isRepresentativeReadyBannerVisible &&
    isRepresentativeReadyCardVisible === false;
  const shouldShowPhoneCallPrompt =
    shouldShowPhoneCallPromptEntryPoint &&
    !isVoiceModeActive &&
    !shouldShowRepresentativeReadyBanner &&
    (phoneCallPromptState === "requested" || isPhoneCallPromptVisible);
  const systemNoticeMessage =
    isMicrophoneBlocked
      ? "Turn on microphone access and try again"
      : voiceErrorMessage ?? dictateStatusMessage;
  const shouldShowMicrophoneNotice =
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    Boolean(systemNoticeMessage);
  const onboardingCopyVariant =
    prototypeScenario.entryVariant === "confirm-details-first"
      ? "direct-entry"
      : "default";

  useEffect(() => {
    closeVoiceModeRef.current = closeVoiceMode;
  }, [closeVoiceMode]);

  useEffect(() => {
    shouldShowNextStepSurfaceRef.current = shouldShowNextStepSurface;
  }, [shouldShowNextStepSurface]);

  const resetPanelToScenario = useCallback(
    (scenario: PrototypeScenario) => {
      const nextContactDetails = getContactDetailsForScenario(scenario);

      resetVoiceFlow();
      clearResponseTimers(thinkingTimerRef, streamingTimerRef);
      resetRepresentativeMatchFlow();
      resetLiveSalesChatFlow();

      pendingAssistantResponseRef.current = null;
      nextAssistantMessageNumberRef.current = 2;

      setIsLinkedInConnected(scenario.authState === "linkedin-connected");
      setPanelState(getPrototypeScenarioEntryState(scenario));
      setContactDetails(nextContactDetails);
      setMessages([]);
      setConversationState(null);
      setComposerDraft("");
      setFocusComposerSignal((currentValue) => currentValue + 1);
      setIsAssistantResponding(false);
      resetPhoneCallFlow({
        phoneNumber: nextContactDetails.phoneNumber,
        promptState: "available",
      });
    },
    [
      resetPhoneCallFlow,
      resetLiveSalesChatFlow,
      resetRepresentativeMatchFlow,
      resetVoiceFlow,
    ],
  );

  const syncPrototypeScenario = useCallback(
    (scenario: PrototypeScenario) => {
      onPrototypeScenarioChange?.(scenario);
    },
    [onPrototypeScenarioChange],
  );

  const handleBackToChat = useCallback(() => {
    if (isMatchedBookingSurfaceVisible) {
      closeMatchedBookingSurface();
      return;
    }

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
        assistantTurn.openingSupport,
        assistantTurn.suggestedReplies,
        assistantTurn.suggestedReplyDisplay,
        assistantMessageNumber,
      ),
    ]);
  }, [
    closeMatchedBookingSurface,
    contactDetails,
    conversationState,
    isMatchedBookingSurfaceVisible,
  ]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    clearVoiceFlowSideEffects();
    clearPhoneCallTimers();
    clearRepresentativeFlowTimers();
    clearLiveSalesTimers();

    const voiceResetTimer = window.setTimeout(() => {
      resetPhoneCallTransientState();
      resetLiveSalesChatFlow();
      resetRepresentativeFlowState();
      resetVoiceFlowState();
    }, 0);

    const exitTimer = window.setTimeout(() => {
      onClosed?.();
    }, PANEL_EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(voiceResetTimer);
      window.clearTimeout(exitTimer);
    };
  }, [
    clearRepresentativeFlowTimers,
    clearLiveSalesTimers,
    clearPhoneCallTimers,
    clearVoiceFlowSideEffects,
    isOpen,
    onClosed,
    resetLiveSalesChatFlow,
    resetPhoneCallTransientState,
    resetRepresentativeFlowState,
    resetVoiceFlowState,
  ]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        if (isMeetingCancelDialogOpen) {
          if (!isMeetingCancelSubmitting) {
            closeMeetingCancelDialog();
          }
          return;
        }

        if (isPhoneCallDialogOpen) {
          if (!isPhoneCallSubmitting) {
            handleClosePhoneCallDialog();
          }
          return;
        }

        if (isVoiceModeActive) {
          closeVoiceMode();
          return;
        }

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
    closeVoiceMode,
    closeMeetingCancelDialog,
    handleBackToChat,
    isAssistantResponding,
    isExpanded,
    handleClosePhoneCallDialog,
    isMeetingCancelDialogOpen,
    isMeetingCancelSubmitting,
    isPhoneCallDialogOpen,
    isPhoneCallSubmitting,
    isOpen,
    isVoiceModeActive,
    onClose,
    shouldShowNextStepSurface,
  ]);

  useEffect(() => {
    return () => {
      clearResponseTimers(thinkingTimerRef, streamingTimerRef);
      clearPhoneCallTimers();
      clearRepresentativeFlowTimers();
      clearLiveSalesTimers();
      clearVoiceFlowSideEffects();
    };
  }, [
    clearRepresentativeFlowTimers,
    clearPhoneCallTimers,
    clearLiveSalesTimers,
    clearVoiceFlowSideEffects,
  ]);

  useEffect(() => {
    onExpandedChange?.(isPresentationExpanded);

    return () => {
      onExpandedChange?.(false);
    };
  }, [isPresentationExpanded, onExpandedChange]);

  useEffect(() => {
    if (!isVoiceModeActive) {
      bookingVoiceGuidanceKeyRef.current = null;
      return;
    }

    if (panelState !== "chat") {
      const voiceResetTimer = window.setTimeout(() => {
        closeVoiceMode();
      }, 0);

      return () => {
        window.clearTimeout(voiceResetTimer);
      };
    }
  }, [closeVoiceMode, isVoiceModeActive, panelState]);

  useEffect(() => {
    if (!isVoiceModeActive || !shouldShowNextStepSurface) {
      bookingVoiceGuidanceKeyRef.current = null;
      return;
    }

    const guidanceKey =
      representativeMatchStatus === "booked" ? "manage" : "book";

    if (bookingVoiceGuidanceKeyRef.current === guidanceKey) {
      return;
    }

    playVoiceGuidanceMessage(
      guidanceKey === "manage"
        ? "Update the meeting details here. I can help if you need it."
        : "Pick a format and time. I can help if you need it.",
    );
    bookingVoiceGuidanceKeyRef.current = guidanceKey;
  }, [
    isVoiceModeActive,
    playVoiceGuidanceMessage,
    representativeMatchStatus,
    shouldShowNextStepSurface,
  ]);
  const streamAssistantTurn = useCallback(
    (assistantTurn: AiConciergeAssistantTurn, assistantMessageId: string) => {
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
                    artifact: isComplete ? assistantTurn.artifact : undefined,
                    openingSupport: isComplete
                      ? assistantTurn.openingSupport
                      : undefined,
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
          pendingAssistantResponseRef.current = null;
          setConversationState(assistantTurn.nextState);
          setIsAssistantResponding(false);
          if (assistantTurn.postCompleteEffect === "representative-match") {
            startRepresentativeMatchFlow(assistantMessageId);
            return;
          }

          if (assistantTurn.postCompleteEffect === "live-sales-handoff") {
            handleStartLiveSalesHandoff(assistantMessageId);
          }
        }, getStreamingInterval(assistantTurn.body));
      }, thinkingDelay);
    },
    [handleStartLiveSalesHandoff, startRepresentativeMatchFlow],
  );

  const queueRepresentativeAssistantTurn = useCallback(
    (assistantTurn: AiConciergeAssistantTurn) => {
      const assistantMessageNumber = nextAssistantMessageNumberRef.current;
      const assistantMessageId = createAssistantMessageId(assistantMessageNumber);

      nextAssistantMessageNumberRef.current += 2;
      setIsAssistantResponding(true);
      pendingAssistantResponseRef.current = {
        assistantMessageId,
        stopState: conversationState,
      };
      setMessages((currentMessages) => [
        ...clearSuggestedReplies(currentMessages),
        createThinkingAssistantMessage(assistantMessageNumber),
      ]);
      streamAssistantTurn(assistantTurn, assistantMessageId);

      return assistantMessageId;
    },
    [conversationState, streamAssistantTurn],
  );

  const sendMessage = useCallback(
    (body: string) => {
      const trimmedBody = body.trim();
      if (
        !trimmedBody ||
        isAssistantResponding ||
        isLiveAgentReplyPending ||
        isLiveSalesChatConnecting
      ) {
        return null;
      }

      stopDictationRecognition();
      clearDictateStatusMessage();

      if (isLiveSalesChatActive) {
        setMessages((currentMessages) => [
          ...clearSuggestedReplies(currentMessages),
          createUserMessage(trimmedBody, currentMessages.length + 1),
        ]);
        queueLiveSalesReply(trimmedBody);
        return `agent-message-${Date.now()}`;
      }

      if (!conversationState) {
        return null;
      }

      const assistantTurn = getAssistantTurn({
        contactDetails,
        input: trimmedBody,
        state: conversationState,
      });
      if (assistantTurn.postCompleteEffect === "representative-match") {
        setRepresentativeBookingDraft(null);
      }
      setIsAssistantResponding(true);
      const assistantMessageNumber = nextAssistantMessageNumberRef.current;
      const assistantMessageId = createAssistantMessageId(assistantMessageNumber);

      nextAssistantMessageNumberRef.current += 2;
      pendingAssistantResponseRef.current = {
        assistantMessageId,
        stopState: conversationState,
      };

      setMessages((currentMessages) => {
        const nextMessages = clearSuggestedReplies(currentMessages);
        const nextMessageNumber = nextMessages.length + 1;

        return [
          ...nextMessages,
          createUserMessage(trimmedBody, nextMessageNumber),
          createThinkingAssistantMessage(assistantMessageNumber),
        ];
      });

      streamAssistantTurn(assistantTurn, assistantMessageId);
      return assistantMessageId;
    },
    [
      clearDictateStatusMessage,
      contactDetails,
      conversationState,
      isAssistantResponding,
      isLiveAgentReplyPending,
      isLiveSalesChatActive,
      isLiveSalesChatConnecting,
      queueLiveSalesReply,
      setRepresentativeBookingDraft,
      stopDictationRecognition,
      streamAssistantTurn,
    ],
  );

  useEffect(() => {
    registerVoiceMessageSender(sendMessage);
  }, [registerVoiceMessageSender, sendMessage]);

  const handleStopAssistantResponse = useCallback(() => {
    const pendingAssistantResponse = pendingAssistantResponseRef.current;
    if (!pendingAssistantResponse) {
      return;
    }

    clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    pendingAssistantResponseRef.current = null;

    clearAwaitedVoiceAssistantMessage(
      pendingAssistantResponse.assistantMessageId,
    );

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
  }, [clearAwaitedVoiceAssistantMessage]);

  const handleSendMessage = (body: string) => {
    if (!sendMessage(body)) {
      return;
    }

    setComposerDraft("");
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
    setIsLinkedInConnected(true);
    setContactDetails((currentDetails) =>
      mergeMissingContactDetails(currentDetails, PREFILLED_CONTACT_DETAILS),
    );
    syncPrototypeScenario({
      authState: "linkedin-connected",
      entryVariant: prototypeScenario.entryVariant,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
    });
    setPanelState("prefill");
  };

  const handleGetStarted = () => {
    setPanelState(
      isLinkedInConnected || prototypeScenario.authState === "linkedin-connected"
        ? "prefill"
        : "manual",
    );
  };

  const handleBackFromDetails = () => {
    setPanelState("welcome");
  };

  const handleUseAnotherAccount = () => {
    setIsLinkedInConnected(false);
    setContactDetails({ ...EMPTY_CONTACT_DETAILS });
    syncPrototypeScenario({
      authState: "signed-out",
      entryVariant: prototypeScenario.entryVariant,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
    });
    setPanelState("manual");
  };

  const restartConversation = () => {
    const openingTurn = createOpeningTurn({
      contactDetails,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
    });
    const openingAssistantMessageNumber = 1;
    const openingAssistantMessageId = createAssistantMessageId(
      openingAssistantMessageNumber,
    );

    resetVoiceFlow();
    clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    clearPhoneCallTimers();
    resetRepresentativeMatchFlow();
    resetLiveSalesChatFlow();
    setComposerDraft("");
    setIsAssistantResponding(true);
    resetPhoneCallFlow({
      phoneNumber: contactDetails.phoneNumber,
      promptState: "available",
    });
    setConversationState(openingTurn.nextState);
    pendingAssistantResponseRef.current = {
      assistantMessageId: openingAssistantMessageId,
      stopState: openingTurn.nextState,
    };
    setMessages([createThinkingAssistantMessage(openingAssistantMessageNumber)]);
    nextAssistantMessageNumberRef.current = 3;
    streamAssistantTurn(openingTurn, openingAssistantMessageId);
  };

  const handleStartConversation = () => {
    if (!isContactDetailsValid) {
      return;
    }

    restartConversation();
    setPanelState("chat");
  };

  const handleRestartConversation = useCallback(() => {
    resetPanelToScenario(prototypeScenario);
  }, [prototypeScenario, resetPanelToScenario]);

  const handleSuggestedReply = (suggestedReply: AiConciergeSuggestedReply) => {
    stopDictationRecognition();
    if (!sendMessage(suggestedReply.label)) {
      return;
    }

    setComposerDraft("");
  };

  const handleComposerSuggestedReplySelect = (
    suggestedReply: AiConciergeSuggestedReply,
  ) => {
    dismissAvailablePhoneCallPrompt();
    setComposerDraft(suggestedReply.label);
    setFocusComposerSignal((currentValue) => currentValue + 1);
  };

  const handleOpeningPromptInsert = (prompt: string) => {
    dismissAvailablePhoneCallPrompt();
    setComposerDraft(prompt);
    setFocusComposerSignal((currentValue) => currentValue + 1);
  };

  const handleComposerDraftChange = (draft: string) => {
    if (draft.trim().length > 0) {
      dismissAvailablePhoneCallPrompt();
    }

    setComposerDraft(draft);
  };

  const handleBookAgain = useCallback(() => {
    if (
      !conversationState ||
      isAssistantResponding ||
      isLiveAgentReplyPending ||
      isLiveSalesChatConnecting
    ) {
      return;
    }

    const assistantTurn = createRepresentativeMatchingTurn(conversationState);

    closeVoiceMode();
    stopDictationRecognition();
    clearDictateStatusMessage();
    closeMatchedBookingSurface();
    dismissRepresentativeReadyBanner();
    setRepresentativeBookingDraft(
      createRepresentativeRebookingDraft(representativeBookedSelection),
    );
    queueRepresentativeAssistantTurn(assistantTurn);
  }, [
    clearDictateStatusMessage,
    closeMatchedBookingSurface,
    closeVoiceMode,
    conversationState,
    dismissRepresentativeReadyBanner,
    isAssistantResponding,
    isLiveAgentReplyPending,
    isLiveSalesChatConnecting,
    queueRepresentativeAssistantTurn,
    representativeBookedSelection,
    setRepresentativeBookingDraft,
    stopDictationRecognition,
  ]);

  const handleToggleExpand = () => {
    setIsExpanded((currentValue) => !currentValue);
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
        <div
          className={[
            "relative h-full w-full origin-right transition-[width,max-width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:transform-gpu",
            isDockedNextStepSurface
              ? "sm:w-[960px] sm:translate-x-0"
              : isExpanded
                ? "sm:w-[min(1480px,calc(100vw-32px))] sm:translate-x-[calc((min(1480px,calc(100vw-32px))+32px-100vw)/2)]"
              : "sm:w-[432px] sm:translate-x-0",
          ].join(" ")}
        >
          {canRestartConversation ? (
            <InternalRestartControl onRestart={handleRestartConversation} />
          ) : null}
          {shouldShowComposerExampleResponses ? (
            <ComposerExampleResponsesCard
              isExpanded={isExpanded}
              onSelectSuggestedReply={handleComposerSuggestedReplySelect}
              suggestedReplies={composerSuggestedReplies}
            />
          ) : null}
          <section
            id="ai-concierge-panel"
            role="dialog"
            aria-label="Chat panel"
            aria-hidden={!isOpen}
            aria-modal={isOpen && isExpanded}
            className={[
              "relative flex h-full w-full flex-col overflow-hidden border border-ai-border-faint shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)] transition-[border-radius,height,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none",
              isOpen
                ? "animate-[ai-concierge-panel-enter_260ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
                : "pointer-events-none animate-[ai-concierge-panel-exit_220ms_ease-in_both] motion-reduce:animate-none",
              panelState === "welcome"
                ? "bg-[radial-gradient(circle_at_top,rgba(10,102,194,0.14),rgba(10,102,194,0.04)_28%,rgba(255,255,255,0)_54%),linear-gradient(180deg,#f2f7ff_0%,#f7faff_34%,#ffffff_100%)]"
                : "bg-ai-surface-base",
              isDockedNextStepSurface
                ? "sm:rounded-[28px]"
                : isExpanded
                  ? "sm:h-[calc(100vh-32px)] sm:max-h-full sm:rounded-[32px]"
                  : "sm:rounded-[24px]",
            ].join(" ")}
          >
            <AiConciergeHeader
              isExpanded={isExpanded}
              liveAgentName={
                isLiveSalesChatActive ? DEFAULT_REPRESENTATIVE_NAME : null
              }
              onClose={onClose}
              onOpenPhoneCall={
                shouldShowPhoneCallHeaderAction
                  ? handleOpenPhoneCallDialog
                  : undefined
              }
              onToggleExpand={handleToggleExpand}
              variant={panelState === "welcome" ? "welcome" : "default"}
            />
            {panelState === "chat" ? (
              <div className="flex min-h-0 flex-1 flex-col animate-[ai-concierge-chat-surface-in_320ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
                {shouldShowNextStepSurface ? (
                  <div className="flex min-h-0 flex-1 flex-col sm:grid sm:grid-cols-[420px_minmax(0,1fr)]">
                    <div className="hidden min-h-0 border-r border-ai-divider bg-ai-surface-base sm:flex sm:flex-col sm:animate-[ai-concierge-chat-column-in_260ms_ease-out]">
                      <AiConciergeBody
                        activeVoiceAssistantMessageId={activeVoiceAssistantMessageId}
                        isVoiceModeActive={isVoiceModeActive}
                        messages={messages}
                        onBookAgain={handleBookAgain}
                        onBookMeeting={openMatchedBookingSurface}
                        onInsertOpeningPrompt={handleOpeningPromptInsert}
                        onManageBooking={openMatchedBookingSurface}
                        onRecommendationPrimaryAction={
                          handleRecommendationPrimaryAction
                        }
                        pendingRecommendationMessageId={
                          pendingRecommendationMessageId
                        }
                        onSelectSuggestedReply={handleSuggestedReply}
                        scrollToLatestSignal={threadScrollSignal}
                      />
                    </div>
                    <AiConciergeNextStepPanel
                      bookingMode={
                        representativeMatchStatus === "booked" ? "manage" : "book"
                      }
                      contactDetails={contactDetails}
                      initialSelection={representativeBookingDraft}
                      onBackToChat={handleBackToChat}
                      onCancelMeeting={
                        representativeMatchStatus === "booked"
                          ? openMeetingCancelDialog
                          : undefined
                      }
                      onConfirmBooking={handleNextStepConfirmed}
                    />
                  </div>
                ) : (
                  <>
                    {shouldShowRepresentativeReadyBanner ? (
                      <AiConciergeRepresentativeReadyBanner
                        isPanelExpanded={isExpanded}
                        onBookMeeting={openMatchedBookingSurface}
                        onDismiss={dismissRepresentativeReadyBanner}
                      />
                    ) : null}
                    <AiConciergeBody
                      activeVoiceAssistantMessageId={activeVoiceAssistantMessageId}
                      isVoiceModeActive={isVoiceModeActive}
                      isPanelExpanded={isExpanded}
                      messages={messages}
                      onBookAgain={handleBookAgain}
                      onBookMeeting={openMatchedBookingSurface}
                      onInsertOpeningPrompt={handleOpeningPromptInsert}
                      onManageBooking={openMatchedBookingSurface}
                      onRecommendationPrimaryAction={
                        handleRecommendationPrimaryAction
                      }
                      pendingRecommendationMessageId={
                        pendingRecommendationMessageId
                      }
                      onRepresentativeReadyCardVisibilityChange={
                        setRepresentativeReadyCardVisible
                      }
                      onSelectSuggestedReply={handleSuggestedReply}
                      scrollToLatestSignal={threadScrollSignal}
                    />
                  </>
                )}
                {!shouldShowNextStepSurface && shouldShowPhoneCallPrompt ? (
                  <AiConciergePhoneCallPrompt
                    isPanelExpanded={isExpanded}
                    onDismiss={dismissPhoneCallPrompt}
                    onOpenDialog={handleOpenPhoneCallDialog}
                    phoneNumber={contactDetails.phoneNumber}
                    state={
                      phoneCallPromptState === "requested"
                        ? "requested"
                        : "available"
                    }
                  />
                ) : null}
                {shouldShowMicrophoneNotice ? (
                  <AiConciergeMicrophoneNotice
                    isPanelExpanded={isExpanded}
                    message={systemNoticeMessage ?? ""}
                    onDismiss={clearMicrophoneBlockedNotice}
                  />
                ) : null}
                {isVoiceModeActive ? (
                  <AiConciergeVoiceDock
                    errorMessage={voiceErrorMessage}
                    isMuted={isVoicePlaybackMuted}
                    isPanelExpanded={isExpanded}
                    onClose={closeVoiceMode}
                    onDoneListening={handleFinishVoiceTurn}
                    onRetry={handleRetryVoiceMode}
                    onStopSpeaking={handleStopAssistantPlayback}
                    onToggleMute={handleToggleVoicePlayback}
                    status={voiceModeStatus}
                    userName={`${contactDetails.firstName} ${contactDetails.lastName}`.trim()}
                    userCaption={voiceUserCaption}
                  />
                ) : !shouldShowNextStepSurface ? (
                  <AiConciergeComposer
                    key={composerKey}
                    disabled={
                      isAssistantResponding ||
                      isLiveAgentReplyPending ||
                      isLiveSalesChatConnecting
                    }
                    disabledPlaceholder={
                      isLiveAgentReplyPending
                        ? `${DEFAULT_REPRESENTATIVE_NAME} is replying...`
                        : isLiveSalesChatConnecting
                          ? "Connecting to your account rep..."
                          : "Responding..."
                    }
                    draft={composerDraft}
                    focusComposerSignal={focusComposerSignal}
                    isDictating={isDictating}
                    isPanelExpanded={isExpanded}
                    isResponding={isAssistantResponding}
                    idlePlaceholder={
                      isLiveSalesChatActive
                        ? `Message ${DEFAULT_REPRESENTATIVE_NAME}`
                        : "Type your message"
                    }
                    onDraftChange={handleComposerDraftChange}
                    onSend={handleSendMessage}
                    onToggleDictation={handleToggleDictation}
                    onStopResponse={handleStopAssistantResponse}
                    onStartVoiceMode={handleStartVoiceMode}
                    showVoiceModeAction={!isLiveSalesChatActive}
                  />
                ) : null}
              </div>
            ) : (
              <AiConciergeOnboarding
                copyVariant={onboardingCopyVariant}
                details={contactDetails}
                isPanelExpanded={isExpanded}
                isValid={isContactDetailsValid}
                linkedInIdentity={
                  isLinkedInConnected ? LINKEDIN_IDENTITY : null
                }
                mode={panelState}
                onBack={handleBackFromDetails}
                onChange={handleContactDetailChange}
                onGetStarted={handleGetStarted}
                onContinueWithLinkedIn={handleStartWithLinkedIn}
                onStartConversation={handleStartConversation}
                onUseAnotherAccount={handleUseAnotherAccount}
              />
            )}
            <AiConciergePhoneCallDialog
              isOpen={isPhoneCallDialogOpen}
              isSubmitting={isPhoneCallSubmitting}
              onClose={handleClosePhoneCallDialog}
              onConfirm={handleConfirmPhoneCall}
              onPhoneNumberChange={setPhoneCallNumberDraft}
              phoneNumber={phoneCallNumberDraft}
            />
            <AiConciergeMeetingCancelDialog
              isOpen={isMeetingCancelDialogOpen}
              isSubmitting={isMeetingCancelSubmitting}
              onClose={closeMeetingCancelDialog}
              onConfirm={handleConfirmMeetingCancellation}
              representativeName={DEFAULT_REPRESENTATIVE_NAME}
            />
            <AiConciergeConfettiOverlay trigger={bookingCelebrationTrigger} />
          </section>
        </div>
      </div>
    </div>
  );
}

function mergeMissingContactDetails(
  currentDetails: ConciergeContactDetails,
  nextDetails: ConciergeContactDetails,
) {
  const preferCurrentValue = (field: keyof ConciergeContactDetails) =>
    currentDetails[field].trim().length > 0
      ? currentDetails[field]
      : nextDetails[field];

  return {
    firstName: preferCurrentValue("firstName"),
    lastName: preferCurrentValue("lastName"),
    company: preferCurrentValue("company"),
    email: preferCurrentValue("email"),
    phoneNumber: preferCurrentValue("phoneNumber"),
    countryRegion: preferCurrentValue("countryRegion"),
    role: preferCurrentValue("role"),
  };
}

function ComposerExampleResponsesCard({
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
          <PrototypeShellLabel className="px-0 pb-1">Internal only</PrototypeShellLabel>
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

function InternalRestartControl({
  onRestart,
}: {
  onRestart: () => void;
}) {
  return (
    <div className="absolute left-3 top-3 z-10 sm:left-0 sm:top-0 sm:-translate-x-[calc(100%+12px)]">
      <PrototypeShellCard className="rounded-[20px] p-2 shadow-[0_18px_36px_rgba(2,6,23,0.24)]">
        <PrototypeShellLabel className="px-2 pb-2">Internal only</PrototypeShellLabel>
        <PrototypeShellActionButton
          onClick={onRestart}
          className="w-full justify-center rounded-[14px] px-3"
        >
          <RestartIcon />
          Restart
        </PrototypeShellActionButton>
      </PrototypeShellCard>
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
  openingSupport: AiConciergeMessage["openingSupport"],
  suggestedReplies: AiConciergeSuggestedReply[] | undefined,
  suggestedReplyDisplay: AiConciergeMessage["suggestedReplyDisplay"],
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: createAssistantMessageId(messageNumber),
    role: "assistant",
    body,
    openingSupport,
    status: "complete",
    suggestedReplies,
    suggestedReplyDisplay,
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
