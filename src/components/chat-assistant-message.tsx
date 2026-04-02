type ChatAssistantMessageProps = {
  body: string;
  className?: string;
  status?: "complete" | "streaming" | "thinking";
};

function ThinkingIndicator() {
  return (
    <div
      aria-label="AI Concierge is thinking"
      className="flex items-center gap-1.5 py-1"
      role="status"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          className="assistant-thinking-dot h-2 w-2 rounded-full bg-black/35"
          style={{ animationDelay: `${index * 0.16}s` }}
        />
      ))}
    </div>
  );
}

export function ChatAssistantMessage({
  body,
  className = "",
  status = "complete",
}: ChatAssistantMessageProps) {
  if (status === "thinking") {
    return (
      <div className={["w-full", className].join(" ")}>
        <ThinkingIndicator />
      </div>
    );
  }

  return (
    <div className={["w-full", className].join(" ")}>
      <p className="font-panel-text whitespace-pre-wrap break-words text-[14px] leading-[1.5] tracking-[-0.15px] text-black/90">
        {body}
      </p>
    </div>
  );
}
