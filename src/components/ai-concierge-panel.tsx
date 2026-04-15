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
import { AiConciergePremiumPlanPanel } from "@/components/ai-concierge-premium-plan-panel";
import { AiConciergeRepresentativeReadyBanner } from "@/components/ai-concierge-representative-booking";
import { AiConciergeOnboarding } from "@/components/ai-concierge-onboarding";
import { CloseIcon } from "@/components/close-icon";
import {
  getAiConciergeEntryIdentityKey,
  readStoredAiConciergeEntrySession,
  writeStoredAiConciergeEntrySession,
} from "@/lib/ai-concierge-entry-session";
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
  LinkedInIdentity,
  PremiumPlanId,
} from "@/lib/ai-concierge-types";
import type { PrototypeLinkedInAuthReason } from "@/lib/prototype-linkedin-auth";
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
import { getPremiumPlanCheckoutHref } from "@/lib/premium-plan-details";

type AiConciergePanelProps = {
  authReturnNonce?: number;
  customGetAssistantTurn?: (args: {
    contactDetails: ConciergeContactDetails;
    input: string;
    state: AiConciergeConversationState;
  }) => AiConciergeAssistantTurn;
  customOpeningTurn?: (args: {
    contactDetails: ConciergeContactDetails;
    openingPromptVariant: PrototypeScenario["openingPromptVariant"];
  }) => AiConciergeAssistantTurn;
  disablePhoneCall?: boolean;
  disableVoiceMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAuthReturnHandled?: () => void;
  onClosed?: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
  onPrototypeLinkedInAuthRequest?: (
    reason: PrototypeLinkedInAuthReason,
  ) => void;
  onPrototypeScenarioChange?: (scenario: PrototypeScenario) => void;
  prototypeScenario?: PrototypeScenario;
  signedInContactDetails?: ConciergeContactDetails;
  signedInLinkedInIdentity?: LinkedInIdentity;
};

type PendingAssistantResponse = {
  assistantMessageId: string;
  stopState: AiConciergeConversationState | null;
};

const PANEL_EXIT_DURATION_MS = 220;
const VOICE_ENTRY_SWEEP_DURATION_MS = 980;
const VOICE_COMPOSER_MORPH_DURATION_MS = 520;
const VOICE_ENTRY_ACTIVATION_DELAY_MS = VOICE_COMPOSER_MORPH_DURATION_MS;
const VOICE_ENTRY_SOUND_SRC = "/audio/voice-entry-piano-ascending.wav";
const VOICE_EXIT_SOUND_SRC = "/audio/voice-exit-piano-descending.wav";
const VOICE_TRANSITION_SOUND_VOLUME = 0.14;

type AiConciergePanelState = "chat" | "manual" | "prefill" | "welcome";

type OnboardingFlowIntent = "entry" | "representative-gate";

type PendingIdentityAction =
  | {
      messageId: string;
      type: "live-sales-handoff";
    }
  | {
      messageId: string;
      type: "recommendation-card";
    }
  | {
      messageId: string;
      type: "representative-match";
    };

function getContactDetailsForScenario(
  scenario: PrototypeScenario,
  signedInContactDetails: ConciergeContactDetails,
): ConciergeContactDetails {
  return scenario.authState === "linkedin-connected"
    ? { ...signedInContactDetails }
    : { ...EMPTY_CONTACT_DETAILS };
}

function VoiceEntrySweepOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-[inherit]"
    >
      <div className="ai-premium-gradient-border-swoop absolute inset-0 rounded-[inherit] opacity-0 animate-[ai-concierge-voice-entry-border_980ms_linear_both] motion-reduce:animate-none" />
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_88%_86%,rgba(255,255,255,0.14),rgba(255,255,255,0)_44%)] opacity-0 animate-[ai-concierge-voice-entry-veil_980ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none" />
      <div className="ai-premium-gradient-swoop absolute inset-[-28%] opacity-0 blur-[10px] transform-gpu will-change-transform animate-[ai-concierge-voice-entry-sweep_980ms_linear_both] motion-reduce:animate-none" />
    </div>
  );
}

