"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AiConciergeBody } from "@/components/ai-concierge-body";
import { AiConciergeConfettiOverlay } from "@/components/ai-concierge-confetti-overlay";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeOpeningSupportView } from "@/components/ai-concierge-opening-support";
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
  clearResponseTimers,
  clearSuggestedReplies,
  createAssistantMessage,
  createAssistantMessageId,
  createStreamingChunks,
  createThinkingAssistantMessage,
  createUserMessage,
  getComposerInteractionKey,
  getComposerSuggestedReplies,
  getStreamingChunkDelay,
  getThinkingDelay,
  streamAssistantTurnPlayback,
} from "@/lib/ai-concierge-assistant-playback";
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
  isPrototypePlaybackMode,
  type PrototypePlaybackRoute,
  type PrototypeScenario,
} from "@/lib/prototype-scenario";
import { buildPlaybackTranscript } from "@/lib/ai-concierge-playback";
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
const VOICE_COMPOSER_MORPH_DURATION_MS = 820;
const VOICE_ENTRY_ACTIVATION_DELAY_MS = VOICE_COMPOSER_MORPH_DURATION_MS;
const VOICE_DOCK_CONTROLS_REVEAL_DELAY_MS = 240;
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
      // Route 2 card-tap variant. Like "recommendation-card" but routes to the
      // live-chat CTA handler (transforms card → "Connecting you now...", hands
      // off to live sales flow) after the identity gate clears.
      messageId: string;
      type: "recommendation-card-live-chat";
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
        <div className="relative h-14 w-full max-w-full overflow-hidden animate-[ai-concierge-composer-to-voice-shell_820ms_cubic-bezier(0.16,1,0.3,1)_both] will-change-[width]">
          <div className="absolute inset-0 rounded-full border border-ai-border-faint bg-ai-surface-base shadow-[0_0_0_1px_rgba(140,140,140,0.04),0_4px_12px_rgba(140,140,140,0.16)] animate-[ai-concierge-composer-to-voice-neutral-frame_820ms_ease-out_both]" />
          <div className="absolute inset-0 rounded-full border border-ai-blue-primary opacity-0 animate-[ai-concierge-composer-to-voice-gradient-frame_820ms_cubic-bezier(0.16,1,0.3,1)_both]" />
          <div className="absolute inset-0 flex items-center justify-between gap-4 px-3 animate-[ai-concierge-composer-to-voice-content_820ms_cubic-bezier(0.16,1,0.3,1)_both]">
            <span className="ai-type-body-md-open max-w-[220px] truncate pl-1 text-ai-text-disabled">
              Send a message
            </span>
            <span className="flex items-center gap-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-ai-text-secondary">
                <TransitionMicIcon />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ai-blue-primary text-ai-text-inverse">
                <span className="h-5 w-[13px]">
                  <TransitionVoiceWaveIcon className="h-full w-full" />
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransitionMicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.1213 9.12132C9.55871 9.68393 8.79565 10 8 10C7.20435 10 6.44129 9.68393 5.87868 9.12132C5.31607 8.55871 5 7.79565 5 7V4C5 3.20435 5.31607 2.44129 5.87868 1.87868C6.44129 1.31607 7.20435 1 8 1C8.79565 1 9.55871 1.31607 10.1213 1.87868C10.6839 2.44129 11 3.20435 11 4V7C11 7.79565 10.6839 8.55871 10.1213 9.12132Z"
        fill="currentColor"
      />
      <path
        d="M12 7V6H13V7C13.0002 8.15265 12.6022 9.26999 11.8733 10.1629C11.1444 11.0558 10.1294 11.6695 9 11.9V13H11V15H5V13H7V11.9C5.87064 11.6695 4.8556 11.0558 4.12669 10.1629C3.39778 9.26999 2.99977 8.15265 3 7V6H4V7C4 8.06087 4.42143 9.07828 5.17157 9.82843C5.92172 10.5786 6.93913 11 8 11C9.06087 11 10.0783 10.5786 10.8284 9.82843C11.5786 9.07828 12 8.06087 12 7Z"
        fill="currentColor"
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
      viewBox="0 0 12 18"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1.5 8V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.75 6.25V11.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 4.5V13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.25 6.25V11.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.5 8V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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
  const isPlaybackMode = isPrototypePlaybackMode(prototypeScenario);
  const [storedEntrySession] = useState(() =>
    !isPlaybackMode && authReturnNonce === undefined
      ? readStoredAiConciergeEntrySession()
      : null,
  );
  const initialIdentityKey = getAiConciergeEntryIdentityKey({
    isLinkedInConnected: prototypeScenario.authState === "linkedin-connected",
    linkedInIdentity:
      prototypeScenario.authState === "linkedin-connected"
        ? signedInLinkedInIdentity
        : null,
  });
  const shouldResumeConversationFromStoredEntry =
    !isPlaybackMode && storedEntrySession?.identityKey === initialIdentityKey;
  // Playback always uses Jamie's prefilled contact details so the scripted
  // transcript renders consistently, regardless of the sign-in scenario.
  const initialContactDetails = isPlaybackMode
    ? { ...signedInContactDetails }
    : shouldResumeConversationFromStoredEntry
      ? { ...storedEntrySession.contactDetails }
      : getContactDetailsForScenario(prototypeScenario, signedInContactDetails);
  const initialPlaybackMessages = useState(() => {
    if (!isPlaybackMode || prototypeScenario.playbackRoute === "live") {
      return null;
    }

    return buildPlaybackTranscript({
      contactDetails: { ...signedInContactDetails },
      route: prototypeScenario.playbackRoute as Exclude<
        PrototypePlaybackRoute,
        "live"
      >,
    });
  })[0];
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
    isPlaybackMode || shouldResumeConversationFromStoredEntry
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
    initialPlaybackMessages
      ? initialPlaybackMessages
      : shouldResumeConversationFromStoredEntry
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
  const [showVoiceDockControls, setShowVoiceDockControls] = useState(true);
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
  const voiceDockControlsTimerRef = useRef<number | null>(null);
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

        const revealNextChunk = () => {
          const chunkDelay = getStreamingChunkDelay(
            streamingChunks[chunkIndex] ?? "",
            chunkIndex,
            streamingChunks.length,
            "voice",
          );

          streamingTimerRef.current = window.setTimeout(() => {
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
              revealNextChunk();
              return;
            }

            clearResponseTimers(thinkingTimerRef, streamingTimerRef);
            pendingAssistantResponseRef.current = null;
            setConversationState(conversationState);
            setIsAssistantResponding(false);
          }, chunkDelay);
        };

        revealNextChunk();
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

  const interruptPendingAssistantResponse = useCallback(() => {
    const pendingAssistantResponse = pendingAssistantResponseRef.current;
    if (!pendingAssistantResponse) {
      return null;
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

    return pendingAssistantResponse.assistantMessageId;
  }, []);

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
    interruptAssistantReply: interruptPendingAssistantResponse,
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
    handleRecommendationLiveChatAction,
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
    startLiveSalesHandoffFlow,
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
  // Wrapper for the recommendation-card "Chat live now" tap so the phone-call
  // prompt dismissal matches what happens when the chat composer triggers a
  // live-sales handoff. Body component routes here based on CTA intent.
  const handleCardLiveChatAction = useCallback(
    (messageId: string) => {
      dismissPhoneCallPrompt();
      handleRecommendationLiveChatAction(messageId);
    },
    [dismissPhoneCallPrompt, handleRecommendationLiveChatAction],
  );
  const isLiveSalesChatActive = liveSalesChatStatus === "active";
  const isLiveSalesChatConnecting = liveSalesChatStatus === "connecting";
  const isDockedNextStepSurface = shouldShowNextStepSurface && !isExpanded;
  const isPresentationExpanded = isExpanded || shouldShowNextStepSurface;
  const canRestartConversation =
    !isPlaybackMode &&
    panelState === "chat" &&
    messages.length > 1 &&
    !shouldShowNextStepSurface;
  const composerSuggestedReplies = getComposerSuggestedReplies(
    messages,
    isAssistantResponding || isLiveAgentReplyPending,
  );
  const composerKey = getComposerInteractionKey(
    messages,
    isAssistantResponding || isLiveAgentReplyPending,
  );
  const shouldShowComposerExampleResponses =
    !isPlaybackMode &&
    panelState === "chat" &&
    !shouldShowNextStepSurface &&
    !isLiveSalesChatActive &&
    !isVoiceModeActive &&
    composerSuggestedReplies.length > 0 &&
    composerDraft.trim().length === 0;
  const shouldShowPhoneCallPromptEntryPoint =
    !isPlaybackMode &&
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
  const isDirectToChatOnboarding =
    prototypeScenario.onboardingStyle === "direct-to-chat";
  // In the direct-to-chat flow, the signed-out fallback is a single
  // "What should I call you?" field. The rep-gate always uses the full
  // form so we can collect the contact info an action needs.
  const isQuickNameEntry =
    isDirectToChatOnboarding &&
    onboardingFlowIntent === "entry" &&
    panelState === "manual" &&
    !isLinkedInConnected &&
    prototypeScenario.authState !== "linkedin-connected";
  const onboardingFieldSet: "full" | "first-name-only" = isQuickNameEntry
    ? "first-name-only"
    : "full";
  const isOnboardingValid = isQuickNameEntry
    ? contactDetails.firstName.trim().length > 0
    : isContactDetailsValid;
  const onboardingSubmitLabel =
    pendingIdentityAction !== null
      ? "Continue to rep"
      : isQuickNameEntry
        ? "Continue"
        : "Start chat";
  const shouldShowOnboardingBackButton = true;
  // Booking panel email/phone start empty in direct-to-chat so the user
  // fills them at the moment of booking (the booking panel already
  // exposes per-format email or phone fields with "Only used for this
  // meeting" helper text). Playback mode always uses prefilled details
  // so scripted transcripts render consistently.
  const bookingPanelContactDetails =
    isDirectToChatOnboarding && !isPlaybackMode
      ? EMPTY_CONTACT_DETAILS
      : contactDetails;

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
      // When a turn includes an acknowledge-only `priorBubble`, we stream it
      // into the thinking message that was already appended, then spawn a
      // second thinking message and stream the main body into that. The main
      // body is the one that carries chips/artifact/postCompleteEffect.
      const handleMainComplete = (finalMessageId: string) => {
        pendingAssistantResponseRef.current = null;
        setConversationState(assistantTurn.nextState);
        setIsAssistantResponding(false);
        if (assistantTurn.postCompleteEffect === "representative-match") {
          if (!isContactDetailsValid) {
            openRepresentativeIdentityGate({
              messageId: finalMessageId,
              type: "representative-match",
            });
            return;
          }

          startRepresentativeMatchFlow(finalMessageId);
          return;
        }

        if (assistantTurn.postCompleteEffect === "live-sales-handoff") {
          if (!isContactDetailsValid) {
            openRepresentativeIdentityGate({
              messageId: finalMessageId,
              type: "live-sales-handoff",
            });
            return;
          }

          handleStartLiveSalesHandoff(finalMessageId);
        }
      };

      if (assistantTurn.priorBubble) {
        const priorBubbleTurn: AiConciergeAssistantTurn = {
          body: assistantTurn.priorBubble,
          nextState: assistantTurn.nextState,
        };

        streamAssistantTurnPlayback({
          assistantTurn: priorBubbleTurn,
          assistantMessageId,
          onComplete: () => {
            const secondaryMessageNumber =
              nextAssistantMessageNumberRef.current;
            const secondaryMessageId = createAssistantMessageId(
              secondaryMessageNumber,
            );
            nextAssistantMessageNumberRef.current += 2;

            setMessages((currentMessages) => [
              ...currentMessages,
              createThinkingAssistantMessage(secondaryMessageNumber),
            ]);

            const mainTurn: AiConciergeAssistantTurn = {
              ...assistantTurn,
              priorBubble: undefined,
            };

            streamAssistantTurnPlayback({
              assistantTurn: mainTurn,
              assistantMessageId: secondaryMessageId,
              onComplete: () => handleMainComplete(secondaryMessageId),
              setMessages,
              streamMode,
              streamingTimerRef,
              thinkingTimerRef,
            });
          },
          setMessages,
          streamMode,
          streamingTimerRef,
          thinkingTimerRef,
        });
        return;
      }

      streamAssistantTurnPlayback({
        assistantTurn,
        assistantMessageId,
        onComplete: () => handleMainComplete(assistantMessageId),
        setMessages,
        streamMode,
        streamingTimerRef,
        thinkingTimerRef,
      });
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
    (
      body: string,
      options?: {
        includeAssistantBody?: boolean;
      },
    ) => {
      const trimmedBody = body.trim();
      if (
        !trimmedBody ||
        isAssistantResponding ||
        isLiveAgentReplyPending ||
        isLiveSalesChatConnecting
      ) {
        return {
          assistantBody: null,
          assistantMessageId: null,
        };
      }

      stopDictationRecognition();
      clearDictateStatusMessage();

      if (isLiveSalesChatActive) {
        setMessages((currentMessages) => [
          ...clearSuggestedReplies(currentMessages),
          createUserMessage(trimmedBody, currentMessages.length + 1),
        ]);
        queueLiveSalesReply(trimmedBody);
        return {
          assistantBody: null,
          assistantMessageId: `agent-message-${Date.now()}`,
        };
      }

      if (!conversationState) {
        return {
          assistantBody: null,
          assistantMessageId: null,
        };
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
      return {
        assistantBody: options?.includeAssistantBody ? assistantTurn.body : null,
        assistantMessageId,
      };
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
    registerVoiceMessageSender((body) =>
      sendMessage(body, {
        includeAssistantBody: true,
      }),
    );
  }, [registerVoiceMessageSender, sendMessage]);

  const handleStopAssistantResponse = useCallback(() => {
    const interruptedAssistantMessageId = interruptPendingAssistantResponse();

    if (interruptedAssistantMessageId) {
      clearAwaitedVoiceAssistantMessage(interruptedAssistantMessageId);
    }
  }, [clearAwaitedVoiceAssistantMessage, interruptPendingAssistantResponse]);

  const handleSendMessage = (body: string) => {
    if (!sendMessage(body).assistantMessageId) {
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
      onboardingStyle: prototypeScenario.onboardingStyle,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
      playbackRoute: prototypeScenario.playbackRoute,
    });
    setOnboardingFlowIntent("entry");
    setPendingIdentityAction(null);
    setContactDetails(nextContactDetails);
    if (isDirectToChatOnboarding && onboardingFlowIntent === "entry") {
      persistConfirmedEntryDetails(nextContactDetails);
      restartConversationWithDetails(nextContactDetails);
      setPanelState("chat");
      return;
    }
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
      onboardingStyle: prototypeScenario.onboardingStyle,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
      playbackRoute: prototypeScenario.playbackRoute,
    });
    setPanelState("manual");
  };

  const handleGetStarted = () => {
    setOnboardingFlowIntent("entry");
    setPendingIdentityAction(null);
    const isConnected =
      isLinkedInConnected ||
      prototypeScenario.authState === "linkedin-connected";
    if (isDirectToChatOnboarding && isConnected) {
      persistConfirmedEntryDetails(contactDetails);
      restartConversationWithDetails(contactDetails);
      setPanelState("chat");
      return;
    }
    setPanelState(isConnected ? "prefill" : "manual");
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
      onboardingStyle: prototypeScenario.onboardingStyle,
      openingPromptVariant: prototypeScenario.openingPromptVariant,
      playbackRoute: prototypeScenario.playbackRoute,
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
      if (isDirectToChatOnboarding) {
        persistConfirmedEntryDetails(signedInContactDetails);
        restartConversationWithDetails(signedInContactDetails);
        setPanelState("chat");
      } else {
        setPanelState("prefill");
      }
      onAuthReturnHandled?.();
    });
  }, [
    authReturnNonce,
    isDirectToChatOnboarding,
    onAuthReturnHandled,
    persistConfirmedEntryDetails,
    restartConversationWithDetails,
    signedInContactDetails,
  ]);

  const openRecommendationLink = useCallback(
    (messageId: string) => {
      const recommendationArtifact = messages.find((message) => {
        return (
          message.id === messageId && message.artifact?.type === "recommendation"
        );
      })?.artifact;

      if (
        !recommendationArtifact ||
        recommendationArtifact.type !== "recommendation" ||
        !recommendationArtifact.ctaHref
      ) {
        return false;
      }

      window.open(recommendationArtifact.ctaHref, "_blank", "noopener,noreferrer");
      return true;
    },
    [messages],
  );

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
        if (openRecommendationLink(nextAction.messageId)) {
          return;
        }

        handleRecommendationPrimaryAction(nextAction.messageId);
        return;
      }

      if (nextAction.type === "recommendation-card-live-chat") {
        handleCardLiveChatAction(nextAction.messageId);
        return;
      }

      if (nextAction.type === "representative-match") {
        startRepresentativeMatchFlow(nextAction.messageId);
        return;
      }

      handleStartLiveSalesHandoff(nextAction.messageId);
      return;
    }

    if (!isOnboardingValid) {
      return;
    }

    setOnboardingFlowIntent("entry");
    persistConfirmedEntryDetails(contactDetails);
    restartConversation();
    setPanelState("chat");
  };

  const handleRecommendationPrimaryActionWithIdentityGate = useCallback(
    (messageId: string) => {
      if (openRecommendationLink(messageId)) {
        return;
      }

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
      openRecommendationLink,
      openRepresentativeIdentityGate,
    ],
  );

  // Gated wrapper for the card's "Chat live now" CTA (Routes 2). Same identity
  // gate logic as the booking variant — if contact details aren't captured yet,
  // bounce into the identity form first and resume after it clears.
  const handleRecommendationLiveChatActionWithIdentityGate = useCallback(
    (messageId: string) => {
      if (!isContactDetailsValid) {
        openRepresentativeIdentityGate({
          messageId,
          type: "recommendation-card-live-chat",
        });
        return;
      }

      handleCardLiveChatAction(messageId);
    },
    [
      handleCardLiveChatAction,
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

  const clearVoiceDockControlsTimer = useCallback(() => {
    if (
      typeof window === "undefined" ||
      voiceDockControlsTimerRef.current === null
    ) {
      return;
    }

    window.clearTimeout(voiceDockControlsTimerRef.current);
    voiceDockControlsTimerRef.current = null;
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
    clearVoiceDockControlsTimer();
    clearVoiceComposerTransitionTimer();
    clearVoiceEntryAnimationTimer();
    clearVoiceEntryActivationTimer();
    stopVoiceTransitionSounds();
  }, [
    clearVoiceDockControlsTimer,
    clearVoiceComposerTransitionTimer,
    clearVoiceEntryActivationTimer,
    clearVoiceEntryAnimationTimer,
    stopVoiceTransitionSounds,
  ]);

  const resetVoiceEntryTransitionState = useCallback(() => {
    clearPendingVoiceEntryTransitions();
    setIsVoiceComposerTransitioning(false);
    setIsVoiceEntryAnimating(false);
    setShowVoiceDockControls(true);
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
      setShowVoiceDockControls(true);
      handleStartVoiceMode();
      return;
    }

    setShowVoiceDockControls(false);
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

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      prefersReducedMotion ||
      !isVoiceModeActive ||
      isVoiceComposerTransitioning ||
      showVoiceDockControls
    ) {
      return;
    }

    const revealDelayMs =
      voiceModeStatus === "speaking" ? 0 : VOICE_DOCK_CONTROLS_REVEAL_DELAY_MS;

    clearVoiceDockControlsTimer();
    voiceDockControlsTimerRef.current = window.setTimeout(() => {
      setShowVoiceDockControls(true);
      voiceDockControlsTimerRef.current = null;
    }, revealDelayMs);

    return () => {
      clearVoiceDockControlsTimer();
    };
  }, [
    clearVoiceDockControlsTimer,
    isVoiceComposerTransitioning,
    isVoiceModeActive,
    prefersReducedMotion,
    showVoiceDockControls,
    voiceModeStatus,
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
                      onRecommendationLiveChatAction={
                        handleRecommendationLiveChatActionWithIdentityGate
                      }
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
                        contactDetails={bookingPanelContactDetails}
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
                      onRecommendationLiveChatAction={
                        handleRecommendationLiveChatActionWithIdentityGate
                      }
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
                {!isPlaybackMode &&
                !shouldShowNextStepSurface &&
                shouldShowPhoneCallPrompt ? (
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
                {!isPlaybackMode && shouldShowMicrophoneNotice ? (
                  <AiConciergeMicrophoneNotice
                    isPanelExpanded={isExpanded}
                    message={systemNoticeMessage ?? ""}
                    onDismiss={clearMicrophoneBlockedNotice}
                  />
                ) : null}
                {isPlaybackMode ? null : !disableVoiceMode &&
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
                    showControls={showVoiceDockControls}
                    status={voiceModeStatus}
                    userName={`${contactDetails.firstName} ${contactDetails.lastName}`.trim()}
                  />
                ) : !shouldShowNextStepSurface &&
                  !isVoiceComposerTransitioning ? (
                  <>
                    {(() => {
                      // Pills dock above the composer as a slim strip during the
                      // opening state only. Matches the ChatGPT / Meta AI pattern
                      // where starter prompts live next to the composer rather
                      // than buried inside an assistant bubble. Hidden once Jamie
                      // sends her first message, in playback mode (scripted —
                      // can't be tapped), and in voice mode (the voice dock
                      // owns that surface).
                      const hasCommittedUserTurn = messages.some(
                        (message) => message.role === "user",
                      );
                      if (hasCommittedUserTurn || isPlaybackMode) {
                        return null;
                      }
                      const openingMessage = messages.find(
                        (message) =>
                          message.role === "assistant" &&
                          message.openingSupport?.type === "topic-picker",
                      );
                      if (!openingMessage?.openingSupport) {
                        return null;
                      }
                      return (
                        <div className="px-5 pb-3">
                          <div
                            className={[
                              "mx-auto w-full",
                              isExpanded ? "max-w-[720px]" : "max-w-full",
                            ].join(" ")}
                          >
                            <AiConciergeOpeningSupportView
                              layout="docked"
                              onInsertPrompt={handleOpeningPromptInsert}
                              support={openingMessage.openingSupport}
                            />
                          </div>
                        </div>
                      );
                    })()}
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
                          ? "Connecting to your hiring specialist..."
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
                        : "Send a message"
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
                  </>
                ) : null}
              </div>
            ) : (
              <AiConciergeOnboarding
                copyVariant={onboardingCopyVariant}
                details={contactDetails}
                fieldSet={onboardingFieldSet}
                isPanelExpanded={isExpanded}
                isLinkedInConnected={isLinkedInConnected}
                isValid={isOnboardingValid}
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

type AssistantStreamMode = "text" | "voice";
