"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { AiConciergeMessage } from "@/lib/ai-concierge-types";

type VoiceModeStatus =
  | "requesting-permission"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "unsupported";

type LiveSalesChatStatus = "active" | "connecting" | "idle";
type PanelState = "chat" | "manual" | "prefill" | "welcome";
type AwaitedVoiceAssistantMessageKind = "guidance" | "intro" | "reply";

type VoiceMessageSendResult = {
  assistantBody: string | null;
  assistantMessageId: string | null;
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

type StartListeningOptions = {
  seedTranscript?: string;
  skipStopAssistantSpeech?: boolean;
};

type UseVoiceFlowParams = {
  appendVoiceAssistantMessage: (body: string) => string | null;
  composerDraft: string;
  ensureVoiceIntroMessage: (body: string) => string | null;
  getShouldShowNextStepSurface: () => boolean;
  interruptAssistantReply: () => string | null;
  isAssistantResponding: boolean;
  liveSalesChatStatus: LiveSalesChatStatus;
  messages: AiConciergeMessage[];
  panelState: PanelState;
  setComposerDraft: Dispatch<SetStateAction<string>>;
  voiceIntroMessage: string;
};

export function useVoiceFlow({
  appendVoiceAssistantMessage,
  composerDraft,
  ensureVoiceIntroMessage,
  getShouldShowNextStepSurface,
  interruptAssistantReply,
  isAssistantResponding,
  liveSalesChatStatus,
  messages,
  panelState,
  setComposerDraft,
  voiceIntroMessage,
}: UseVoiceFlowParams) {
  const [dictateStatusMessage, setDictateStatusMessage] = useState<string | null>(
    null,
  );
  const [activeVoiceAssistantMessageId, setActiveVoiceAssistantMessageId] =
    useState<string | null>(null);
  const [isMicrophoneBlocked, setIsMicrophoneBlocked] = useState(false);
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

  const dictateRecognitionRef =
    useRef<BrowserSpeechRecognitionLike | null>(null);
  const bargeInRecognitionRef =
    useRef<BrowserSpeechRecognitionLike | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognitionLike | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const preferredSpeechVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const speechPlaybackRequestRef = useRef(0);
  const hasGrantedMicrophonePermissionRef = useRef(false);
  const activeAssistantCaptionRef = useRef("");
  const isAssistantRespondingRef = useRef(false);
  const isVoiceModeActiveRef = useRef(false);
  const isVoicePlaybackMutedRef = useRef(false);
  const awaitedVoiceAssistantMessageIdRef = useRef<string | null>(null);
  const awaitedVoiceAssistantBodyRef = useRef<string | null>(null);
  const awaitedVoiceAssistantMessageKindRef =
    useRef<AwaitedVoiceAssistantMessageKind | null>(null);
  const hasPlayedVoiceIntroRef = useRef(false);
  const composerDraftRef = useRef("");
  const dictateBaseDraftRef = useRef("");
  const dictateTranscriptRef = useRef("");
  const voiceTranscriptRef = useRef("");
  const voiceTransitionTimerRef = useRef<number | null>(null);
  const startListeningRef =
    useRef<(options?: StartListeningOptions) => Promise<void>>(() =>
      Promise.resolve(),
    );
  const shouldShowNextStepSurfaceRef = useRef(getShouldShowNextStepSurface);
  const voiceMessageSenderRef =
    useRef<((body: string) => VoiceMessageSendResult) | null>(null);

  const clearDictateStatusMessage = useCallback(() => {
    setDictateStatusMessage(null);
  }, []);

  const clearMicrophoneBlockedNotice = useCallback(() => {
    setIsMicrophoneBlocked(false);
    setDictateStatusMessage(null);
    setVoiceErrorMessage(null);
  }, []);

  const clearVoiceTransitionTimer = useCallback(() => {
    if (typeof window === "undefined" || voiceTransitionTimerRef.current === null) {
      return;
    }

    window.clearTimeout(voiceTransitionTimerRef.current);
    voiceTransitionTimerRef.current = null;
  }, []);

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

  const stopBargeInRecognition = useCallback(() => {
    const recognition = bargeInRecognitionRef.current;
    bargeInRecognitionRef.current = null;

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
    speechPlaybackRequestRef.current += 1;
    setActiveVoiceAssistantMessageId(null);
    activeAssistantCaptionRef.current = "";
    stopBargeInRecognition();

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
  }, [stopBargeInRecognition]);

  const resolvePreferredSpeechVoice = useCallback(async () => {
    if (preferredSpeechVoiceRef.current) {
      return preferredSpeechVoiceRef.current;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return null;
    }

    const speechSynthesis = window.speechSynthesis;
    speechSynthesis.getVoices();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const preferredVoice = getPreferredSpeechVoice(speechSynthesis.getVoices());

      if (preferredVoice) {
        preferredSpeechVoiceRef.current = preferredVoice;
        return preferredVoice;
      }

      await waitForMilliseconds(50);
    }

    return null;
  }, []);

  const closeVoiceMode = useCallback(
    (clearCaptions = true) => {
      const retainedTranscript = normalizeVoiceTranscript(voiceTranscriptRef.current);
      isVoiceModeActiveRef.current = false;
      awaitedVoiceAssistantMessageIdRef.current = null;
      awaitedVoiceAssistantBodyRef.current = null;
      awaitedVoiceAssistantMessageKindRef.current = null;
      voiceTranscriptRef.current = "";
      clearVoiceTransitionTimer();
      setIsVoiceModeActive(false);
      setVoiceModeStatus("requesting-permission");
      setVoiceErrorMessage(null);
      stopVoiceRecognition();
      stopAssistantSpeech();

      if (clearCaptions) {
        if (retainedTranscript) {
          const nextComposerDraft = mergeDraftWithTranscript(
            composerDraftRef.current,
            retainedTranscript,
          );

          composerDraftRef.current = nextComposerDraft;
          setComposerDraft(nextComposerDraft);
        }

        setVoiceUserCaption("");
        setVoiceAssistantCaption("");
      }
    },
    [
      clearVoiceTransitionTimer,
      setComposerDraft,
      stopAssistantSpeech,
      stopVoiceRecognition,
    ],
  );

  const handleBlockedMicrophoneInVoiceMode = useCallback(() => {
    setIsMicrophoneBlocked(true);
    closeVoiceMode();
  }, [closeVoiceMode]);

  const showVoiceSystemNotice = useCallback(
    (message: string) => {
      closeVoiceMode();
      setVoiceErrorMessage(message);
    },
    [closeVoiceMode],
  );

  const clearVoiceFlowSideEffects = useCallback(() => {
    clearVoiceTransitionTimer();
    releaseDictationRecognition();
    stopBargeInRecognition();
    stopVoiceRecognition();
    stopAssistantSpeech();
  }, [
    clearVoiceTransitionTimer,
    releaseDictationRecognition,
    stopBargeInRecognition,
    stopAssistantSpeech,
    stopVoiceRecognition,
  ]);

  const resetVoiceFlowState = useCallback(() => {
    awaitedVoiceAssistantMessageIdRef.current = null;
    awaitedVoiceAssistantBodyRef.current = null;
    awaitedVoiceAssistantMessageKindRef.current = null;
    dictateBaseDraftRef.current = "";
    dictateTranscriptRef.current = "";
    voiceTranscriptRef.current = "";
    composerDraftRef.current = "";
    voiceMessageSenderRef.current = null;
    isVoiceModeActiveRef.current = false;
    setActiveVoiceAssistantMessageId(null);
    setIsMicrophoneBlocked(false);
    setDictateStatusMessage(null);
    setIsDictating(false);
    setIsVoiceModeActive(false);
    setVoiceModeStatus("requesting-permission");
    setVoiceUserCaption("");
    setVoiceAssistantCaption("");
    setVoiceErrorMessage(null);
  }, []);

  const resetVoiceFlow = useCallback(() => {
    hasPlayedVoiceIntroRef.current = false;
    clearVoiceFlowSideEffects();
    resetVoiceFlowState();
  }, [clearVoiceFlowSideEffects, resetVoiceFlowState]);

  const registerVoiceMessageSender = useCallback(
    (sendMessage: (body: string) => VoiceMessageSendResult) => {
      voiceMessageSenderRef.current = sendMessage;
    },
    [],
  );

  const scheduleVoiceListening = useCallback(
    (delayMs = 120) => {
      clearVoiceTransitionTimer();

      if (typeof window === "undefined") {
        return;
      }

      const queueListeningAttempt = (nextDelayMs: number) => {
        voiceTransitionTimerRef.current = window.setTimeout(() => {
          voiceTransitionTimerRef.current = null;

          if (!isVoiceModeActiveRef.current) {
            return;
          }

          if (isAssistantRespondingRef.current) {
            queueListeningAttempt(90);
            return;
          }

          void startListeningRef.current();
        }, nextDelayMs);
      };

      queueListeningAttempt(delayMs);
    },
    [clearVoiceTransitionTimer],
  );

  const startBargeInMonitoring = useCallback(
    (caption: string) => {
      if (
        typeof window === "undefined" ||
        !isVoiceModeActiveRef.current ||
        !hasGrantedMicrophonePermissionRef.current
      ) {
        return;
      }

      const browserWindow = window as BrowserWindowWithSpeechRecognition;
      const SpeechRecognitionConstructor =
        getSpeechRecognitionConstructor(browserWindow);

      if (!SpeechRecognitionConstructor) {
        return;
      }

      stopBargeInRecognition();
      activeAssistantCaptionRef.current = normalizeVoiceComparisonText(caption);

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let nextTranscript = "";

        for (let index = 0; index < event.results.length; index += 1) {
          nextTranscript += event.results[index][0]?.transcript ?? "";
        }

        const normalizedTranscript = normalizeVoiceTranscript(nextTranscript);

        if (
          !shouldTriggerVoiceBargeIn({
            assistantCaption: activeAssistantCaptionRef.current,
            transcript: normalizedTranscript,
          })
        ) {
          return;
        }

        hasPlayedVoiceIntroRef.current = true;
        clearVoiceTransitionTimer();
        awaitedVoiceAssistantMessageIdRef.current = null;
        awaitedVoiceAssistantBodyRef.current = null;
        awaitedVoiceAssistantMessageKindRef.current = null;
        isAssistantRespondingRef.current = false;
        stopAssistantSpeech();
        interruptAssistantReply();
        setVoiceAssistantCaption("");
        setVoiceErrorMessage(null);
        void startListeningRef.current({
          seedTranscript: normalizedTranscript,
          skipStopAssistantSpeech: true,
        });
      };
      recognition.onerror = (event) => {
        recognition.onend = null;

        if (bargeInRecognitionRef.current === recognition) {
          bargeInRecognitionRef.current = null;
        }

        if (
          event.error === "aborted" ||
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          return;
        }
      };
      recognition.onend = () => {
        if (bargeInRecognitionRef.current === recognition) {
          bargeInRecognitionRef.current = null;
        }
      };

      bargeInRecognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        if (bargeInRecognitionRef.current === recognition) {
          bargeInRecognitionRef.current = null;
        }
      }
    },
    [
      clearVoiceTransitionTimer,
      interruptAssistantReply,
      stopAssistantSpeech,
      stopBargeInRecognition,
    ],
  );

  const playAssistantCaption = useCallback(
    (
      caption: string,
      {
        assistantMessageId = null,
        fallbackDelayMs = 120,
        onComplete,
        onError,
      }: {
        fallbackDelayMs?: number;
        onComplete?: () => void;
        onError?: () => void;
        assistantMessageId?: string | null;
      } = {},
    ) => {
      setVoiceAssistantCaption(caption);
      setVoiceModeStatus("speaking");

      if (
        isVoicePlaybackMutedRef.current ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        setActiveVoiceAssistantMessageId(assistantMessageId);
        clearVoiceTransitionTimer();

        if (fallbackDelayMs <= 0) {
          onComplete?.();
          return;
        }

        voiceTransitionTimerRef.current = window.setTimeout(() => {
          voiceTransitionTimerRef.current = null;

          if (isVoiceModeActiveRef.current) {
            onComplete?.();
          }
        }, fallbackDelayMs);
        return;
      }

      stopAssistantSpeech();
      setActiveVoiceAssistantMessageId(assistantMessageId);

      const speechSynthesis = window.speechSynthesis;
      const speechPlaybackRequestId = speechPlaybackRequestRef.current;

      void (async () => {
        const utterance = new SpeechSynthesisUtterance(caption);
        const preferredVoice = await resolvePreferredSpeechVoice();

        if (
          speechPlaybackRequestId !== speechPlaybackRequestRef.current ||
          !isVoiceModeActiveRef.current ||
          isVoicePlaybackMutedRef.current
        ) {
          return;
        }

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        activeAssistantCaptionRef.current = normalizeVoiceComparisonText(caption);
        startBargeInMonitoring(caption);
        utterance.rate = 1.03;
        utterance.pitch = 1;
        utterance.onend = () => {
          speechUtteranceRef.current = null;
          setActiveVoiceAssistantMessageId(null);
          activeAssistantCaptionRef.current = "";
          stopBargeInRecognition();

          if (isVoiceModeActiveRef.current) {
            onComplete?.();
          }
        };
        utterance.onerror = () => {
          speechUtteranceRef.current = null;
          setActiveVoiceAssistantMessageId(null);
          activeAssistantCaptionRef.current = "";
          stopBargeInRecognition();

          if (isVoiceModeActiveRef.current) {
            onError?.();
          }
        };

        speechUtteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      })();
    },
    [
      clearVoiceTransitionTimer,
      resolvePreferredSpeechVoice,
      startBargeInMonitoring,
      stopAssistantSpeech,
      stopBargeInRecognition,
    ],
  );

  const submitVoiceTranscript = useCallback((body: string) => {
    const normalizedTranscript = normalizeVoiceTranscript(body);
    if (!normalizedTranscript) {
      const fallbackMessage =
        "I didn't catch that. Try again or switch back to keyboard.";
      const assistantMessageId = appendVoiceAssistantMessage(fallbackMessage);

      voiceTranscriptRef.current = "";
      setVoiceUserCaption("");
      setVoiceAssistantCaption("");
      setVoiceErrorMessage(null);
      setVoiceModeStatus("thinking");

      if (!assistantMessageId) {
        setVoiceModeStatus("error");
        setVoiceErrorMessage(fallbackMessage);
        return;
      }

      awaitedVoiceAssistantMessageIdRef.current = assistantMessageId;
      awaitedVoiceAssistantBodyRef.current = fallbackMessage;
      awaitedVoiceAssistantMessageKindRef.current = "guidance";
      return;
    }

    voiceTranscriptRef.current = "";
    setVoiceUserCaption(normalizedTranscript);
    setVoiceAssistantCaption("");
    setVoiceErrorMessage(null);
    setVoiceModeStatus("thinking");

    const voiceReply =
      voiceMessageSenderRef.current?.(normalizedTranscript) ?? {
        assistantBody: null,
        assistantMessageId: null,
      };
    const assistantMessageId = voiceReply.assistantMessageId;

    if (!assistantMessageId) {
      setVoiceModeStatus("error");
      setVoiceErrorMessage(
        "I couldn't send that voice turn yet. Try again once the current reply finishes.",
      );
      return;
    }

    setVoiceUserCaption("");
    awaitedVoiceAssistantMessageIdRef.current = assistantMessageId;
    awaitedVoiceAssistantBodyRef.current = voiceReply.assistantBody;
    awaitedVoiceAssistantMessageKindRef.current = "reply";
  }, [appendVoiceAssistantMessage]);

  const playVoiceGuidanceMessage = useCallback((body: string) => {
    const normalizedBody = normalizeVoiceTranscript(body);

    if (
      !normalizedBody ||
      !isVoiceModeActiveRef.current ||
      panelState !== "chat"
    ) {
      return null;
    }

    awaitedVoiceAssistantMessageIdRef.current = null;
    awaitedVoiceAssistantMessageKindRef.current = null;
    voiceTranscriptRef.current = "";
    setVoiceUserCaption("");
    setVoiceAssistantCaption("");
    setVoiceErrorMessage(null);
    setVoiceModeStatus("thinking");
    stopVoiceRecognition();

    const assistantMessageId = appendVoiceAssistantMessage(normalizedBody);

    if (!assistantMessageId) {
      return null;
    }

    awaitedVoiceAssistantMessageIdRef.current = assistantMessageId;
    awaitedVoiceAssistantBodyRef.current = normalizedBody;
    awaitedVoiceAssistantMessageKindRef.current = "guidance";

    return assistantMessageId;
  }, [
    appendVoiceAssistantMessage,
    panelState,
    stopVoiceRecognition,
  ]);

  const startListening = useCallback(async (options: StartListeningOptions = {}) => {
    const {
      seedTranscript = "",
      skipStopAssistantSpeech = false,
    } = options;
    if (
      typeof window === "undefined" ||
      !isVoiceModeActiveRef.current ||
      panelState !== "chat" ||
      liveSalesChatStatus !== "idle" ||
      isAssistantRespondingRef.current
    ) {
      return;
    }

    const normalizedSeedTranscript = normalizeVoiceTranscript(seedTranscript);
    const browserWindow = window as BrowserWindowWithSpeechRecognition;
    const SpeechRecognitionConstructor =
      getSpeechRecognitionConstructor(browserWindow);

    if (!SpeechRecognitionConstructor || !navigator.mediaDevices?.getUserMedia) {
      showVoiceSystemNotice(
        "Live voice conversation is not available in this browser.",
      );
      return;
    }

    if (!skipStopAssistantSpeech) {
      stopAssistantSpeech();
    }
    stopBargeInRecognition();
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
      if (!isVoiceModeActiveRef.current) {
        return;
      }

      handleBlockedMicrophoneInVoiceMode();
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
      const combinedTranscript = normalizedSeedTranscript
        ? normalizedTranscript
          ? mergeDraftWithTranscript(
              normalizedSeedTranscript,
              normalizedTranscript,
            )
          : normalizedSeedTranscript
        : normalizedTranscript;
      voiceTranscriptRef.current = combinedTranscript;

      if (combinedTranscript) {
        setVoiceAssistantCaption("");
        setVoiceUserCaption(combinedTranscript);
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
        handleBlockedMicrophoneInVoiceMode();
        return;
      }

      if (event.error === "language-not-supported") {
        showVoiceSystemNotice(
          "Voice conversation is not available for this browser language setup.",
        );
        return;
      }

      showVoiceSystemNotice("Voice capture hit a browser issue. Try again.");
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
        submitVoiceTranscript("");
        return;
      }

      submitVoiceTranscript(normalizedTranscript);
    };

    recognitionRef.current = recognition;
    voiceTranscriptRef.current = normalizedSeedTranscript;
    setVoiceUserCaption(normalizedSeedTranscript);

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      showVoiceSystemNotice(
        "Voice capture could not start. Try again or switch back to keyboard.",
      );
    }
  }, [
    liveSalesChatStatus,
    panelState,
    handleBlockedMicrophoneInVoiceMode,
    showVoiceSystemNotice,
    submitVoiceTranscript,
    stopBargeInRecognition,
    stopAssistantSpeech,
    stopVoiceRecognition,
  ]);

  const handleToggleDictation = useCallback(async () => {
    if (
      panelState !== "chat" ||
      shouldShowNextStepSurfaceRef.current() ||
      liveSalesChatStatus === "connecting" ||
      isAssistantRespondingRef.current ||
      isVoiceModeActiveRef.current
    ) {
      return;
    }

    if (dictateRecognitionRef.current) {
      stopDictationRecognition();
      clearDictateStatusMessage();
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
    clearDictateStatusMessage();
    clearMicrophoneBlockedNotice();

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
      setIsMicrophoneBlocked(true);
      return;
    }

    if (
      isVoiceModeActiveRef.current ||
      isAssistantRespondingRef.current ||
      panelState !== "chat" ||
      shouldShowNextStepSurfaceRef.current()
    ) {
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setIsDictating(true);
      clearDictateStatusMessage();
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

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setIsMicrophoneBlocked(true);
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
      clearDictateStatusMessage();
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
    clearMicrophoneBlockedNotice,
    clearDictateStatusMessage,
    liveSalesChatStatus,
    panelState,
    setComposerDraft,
    stopDictationRecognition,
  ]);

  const handleStartVoiceMode = useCallback(() => {
    if (
      isAssistantResponding ||
      liveSalesChatStatus !== "idle" ||
      panelState !== "chat" ||
      shouldShowNextStepSurfaceRef.current()
    ) {
      return;
    }

    stopDictationRecognition();
    clearDictateStatusMessage();
    clearMicrophoneBlockedNotice();
    isVoiceModeActiveRef.current = true;
    setIsVoiceModeActive(true);
    setVoiceErrorMessage(null);
    setVoiceUserCaption("");
    setVoiceAssistantCaption("");
    voiceTranscriptRef.current = "";
    awaitedVoiceAssistantMessageIdRef.current = null;
    awaitedVoiceAssistantBodyRef.current = null;
    awaitedVoiceAssistantMessageKindRef.current = null;

    if (!hasPlayedVoiceIntroRef.current) {
      const introMessageId = ensureVoiceIntroMessage(voiceIntroMessage);
      if (!introMessageId) {
        hasPlayedVoiceIntroRef.current = true;
        void startListening();
        return;
      }

      setVoiceModeStatus("thinking");
      awaitedVoiceAssistantMessageIdRef.current = introMessageId;
      awaitedVoiceAssistantBodyRef.current = voiceIntroMessage.trim();
      awaitedVoiceAssistantMessageKindRef.current = "intro";
      return;
    }

    void startListening();
  }, [
    clearMicrophoneBlockedNotice,
    clearDictateStatusMessage,
    isAssistantResponding,
    ensureVoiceIntroMessage,
    liveSalesChatStatus,
    panelState,
    startListening,
    stopDictationRecognition,
    voiceIntroMessage,
  ]);

  const handleRetryVoiceMode = useCallback(() => {
    if (!isVoiceModeActiveRef.current) {
      return;
    }

    void startListening();
  }, [startListening]);

  const handleFinishVoiceTurn = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    try {
      recognition.stop();
    } catch {
      // The browser can throw if recognition is already stopping.
    }
  }, []);

  const handleStopAssistantPlayback = useCallback(() => {
    if (!isVoiceModeActiveRef.current) {
      return;
    }

    hasPlayedVoiceIntroRef.current = true;
    awaitedVoiceAssistantMessageIdRef.current = null;
    awaitedVoiceAssistantBodyRef.current = null;
    awaitedVoiceAssistantMessageKindRef.current = null;
    isAssistantRespondingRef.current = false;
    clearVoiceTransitionTimer();
    stopAssistantSpeech();
    interruptAssistantReply();
    setVoiceErrorMessage(null);
    setVoiceModeStatus("listening");
    scheduleVoiceListening(0);
  }, [
    clearVoiceTransitionTimer,
    interruptAssistantReply,
    scheduleVoiceListening,
    stopAssistantSpeech,
  ]);

  const handleToggleVoicePlayback = useCallback(() => {
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
  }, [startListening, stopAssistantSpeech]);

  const clearAwaitedVoiceAssistantMessage = useCallback(
    (assistantMessageId: string) => {
      if (awaitedVoiceAssistantMessageIdRef.current === assistantMessageId) {
        awaitedVoiceAssistantMessageIdRef.current = null;
        awaitedVoiceAssistantBodyRef.current = null;
        awaitedVoiceAssistantMessageKindRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    shouldShowNextStepSurfaceRef.current = getShouldShowNextStepSurface;
  }, [getShouldShowNextStepSurface]);

  useEffect(() => {
    isAssistantRespondingRef.current = isAssistantResponding;
  }, [isAssistantResponding]);

  useEffect(() => {
    isVoicePlaybackMutedRef.current = isVoicePlaybackMuted;
  }, [isVoicePlaybackMuted]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  useEffect(() => {
    composerDraftRef.current = composerDraft;
  }, [composerDraft]);

  useEffect(() => {
    void resolvePreferredSpeechVoice();
  }, [resolvePreferredSpeechVoice]);

  useEffect(() => {
    if (!isVoiceModeActive || panelState !== "chat") {
      return;
    }

    const awaitedMessageId = awaitedVoiceAssistantMessageIdRef.current;
    if (!awaitedMessageId) {
      return;
    }

    const visibleAssistantMessage = messages.find(
      (message) =>
        message.id === awaitedMessageId &&
        message.role === "assistant" &&
        message.status !== "thinking" &&
        message.body.trim().length > 0,
    );

    if (!visibleAssistantMessage) {
      return;
    }

    const awaitedMessageKind = awaitedVoiceAssistantMessageKindRef.current;
    const awaitedAssistantBody = awaitedVoiceAssistantBodyRef.current?.trim();
    const assistantCaption =
      awaitedAssistantBody ||
      (visibleAssistantMessage.status === "complete"
        ? visibleAssistantMessage.body.trim()
        : "");

    if (!assistantCaption) {
      return;
    }

    awaitedVoiceAssistantMessageIdRef.current = null;
    awaitedVoiceAssistantBodyRef.current = null;
    awaitedVoiceAssistantMessageKindRef.current = null;
    const playbackFrameId = window.requestAnimationFrame(() => {
      playAssistantCaption(assistantCaption, {
        assistantMessageId: visibleAssistantMessage.id,
        onComplete: () => {
          if (awaitedMessageKind === "intro") {
            hasPlayedVoiceIntroRef.current = true;
          }

          scheduleVoiceListening();
        },
        onError: () => {
          if (awaitedMessageKind === "reply") {
            showVoiceSystemNotice(
              "I showed the reply in text, but audio playback was unavailable.",
            );
            return;
          }

          if (awaitedMessageKind === "intro") {
            hasPlayedVoiceIntroRef.current = true;
          }

          scheduleVoiceListening();
        },
      });
    });

    return () => {
      window.cancelAnimationFrame(playbackFrameId);
    };
  }, [
    isVoiceModeActive,
    messages,
    panelState,
    playAssistantCaption,
    scheduleVoiceListening,
    showVoiceSystemNotice,
  ]);

  return {
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
    voiceAssistantCaption,
    voiceErrorMessage,
    voiceModeStatus,
    voiceUserCaption,
  };
}

function getSpeechRecognitionConstructor(
  browserWindow: BrowserWindowWithSpeechRecognition,
) {
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

function normalizeVoiceTranscript(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeVoiceComparisonText(value: string) {
  return normalizeVoiceTranscript(value).toLowerCase();
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

function shouldTriggerVoiceBargeIn({
  assistantCaption,
  transcript,
}: {
  assistantCaption: string;
  transcript: string;
}) {
  const normalizedTranscript = normalizeVoiceComparisonText(transcript);

  if (!normalizedTranscript) {
    return false;
  }

  if (isExplicitBargeInPhrase(normalizedTranscript)) {
    return true;
  }

  const transcriptWords = normalizedTranscript
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (transcriptWords.length < 2 && normalizedTranscript.length < 8) {
    return false;
  }

  if (isLikelyAssistantEcho(normalizedTranscript, assistantCaption)) {
    return false;
  }

  return true;
}

function isExplicitBargeInPhrase(transcript: string) {
  return /^(stop|wait|hold on|hang on|sorry|actually|one sec|one second)\b/.test(
    transcript,
  );
}

function isLikelyAssistantEcho(transcript: string, assistantCaption: string) {
  if (!assistantCaption) {
    return false;
  }

  if (
    assistantCaption.startsWith(transcript) ||
    assistantCaption.includes(transcript)
  ) {
    return true;
  }

  const transcriptWords = transcript
    .split(/\s+/)
    .filter((word) => word.length > 2);

  if (transcriptWords.length === 0) {
    return false;
  }

  const overlappingWordCount = transcriptWords.filter((word) =>
    assistantCaption.includes(word),
  ).length;

  return overlappingWordCount / transcriptWords.length >= 0.7;
}

function getPreferredSpeechVoice(voices: SpeechSynthesisVoice[]) {
  const preferredVoiceNames = [
    "Alex",
    "Ava",
    "Daniel",
    "Moira",
    "Tessa",
    "Karen",
    "Samantha",
    "Google UK English Female",
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

function waitForMilliseconds(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}