function ComposerToVoiceTransitionShell({
  isPanelExpanded = false,
}: {
  isPanelExpanded?: boolean;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none px-5 pb-5 pt-0">
      <div
        className={[
          "mx-auto flex w-full justify-center",
          isPanelExpanded ? "max-w-[720px]" : "max-w-full",
        ].join(" ")}
      >
        <div className="relative h-14 w-full max-w-full animate-[ai-concierge-composer-to-voice-shell_520ms_cubic-bezier(0.22,1,0.36,1)_both] will-change-[width]">
          <div className="absolute inset-0 rounded-full border border-ai-border-faint bg-ai-surface-base shadow-[0_0_0_1px_rgba(140,140,140,0.04),0_4px_12px_rgba(140,140,140,0.16)] animate-[ai-concierge-composer-to-voice-neutral-frame_520ms_ease-out_both]" />
          <div className="absolute inset-0 rounded-full border border-ai-blue-primary opacity-0 animate-[ai-concierge-composer-to-voice-gradient-frame_520ms_cubic-bezier(0.22,1,0.36,1)_both]" />
          <div className="absolute inset-0 flex items-center justify-between gap-4 px-3 opacity-100 animate-[ai-concierge-composer-to-voice-content_520ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <span className="ai-type-body-md-open max-w-[220px] truncate text-ai-text-disabled">
              Type your message
            </span>
            <div className="flex items-center gap-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-ai-text-secondary">
                <TransitionMicIcon />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ai-blue-primary text-ai-text-inverse shadow-[0_8px_18px_rgba(10,102,194,0.22)]">
                <TransitionVoiceWaveIcon className="h-[18px] w-[18px]" />
              </span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 animate-[ai-concierge-composer-to-voice-center-stage_520ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ai-blue-primary text-ai-text-inverse shadow-[0_12px_24px_rgba(10,102,194,0.18)]">
              <TransitionVoiceWaveIcon className="h-5 w-5" />
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-[3px] opacity-0 animate-[ai-concierge-composer-to-voice-side-controls_520ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <span className="flex h-12 w-12 items-center justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-ai-text-secondary">
                <CloseIcon className="h-5 w-5" />
              </span>
            </span>
            <span aria-hidden="true" className="block h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TransitionMicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12V6C8 3.8 9.8 2 12 2C14.2 2 16 3.8 16 6V12C16 14.2 14.2 16 12 16C9.8 16 8 14.2 8 12ZM17 10V12C17 14.8 14.8 17 12 17C9.2 17 7 14.8 7 12V10H6V12C6 15 8.2 17.4 11 17.9V20H8V22H16V20H13V17.9C15.8 17.4 18 15 18 12V10H17Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function TransitionVoiceWaveIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M2 10V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 3V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 5V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 10V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AiConciergePanel({
  authReturnNonce,
  isOpen,
  onClose,
  onAuthReturnHandled,
  onClosed,
  onExpandedChange,
  onPrototypeLinkedInAuthRequest,
  onPrototypeScenarioChange,
  prototypeScenario = DEFAULT_PROTOTYPE_SCENARIO,
  signedInContactDetails = PREFILLED_CONTACT_DETAILS,
  signedInLinkedInIdentity = LINKEDIN_IDENTITY,
  customGetAssistantTurn,
  customOpeningTurn,
  disablePhoneCall = false,
  disableVoiceMode = false,
}: AiConciergePanelProps) {
  const [storedEntrySession] = useState(() =>
    authReturnNonce === undefined ? readStoredAiConciergeEntrySession() : null,
  );
  const initialIdentityKey = getAiConciergeEntryIdentityKey({
    isLinkedInConnected: prototypeScenario.authState === "linkedin-connected",
    linkedInIdentity:
      prototypeScenario.authState === "linkedin-connected"
        ? signedInLinkedInIdentity
        : null,
  });
  const shouldResumeConversationFromStoredEntry =
    storedEntrySession?.identityKey === initialIdentityKey;
  const initialContactDetails = shouldResumeConversationFromStoredEntry
    ? { ...storedEntrySession.contactDetails }
    : getContactDetailsForScenario(prototypeScenario, signedInContactDetails);
  const storedEntryOpeningTurn = shouldResumeConversationFromStoredEntry
    ? (customOpeningTurn ?? createOpeningTurn)({
        contactDetails: initialContactDetails,
        openingPromptVariant: prototypeScenario.openingPromptVariant,
      })
    : null;
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(
    prototypeScenario.authState === "linkedin-connected",
  );
  const [panelState, setPanelState] = useState<AiConciergePanelState>(
    shouldResumeConversationFromStoredEntry
      ? "chat"
      : getPrototypeScenarioEntryState(prototypeScenario),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] = useState<ConciergeContactDetails>(
    initialContactDetails,
  );
  const [onboardingFlowIntent, setOnboardingFlowIntent] =
    useState<OnboardingFlowIntent>("entry");
  const [pendingIdentityAction, setPendingIdentityAction] =
    useState<PendingIdentityAction | null>(null);
  const [messages, setMessages] = useState<AiConciergeMessage[]>(
    shouldResumeConversationFromStoredEntry
      ? [createThinkingAssistantMessage(1)]
      : [],
  );
  const [conversationState, setConversationState] =
    useState<AiConciergeConversationState | null>(
      storedEntryOpeningTurn?.nextState ?? null,
    );
  const [composerDraft, setComposerDraft] = useState("");
  const [focusComposerSignal, setFocusComposerSignal] = useState(0);
  const [isAssistantResponding, setIsAssistantResponding] = useState(
    shouldResumeConversationFromStoredEntry,
  );
  const [isVoiceComposerTransitioning, setIsVoiceComposerTransitioning] =
    useState(false);
  const [isVoiceEntryAnimating, setIsVoiceEntryAnimating] = useState(false);
  const [voiceEntryAnimationKey, setVoiceEntryAnimationKey] = useState(0);
  const [threadScrollSignal, setThreadScrollSignal] = useState(0);
  const [activePremiumPlanId, setActivePremiumPlanId] =
    useState<PremiumPlanId | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const nextAssistantMessageNumberRef = useRef(
    shouldResumeConversationFromStoredEntry ? 3 : 2,
  );
  const thinkingTimerRef = useRef<number | null>(null);
  const streamingTimerRef = useRef<number | null>(null);
  const voiceComposerTransitionTimerRef = useRef<number | null>(null);
  const voiceEntryAnimationTimerRef = useRef<number | null>(null);
  const voiceEntryActivationTimerRef = useRef<number | null>(null);
  const voiceEntrySoundRef = useRef<HTMLAudioElement | null>(null);
  const voiceExitSoundRef = useRef<HTMLAudioElement | null>(null);
  const closeVoiceModeRef = useRef<(clearCaptions?: boolean) => void>(() => {});
  const shouldShowNextStepSurfaceRef = useRef(false);
  const bookingVoiceGuidanceKeyRef = useRef<string | null>(null);
  const pendingAssistantResponseRef =
    useRef<PendingAssistantResponse | null>(null);
  const handledAuthReturnNonceRef = useRef<number | null>(null);
  const handledStoredEntryResumeRef = useRef(false);
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
  const queuePlainVoiceAssistantMessage = useCallback(
    ({
      body,
      messageId,
      messageNumber,
      openingSupport,
      replaceExistingMessage = false,
      suggestedReplies,
      suggestedReplyDisplay,
    }: {
      body: string;
      messageId: string;
      messageNumber: number;
      openingSupport?: AiConciergeMessage["openingSupport"];
      replaceExistingMessage?: boolean;
      suggestedReplies?: AiConciergeSuggestedReply[];
      suggestedReplyDisplay?: AiConciergeMessage["suggestedReplyDisplay"];
    }) => {
      const trimmedBody = body.trim();

      if (!trimmedBody) {
        return null;
      }

      clearResponseTimers(thinkingTimerRef, streamingTimerRef);
      setIsAssistantResponding(true);
      pendingAssistantResponseRef.current = {
        assistantMessageId: messageId,
        stopState: conversationState,
      };

      if (replaceExistingMessage) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === messageId && message.role === "assistant"
              ? {
                  ...message,
                  artifact: undefined,
                  body: "",
                  openingSupport: undefined,
                  status: "thinking",
                  streamedChunks: undefined,
                  suggestedReplies: undefined,
                  suggestedReplyDisplay: undefined,
                }
              : message,
          ),
        );
      } else {
        setMessages((currentMessages) => [
          ...currentMessages,
          createThinkingAssistantMessage(messageNumber),
        ]);
      }

      const streamingChunks = createStreamingChunks(trimmedBody, "voice");
      let chunkIndex = 0;

      thinkingTimerRef.current = window.setTimeout(() => {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === messageId && message.role === "assistant"
              ? {
                  ...message,
                  body: "",
                  status: "streaming",
                  streamedChunks: [],
                }
              : message,
          ),
        );

        streamingTimerRef.current = window.setInterval(() => {
          chunkIndex += 1;
          const nextChunks = streamingChunks.slice(0, chunkIndex);
          const nextBody = nextChunks.join("");
          const isComplete = chunkIndex >= streamingChunks.length;

          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === messageId && message.role === "assistant"
                ? {
                    ...message,
                    body: nextBody,
                    openingSupport: isComplete ? openingSupport : undefined,
                    status: isComplete ? "complete" : "streaming",
                    streamedChunks: nextChunks,
                    suggestedReplies: isComplete ? suggestedReplies : undefined,
                    suggestedReplyDisplay: isComplete
                      ? suggestedReplyDisplay
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
          setConversationState(conversationState);
          setIsAssistantResponding(false);
        }, getStreamingInterval(trimmedBody, "voice"));
      }, getThinkingDelay(trimmedBody, "voice"));

      return messageId;
    },
    [conversationState],
  );
  const appendVoiceAssistantMessage = useCallback((body: string) => {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return null;
    }

    const assistantMessageNumber = nextAssistantMessageNumberRef.current;
    const messageId = createAssistantMessageId(assistantMessageNumber);

    nextAssistantMessageNumberRef.current += 2;

    return queuePlainVoiceAssistantMessage({
      body: trimmedBody,
      messageId,
      messageNumber: assistantMessageNumber,
    });
  }, [queuePlainVoiceAssistantMessage]);
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
        const openingMessage =
          messages[0]?.role === "assistant" ? messages[0] : null;

        return queuePlainVoiceAssistantMessage({
          body: trimmedBody,
          messageId: "assistant-message-1",
          messageNumber: 1,
          openingSupport: openingMessage?.openingSupport,
          replaceExistingMessage: true,
          suggestedReplies: openingMessage?.suggestedReplies,
          suggestedReplyDisplay: openingMessage?.suggestedReplyDisplay,
        });
      }

      const assistantMessageNumber = nextAssistantMessageNumberRef.current;
      const messageId = createAssistantMessageId(assistantMessageNumber);

      nextAssistantMessageNumberRef.current += 2;
      return queuePlainVoiceAssistantMessage({
        body: trimmedBody,
        messageId,
        messageNumber: assistantMessageNumber,
      });
    },
    [messages, queuePlainVoiceAssistantMessage],
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
    isDictating,
    isMicrophoneBlocked,
    isVoiceModeActive,
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
  const isContactDetailsValid = REQUIRED_CONTACT_FIELDS.every(
    (field) => contactDetails[field].trim().length > 0,
  );
  const isPremiumPlanSurfaceVisible =
    panelState === "chat" && activePremiumPlanId !== null;
  const shouldShowNextStepSurface =
    panelState === "chat" &&
    (isMatchedBookingSurfaceVisible || isPremiumPlanSurfaceVisible);
  const shouldShowPhoneCallHeaderAction =
    !disablePhoneCall &&
    panelState === "chat" &&
    liveSalesChatStatus === "idle" &&
    isContactDetailsValid;
  const shouldDelayPhoneCallPromptReveal =
    !disablePhoneCall &&
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
    !disablePhoneCall &&
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    liveSalesChatStatus === "idle" &&
    hasCompletedOpeningMessage &&
    isContactDetailsValid;
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
    !disableVoiceMode &&
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    Boolean(systemNoticeMessage);
  const onboardingCopyVariant = "direct-entry";
  const onboardingSubmitLabel =
    pendingIdentityAction !== null ? "Continue to rep" : "Start chat";
  const shouldShowOnboardingBackButton = true;

  useEffect(() => {
    shouldShowNextStepSurfaceRef.current = shouldShowNextStepSurface;
  }, [shouldShowNextStepSurface]);

  const resetPanelToScenario = useCallback(
    (scenario: PrototypeScenario) => {
      const nextContactDetails = getContactDetailsForScenario(
        scenario,
        signedInContactDetails,
      );

      resetVoiceFlow();
      clearResponseTimers(thinkingTimerRef, streamingTimerRef);
      resetRepresentativeMatchFlow();
      resetLiveSalesChatFlow();

      pendingAssistantResponseRef.current = null;
      nextAssistantMessageNumberRef.current = 2;

      setIsLinkedInConnected(scenario.authState === "linkedin-connected");
      setPanelState(getPrototypeScenarioEntryState(scenario));
      setIsExpanded(false);
      setContactDetails(nextContactDetails);
      setOnboardingFlowIntent("entry");
      setPendingIdentityAction(null);
      setMessages([]);
      setConversationState(null);
      setActivePremiumPlanId(null);
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
      signedInContactDetails,
    ],
  );

  const syncPrototypeScenario = useCallback(
    (scenario: PrototypeScenario) => {
      onPrototypeScenarioChange?.(scenario);
    },
    [onPrototypeScenarioChange],
  );

  const openRepresentativeIdentityGate = useCallback(
    (nextAction: PendingIdentityAction) => {
      setPendingIdentityAction(nextAction);
      setOnboardingFlowIntent("representative-gate");
      setPanelState(
        isLinkedInConnected ||
          prototypeScenario.authState === "linkedin-connected"
          ? "prefill"
          : "manual",
      );
    },
    [isLinkedInConnected, prototypeScenario.authState],
  );

  const handleBackToChat = useCallback(() => {
    if (activePremiumPlanId !== null) {
      setActivePremiumPlanId(null);
      return;
    }

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
    activePremiumPlanId,
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
      resetPanelToScenario(prototypeScenario);
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
    prototypeScenario,
    resetPanelToScenario,
    resetLiveSalesChatFlow,
    resetPhoneCallTransientState,
    resetRepresentativeFlowState,
    resetVoiceFlowState,
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

  const resetVoiceTransitionSound = useCallback((sound: HTMLAudioElement | null) => {
    if (!sound) {
      return;
    }

    sound.pause();

    try {
      sound.currentTime = 0;
    } catch {
      // Some browsers can reject rewinding during teardown; silence is fine here.
    }
  }, []);

  const stopVoiceTransitionSounds = useCallback(() => {
    resetVoiceTransitionSound(voiceEntrySoundRef.current);
    resetVoiceTransitionSound(voiceExitSoundRef.current);
  }, [resetVoiceTransitionSound]);

  const playVoiceEntrySound = useCallback(() => {
    resetVoiceTransitionSound(voiceExitSoundRef.current);

    const voiceEntrySound = voiceEntrySoundRef.current;
    if (!voiceEntrySound) {
      return;
    }

    resetVoiceTransitionSound(voiceEntrySound);

    const playPromise = voiceEntrySound.play();
    if (playPromise && typeof playPromise.catch === "function") {
      void playPromise.catch(() => {});
    }
  }, [resetVoiceTransitionSound]);

  const playVoiceExitSound = useCallback(() => {
    resetVoiceTransitionSound(voiceEntrySoundRef.current);

    const voiceExitSound = voiceExitSoundRef.current;
    if (!voiceExitSound) {
      return;
    }

    resetVoiceTransitionSound(voiceExitSound);

    const playPromise = voiceExitSound.play();
    if (playPromise && typeof playPromise.catch === "function") {
      void playPromise.catch(() => {});
    }
  }, [resetVoiceTransitionSound]);

  const handleCloseVoiceModeWithSound = useCallback(
    (clearCaptions = true) => {
      if (isVoiceModeActive) {
        playVoiceExitSound();
      }

      closeVoiceMode(clearCaptions);
    },
    [closeVoiceMode, isVoiceModeActive, playVoiceExitSound],
  );

  useEffect(() => {
    closeVoiceModeRef.current = handleCloseVoiceModeWithSound;
  }, [handleCloseVoiceModeWithSound]);

  useEffect(() => {
    if (!isVoiceModeActive) {
      bookingVoiceGuidanceKeyRef.current = null;
      return;
    }

    if (panelState !== "chat") {
      const voiceResetTimer = window.setTimeout(() => {
        handleCloseVoiceModeWithSound();
      }, 0);

      return () => {
        window.clearTimeout(voiceResetTimer);
      };
    }
  }, [handleCloseVoiceModeWithSound, isVoiceModeActive, panelState]);

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
    (
      assistantTurn: AiConciergeAssistantTurn,
      assistantMessageId: string,
      streamMode: AssistantStreamMode = "text",
    ) => {
      const thinkingDelay = getThinkingDelay(assistantTurn.body, streamMode);
      const streamingChunks = createStreamingChunks(assistantTurn.body, streamMode);
      let chunkIndex = 0;

      clearResponseTimers(thinkingTimerRef, streamingTimerRef);

      thinkingTimerRef.current = window.setTimeout(() => {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, body: "", status: "streaming", streamedChunks: [] }
              : message,
          ),
        );

        streamingTimerRef.current = window.setInterval(() => {
          chunkIndex += 1;
          const nextChunks = streamingChunks.slice(0, chunkIndex);
          const nextBody = nextChunks.join("");
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
                    streamedChunks: nextChunks,
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
            if (!isContactDetailsValid) {
              openRepresentativeIdentityGate({
                messageId: assistantMessageId,
                type: "representative-match",
              });
              return;
            }

            startRepresentativeMatchFlow(assistantMessageId);
            return;
          }

          if (assistantTurn.postCompleteEffect === "live-sales-handoff") {
            if (!isContactDetailsValid) {
              openRepresentativeIdentityGate({
                messageId: assistantMessageId,
                type: "live-sales-handoff",
              });
              return;
            }

            handleStartLiveSalesHandoff(assistantMessageId);
          }
        }, getStreamingInterval(assistantTurn.body, streamMode));
      }, thinkingDelay);
    },
    [
      handleStartLiveSalesHandoff,
      isContactDetailsValid,
      openRepresentativeIdentityGate,
      startRepresentativeMatchFlow,
    ],
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

      const assistantTurn = (customGetAssistantTurn ?? getAssistantTurn)({
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

      streamAssistantTurn(
        assistantTurn,
        assistantMessageId,
        isVoiceModeActive ? "voice" : "text",
      );
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
      isVoiceModeActive,
      customGetAssistantTurn,
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

  const restartConversationWithDetails = useCallback((
    nextContactDetails: ConciergeContactDetails,
  ) => {
    const openingTurn = (customOpeningTurn ?? createOpeningTurn)({
      contactDetails: nextContactDetails,
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
    setContactDetails(nextContactDetails);
    setActivePremiumPlanId(null);
    setIsAssistantResponding(true);
    resetPhoneCallFlow({
      phoneNumber: nextContactDetails.phoneNumber,
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
  }, [
    clearPhoneCallTimers,
    customOpeningTurn,
    prototypeScenario.openingPromptVariant,
    resetLiveSalesChatFlow,
    resetPhoneCallFlow,
    resetRepresentativeMatchFlow,
    resetVoiceFlow,
    streamAssistantTurn,
  ]);

  const restartConversation = () => {
    restartConversationWithDetails(contactDetails);
  };

  const persistConfirmedEntryDetails = useCallback(
    (nextContactDetails: ConciergeContactDetails) => {
      writeStoredAiConciergeEntrySession({
        contactDetails: nextContactDetails,
        identityKey: getAiConciergeEntryIdentityKey({
          isLinkedInConnected,
          linkedInIdentity: isLinkedInConnected
            ? signedInLinkedInIdentity
            : null,
        }),
      });
    },
    [isLinkedInConnected, signedInLinkedInIdentity],
  );

  const handleStartWithLinkedIn = () => {
    if (
      onPrototypeLinkedInAuthRequest &&
      onboardingFlowIntent === "entry" &&
      !isLinkedInConnected
    ) {
      onPrototypeLinkedInAuthRequest("sign-in");
      return;
    }

    const nextContactDetails = mergeMissingContactDetails(
      contactDetails,
      signedInContactDetails,
    );

    setIsLinkedInConnected(true);
    syncPrototypeScenario({
      authState: "linkedin-connected",
      entryVariant: prototypeScenario.entryVariant,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
    });
    setOnboardingFlowIntent("entry");
    setPendingIdentityAction(null);
    setContactDetails(nextContactDetails);
    setPanelState("prefill");
  };

  const handleContinueWithoutLinkedIn = () => {
    setOnboardingFlowIntent("entry");
    setPendingIdentityAction(null);
    setIsLinkedInConnected(false);
    setContactDetails({ ...EMPTY_CONTACT_DETAILS });
    syncPrototypeScenario({
      authState: "signed-out",
      entryVariant: prototypeScenario.entryVariant,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
    });
    setPanelState("manual");
  };

  const handleGetStarted = () => {
    setOnboardingFlowIntent("entry");
    setPendingIdentityAction(null);
    setPanelState(
      isLinkedInConnected || prototypeScenario.authState === "linkedin-connected"
        ? "prefill"
        : "manual",
    );
  };

  const handleBackFromDetails = () => {
    if (onboardingFlowIntent === "representative-gate") {
      setPendingIdentityAction(null);
      setOnboardingFlowIntent("entry");
      setPanelState("chat");
      return;
    }

    setPanelState("welcome");
  };

  const handleUseAnotherAccount = () => {
    if (
      onPrototypeLinkedInAuthRequest &&
      onboardingFlowIntent === "entry" &&
      panelState !== "chat"
    ) {
      onPrototypeLinkedInAuthRequest("switch-account");
      return;
    }

    setIsLinkedInConnected(false);
    setContactDetails({ ...EMPTY_CONTACT_DETAILS });
    syncPrototypeScenario({
      authState: "signed-out",
      entryVariant: prototypeScenario.entryVariant,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
    });
    if (onboardingFlowIntent === "entry") {
      setPanelState("welcome");
      return;
    }

    setPanelState("manual");
  };

  useEffect(() => {
    if (
      !shouldResumeConversationFromStoredEntry ||
      handledStoredEntryResumeRef.current ||
      storedEntrySession === null
    ) {
      return;
    }

    handledStoredEntryResumeRef.current = true;
    queueMicrotask(() => {
      restartConversationWithDetails(storedEntrySession.contactDetails);
      setPanelState("chat");
    });
  }, [
    restartConversationWithDetails,
    shouldResumeConversationFromStoredEntry,
    storedEntrySession,
  ]);

  useEffect(() => {
    if (
      authReturnNonce === undefined ||
      handledAuthReturnNonceRef.current === authReturnNonce
    ) {
      return;
    }

    handledAuthReturnNonceRef.current = authReturnNonce;
    queueMicrotask(() => {
      setIsLinkedInConnected(true);
      setOnboardingFlowIntent("entry");
      setPendingIdentityAction(null);
      setContactDetails(signedInContactDetails);
      setPanelState("prefill");
      onAuthReturnHandled?.();
    });
  }, [
    authReturnNonce,
    onAuthReturnHandled,
    signedInContactDetails,
  ]);

  const handleStartConversation = () => {
    if (pendingIdentityAction !== null) {
      if (!isContactDetailsValid) {
        return;
      }

      const nextAction = pendingIdentityAction;

      setPendingIdentityAction(null);
      setOnboardingFlowIntent("entry");
      setPanelState("chat");
      persistConfirmedEntryDetails(contactDetails);

      if (nextAction.type === "recommendation-card") {
        handleRecommendationPrimaryAction(nextAction.messageId);
        return;
      }

      if (nextAction.type === "representative-match") {
        startRepresentativeMatchFlow(nextAction.messageId);
        return;
      }

      handleStartLiveSalesHandoff(nextAction.messageId);
      return;
    }

    if (!isContactDetailsValid) {
      return;
    }

    setOnboardingFlowIntent("entry");
    persistConfirmedEntryDetails(contactDetails);
    restartConversation();
    setPanelState("chat");
  };

  const handleRecommendationPrimaryActionWithIdentityGate = useCallback(
    (messageId: string) => {
      if (!isContactDetailsValid) {
        openRepresentativeIdentityGate({
          messageId,
          type: "recommendation-card",
        });
        return;
      }

      handleRecommendationPrimaryAction(messageId);
    },
    [
      handleRecommendationPrimaryAction,
      isContactDetailsValid,
      openRepresentativeIdentityGate,
    ],
  );

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

  const handlePremiumPlanSelect = useCallback((planId: PremiumPlanId) => {
    dismissAvailablePhoneCallPrompt();
    setActivePremiumPlanId(planId);
  }, [dismissAvailablePhoneCallPrompt]);

  const handlePremiumPlanRedeem = useCallback((planId: PremiumPlanId) => {
    if (typeof window === "undefined") {
      return;
    }

    window.location.assign(getPremiumPlanCheckoutHref(planId));
  }, []);

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

  const clearVoiceEntryAnimationTimer = useCallback(() => {
    if (
      typeof window === "undefined" ||
      voiceEntryAnimationTimerRef.current === null
    ) {
      return;
    }

    window.clearTimeout(voiceEntryAnimationTimerRef.current);
    voiceEntryAnimationTimerRef.current = null;
  }, []);

  const clearVoiceEntryActivationTimer = useCallback(() => {
    if (
      typeof window === "undefined" ||
      voiceEntryActivationTimerRef.current === null
    ) {
      return;
    }

    window.clearTimeout(voiceEntryActivationTimerRef.current);
    voiceEntryActivationTimerRef.current = null;
  }, []);

  const clearVoiceComposerTransitionTimer = useCallback(() => {
    if (
      typeof window === "undefined" ||
      voiceComposerTransitionTimerRef.current === null
    ) {
      return;
    }

    window.clearTimeout(voiceComposerTransitionTimerRef.current);
    voiceComposerTransitionTimerRef.current = null;
  }, []);
  const triggerVoiceComposerTransition = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    clearVoiceComposerTransitionTimer();
    setIsVoiceComposerTransitioning(true);
    voiceComposerTransitionTimerRef.current = window.setTimeout(() => {
      setIsVoiceComposerTransitioning(false);
      voiceComposerTransitionTimerRef.current = null;
    }, VOICE_COMPOSER_MORPH_DURATION_MS);
  }, [clearVoiceComposerTransitionTimer]);

  const clearPendingVoiceEntryTransitions = useCallback(() => {
    clearVoiceComposerTransitionTimer();
    clearVoiceEntryAnimationTimer();
    clearVoiceEntryActivationTimer();
    stopVoiceTransitionSounds();
  }, [
    clearVoiceComposerTransitionTimer,
    clearVoiceEntryActivationTimer,
    clearVoiceEntryAnimationTimer,
    stopVoiceTransitionSounds,
  ]);

  const resetVoiceEntryTransitionState = useCallback(() => {
    clearPendingVoiceEntryTransitions();
    setIsVoiceComposerTransitioning(false);
    setIsVoiceEntryAnimating(false);
  }, [clearPendingVoiceEntryTransitions]);

  const triggerVoiceEntryAnimation = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    clearVoiceEntryAnimationTimer();
    setVoiceEntryAnimationKey((currentValue) => currentValue + 1);
    setIsVoiceEntryAnimating(true);
    voiceEntryAnimationTimerRef.current = window.setTimeout(() => {
      setIsVoiceEntryAnimating(false);
      voiceEntryAnimationTimerRef.current = null;
    }, VOICE_ENTRY_SWEEP_DURATION_MS);
  }, [clearVoiceEntryAnimationTimer]);

  const handleStartVoiceModeWithTransition = useCallback(() => {
    if (
      isVoiceComposerTransitioning ||
      isVoiceEntryAnimating ||
      isVoiceModeActive ||
      isAssistantResponding ||
      liveSalesChatStatus !== "idle" ||
      panelState !== "chat" ||
      shouldShowNextStepSurface
    ) {
      return;
    }

    if (typeof window === "undefined") {
      handleStartVoiceMode();
      return;
    }

    if (prefersReducedMotion) {
      handleStartVoiceMode();
      return;
    }

    triggerVoiceEntryAnimation();
    triggerVoiceComposerTransition();
    playVoiceEntrySound();

    clearVoiceEntryActivationTimer();
    voiceEntryActivationTimerRef.current = window.setTimeout(() => {
      voiceEntryActivationTimerRef.current = null;
      handleStartVoiceMode();
    }, VOICE_ENTRY_ACTIVATION_DELAY_MS);
  }, [
    clearVoiceEntryActivationTimer,
    handleStartVoiceMode,
    isAssistantResponding,
    isVoiceComposerTransitioning,
    isVoiceEntryAnimating,
    isVoiceModeActive,
    liveSalesChatStatus,
    panelState,
    playVoiceEntrySound,
    prefersReducedMotion,
    shouldShowNextStepSurface,
    triggerVoiceComposerTransition,
    triggerVoiceEntryAnimation,
  ]);

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

    handleCloseVoiceModeWithSound();
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
    conversationState,
    dismissRepresentativeReadyBanner,
    handleCloseVoiceModeWithSound,
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

  const handlePanelClose = useCallback(() => {
    resetVoiceEntryTransitionState();
    onClose();
  }, [onClose, resetVoiceEntryTransitionState]);

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
          handleCloseVoiceModeWithSound();
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

        handlePanelClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [
    closeMeetingCancelDialog,
    handleBackToChat,
    handleCloseVoiceModeWithSound,
    handlePanelClose,
    isAssistantResponding,
    isExpanded,
    handleClosePhoneCallDialog,
    isMeetingCancelDialogOpen,
    isMeetingCancelSubmitting,
    isPhoneCallDialogOpen,
    isPhoneCallSubmitting,
    isOpen,
    isVoiceModeActive,
    shouldShowNextStepSurface,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const voiceEntrySound = new window.Audio(VOICE_ENTRY_SOUND_SRC);
    voiceEntrySound.preload = "auto";
    voiceEntrySound.volume = VOICE_TRANSITION_SOUND_VOLUME;
    voiceEntrySoundRef.current = voiceEntrySound;
    const voiceExitSound = new window.Audio(VOICE_EXIT_SOUND_SRC);
    voiceExitSound.preload = "auto";
    voiceExitSound.volume = VOICE_TRANSITION_SOUND_VOLUME;
    voiceExitSoundRef.current = voiceExitSound;

    voiceEntrySound.load();
    voiceExitSound.load();

    return () => {
      voiceEntrySound.pause();
      voiceExitSound.pause();
      voiceEntrySound.src = "";
      voiceExitSound.src = "";
      voiceEntrySoundRef.current = null;
      voiceExitSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      clearPendingVoiceEntryTransitions();
    };
  }, [clearPendingVoiceEntryTransitions]);

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
              "relative flex h-full w-full flex-col overflow-hidden border transition-[border-radius,height,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none",
              isVoiceEntryAnimating ? "border-transparent" : "border-ai-border-faint",
              isVoiceEntryAnimating
                ? "shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_8px_24px_rgba(10,102,194,0.18)]"
                : "shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)]",
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
            {isVoiceEntryAnimating ? (
              <VoiceEntrySweepOverlay key={voiceEntryAnimationKey} />
            ) : null}
            <AiConciergeHeader
              isExpanded={isExpanded}
              liveAgentName={
                isLiveSalesChatActive ? DEFAULT_REPRESENTATIVE_NAME : null
              }
              onClose={handlePanelClose}
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
                      onPremiumPlanSelect={handlePremiumPlanSelect}
                      onRecommendationPrimaryAction={
                        handleRecommendationPrimaryActionWithIdentityGate
                      }
                      pendingRecommendationMessageId={
                        pendingRecommendationMessageId
                      }
                      onSelectSuggestedReply={handleSuggestedReply}
                      scrollToLatestSignal={threadScrollSignal}
                      voiceDraftText={voiceUserCaption}
                    />
                  </div>
                    {activePremiumPlanId ? (
                      <AiConciergePremiumPlanPanel
                        onBackToChat={handleBackToChat}
                        onRedeem={handlePremiumPlanRedeem}
                        planId={activePremiumPlanId}
                      />
                    ) : (
                      <AiConciergeNextStepPanel
                        bookingMode={
                          representativeMatchStatus === "booked"
                            ? "manage"
                            : "book"
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
                    )}
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
                      onPremiumPlanSelect={handlePremiumPlanSelect}
                      onRecommendationPrimaryAction={
                        handleRecommendationPrimaryActionWithIdentityGate
                      }
                      pendingRecommendationMessageId={
                        pendingRecommendationMessageId
                      }
                      onRepresentativeReadyCardVisibilityChange={
                        setRepresentativeReadyCardVisible
                      }
                      onSelectSuggestedReply={handleSuggestedReply}
                      scrollToLatestSignal={threadScrollSignal}
                      voiceDraftText={voiceUserCaption}
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
                {!disableVoiceMode &&
                isVoiceComposerTransitioning &&
                !shouldShowNextStepSurface ? (
                  <ComposerToVoiceTransitionShell
                    isPanelExpanded={isExpanded}
                  />
                ) : !disableVoiceMode && isVoiceModeActive ? (
                  <AiConciergeVoiceDock
                    errorMessage={voiceErrorMessage}
                    isPanelExpanded={isExpanded}
                    onClose={handleCloseVoiceModeWithSound}
                    onDoneListening={handleFinishVoiceTurn}
                    onRetry={handleRetryVoiceMode}
                    onStopSpeaking={handleStopAssistantPlayback}
                    status={voiceModeStatus}
                    userName={`${contactDetails.firstName} ${contactDetails.lastName}`.trim()}
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
                          ? "Connecting to your sales rep..."
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
                    onStartVoiceMode={handleStartVoiceModeWithTransition}
                    showDictationAction={!disableVoiceMode}
                    showVoiceModeAction={
                      !disableVoiceMode && !isLiveSalesChatActive
                    }
                  />
                ) : null}
              </div>
            ) : (
              <AiConciergeOnboarding
                copyVariant={onboardingCopyVariant}
                details={contactDetails}
                isPanelExpanded={isExpanded}
                isLinkedInConnected={isLinkedInConnected}
                isValid={isContactDetailsValid}
                linkedInIdentity={
                  isLinkedInConnected ? signedInLinkedInIdentity : null
                }
                mode={panelState}
                onBack={handleBackFromDetails}
                onChange={handleContactDetailChange}
                onContinueWithoutLinkedIn={handleContinueWithoutLinkedIn}
                onGetStarted={handleGetStarted}
                onContinueWithLinkedIn={handleStartWithLinkedIn}
                onStartConversation={handleStartConversation}
                onUseAnotherAccount={handleUseAnotherAccount}
                showLinkedInPromptInManualMode={
                  onboardingFlowIntent === "representative-gate"
                }
                showBackButton={shouldShowOnboardingBackButton}
                submitLabel={onboardingSubmitLabel}
                welcomeVariant="profile-aware"
              />
            )}
            {!disablePhoneCall ? (
              <AiConciergePhoneCallDialog
                isOpen={isPhoneCallDialogOpen}
                isSubmitting={isPhoneCallSubmitting}
                onClose={handleClosePhoneCallDialog}
                onConfirm={handleConfirmPhoneCall}
                onPhoneNumberChange={setPhoneCallNumberDraft}
                phoneNumber={phoneCallNumberDraft}
              />
            ) : null}
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

type AssistantStreamMode = "text" | "voice";

function getThinkingDelay(
  body: string,
  streamMode: AssistantStreamMode = "text",
) {
  const baseDelay =
    body.length > 220 ? 900 : body.length > 120 ? 700 : 500;

  return streamMode === "voice" ? baseDelay + 220 : baseDelay;
}

function getStreamingInterval(
  body: string,
  streamMode: AssistantStreamMode = "text",
) {
  if (streamMode === "voice") {
    return body.length > 180 ? 150 : 130;
  }

  return body.length > 180 ? 115 : 95;
}

function createStreamingChunks(
  body: string,
  streamMode: AssistantStreamMode = "text",
) {
  const tokens = body.match(/\S+\s*/g) ?? [body];
  const chunkSize =
    streamMode === "voice"
      ? tokens.length > 36
        ? 4
        : tokens.length > 20
          ? 3
          : 2
      : tokens.length > 30
        ? 4
        : tokens.length > 16
          ? 3
          : 2;
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
