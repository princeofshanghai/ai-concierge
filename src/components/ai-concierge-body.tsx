"use client";

import { useLayoutEffect, useRef } from "react";
import { AiConciergeOpeningSupportView } from "@/components/ai-concierge-opening-support";
import { ChatAssistantMessage } from "@/components/chat-assistant-message";
import { AiConciergeRecommendationCard } from "@/components/ai-concierge-recommendation-card";
import { AiConciergeRepresentativeMatchCard } from "@/components/ai-concierge-representative-booking";
import { ChatLiveAgentMessage } from "@/components/chat-live-agent-message";
import { ChatUserMessage } from "@/components/chat-user-message";
import { SuggestedActionPrompt } from "@/components/suggested-action-prompt";
import type {
  AiConciergeMessage,
  AiConciergeSuggestedReply,
} from "@/lib/ai-concierge-types";

type AiConciergeBodyProps = {
  activeVoiceAssistantMessageId?: string | null;
  isVoiceModeActive?: boolean;
  isPanelExpanded?: boolean;
  messages: AiConciergeMessage[];
  onBookAgain: () => void;
  onBookMeeting: () => void;
  onInsertOpeningPrompt?: (prompt: string) => void;
  onManageBooking: () => void;
  onRecommendationPrimaryAction: (messageId: string) => void;
  pendingRecommendationMessageId?: string | null;
  onRepresentativeReadyCardVisibilityChange?: (
    isVisible: boolean | null,
  ) => void;
  onSelectSuggestedReply: (suggestedReply: AiConciergeSuggestedReply) => void;
  scrollToLatestSignal?: number;
};

