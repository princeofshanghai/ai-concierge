import Image from "next/image";

type ChatAssistantMessageProps = {
  body: string;
  className?: string;
  isActiveVoiceTurn?: boolean;
  isPanelExpanded?: boolean;
  showArrivalAnimation?: boolean;
  status?: "complete" | "streaming" | "thinking";
  streamedChunks?: string[];
};

function ThinkingIndicator({
  showArrivalAnimation = false,
}: {
  showArrivalAnimation?: boolean;
}) {
  return (
    <div
      aria-label="Assistant is thinking"
      className="flex items-center gap-2 py-1"
      role="status"
    >
      <span
        aria-hidden="true"
        className={[
          "relative flex shrink-0 items-center justify-center",
          showArrivalAnimation ? "h-10 w-10" : "h-5 w-5",
        ].join(" ")}
      >
        {showArrivalAnimation ? (
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(10,102,194,0.18),rgba(10,102,194,0.08)_40%,rgba(10,102,194,0)_74%)] animate-[ai-concierge-opening-icon-halo_460ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none" />
        ) : null}
        <Image
          src="/figma/chat/ai-concierge-icon.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden="true"
          className={[
            "relative h-5 w-5",
            showArrivalAnimation
              ? "animate-[ai-concierge-opening-icon-settle_380ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
              : "",
          ].join(" ")}
        />
      </span>
      <div className="flex items-center gap-1 py-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden="true"
            className="assistant-thinking-dot h-[7px] w-[7px] rounded-full bg-ai-text-disabled"
            style={{ animationDelay: `${index * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatAssistantMessage({
  body,
  className = "",
  isActiveVoiceTurn = false,
  isPanelExpanded = false,
  showArrivalAnimation = false,
  status = "complete",
  streamedChunks,
}: ChatAssistantMessageProps) {
  const widthClassName = isPanelExpanded
    ? "max-w-[33rem]"
    : "max-w-[21.5rem]";

  if (status === "thinking") {
    return (
      <div className={["w-full", className].join(" ")}>
        <div className={widthClassName}>
          <ThinkingIndicator showArrivalAnimation={showArrivalAnimation} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={["w-full", className].join(" ")}
      data-voice-speaking={isActiveVoiceTurn || undefined}
    >
      <div className={widthClassName}>
        <p className="ai-type-body-sm-open whitespace-pre-wrap break-words text-ai-text-primary">
          {streamedChunks?.length
            ? streamedChunks.map((chunk, index) => (
                <span
                  key={`${index}-${chunk}`}
                  className="inline animate-[ai-concierge-message-chunk-in_220ms_ease-out_both] motion-reduce:animate-none"
                >
                  {chunk}
                </span>
              ))
            : body}
        </p>
      </div>
    </div>
  );
}
