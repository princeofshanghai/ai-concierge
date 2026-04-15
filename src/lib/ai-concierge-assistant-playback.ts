import type { AiConciergeAssistantTurn } from "@/lib/ai-concierge-conversation";
import type {
  AiConciergeMessage,
  AiConciergeSuggestedReply,
} from "@/lib/ai-concierge-types";

export type AssistantStreamMode = "text" | "voice";

type TimerRef = {
  current: number | null;
};

type UpdateMessages = (
  updater: (currentMessages: AiConciergeMessage[]) => AiConciergeMessage[],
) => void;

type StreamAssistantTurnPlaybackArgs = {
  assistantTurn: AiConciergeAssistantTurn;
  assistantMessageId: string;
  onComplete: () => void;
  setMessages: UpdateMessages;
  streamMode?: AssistantStreamMode;
  streamingTimerRef: TimerRef;
  thinkingTimerRef: TimerRef;
};

export function clearSuggestedReplies(
  currentMessages: AiConciergeMessage[],
): AiConciergeMessage[] {
  return currentMessages.map((message) =>
    message.suggestedReplies
      ? { ...message, suggestedReplies: undefined }
      : message,
  );
}

export function createAssistantMessage(
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

export function createAssistantMessageFromTurn(
  assistantTurn: AiConciergeAssistantTurn,
  messageNumber: number,
): AiConciergeMessage {
  return {
    ...createAssistantMessage(
      assistantTurn.body,
      assistantTurn.openingSupport,
      assistantTurn.suggestedReplies,
      assistantTurn.suggestedReplyDisplay,
      messageNumber,
    ),
    artifact: assistantTurn.artifact,
  };
}

export function createThinkingAssistantMessage(
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: createAssistantMessageId(messageNumber),
    role: "assistant",
    body: "",
    status: "thinking",
  };
}

export function createUserMessage(
  body: string,
  messageNumber: number,
): AiConciergeMessage {
  return {
    id: `user-message-${messageNumber}`,
    role: "user",
    body,
  };
}

export function createAssistantMessageId(messageNumber: number) {
  return `assistant-message-${messageNumber}`;
}

export function getComposerSuggestedReplies(
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

export function getComposerInteractionKey(
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

export function getThinkingDelay(
  body: string,
  streamMode: AssistantStreamMode = "text",
) {
  const baseDelay =
    body.length > 220 ? 900 : body.length > 120 ? 700 : 500;

  return streamMode === "voice" ? baseDelay + 220 : baseDelay;
}

export function getStreamingInterval(
  body: string,
  streamMode: AssistantStreamMode = "text",
) {
  if (streamMode === "voice") {
    return body.length > 180 ? 150 : 130;
  }

  return body.length > 180 ? 115 : 95;
}

export function createStreamingChunks(
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

export function clearResponseTimers(
  thinkingTimerRef: TimerRef,
  streamingTimerRef: TimerRef,
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

export function streamAssistantTurnPlayback({
  assistantTurn,
  assistantMessageId,
  onComplete,
  setMessages,
  streamMode = "text",
  streamingTimerRef,
  thinkingTimerRef,
}: StreamAssistantTurnPlaybackArgs) {
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
      onComplete();
    }, getStreamingInterval(assistantTurn.body, streamMode));
  }, thinkingDelay);
}
