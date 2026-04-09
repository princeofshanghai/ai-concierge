import type { ReactNode } from "react";

type ChatUserMessageProps = {
  children: ReactNode;
  className?: string;
  isDraft?: boolean;
  isPanelExpanded?: boolean;
};

export function ChatUserMessage({
  children,
  className = "",
  isDraft = false,
  isPanelExpanded = false,
}: ChatUserMessageProps) {
  return (
    <div
      className={[
        "ml-auto rounded-bl-[24px] rounded-tl-[24px] rounded-tr-[24px] rounded-br-none px-6 py-5",
        isDraft
          ? "bg-ai-surface-panel-subtle text-ai-text-meta"
          : "bg-ai-surface-user-message text-ai-text-primary",
        isPanelExpanded ? "max-w-[440px]" : "max-w-[352px]",
        "ai-type-body-sm-open transition-[background-color,border-color,color] duration-150",
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
