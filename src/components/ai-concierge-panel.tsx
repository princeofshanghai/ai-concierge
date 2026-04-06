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
import { AiConciergeConfettiOverlay } from "@/components/ai-concierge-confetti-overlay";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import {
  AiConciergeVoiceDock,
  type VoiceModeStatus,
} from "@/components/ai-concierge-voice-dock";
import { AiConciergePhoneCallDialog } from "@/components/ai-concierge-phone-call-dialog";
import { AiConciergePhoneCallPrompt } from "@/components/ai-concierge-phone-call-prompt";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import {
  AiConciergeNextStepPanel,
  type BookingSelection,
} from "@/components/ai-concierge-next-step-panel";
import {
  AiConciergeRepresentativeReadyBanner,
  type RepresentativeMeetingDetails,
  type RepresentativeMatchStatus,
} from "@/components/ai-concierge-representative-booking";
import {
  AiConciergeOnboarding,
  type ConciergeContactDetails,
  type LinkedInIdentity,
} from "@/components/ai-concierge-onboarding";
import {
  createReturnToChatTurn,
  createOpeningTurn,
  getAssistantTurn,
  type AiConciergeConversationState,
} from "@/lib/ai-concierge-conversation";
import {
  PrototypeShellActionButton,
  PrototypeShellCard,
  PrototypeShellLabel,
} from "@/components/prototype-shell";

type AiConciergePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onClosed?: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
};

type PendingAssistantTurn = ReturnType<typeof createOpeningTurn> & {
  artifact?: AiConciergeMessage["artifact"];
  postCompleteEffect?: "live-sales-handoff" | "representative-match";
};
type PendingAssistantResponse = {
  assistantMessageId: string;
  stopState: AiConciergeConversationState | null;
};

type BrowserSpeechRecognitionAlternativeLike = {
  transcript: string;
};

type BrowserSpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: BrowserSpeechRecognitionAlternativeLike;
};

type BrowserSpeechRecognitionEventLike = Event & {
  results: ArrayLike<BrowserSpeechRecognitionResultLike>;
};

type BrowserSpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type BrowserSpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEventLike) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognitionLike;

type BrowserWindowWithSpeechRecognition = Window &
  typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

const PANEL_EXIT_DURATION_MS = 220;
const PHONE_CALL_PROMPT_REVEAL_DELAY_MS = 1_800;
const REPRESENTATIVE_MATCH_DELAY_MS = 2_500;
const REPRESENTATIVE_MATCH_READY_MS = 6_000;
const LIVE_SALES_REPRESENTATIVE_NAME = "David S.";

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
  role: "Director - HR/Talent",
};

const LINKEDIN_IDENTITY: LinkedInIdentity = {
  firstName: PREFILLED_CONTACT_DETAILS.firstName,
  lastName: PREFILLED_CONTACT_DETAILS.lastName,
  email: PREFILLED_CONTACT_DETAILS.email,
};

const REQUIRED_CONTACT_FIELDS: Array<keyof ConciergeContactDetails> = [
  "firstName",
  "lastName",
  "company",
  "email",
  "role",
];

