import type { AiConciergeAssistantTurn } from "@/lib/ai-concierge-conversation";
import type {
  AiConciergeMessage,
  AiConciergeSuggestedReply,
} from "@/lib/ai-concierge-types";

export type AssistantStreamMode = "text" | "voice";

const STRONG_STREAM_BREAK_PATTERN = /(?:[.!?…]["')\]]*|\n)\s*$/;
const SOFT_STREAM_BREAK_PATTERN = /[,;:]["')\]]*\s*$/;

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

// Playback pre-render uses this to flatten a turn (which may contain an
// acknowledge-only `priorBubble`) into the list of rendered messages. The
// prior bubble becomes its own message with no chips or artifact; the main
// body gets all the bells (chips, artifact, openingSupport).
export function createAssistantMessagesFromTurn(
  assistantTurn: AiConciergeAssistantTurn,
  firstMessageNumber: number,
): AiConciergeMessage[] {
  if (!assistantTurn.priorBubble) {
    return [createAssistantMessageFromTurn(assistantTurn, firstMessageNumber)];
  }

  const priorMessage = createAssistantMessage(
    assistantTurn.priorBubble,
    undefined,
    undefined,
    undefined,
    firstMessageNumber,
  );

  const mainMessage: AiConciergeMessage = {
    ...createAssistantMessage(
      assistantTurn.body,
      assistantTurn.openingSupport,
      assistantTurn.suggestedReplies,
      assistantTurn.suggestedReplyDisplay,
      firstMessageNumber + 1,
    ),
    artifact: assistantTurn.artifact,
  };

  return [priorMessage, mainMessage];
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
    body.length > 220 ? 940 : body.length > 120 ? 820 : 760;

  return streamMode === "voice" ? Math.max(560, baseDelay - 180) : baseDelay;
}

export function getStreamingChunkDelay(
  chunk: string,
  chunkIndex: number,
  totalChunks: number,
  streamMode: AssistantStreamMode = "text",
) {
  const wordCount = chunk.match(/\S+/g)?.length ?? 1;
  const baseDelay =
    streamMode === "voice"
      ? totalChunks > 6
        ? 96
        : 110
      : totalChunks > 6
        ? 118
        : 136;
  const introDelay = chunkIndex === 0 ? (streamMode === "voice" ? 24 : 36) : 0;
  const wordDelay = Math.min(
    wordCount * (streamMode === "voice" ? 8 : 13),
    streamMode === "voice" ? 32 : 60,
  );
  // Let punctuation create the breathing room that makes the stream feel paced.
  const punctuationDelay = STRONG_STREAM_BREAK_PATTERN.test(chunk)
    ? streamMode === "voice"
      ? 56
      : 108
    : SOFT_STREAM_BREAK_PATTERN.test(chunk)
      ? streamMode === "voice"
        ? 26
        : 62
      : 0;

  return baseDelay + introDelay + wordDelay + punctuationDelay;
}

export function createStreamingChunks(
  body: string,
  streamMode: AssistantStreamMode = "text",
) {
  const tokens = body.match(/\S+\s*/g) ?? [];

  if (tokens.length === 0) {
    return body ? [body] : [];
  }

  const baseChunkSize =
    streamMode === "voice"
      ? tokens.length > 28
        ? 5
        : tokens.length > 16
          ? 4
          : 3
      : tokens.length > 36
        ? 5
        : tokens.length > 20
          ? 4
          : 3;
  const chunks: string[] = [];
  let currentChunk = "";
  let currentWordCount = 0;

  // Break on phrase-like boundaries so replies feel composed instead of metronomic.
  for (const token of tokens) {
    currentChunk += token;
    currentWordCount += 1;

    const chunkSize =
      chunks.length === 0 ? Math.max(2, baseChunkSize - 1) : baseChunkSize;
    const endsWithStrongBreak = STRONG_STREAM_BREAK_PATTERN.test(currentChunk);
    const endsWithSoftBreak = SOFT_STREAM_BREAK_PATTERN.test(currentChunk);
    const shouldBreakOnStrong = endsWithStrongBreak && currentWordCount >= 2;
    const shouldBreakOnSoft =
      endsWithSoftBreak && currentWordCount >= Math.max(2, chunkSize - 1);
    const reachedChunkTarget = currentWordCount >= chunkSize;

    if (!shouldBreakOnStrong && !shouldBreakOnSoft && !reachedChunkTarget) {
      continue;
    }

    chunks.push(currentChunk);
    currentChunk = "";
    currentWordCount = 0;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
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
    window.clearTimeout(streamingTimerRef.current);
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

    const revealNextChunk = () => {
      const chunkDelay = getStreamingChunkDelay(
        streamingChunks[chunkIndex] ?? "",
        chunkIndex,
        streamingChunks.length,
        streamMode,
      );

      streamingTimerRef.current = window.setTimeout(() => {
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
          revealNextChunk();
          return;
        }

        clearResponseTimers(thinkingTimerRef, streamingTimerRef);
        onComplete();
      }, chunkDelay);
    };

    revealNextChunk();
  }, thinkingDelay);
}
