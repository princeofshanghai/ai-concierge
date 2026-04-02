"use client";

import { useLayoutEffect, useRef } from "react";
import { ChatAssistantMessage } from "@/components/chat-assistant-message";
import { ChatUserMessage } from "@/components/chat-user-message";

export type AiConciergeSuggestedReply = {
  id: string;
  label: string;
};

export type AiConciergeMessage = {
  body: string;
  id: string;
  role: "assistant" | "user";
  status?: "complete" | "streaming" | "thinking";
  suggestedReplies?: AiConciergeSuggestedReply[];
  suggestedReplyDisplay?: "composer" | "inline";
};

type AiConciergeBodyProps = {
  isPanelExpanded?: boolean;
  messages: AiConciergeMessage[];
  onSelectSuggestedReply: (suggestedReply: AiConciergeSuggestedReply) => void;
};

function SuggestedReplyButton({
  onClick,
  suggestedReply,
}: {
  onClick: (suggestedReply: AiConciergeSuggestedReply) => void;
  suggestedReply: AiConciergeSuggestedReply;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(suggestedReply)}
      className="font-panel-text inline-flex min-h-10 max-w-full items-center justify-center rounded-full border border-[#c7dcf4] bg-[#f7fbff] px-4 py-2 text-left text-[14px] leading-[1.4] text-linkedin-blue transition-colors hover:border-[#b6d0ef] hover:bg-[#eef6ff]"
    >
      <span className="whitespace-normal">{suggestedReply.label}</span>
    </button>
  );
}

export function AiConciergeBody({
  isPanelExpanded = false,
  messages,
  onSelectSuggestedReply,
}: AiConciergeBodyProps) {
  const endOfThreadRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);

  useLayoutEffect(() => {
    const shouldSmoothScroll =
      previousMessageCountRef.current > 0 &&
      messages.length > previousMessageCountRef.current;

    endOfThreadRef.current?.scrollIntoView({
      behavior: shouldSmoothScroll ? "smooth" : "auto",
      block: "end",
    });
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex min-h-full flex-col px-5 py-5">
        <div
          className={[
            "mx-auto flex min-h-full w-full flex-col",
            isPanelExpanded ? "max-w-[720px]" : "max-w-full",
          ].join(" ")}
        >
          <p className="font-panel-text text-center text-[12px] leading-[1.5] text-black/60">
            Today 1:00 PM
          </p>
          <div className="mt-5 flex flex-col gap-4">
            {messages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="flex flex-col gap-3">
                  <ChatAssistantMessage
                    body={message.body}
                    className={isPanelExpanded ? "max-w-[680px]" : ""}
                    status={message.status}
                  />
                  {message.status === "complete" &&
                  message.suggestedReplies?.length &&
                  message.suggestedReplyDisplay === "inline" ? (
                    <div className="flex flex-wrap gap-2">
                      {message.suggestedReplies.map((suggestedReply) => (
                        <SuggestedReplyButton
                          key={suggestedReply.id}
                          suggestedReply={suggestedReply}
                          onClick={onSelectSuggestedReply}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
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