export function AiConciergePanel({
  isOpen,
  onClose,
  onClosed,
  onExpandedChange,
}: AiConciergePanelProps) {
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [panelState, setPanelState] = useState<
    "chat" | "manual" | "prefill" | "welcome"
  >("welcome");
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] =
    useState<ConciergeContactDetails>(EMPTY_CONTACT_DETAILS);
  const [messages, setMessages] = useState<AiConciergeMessage[]>([]);
  const [conversationState, setConversationState] =
    useState<AiConciergeConversationState | null>(null);
  const [composerDraft, setComposerDraft] = useState("");
  const [focusComposerSignal, setFocusComposerSignal] = useState(0);
  const [dictateStatusMessage, setDictateStatusMessage] = useState<string | null>(
    null,
  );
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceModeStatus, setVoiceModeStatus] =
    useState<VoiceModeStatus>("requesting-permission");
  const [voiceUserCaption, setVoiceUserCaption] = useState("");
  const [voiceAssistantCaption, setVoiceAssistantCaption] = useState("");
  const [voiceErrorMessage, setVoiceErrorMessage] = useState<string | null>(
    null,
  );
  const [isVoicePlaybackMuted, setIsVoicePlaybackMuted] = useState(false);
  const [isPhoneCallDialogOpen, setIsPhoneCallDialogOpen] = useState(false);
  const [isPhoneCallSubmitting, setIsPhoneCallSubmitting] = useState(false);
  const [phoneCallNumberDraft, setPhoneCallNumberDraft] = useState("");
  const [isPhoneCallPromptVisible, setIsPhoneCallPromptVisible] = useState(false);
  const [phoneCallPromptState, setPhoneCallPromptState] = useState<
    "available" | "dismissed" | "requested"
  >("available");
  const [representativeMatchStatus, setRepresentativeMatchStatus] =
    useState<RepresentativeMatchStatus | null>(null);
  const [representativeMatchMessageId, setRepresentativeMatchMessageId] =
    useState<string | null>(null);
  const [isRepresentativeReadyBannerVisible, setIsRepresentativeReadyBannerVisible] =
    useState(false);
  const [isRepresentativeReadyCardVisible, setIsRepresentativeReadyCardVisible] =
    useState<boolean | null>(null);
  const [representativeBookedSelection, setRepresentativeBookedSelection] =
    useState<BookingSelection | null>(null);
  const [bookingCelebrationTrigger, setBookingCelebrationTrigger] = useState(0);
  const [isLiveAgentReplyPending, setIsLiveAgentReplyPending] = useState(false);
  const [liveSalesChatStatus, setLiveSalesChatStatus] = useState<
    "active" | "connecting" | "idle"
  >("idle");
  const [isMatchedBookingSurfaceVisible, setIsMatchedBookingSurfaceVisible] =
    useState(false);
  const nextAssistantMessageNumberRef = useRef(2);
  const thinkingTimerRef = useRef<number | null>(null);
  const streamingTimerRef = useRef<number | null>(null);
  const phoneCallRequestTimerRef = useRef<number | null>(null);
  const phoneCallPromptTimerRef = useRef<number | null>(null);
  const representativeMatchDelayTimerRef = useRef<number | null>(null);
  const representativeMatchReadyTimerRef = useRef<number | null>(null);
  const liveSalesJoinTimerRef = useRef<number | null>(null);
  const liveSalesReplyTimerRef = useRef<number | null>(null);
  const dictateRecognitionRef =
    useRef<BrowserSpeechRecognitionLike | null>(null);
  const pendingAssistantResponseRef =
    useRef<PendingAssistantResponse | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognitionLike | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasGrantedMicrophonePermissionRef = useRef(false);
  const isAssistantRespondingRef = useRef(false);
  const isVoiceModeActiveRef = useRef(false);
  const isVoicePlaybackMutedRef = useRef(false);
  const awaitedVoiceAssistantMessageIdRef = useRef<string | null>(null);
  const composerDraftRef = useRef("");
  const dictateBaseDraftRef = useRef("");
  const dictateTranscriptRef = useRef("");
  const voiceTranscriptRef = useRef("");
  const shouldShowNextStepSurface =
    panelState === "chat" && isMatchedBookingSurfaceVisible;
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
  const hasCompletedOpeningMessage =
    messages[0]?.id === "assistant-message-1" &&
    messages[0]?.status === "complete";
  const shouldShowPhoneCallHeaderAction =
    panelState === "chat" && liveSalesChatStatus === "idle";
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

  const stopVoiceRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    if (!recognition) {
      return;
    }

    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    recognition.onstart = null;

    try {
      recognition.stop();
    } catch {
      // The browser can throw if recognition is already stopped.
    }
  }, []);

  const releaseDictationRecognition = useCallback(() => {
    const recognition = dictateRecognitionRef.current;
    dictateRecognitionRef.current = null;

    if (!recognition) {
      return;
    }

    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    recognition.onstart = null;

    try {
      recognition.stop();
    } catch {
      // The browser can throw if recognition is already stopped.
    }
  }, []);

  const stopDictationRecognition = useCallback(() => {
    releaseDictationRecognition();
    setIsDictating(false);
  }, [releaseDictationRecognition]);

  const stopAssistantSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      speechUtteranceRef.current = null;
      return;
    }

    if (speechUtteranceRef.current) {
      speechUtteranceRef.current.onend = null;
      speechUtteranceRef.current.onerror = null;
      speechUtteranceRef.current = null;
    }

    window.speechSynthesis.cancel();
  }, []);

  const closeVoiceMode = useCallback(
    (clearCaptions = true) => {
      isVoiceModeActiveRef.current = false;
      awaitedVoiceAssistantMessageIdRef.current = null;
      voiceTranscriptRef.current = "";
      setIsVoiceModeActive(false);
      setVoiceModeStatus("requesting-permission");
      setVoiceErrorMessage(null);
      stopVoiceRecognition();
      stopAssistantSpeech();

      if (clearCaptions) {
        setVoiceUserCaption("");
        setVoiceAssistantCaption("");
      }
    },
    [stopAssistantSpeech, stopVoiceRecognition],
  );

  const clearRepresentativeMatchTimers = useCallback(() => {
    if (representativeMatchDelayTimerRef.current !== null) {
      window.clearTimeout(representativeMatchDelayTimerRef.current);
      representativeMatchDelayTimerRef.current = null;
    }

    if (representativeMatchReadyTimerRef.current !== null) {
      window.clearTimeout(representativeMatchReadyTimerRef.current);
      representativeMatchReadyTimerRef.current = null;
    }
  }, []);

  const clearLiveSalesTimers = useCallback(() => {
    if (liveSalesJoinTimerRef.current !== null) {
      window.clearTimeout(liveSalesJoinTimerRef.current);
      liveSalesJoinTimerRef.current = null;
    }

    if (liveSalesReplyTimerRef.current !== null) {
      window.clearTimeout(liveSalesReplyTimerRef.current);
      liveSalesReplyTimerRef.current = null;
    }
  }, []);

  const resetRepresentativeMatchFlow = useCallback(() => {
    clearRepresentativeMatchTimers();
    setRepresentativeMatchStatus(null);
    setRepresentativeMatchMessageId(null);
    setIsRepresentativeReadyBannerVisible(false);
    setIsRepresentativeReadyCardVisible(null);
    setRepresentativeBookedSelection(null);
    setIsMatchedBookingSurfaceVisible(false);
  }, [clearRepresentativeMatchTimers]);

  const resetLiveSalesChatFlow = useCallback(() => {
    clearLiveSalesTimers();
    setIsLiveAgentReplyPending(false);
    setLiveSalesChatStatus("idle");
  }, [clearLiveSalesTimers]);

  const updateRepresentativeMatchMessage = useCallback(
    (
      messageId: string,
      updates: {
        meetingDetails?: RepresentativeMeetingDetails;
        status: RepresentativeMatchStatus;
      },
    ) => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId &&
          message.artifact?.type === "representative-match"
            ? {
                ...message,
                artifact: {
                  ...message.artifact,
                  meetingDetails: updates.meetingDetails,
                  status: updates.status,
                },
              }
            : message,
        ),
      );
    },
    [],
  );

  const queueLiveSalesReply = useCallback(
    (userInput: string) => {
      clearLiveSalesTimers();
      setIsLiveAgentReplyPending(true);

      liveSalesReplyTimerRef.current = window.setTimeout(() => {
        liveSalesReplyTimerRef.current = null;
        setMessages((currentMessages) => [
          ...currentMessages,
          createLiveAgentMessage(
            createLiveSalesReplyBody({
              contactFirstName: contactDetails.firstName,
              input: userInput,
            }),
            currentMessages.length + 1,
          ),
        ]);
        setIsLiveAgentReplyPending(false);
      }, getLiveSalesReplyDelay(userInput));
    },
    [clearLiveSalesTimers, contactDetails.firstName],
  );

  const startLiveSalesHandoffFlow = useCallback((messageId: string) => {
    clearLiveSalesTimers();
    setLiveSalesChatStatus("connecting");
    setPhoneCallPromptState("dismissed");
    setIsPhoneCallPromptVisible(false);
    closeVoiceMode();

    liveSalesJoinTimerRef.current = window.setTimeout(() => {
      liveSalesJoinTimerRef.current = null;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, artifact: undefined }
            : message,
        ),
      );
      setMessages((currentMessages) => [
        ...currentMessages,
        createSystemMessage(
          `${LIVE_SALES_REPRESENTATIVE_NAME} joined the chat`,
          currentMessages.length + 1,
        ),
        createLiveAgentMessage(
          `Hey ${contactDetails.firstName}, give me one moment while I review your request.`,
          currentMessages.length + 2,
        ),
      ]);
      setLiveSalesChatStatus("active");
      setFocusComposerSignal((currentValue) => currentValue + 1);
    }, 2200);
  }, [clearLiveSalesTimers, closeVoiceMode, contactDetails.firstName]);

  const startRepresentativeMatchFlow = useCallback(
    (messageId: string) => {
      clearRepresentativeMatchTimers();
      resetLiveSalesChatFlow();
      setRepresentativeMatchMessageId(messageId);
      setRepresentativeMatchStatus("matching");
      setIsRepresentativeReadyBannerVisible(false);
      setIsRepresentativeReadyCardVisible(null);
      setRepresentativeBookedSelection(null);
      setIsMatchedBookingSurfaceVisible(false);

      // Shortened prototype timing keeps the matched flow reviewable without a real backend.
      representativeMatchDelayTimerRef.current = window.setTimeout(() => {
        setRepresentativeMatchStatus((currentStatus) =>
          currentStatus === "matching" ? "delayed" : currentStatus,
        );
        updateRepresentativeMatchMessage(messageId, { status: "delayed" });
        representativeMatchDelayTimerRef.current = null;
      }, REPRESENTATIVE_MATCH_DELAY_MS);

      representativeMatchReadyTimerRef.current = window.setTimeout(() => {
        setRepresentativeMatchStatus("ready");
        updateRepresentativeMatchMessage(messageId, { status: "ready" });
        setIsRepresentativeReadyBannerVisible(true);
        representativeMatchReadyTimerRef.current = null;
      }, REPRESENTATIVE_MATCH_READY_MS);
    },
    [
      clearRepresentativeMatchTimers,
      resetLiveSalesChatFlow,
      updateRepresentativeMatchMessage,
    ],
  );

  const openMatchedBookingSurface = useCallback(() => {
    setIsRepresentativeReadyBannerVisible(false);
    setIsMatchedBookingSurfaceVisible(true);
  }, []);

  const handleDismissRepresentativeReadyBanner = useCallback(() => {
    setIsRepresentativeReadyBannerVisible(false);
  }, []);

  const handleBackToChat = useCallback(() => {
    if (isMatchedBookingSurfaceVisible) {
      setIsMatchedBookingSurfaceVisible(false);
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
        assistantTurn.suggestedReplies,
        assistantTurn.suggestedReplyDisplay,
        assistantMessageNumber,
      ),
    ]);
  }, [contactDetails, conversationState, isMatchedBookingSurfaceVisible]);

  useEffect(() => {
    isAssistantRespondingRef.current = isAssistantResponding;
  }, [isAssistantResponding]);

  useEffect(() => {
    isVoicePlaybackMutedRef.current = isVoicePlaybackMuted;
  }, [isVoicePlaybackMuted]);

  useEffect(() => {
    composerDraftRef.current = composerDraft;
  }, [composerDraft]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    releaseDictationRecognition();
    stopVoiceRecognition();
    stopAssistantSpeech();

    if (phoneCallRequestTimerRef.current !== null) {
      window.clearTimeout(phoneCallRequestTimerRef.current);
      phoneCallRequestTimerRef.current = null;
    }
    if (phoneCallPromptTimerRef.current !== null) {
      window.clearTimeout(phoneCallPromptTimerRef.current);
      phoneCallPromptTimerRef.current = null;
    }
    clearRepresentativeMatchTimers();
    clearLiveSalesTimers();

    const voiceResetTimer = window.setTimeout(() => {
      setIsPhoneCallDialogOpen(false);
      setIsPhoneCallSubmitting(false);
      setIsPhoneCallPromptVisible(false);
      setRepresentativeMatchStatus(null);
      setRepresentativeMatchMessageId(null);
      setIsRepresentativeReadyBannerVisible(false);
      setIsRepresentativeReadyCardVisible(null);
      setRepresentativeBookedSelection(null);
      setIsLiveAgentReplyPending(false);
      setLiveSalesChatStatus("idle");
      setIsMatchedBookingSurfaceVisible(false);
      closeVoiceMode();
    }, 0);

    const exitTimer = window.setTimeout(() => {
      onClosed?.();
    }, PANEL_EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(voiceResetTimer);
      window.clearTimeout(exitTimer);
    };
  }, [
    clearLiveSalesTimers,
    clearRepresentativeMatchTimers,
    closeVoiceMode,
    isOpen,
    onClosed,
    stopAssistantSpeech,
    releaseDictationRecognition,
    stopVoiceRecognition,
  ]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        if (isPhoneCallDialogOpen) {
          if (!isPhoneCallSubmitting) {
            setIsPhoneCallDialogOpen(false);
          }
          return;
        }

        if (isVoiceModeActiveRef.current) {
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
    handleBackToChat,
    isAssistantResponding,
    isExpanded,
    isPhoneCallDialogOpen,
    isPhoneCallSubmitting,
    isOpen,
    onClose,
    shouldShowNextStepSurface,
  ]);

  useEffect(() => {
    return () => {
      clearResponseTimers(thinkingTimerRef, streamingTimerRef);
      if (phoneCallRequestTimerRef.current !== null) {
        window.clearTimeout(phoneCallRequestTimerRef.current);
        phoneCallRequestTimerRef.current = null;
      }
      clearRepresentativeMatchTimers();
      clearLiveSalesTimers();
      releaseDictationRecognition();
      stopVoiceRecognition();
      stopAssistantSpeech();
    };
  }, [
    clearLiveSalesTimers,
    clearRepresentativeMatchTimers,
    releaseDictationRecognition,
    stopAssistantSpeech,
    stopVoiceRecognition,
  ]);

  useEffect(() => {
    onExpandedChange?.(isPresentationExpanded);

    return () => {
      onExpandedChange?.(false);
    };
  }, [isPresentationExpanded, onExpandedChange]);

  useEffect(() => {
    if (!isVoiceModeActive) {
      return;
    }

    if (panelState !== "chat" || shouldShowNextStepSurface) {
      const voiceResetTimer = window.setTimeout(() => {
        closeVoiceMode();
      }, 0);

      return () => {
        window.clearTimeout(voiceResetTimer);
      };
    }
  }, [closeVoiceMode, isVoiceModeActive, panelState, shouldShowNextStepSurface]);

  useEffect(() => {
    if (phoneCallPromptTimerRef.current !== null) {
      window.clearTimeout(phoneCallPromptTimerRef.current);
      phoneCallPromptTimerRef.current = null;
    }

    const showImmediately = isOpen && phoneCallPromptState === "requested";
    const shouldDelayReveal =
      isOpen &&
      phoneCallPromptState === "available" &&
      panelState === "chat" &&
      !shouldShowNextStepSurface &&
      hasCompletedOpeningMessage;

    phoneCallPromptTimerRef.current = window.setTimeout(
      () => {
        setIsPhoneCallPromptVisible(showImmediately || shouldDelayReveal);
        phoneCallPromptTimerRef.current = null;
      },
      shouldDelayReveal ? PHONE_CALL_PROMPT_REVEAL_DELAY_MS : 0,
    );

    return () => {
      if (phoneCallPromptTimerRef.current !== null) {
        window.clearTimeout(phoneCallPromptTimerRef.current);
        phoneCallPromptTimerRef.current = null;
      }
    };
  }, [
    hasCompletedOpeningMessage,
    isOpen,
    panelState,
    phoneCallPromptState,
    shouldShowNextStepSurface,
  ]);

  const streamAssistantTurn = useCallback(
    (assistantTurn: PendingAssistantTurn, assistantMessageId: string) => {
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
            startLiveSalesHandoffFlow(assistantMessageId);
          }
        }, getStreamingInterval(assistantTurn.body));
      }, thinkingDelay);
    },
    [startLiveSalesHandoffFlow, startRepresentativeMatchFlow],
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
      setDictateStatusMessage(null);

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

      let assistantTurn = getAssistantTurn({
        contactDetails,
        input: trimmedBody,
        state: conversationState,
      });
      if (
        shouldUseRepresentativeBooking({
          input: trimmedBody,
          state: conversationState,
        })
      ) {
        assistantTurn = createRepresentativeMatchingTurn(conversationState);
      } else if (
        shouldUseLiveSalesHandoff({
          input: trimmedBody,
          state: conversationState,
        })
      ) {
        assistantTurn = createLiveSalesHandoffTurn(conversationState);
      }
      const assistantMessageNumber = nextAssistantMessageNumberRef.current;
      const assistantMessageId = createAssistantMessageId(assistantMessageNumber);

      nextAssistantMessageNumberRef.current += 2;
      setIsAssistantResponding(true);
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
      contactDetails,
      conversationState,
      isAssistantResponding,
      isLiveAgentReplyPending,
      isLiveSalesChatActive,
      isLiveSalesChatConnecting,
      queueLiveSalesReply,
      stopDictationRecognition,
      streamAssistantTurn,
    ],
  );

  const submitVoiceTranscript = useCallback(
    (body: string) => {
      const normalizedTranscript = normalizeVoiceTranscript(body);
      if (!normalizedTranscript) {
        setVoiceModeStatus("error");
        setVoiceErrorMessage(
          "I didn't catch that. Try again or switch back to keyboard.",
        );
        return;
      }

      voiceTranscriptRef.current = "";
      setVoiceUserCaption(normalizedTranscript);
      setVoiceAssistantCaption("");
      setVoiceErrorMessage(null);
      setVoiceModeStatus("thinking");

      const assistantMessageId = sendMessage(normalizedTranscript);
      if (!assistantMessageId) {
        setVoiceModeStatus("error");
        setVoiceErrorMessage(
          "I couldn't send that voice turn yet. Try again once the current reply finishes.",
        );
        return;
      }

      awaitedVoiceAssistantMessageIdRef.current = assistantMessageId;
    },
    [sendMessage],
  );

  const handleStopAssistantResponse = useCallback(() => {
    const pendingAssistantResponse = pendingAssistantResponseRef.current;
    if (!pendingAssistantResponse) {
      return;
    }

    clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    pendingAssistantResponseRef.current = null;

    if (
      awaitedVoiceAssistantMessageIdRef.current ===
      pendingAssistantResponse.assistantMessageId
    ) {
      awaitedVoiceAssistantMessageIdRef.current = null;
    }

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
  }, []);

  const startListening = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !isVoiceModeActiveRef.current ||
      panelState !== "chat" ||
      shouldShowNextStepSurface ||
      liveSalesChatStatus !== "idle" ||
      isAssistantRespondingRef.current
    ) {
      return;
    }

    const browserWindow = window as BrowserWindowWithSpeechRecognition;
    const SpeechRecognitionConstructor =
      getSpeechRecognitionConstructor(browserWindow);

    if (!SpeechRecognitionConstructor || !navigator.mediaDevices?.getUserMedia) {
      setVoiceModeStatus("unsupported");
      setVoiceErrorMessage(
        "Live voice conversation is not available in this browser.",
      );
      return;
    }

    stopAssistantSpeech();
    stopVoiceRecognition();
    setVoiceErrorMessage(null);
    setVoiceModeStatus(
      hasGrantedMicrophonePermissionRef.current
        ? "listening"
        : "requesting-permission",
    );

    try {
      if (!hasGrantedMicrophonePermissionRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        hasGrantedMicrophonePermissionRef.current = true;
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      setVoiceModeStatus("error");
      setVoiceErrorMessage(
        "Microphone access is blocked. Allow it in your browser settings and try again.",
      );
      return;
    }

    if (!isVoiceModeActiveRef.current) {
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setVoiceModeStatus("listening");
    };
    recognition.onresult = (event) => {
      let nextTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0]?.transcript ?? "";
      }

      const normalizedTranscript = normalizeVoiceTranscript(nextTranscript);
      voiceTranscriptRef.current = normalizedTranscript;

      if (normalizedTranscript) {
        setVoiceAssistantCaption("");
        setVoiceUserCaption(normalizedTranscript);
      }
    };
    recognition.onerror = (event) => {
      recognition.onend = null;
      recognitionRef.current = null;
      voiceTranscriptRef.current = "";

      if (!isVoiceModeActiveRef.current) {
        return;
      }

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setVoiceModeStatus("error");
        setVoiceErrorMessage(
          "Microphone access is blocked. Allow it in your browser settings and try again.",
        );
        return;
      }

      if (event.error === "language-not-supported") {
        setVoiceModeStatus("unsupported");
        setVoiceErrorMessage(
          "Voice conversation is not available for this browser language setup.",
        );
        return;
      }

      setVoiceModeStatus("error");
      setVoiceErrorMessage("Voice capture hit a browser issue. Try again.");
    };
    recognition.onend = () => {
      recognitionRef.current = null;

      if (!isVoiceModeActiveRef.current) {
        return;
      }

      const normalizedTranscript = normalizeVoiceTranscript(
        voiceTranscriptRef.current,
      );

      if (!normalizedTranscript) {
        setVoiceModeStatus("error");
        setVoiceErrorMessage(
          "I didn't catch that. Try again or switch back to keyboard.",
        );
        return;
      }

      submitVoiceTranscript(normalizedTranscript);
    };

    recognitionRef.current = recognition;
    voiceTranscriptRef.current = "";
    setVoiceUserCaption("");

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setVoiceModeStatus("error");
      setVoiceErrorMessage(
        "Voice capture could not start. Try again or switch back to keyboard.",
      );
    }
  }, [
    liveSalesChatStatus,
    panelState,
    shouldShowNextStepSurface,
    stopAssistantSpeech,
    stopVoiceRecognition,
    submitVoiceTranscript,
  ]);

  const handleToggleDictation = useCallback(async () => {
    if (
      panelState !== "chat" ||
      shouldShowNextStepSurface ||
      liveSalesChatStatus === "connecting" ||
      isAssistantRespondingRef.current ||
      isVoiceModeActiveRef.current
    ) {
      return;
    }

    if (dictateRecognitionRef.current) {
      stopDictationRecognition();
      setDictateStatusMessage(null);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const browserWindow = window as BrowserWindowWithSpeechRecognition;
    const SpeechRecognitionConstructor =
      getSpeechRecognitionConstructor(browserWindow);

    if (!SpeechRecognitionConstructor || !navigator.mediaDevices?.getUserMedia) {
      setDictateStatusMessage("Dictation is not available in this browser.");
      return;
    }

    dictateBaseDraftRef.current = composerDraftRef.current;
    dictateTranscriptRef.current = "";
    setDictateStatusMessage(null);

    try {
      if (!hasGrantedMicrophonePermissionRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        hasGrantedMicrophonePermissionRef.current = true;
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      setIsDictating(false);
      setDictateStatusMessage(
        "Microphone access is blocked. Use the keyboard instead.",
      );
      return;
    }

    if (
      isVoiceModeActiveRef.current ||
      isAssistantRespondingRef.current ||
      panelState !== "chat" ||
      shouldShowNextStepSurface
    ) {
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setIsDictating(true);
      setDictateStatusMessage(null);
    };
    recognition.onresult = (event) => {
      let nextTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0]?.transcript ?? "";
      }

      const normalizedTranscript = normalizeVoiceTranscript(nextTranscript);
      dictateTranscriptRef.current = normalizedTranscript;
      setComposerDraft(
        mergeDraftWithTranscript(
          dictateBaseDraftRef.current,
          normalizedTranscript,
        ),
      );
    };
    recognition.onerror = (event) => {
      recognition.onend = null;
      dictateRecognitionRef.current = null;
      dictateTranscriptRef.current = "";
      setIsDictating(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setDictateStatusMessage(
          "Microphone access is blocked. Use the keyboard instead.",
        );
        return;
      }

      if (event.error === "language-not-supported") {
        setDictateStatusMessage(
          "Dictation is not available for this browser language.",
        );
        return;
      }

      setDictateStatusMessage("Dictation hit a browser issue. Try again.");
    };
    recognition.onend = () => {
      dictateRecognitionRef.current = null;
      setIsDictating(false);

      if (!dictateTranscriptRef.current) {
        setComposerDraft(dictateBaseDraftRef.current);
        setDictateStatusMessage("I didn't catch that. Try dictating again.");
        return;
      }

      setComposerDraft(
        mergeDraftWithTranscript(
          dictateBaseDraftRef.current,
          dictateTranscriptRef.current,
        ),
      );
      dictateTranscriptRef.current = "";
      setDictateStatusMessage(null);
    };

    dictateRecognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      dictateRecognitionRef.current = null;
      setIsDictating(false);
      setDictateStatusMessage("Dictation could not start. Try again.");
    }
  }, [
    liveSalesChatStatus,
    panelState,
    shouldShowNextStepSurface,
    stopDictationRecognition,
  ]);

  useEffect(() => {
    if (!isVoiceModeActive || panelState !== "chat" || shouldShowNextStepSurface) {
      return;
    }

    const awaitedMessageId = awaitedVoiceAssistantMessageIdRef.current;
    if (!awaitedMessageId) {
      return;
    }

    const completedAssistantMessage = messages.find(
      (message) =>
        message.id === awaitedMessageId &&
        message.role === "assistant" &&
        message.status === "complete",
    );

    if (!completedAssistantMessage) {
      return;
    }

    awaitedVoiceAssistantMessageIdRef.current = null;
    setVoiceAssistantCaption(completedAssistantMessage.body);

    if (
      isVoicePlaybackMutedRef.current ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      setVoiceModeStatus("listening");
      window.setTimeout(() => {
        if (isVoiceModeActiveRef.current) {
          void startListening();
        }
      }, 120);
      return;
    }

    stopAssistantSpeech();

    const utterance = new SpeechSynthesisUtterance(
      completedAssistantMessage.body,
    );
    const preferredVoice = getPreferredSpeechVoice(
      window.speechSynthesis.getVoices(),
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      speechUtteranceRef.current = null;

      if (!isVoiceModeActiveRef.current) {
        return;
      }

      setVoiceModeStatus("listening");
      void startListening();
    };
    utterance.onerror = () => {
      speechUtteranceRef.current = null;

      if (!isVoiceModeActiveRef.current) {
        return;
      }

      setVoiceModeStatus("error");
      setVoiceErrorMessage(
        "I showed the reply in text, but audio playback was unavailable.",
      );
    };

    speechUtteranceRef.current = utterance;
    setVoiceModeStatus("speaking");
    window.speechSynthesis.speak(utterance);
  }, [
    isVoiceModeActive,
    messages,
    panelState,
    shouldShowNextStepSurface,
    startListening,
    stopAssistantSpeech,
  ]);

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
    setPanelState("prefill");
  };

  const handleGetStarted = () => {
    setPanelState(isLinkedInConnected ? "prefill" : "manual");
  };

  const handleBackFromDetails = () => {
    setPanelState("welcome");
  };

  const handleUseAnotherAccount = () => {
    setIsLinkedInConnected(false);
    setContactDetails(EMPTY_CONTACT_DETAILS);
    setPanelState("manual");
  };

  const restartConversation = () => {
    const openingTurn = createOpeningTurn({
      contactDetails,
    });
    const openingAssistantMessageNumber = 1;
    const openingAssistantMessageId = createAssistantMessageId(
      openingAssistantMessageNumber,
    );

    closeVoiceMode();
    stopDictationRecognition();
    clearResponseTimers(thinkingTimerRef, streamingTimerRef);
    if (phoneCallRequestTimerRef.current !== null) {
      window.clearTimeout(phoneCallRequestTimerRef.current);
      phoneCallRequestTimerRef.current = null;
    }
    if (phoneCallPromptTimerRef.current !== null) {
      window.clearTimeout(phoneCallPromptTimerRef.current);
      phoneCallPromptTimerRef.current = null;
    }
    resetRepresentativeMatchFlow();
    resetLiveSalesChatFlow();
    setComposerDraft("");
    setDictateStatusMessage(null);
    setIsAssistantResponding(true);
    setIsPhoneCallDialogOpen(false);
    setIsPhoneCallSubmitting(false);
    setIsPhoneCallPromptVisible(false);
    setPhoneCallNumberDraft(contactDetails.phoneNumber);
    setPhoneCallPromptState("available");
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

  const handleRestartConversation = () => {
    restartConversation();
    setPanelState("chat");
  };

  const dismissAvailablePhoneCallPrompt = () => {
    if (phoneCallPromptState !== "available") {
      return;
    }

    if (phoneCallPromptTimerRef.current !== null) {
      window.clearTimeout(phoneCallPromptTimerRef.current);
      phoneCallPromptTimerRef.current = null;
    }

    setPhoneCallPromptState("dismissed");
    setIsPhoneCallPromptVisible(false);
  };

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

  const handleComposerDraftChange = (draft: string) => {
    if (draft.trim().length > 0) {
      dismissAvailablePhoneCallPrompt();
    }

    setComposerDraft(draft);
  };

  const handleNextStepConfirmed = (selection: BookingSelection) => {
    const assistantMessageNumber = nextAssistantMessageNumberRef.current;
    const meetingDetails = createRepresentativeMeetingDetails(selection);
    const isUpdatingExistingMeeting = representativeMatchStatus === "booked";
    const confirmationBody = isUpdatingExistingMeeting
      ? `I updated your meeting with ${meetingDetails.representativeName} to ${meetingDetails.dateLabel} at ${meetingDetails.timeLabel}.`
      : `You're all set. I've booked ${meetingDetails.dateLabel} at ${meetingDetails.timeLabel} with ${meetingDetails.representativeName}.`;

    clearRepresentativeMatchTimers();
    if (representativeMatchStatus && representativeMatchMessageId) {
      setRepresentativeBookedSelection(selection);
      setRepresentativeMatchStatus("booked");
      updateRepresentativeMatchMessage(representativeMatchMessageId, {
        meetingDetails,
        status: "booked",
      });
      setIsRepresentativeReadyBannerVisible(false);
      setIsMatchedBookingSurfaceVisible(false);
      if (!isUpdatingExistingMeeting) {
        setBookingCelebrationTrigger((currentValue) => currentValue + 1);
      }
      return;
    }

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

  const handleToggleExpand = () => {
    setIsExpanded((currentValue) => !currentValue);
  };

  const handleOpenPhoneCallDialog = () => {
    if (!shouldShowPhoneCallHeaderAction) {
      return;
    }

    setPhoneCallNumberDraft(contactDetails.phoneNumber);
    setIsPhoneCallDialogOpen(true);
  };

  const handleClosePhoneCallDialog = () => {
    if (isPhoneCallSubmitting) {
      return;
    }

    setIsPhoneCallDialogOpen(false);
  };

  const handleConfirmPhoneCall = () => {
    const trimmedPhoneNumber = phoneCallNumberDraft.trim();

    if (!trimmedPhoneNumber) {
      return;
    }

    setIsPhoneCallSubmitting(true);

    if (phoneCallRequestTimerRef.current !== null) {
      window.clearTimeout(phoneCallRequestTimerRef.current);
    }

    phoneCallRequestTimerRef.current = window.setTimeout(() => {
      phoneCallRequestTimerRef.current = null;
      setContactDetails((currentDetails) => ({
        ...currentDetails,
        phoneNumber: trimmedPhoneNumber,
      }));
      setIsPhoneCallSubmitting(false);
      setIsPhoneCallDialogOpen(false);
      setPhoneCallPromptState("requested");
    }, 900);
  };

  const handleStartVoiceMode = () => {
    if (
      isAssistantResponding ||
      isLiveAgentReplyPending ||
      liveSalesChatStatus !== "idle" ||
      panelState !== "chat" ||
      shouldShowNextStepSurface
    ) {
      return;
    }

    stopDictationRecognition();
    setDictateStatusMessage(null);
    isVoiceModeActiveRef.current = true;
    setIsVoiceModeActive(true);
    setVoiceModeStatus("requesting-permission");
    setVoiceErrorMessage(null);
    setVoiceUserCaption("");
    setVoiceAssistantCaption("");
    voiceTranscriptRef.current = "";
    awaitedVoiceAssistantMessageIdRef.current = null;
    void startListening();
  };

  const handleRetryVoiceMode = () => {
    if (!isVoiceModeActiveRef.current) {
      return;
    }

    void startListening();
  };

  const handleToggleVoicePlayback = () => {
    setIsVoicePlaybackMuted((currentValue) => {
      const nextValue = !currentValue;
      isVoicePlaybackMutedRef.current = nextValue;

      if (
        nextValue &&
        speechUtteranceRef.current &&
        typeof window !== "undefined" &&
        isVoiceModeActiveRef.current
      ) {
        stopAssistantSpeech();
        setVoiceModeStatus("listening");
        void startListening();
      }

      return nextValue;
    });
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
                isLiveSalesChatActive ? LIVE_SALES_REPRESENTATIVE_NAME : null
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
                        messages={messages}
                        onBookMeeting={openMatchedBookingSurface}
                        onSelectSuggestedReply={handleSuggestedReply}
                        scrollToLatestSignal={bookingCelebrationTrigger}
                      />
                    </div>
                    <AiConciergeNextStepPanel
                      contactDetails={contactDetails}
                      initialSelection={representativeBookedSelection}
                      onBackToChat={handleBackToChat}
                      onConfirmBooking={handleNextStepConfirmed}
                    />
                  </div>
                  ) : (
                    <>
                      {shouldShowRepresentativeReadyBanner ? (
                        <AiConciergeRepresentativeReadyBanner
                          isPanelExpanded={isExpanded}
                          onBookMeeting={openMatchedBookingSurface}
                          onDismiss={handleDismissRepresentativeReadyBanner}
                        />
                      ) : null}
                      <AiConciergeBody
                        isPanelExpanded={isExpanded}
                        messages={messages}
                        onBookMeeting={openMatchedBookingSurface}
                        onRepresentativeReadyCardVisibilityChange={
                          setIsRepresentativeReadyCardVisible
                        }
                        onSelectSuggestedReply={handleSuggestedReply}
                        scrollToLatestSignal={bookingCelebrationTrigger}
                      />
                      {shouldShowPhoneCallPrompt ? (
                        <AiConciergePhoneCallPrompt
                          isPanelExpanded={isExpanded}
                          onDismiss={() => setPhoneCallPromptState("dismissed")}
                          onOpenDialog={handleOpenPhoneCallDialog}
                          phoneNumber={contactDetails.phoneNumber}
                          state={
                            phoneCallPromptState === "requested"
                              ? "requested"
                              : "available"
                          }
                        />
                      ) : null}
                      {isVoiceModeActive ? (
                        <AiConciergeVoiceDock
                          assistantCaption={voiceAssistantCaption}
                        errorMessage={voiceErrorMessage}
                        isMuted={isVoicePlaybackMuted}
                        isPanelExpanded={isExpanded}
                        onClose={closeVoiceMode}
                        onRetry={handleRetryVoiceMode}
                        onToggleMute={handleToggleVoicePlayback}
                        status={voiceModeStatus}
                        userCaption={voiceUserCaption}
                      />
                    ) : (
                      <AiConciergeComposer
                        key={composerKey}
                        disabled={
                          isAssistantResponding ||
                          isLiveAgentReplyPending ||
                          isLiveSalesChatConnecting
                        }
                        disabledPlaceholder={
                          isLiveAgentReplyPending
                            ? `${LIVE_SALES_REPRESENTATIVE_NAME} is replying...`
                            : isLiveSalesChatConnecting
                              ? "Connecting to sales..."
                              : "Responding..."
                        }
                        dictateStatusMessage={dictateStatusMessage}
                        draft={composerDraft}
                        focusComposerSignal={focusComposerSignal}
                        isDictating={isDictating}
                        isPanelExpanded={isExpanded}
                        isResponding={isAssistantResponding}
                        idlePlaceholder={
                          isLiveSalesChatActive
                            ? `Message ${LIVE_SALES_REPRESENTATIVE_NAME}`
                            : "Type your message"
                        }
                        onDraftChange={handleComposerDraftChange}
                        onSend={handleSendMessage}
                        onToggleDictation={handleToggleDictation}
                        onStopResponse={handleStopAssistantResponse}
                        onStartVoiceMode={handleStartVoiceMode}
                        showVoiceModeAction={!isLiveSalesChatActive}
                      />
                    )}
                  </>
                )}
              </div>
            ) : (
              <AiConciergeOnboarding
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

function shouldUseRepresentativeBooking({
  input,
  state,
}: {
  input: string;
  state: AiConciergeConversationState;
}) {
  if (state.stage !== "awaiting_handoff_choice") {
    return false;
  }

  return isBookMeetingIntent(input);
}

function shouldUseLiveSalesHandoff({
  input,
  state,
}: {
  input: string;
  state: AiConciergeConversationState;
}) {
  if (
    state.stage !== "awaiting_handoff_choice" ||
    state.likelySolution !== "lighter_touch"
  ) {
    return false;
  }

  return isLiveSalesChatIntent(input);
}

function isBookMeetingIntent(input: string) {
  const normalized = input.toLowerCase();

  return (
    normalized.includes("book meeting") ||
    normalized.includes("book a meeting") ||
    (normalized.includes("book") && normalized.includes("meeting")) ||
    normalized.includes("available times")
  );
}

function isLiveSalesChatIntent(input: string) {
  const normalized = input.toLowerCase();

  return (
    normalized.includes("chat live") ||
    normalized.includes("live now") ||
    normalized.includes("live chat")
  );
}

function createRepresentativeMatchingTurn(
  state: AiConciergeConversationState,
): PendingAssistantTurn {
  return {
    body: "I'm finding the right representative for your situation now. This usually takes about 1 to 2 minutes, and you can keep exploring while I do that.",
    nextState: {
      ...state,
      nextStepMode: null,
      readiness: "exploring",
      stage: "explore",
    },
    artifact: {
      type: "representative-match",
      status: "matching",
    },
    postCompleteEffect: "representative-match",
  };
}

function createLiveSalesHandoffTurn(
  state: AiConciergeConversationState,
): PendingAssistantTurn {
  return {
    body: "",
    artifact: {
      bodyText: "This usually takes less than a minute.",
      titleText: "Connecting you to a sales rep...",
      type: "representative-match",
      status: "matching",
    },
    nextState: {
      ...state,
      nextStepMode: null,
      readiness: "representative",
      stage: "explore",
    },
    postCompleteEffect: "live-sales-handoff",
  };
}

function createRepresentativeMeetingDetails(
  selection: BookingSelection,
): RepresentativeMeetingDetails {
  return {
    contactHelperText: formatRepresentativeMeetingContactHelperText(selection),
    dateLabel: formatRepresentativeMeetingDateLabel(selection.dateLabel),
    formatLabel: formatRepresentativeMeetingFormatLabel(selection.formatId),
    representativeName: "David S.",
    timeLabel: formatRepresentativeMeetingTimeLabel(selection.timeLabel),
  };
}

function formatRepresentativeMeetingDateLabel(dateLabel: string) {
  const [, dayAbbreviation, monthAbbreviation, dayNumber] =
    dateLabel.match(/^([A-Za-z]{3}), ([A-Za-z]{3}) (\d{1,2})$/) ?? [];

  if (!dayAbbreviation || !monthAbbreviation || !dayNumber) {
    return dateLabel;
  }

  const fullDayLabel =
    {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    }[dayAbbreviation] ?? dayAbbreviation;
  const fullMonthLabel =
    {
      Jan: "January",
      Feb: "February",
      Mar: "March",
      Apr: "April",
      May: "May",
      Jun: "June",
      Jul: "July",
      Aug: "August",
      Sep: "September",
      Oct: "October",
      Nov: "November",
      Dec: "December",
    }[monthAbbreviation] ?? monthAbbreviation;

  return `${fullDayLabel}, ${fullMonthLabel} ${dayNumber}`;
}

function formatRepresentativeMeetingTimeLabel(timeLabel: string) {
  const match = timeLabel.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);

  if (!match) {
    return `${timeLabel} PT`;
  }

  const [, rawHours, rawMinutes, meridiem] = match;
  let hours = Number(rawHours) % 12;
  const minutes = Number(rawMinutes);

  if (meridiem === "PM") {
    hours += 12;
  }

  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + 30;

  return `${timeLabel}-${formatRepresentativeMeetingEndTime(endMinutes)} PT`;
}

