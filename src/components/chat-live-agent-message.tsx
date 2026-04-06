import { AVATAR_FALLBACK_SOURCES, Avatar } from "@/components/avatar";

type ChatLiveAgentMessageProps = {
  body: string;
  className?: string;
  isPanelExpanded?: boolean;
  name: string;
  timestampLabel: string;
};

export function ChatLiveAgentMessage({
  body,
  className = "",
  isPanelExpanded = false,
  name,
  timestampLabel,
}: ChatLiveAgentMessageProps) {
  return (
    <div className={["w-full", className].join(" ")}>
      <div
        className={[
          "rounded-bl-none rounded-br-[24px] rounded-tl-[24px] rounded-tr-[24px] bg-ai-surface-neutral-soft px-6 py-5",
          isPanelExpanded ? "max-w-[440px]" : "max-w-[352px]",
          "ai-type-body-sm-open text-ai-text-primary",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap break-words">{body}</p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Avatar
          decorative
          fallbackSrc={AVATAR_FALLBACK_SOURCES[0]}
          name={name}
          seed="live-sales-representative"
          size={24}
        />
        <p className="ai-type-body-xs text-ai-text-meta">
          {name} {timestampLabel}
        </p>
      </div>
    </div>
  );
}
