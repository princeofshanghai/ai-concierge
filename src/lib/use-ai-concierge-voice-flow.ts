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

type UseVoiceFlowParams = {
  appendVoiceAssistantMessage: (body: string) => string | null;
  composerDraft: string;
  ensureVoiceIntroMessage: (body: string) => string | null;
  getShouldShowNextStepSurface: () => boolean;
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
  const recognitionRef = useRef<BrowserSpeechRecognitionLike | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const preferredSpeechVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const speechPlaybackRequestRef = useRef(0);
  const hasGrantedMicrophonePermissionRef = useRef(false);
  const isAssistantRespondingRef = useRef(false);
  const isVoiceModeActiveRef = useRef(false);
  const isVoicePlaybackMutedRef = useRef(false);
  const awaitedVoiceAssistantMessageIdRef = useRef<string | null>(null);
  const hasPlayedVoiceIntroRef = useRef(false);
  const composerDraftRef = useRef("");
  const dictateBaseDraftRef = useRef("");
  const dictateTranscriptRef = useRef("");
  const voiceTranscriptRef = useRef("");
  const voiceTransitionTimerRef = useRef<number | null>(null);
  const startListeningRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const shouldShowNextStepSurfaceRef = useRef(getShouldShowNextStepSurface);
  const voiceMessageSenderRef = useRef<((body: string) => string | null) | null>(
    null,
  );

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
      isVoiceModeActiveRef.current = false;
      awaitedVoiceAssistantMessageIdRef.current = null;
      voiceTranscriptRef.current = "";
      clearVoiceTransitionTimer();
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
    [clearVoiceTransitionTimer, stopAssistantSpeech, stopVoiceRecognition],
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
    stopVoiceRecognition();
    stopAssistantSpeech();
  }, [
    clearVoiceTransitionTimer,
    releaseDictationRecognition,
    stopAssistantSpeech,
    stopVoiceRecognition,
  ]);

  const resetVoiceFlowState = useCallback(() => {
    awaitedVoiceAssistantMessageIdRef.current = null;
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
    (sendMessage: (body: string) => string | null) => {
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

      voiceTransitionTimerRef.current = window.setTimeout(() => {
        voiceTransitionTimerRef.current = null;

        if (isVoiceModeActiveRef.current) {
          void startListeningRef.current();
        }
      }, delayMs);
    },
    [clearVoiceTransitionTimer],
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

        utterance.rate = 0.96;
        utterance.pitch = 1;
        utterance.onend = () => {
          speechUtteranceRef.current = null;
          setActiveVoiceAssistantMessageId(null);

          if (isVoiceModeActiveRef.current) {
            onComplete?.();
          }
        };
        utterance.onerror = () => {
          speechUtteranceRef.current = null;
          setActiveVoiceAssistantMessageId(null);

          if (isVoiceModeActiveRef.current) {
            onError?.();
          }
        };

        speechUtteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      })();
    },
    [clearVoiceTransitionTimer, resolvePreferredSpeechVoice, stopAssistantSpeech],
  );

  const submitVoiceTranscript = useCallback((body: string) => {
    const normalizedTranscript = normalizeVoiceTranscript(body);
    if (!normalizedTranscript) {
      const fallbackMessage =
        "I didn't catch that. Try again or switch back to keyboard.";
      const assistantMessageId = appendVoiceAssistantMessage(fallbackMessage);

      voiceTranscriptRef.current = "";
      setVoiceUserCaption("");
      setVoiceErrorMessage(null);

      if (!assistantMessageId) {
        setVoiceModeStatus("error");
        setVoiceErrorMessage(fallbackMessage);
        return;
      }

      playAssistantCaption(fallbackMessage, {
        assistantMessageId,
        fallbackDelayMs: 900,
        onComplete: () => {
          scheduleVoiceListening();
        },
        onError: () => {
          scheduleVoiceListening();
        },
      });
      return;
    }

    voiceTranscriptRef.current = "";
    setVoiceUserCaption(normalizedTranscript);
    setVoiceAssistantCaption("");
    setVoiceErrorMessage(null);
    setVoiceModeStatus("thinking");

    const assistantMessageId =
      voiceMessageSenderRef.current?.(normalizedTranscript) ?? null;

    if (!assistantMessageId) {
      setVoiceModeStatus("error");
      setVoiceErrorMessage(
        "I couldn't send that voice turn yet. Try again once the current reply finishes.",
      );
      return;
    }

    awaitedVoiceAssistantMessageIdRef.current = assistantMessageId;
  }, [appendVoiceAssistantMessage, playAssistantCaption, scheduleVoiceListening]);

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
    voiceTranscriptRef.current = "";
    setVoiceUserCaption("");
    setVoiceErrorMessage(null);
    stopVoiceRecognition();

    const assistantMessageId = appendVoiceAssistantMessage(normalizedBody);

    if (!assistantMessageId) {
      return null;
    }

    playAssistantCaption(normalizedBody, {
      assistantMessageId,
      fallbackDelayMs: 900,
      onComplete: () => {
        scheduleVoiceListening();
      },
      onError: () => {
        scheduleVoiceListening();
      },
    });

    return assistantMessageId;
  }, [
    appendVoiceAssistantMessage,
    panelState,
    playAssistantCaption,
    scheduleVoiceListening,
    stopVoiceRecognition,
  ]);

  const startListening = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !isVoiceModeActiveRef.current ||
      panelState !== "chat" ||
      liveSalesChatStatus !== "idle" ||
      isAssistantRespondingRef.current
    ) {
      return;
    }

    const browserWindow = window as BrowserWindowWithSpeechRecognition;
    const SpeechRecognitionConstructor =
      getSpeechRecognitionConstructor(browserWindow);

    if (!SpeechRecognitionConstructor || !navigator.mediaDevices?.getUserMedia) {
      showVoiceSystemNotice(
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
    voiceTranscriptRef.current = "";
    setVoiceUserCaption("");

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

    if (!hasPlayedVoiceIntroRef.current) {
      const introMessageId = ensureVoiceIntroMessage(voiceIntroMessage);

      playAssistantCaption(voiceIntroMessage, {
        assistantMessageId: introMessageId,
        fallbackDelayMs: 900,
        onComplete: () => {
          hasPlayedVoiceIntroRef.current = true;
          scheduleVoiceListening();
        },
        onError: () => {
          hasPlayedVoiceIntroRef.current = true;
          scheduleVoiceListening();
        },
      });
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
    playAssistantCaption,
    scheduleVoiceListening,
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
    clearVoiceTransitionTimer();
    stopAssistantSpeech();
    setVoiceErrorMessage(null);
    setVoiceModeStatus("listening");
    scheduleVoiceListening(0);
  }, [clearVoiceTransitionTimer, scheduleVoiceListening, stopAssistantSpeech]);

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
    playAssistantCaption(completedAssistantMessage.body, {
      assistantMessageId: completedAssistantMessage.id,
      onComplete: () => {
        scheduleVoiceListening();
      },
      onError: () => {
        showVoiceSystemNotice(
          "I showed the reply in text, but audio playback was unavailable.",
        );
      },
    });
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
    "Alex",
    "Karen",
    "Moira",
    "Tessa",
    "Daniel",
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

function waitForMilliseconds(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}