function formatRepresentativeMeetingEndTime(totalMinutes: number) {
  const normalizedMinutes = totalMinutes % (24 * 60);
  const hours24 = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

function formatRepresentativeMeetingFormatLabel(formatId: BookingSelection["formatId"]) {
  return (
    {
      phone: "Phone call",
      video: "Video call",
      whatsapp: "WhatsApp call",
    }[formatId] ?? "Video call"
  );
}

function formatRepresentativeMeetingContactHelperText(
  selection: BookingSelection,
) {
  const trimmedEmail = selection.contactEmail?.trim() ?? "";
  const trimmedPhoneNumber = selection.contactPhoneNumber?.trim() ?? "";

  if (selection.formatId === "video") {
    return trimmedEmail.length > 0
      ? `We'll send the meeting link to ${trimmedEmail}.`
      : "We'll send the meeting link shortly.";
  }

  if (selection.formatId === "whatsapp") {
    return trimmedPhoneNumber.length > 0
      ? `We'll call you on WhatsApp at ${trimmedPhoneNumber}.`
      : "We'll reach you on WhatsApp shortly.";
  }

  return trimmedPhoneNumber.length > 0
    ? `We'll call ${trimmedPhoneNumber}.`
    : "We'll call you shortly.";
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

function createSystemMessage(
  body: string,
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: `system-message-${messageNumber}`,
    role: "system",
    body,
  };
}

function createLiveAgentMessage(
  body: string,
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: `agent-message-${messageNumber}`,
    agentName: LIVE_SALES_REPRESENTATIVE_NAME,
    body,
    role: "agent",
    timestampLabel: getCurrentTimeLabel(),
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

function getLiveSalesReplyDelay(body: string) {
  if (body.length > 180) {
    return 1500;
  }

  if (body.length > 90) {
    return 1300;
  }

  return 1100;
}

function createLiveSalesReplyBody({
  contactFirstName,
  input,
}: {
  contactFirstName: string;
  input: string;
}) {
  const normalized = input.toLowerCase();
  const greetingName = contactFirstName.trim() || "there";

  if (
    normalized.includes("pricing") ||
    normalized.includes("cost") ||
    normalized.includes("budget")
  ) {
    return `Happy to help, ${greetingName}. I can walk you through how pricing usually works and what tends to change it for a team like yours. Is your main goal to understand pricing now, or compare which option makes the most sense first?`;
  }

  if (
    normalized.includes("demo") ||
    normalized.includes("show me") ||
    normalized.includes("walk through")
  ) {
    return `Absolutely. I can help you get a clearer walkthrough of what this would look like for your team. Before we do that, what are you most hoping to understand first?`;
  }

  if (
    normalized.includes("role") ||
    normalized.includes("hiring") ||
    normalized.includes("team")
  ) {
    return `Thanks, ${greetingName}. That context helps. I can help you figure out which option is most likely to fit your hiring needs and what the next step should be. What's most important for you to sort out first?`;
  }

  return `Thanks, ${greetingName}. I’ve got the context from the conversation so far. I can help you figure out the right next step and answer any sales questions from here. What would be most helpful to cover first?`;
}

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
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

function getSpeechRecognitionConstructor(
  browserWindow: BrowserWindowWithSpeechRecognition,
) {
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

function normalizeVoiceTranscript(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function mergeDraftWithTranscript(baseDraft: string, transcript: string) {
  if (!transcript) {
    return baseDraft;
  }

  if (!baseDraft.trim().length) {
    return transcript;
  }

  return /\s$/.test(baseDraft)
    ? `${baseDraft}${transcript}`
    : `${baseDraft} ${transcript}`;
}

function getPreferredSpeechVoice(voices: SpeechSynthesisVoice[]) {
  const preferredVoiceNames = [
    "Samantha",
    "Ava",
    "Google US English",
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Jenny Online (Natural) - English (United States)",
  ];

  for (const preferredVoiceName of preferredVoiceNames) {
    const matchedVoice = voices.find((voice) => voice.name === preferredVoiceName);
    if (matchedVoice) {
      return matchedVoice;
    }
  }

  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? null;
}