export function AiConciergeBody({
  activeVoiceAssistantMessageId = null,
  isVoiceModeActive = false,
  isPanelExpanded = false,
  messages,
  onBookAgain,
  onBookMeeting,
  onInsertOpeningPrompt = () => {},
  onManageBooking,
  onRecommendationPrimaryAction,
  pendingRecommendationMessageId = null,
  onRepresentativeReadyCardVisibilityChange,
  onSelectSuggestedReply,
  scrollToLatestSignal = 0,
}: AiConciergeBodyProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const endOfThreadRef = useRef<HTMLDivElement | null>(null);
  const readyRepresentativeCardRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);
  let latestReadyRepresentativeMessageId: string | null = null;
  const visibleMessages = messages;

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior,
    });
  };

  for (let index = visibleMessages.length - 1; index >= 0; index -= 1) {
    const message = visibleMessages[index];

    if (
      message.role === "assistant" &&
      message.status === "complete" &&
      message.artifact?.type === "representative-match" &&
      message.artifact.status === "ready"
    ) {
      latestReadyRepresentativeMessageId = message.id;
      break;
    }
  }

  useLayoutEffect(() => {
    const shouldSmoothScroll =
      previousMessageCountRef.current > 0 &&
      visibleMessages.length > previousMessageCountRef.current;

    scrollToBottom(shouldSmoothScroll ? "smooth" : "auto");
    previousMessageCountRef.current = visibleMessages.length;
  }, [visibleMessages]);

  useLayoutEffect(() => {
    if (scrollToLatestSignal === 0) {
      return;
    }

    scrollToBottom("auto");

    let frameOneId = 0;
    let frameTwoId = 0;
    const settleTimerId = window.setTimeout(() => {
      scrollToBottom("auto");
    }, 360);

    frameOneId = window.requestAnimationFrame(() => {
      scrollToBottom("auto");

      frameTwoId = window.requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    });

    return () => {
      window.cancelAnimationFrame(frameOneId);
      window.cancelAnimationFrame(frameTwoId);
      window.clearTimeout(settleTimerId);
    };
  }, [scrollToLatestSignal]);

  useLayoutEffect(() => {
    if (!onRepresentativeReadyCardVisibilityChange) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    const readyCard = readyRepresentativeCardRef.current;

    if (!latestReadyRepresentativeMessageId || !scrollContainer || !readyCard) {
      onRepresentativeReadyCardVisibilityChange(null);
      return;
    }

    const visibilityThreshold = 0.6;

    const updateVisibility = (intersectionRatio: number) => {
      onRepresentativeReadyCardVisibilityChange(
        intersectionRatio >= visibilityThreshold,
      );
    };

    if (!("IntersectionObserver" in window)) {
      const readyCardRect = readyCard.getBoundingClientRect();
      const scrollContainerRect = scrollContainer.getBoundingClientRect();
      const visibleHeight =
        Math.min(readyCardRect.bottom, scrollContainerRect.bottom) -
        Math.max(readyCardRect.top, scrollContainerRect.top);
      const intersectionRatio =
        visibleHeight > 0
          ? Math.min(visibleHeight / readyCardRect.height, 1)
          : 0;

      updateVisibility(intersectionRatio);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        updateVisibility(entry.intersectionRatio);
      },
      {
        root: scrollContainer,
        threshold: [0, visibilityThreshold, 1],
      },
    );

    observer.observe(readyCard);

    return () => {
      observer.disconnect();
    };
  }, [
    latestReadyRepresentativeMessageId,
    onRepresentativeReadyCardVisibilityChange,
  ]);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      <div className="flex min-h-full flex-col px-5 py-5">
        <div
          className={[
            "mx-auto flex min-h-full w-full flex-col",
            isPanelExpanded ? "max-w-[720px]" : "max-w-full",
          ].join(" ")}
        >
          {visibleMessages.length > 0 ? (
            <p className="ai-type-body-xs text-center text-ai-text-meta">
              Today 1:00 PM
            </p>
          ) : null}
          <div className={[visibleMessages.length > 0 ? "mt-5" : "", "flex flex-col gap-4"].join(" ")}>
            {visibleMessages.map((message) =>
              message.role === "assistant" ? (
                <div
                  key={message.id}
                  className="flex flex-col gap-3 animate-[ai-concierge-message-in_240ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
                >
                  {message.status === "thinking" || message.body.trim().length > 0 ? (
                    <ChatAssistantMessage
                      body={message.body}
                      className={isPanelExpanded ? "max-w-[680px]" : ""}
                      isActiveVoiceTurn={
                        message.status === "complete" &&
                        message.id === activeVoiceAssistantMessageId
                      }
                      showArrivalAnimation={
                        messages.length === 1 &&
                        message.id === "assistant-message-1" &&
                        message.status === "thinking"
                      }
                      status={message.status}
                    />
                  ) : null}
                  {message.status === "complete" &&
                  message.openingSupport &&
                  !isVoiceModeActive ? (
                    <AiConciergeOpeningSupportView
                      onInsertPrompt={onInsertOpeningPrompt}
                      support={message.openingSupport}
                    />
                  ) : null}
                  {message.status === "complete" &&
                  message.artifact?.type === "representative-match" ? (
                    <div
                      ref={
                        message.id === latestReadyRepresentativeMessageId
                          ? readyRepresentativeCardRef
                          : null
                      }
                    >
                      <AiConciergeRepresentativeMatchCard
                        bodyText={message.artifact.bodyText}
                        isPanelExpanded={isPanelExpanded}
                        meetingDetails={message.artifact.meetingDetails}
                        onBookAgain={onBookAgain}
                        onBookMeeting={onBookMeeting}
                        onManageBooking={onManageBooking}
                        status={message.artifact.status}
                        titleText={message.artifact.titleText}
                      />
                    </div>
                  ) : null}
                  {message.status === "complete" &&
                  message.artifact?.type === "recommendation" ? (
                    <AiConciergeRecommendationCard
                      artifact={message.artifact}
                      isPanelExpanded={isPanelExpanded}
                      isPrimaryActionPending={
                        message.id === pendingRecommendationMessageId
                      }
                      onPrimaryAction={() =>
                        onRecommendationPrimaryAction(message.id)
                      }
                    />
                  ) : null}
                  {message.status === "complete" &&
                  message.suggestedReplies?.length &&
                  message.suggestedReplyDisplay === "inline" &&
                  !isVoiceModeActive ? (
                    <div className="flex flex-wrap gap-2 animate-[ai-concierge-suggested-replies-in_220ms_ease-out_both] motion-reduce:animate-none">
                      {message.suggestedReplies.map((suggestedReply) => (
                        <SuggestedActionPrompt
                          key={suggestedReply.id}
                          onClick={() => onSelectSuggestedReply(suggestedReply)}
                        >
                          {suggestedReply.label}
                        </SuggestedActionPrompt>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : message.role === "agent" ? (
                <div
                  key={message.id}
                  className="animate-[ai-concierge-message-in_240ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
                >
                  <ChatLiveAgentMessage
                    body={message.body}
                    isPanelExpanded={isPanelExpanded}
                    name={message.agentName ?? "Sales rep"}
                    timestampLabel={message.timestampLabel ?? ""}
                  />
                </div>
              ) : message.role === "system" ? (
                <p
                  key={message.id}
                  className="ai-type-body-xs animate-[ai-concierge-message-in_240ms_cubic-bezier(0.22,1,0.36,1)_both] text-center text-ai-text-meta motion-reduce:animate-none"
                >
                  {message.body}
                </p>
              ) : (
                <ChatUserMessage
                  key={message.id}
                  isPanelExpanded={isPanelExpanded}
                >
                  {message.body}
                </ChatUserMessage>
              ),
            )}
            <div ref={endOfThreadRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export type { AiConciergeMessage, AiConciergeSuggestedReply };
