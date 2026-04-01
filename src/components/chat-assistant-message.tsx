type ChatAssistantMessageProps = {
  body: string;
  className?: string;
};

export function ChatAssistantMessage({
  body,
  className = "",
}: ChatAssistantMessageProps) {
  return (
    <div className={["w-full max-w-full", className].join(" ")}>
      <p className="font-panel-text whitespace-pre-wrap break-words text-[14px] leading-[1.5] tracking-[-0.15px] text-black/90">
        {body}
      </p>
    </div>
  );
}
