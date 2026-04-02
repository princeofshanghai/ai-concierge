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
        "ml-auto rounded-bl-[24px] rounded-tl-[24px] rounded-tr-[24px] rounded-br-none bg-[#ebf1ff] px-6 py-5",
        isPanelExpanded ? "max-w-[440px]" : "max-w-[352px]",
        "font-panel-text text-[14px] leading-[1.5] tracking-[-0.15px] text-black",
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
