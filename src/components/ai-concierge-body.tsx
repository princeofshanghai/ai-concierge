"use client";

import { useEffect, useRef } from "react";
import { ChatAssistantMessage } from "@/components/chat-assistant-message";
import { ChatUserMessage } from "@/components/chat-user-message";

export type AiConciergeMessage = {
  body: string;
  id: string;
  role: "assistant" | "user";
};

type AiConciergeBodyProps = {
  messages: AiConciergeMessage[];
};

export function AiConciergeBody({ messages }: AiConciergeBodyProps) {
  const endOfThreadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfThreadRef.current?.scrollIntoView({
      behavior: messages.length > 1 ? "smooth" : "auto",
      block: "end",
    });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex min-h-full flex-col px-5 py-5">
        <p className="font-panel-text text-center text-[12px] leading-[1.5] text-black/60">
          Today 1:00 PM
        </p>
        <div className="mt-5 flex flex-col gap-4">
          {messages.map((message) =>
            message.role === "assistant" ? (
              <ChatAssistantMessage key={message.id} body={message.body} />
            ) : (
              <ChatUserMessage key={message.id}>{message.body}</ChatUserMessage>
            ),
          )}
          <div ref={endOfThreadRef} />
        </div>
      </div>
    </div>
  );
}
