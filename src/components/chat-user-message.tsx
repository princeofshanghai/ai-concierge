import type { ReactNode } from "react";

type ChatUserMessageProps = {
  children: ReactNode;
  className?: string;
  isPanelExpanded?: boolean;
};

export function ChatUserMessage({
  children,
  className = "",
  isPanelExpanded = false,
}: ChatUserMessageProps) {
  return (
    <div
      className={[
        "ml-auto rounded-bl-[24px] rounded-tl-[24px] rounded-tr-[24px] rounded-br-none bg-ai-surface-user-message px-6 py-5",
        isPanelExpanded ? "max-w-[440px]" : "max-w-[352px]",
        "ai-type-body-sm-open text-ai-text-primary",
        className,
      ].join(" ")}
    >
      {typeof children === "string" ? (
        <p className="whitespace-pre-wrap break-words">{children}</p>
      ) : (
        children
      )}
    </div>
  );
}
