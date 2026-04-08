"use client";

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { DEFAULT_REPRESENTATIVE_NAME } from "@/lib/ai-concierge-fixtures";
import type { AiConciergeMessage } from "@/lib/ai-concierge-types";

const LIVE_SALES_JOIN_DELAY_MS = 2_200;

type UseLiveSalesFlowParams = {
  closeVoiceMode: () => void;
  contactFirstName: string;
  setFocusComposerSignal: Dispatch<SetStateAction<number>>;
  setMessages: Dispatch<SetStateAction<AiConciergeMessage[]>>;
};

export function useLiveSalesFlow({
  closeVoiceMode,
  contactFirstName,
  setFocusComposerSignal,
  setMessages,
}: UseLiveSalesFlowParams) {
  const [isLiveAgentReplyPending, setIsLiveAgentReplyPending] = useState(false);
  const [liveSalesChatStatus, setLiveSalesChatStatus] = useState<
    "active" | "connecting" | "idle"
  >("idle");

  const liveSalesJoinTimerRef = useRef<number | null>(null);
  const liveSalesReplyTimerRef = useRef<number | null>(null);

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

  const resetLiveSalesChatFlow = useCallback(() => {
    clearLiveSalesTimers();
    setIsLiveAgentReplyPending(false);
    setLiveSalesChatStatus("idle");
  }, [clearLiveSalesTimers]);

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
              contactFirstName,
              input: userInput,
            }),
            currentMessages.length + 1,
          ),
        ]);
        setIsLiveAgentReplyPending(false);
      }, getLiveSalesReplyDelay(userInput));
    },
    [clearLiveSalesTimers, contactFirstName, setMessages],
  );

  const startLiveSalesHandoffFlow = useCallback(
    (messageId: string) => {
      clearLiveSalesTimers();
      setLiveSalesChatStatus("connecting");
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
            `${DEFAULT_REPRESENTATIVE_NAME} joined the chat`,
            currentMessages.length + 1,
          ),
          createLiveAgentMessage(
            `Hey ${contactFirstName}, give me one moment while I review your request.`,
            currentMessages.length + 2,
          ),
        ]);
        setLiveSalesChatStatus("active");
        setFocusComposerSignal((currentValue) => currentValue + 1);
      }, LIVE_SALES_JOIN_DELAY_MS);
    },
    [
      clearLiveSalesTimers,
      closeVoiceMode,
      contactFirstName,
      setFocusComposerSignal,
      setMessages,
    ],
  );

  return {
    clearLiveSalesTimers,
    isLiveAgentReplyPending,
    liveSalesChatStatus,
    queueLiveSalesReply,
    resetLiveSalesChatFlow,
    startLiveSalesHandoffFlow,
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
    agentName: DEFAULT_REPRESENTATIVE_NAME,
    body,
    role: "agent",
    timestampLabel: getCurrentTimeLabel(),
  };
}

function getLiveSalesReplyDelay(body: string) {
  if (body.length > 180) {
    return 1_500;
  }

  if (body.length > 90) {
    return 1_300;
  }

  return 1_100;
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

  return `Thanks, ${greetingName}. I’ve got the context from the conversation so far. I can help you figure out the right next step and answer any questions about which option fits best from here. What would be most helpful to cover first?`;
}

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}
