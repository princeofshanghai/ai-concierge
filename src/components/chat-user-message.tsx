import type { ReactNode } from "react";

type ChatUserMessageProps = {
  children: ReactNode;
  className?: string;
};

export function ChatUserMessage({
  children,
  className = "",
}: ChatUserMessageProps) {
  return (
    <div
      className={[
        "ml-auto max-w-[352px] rounded-bl-[24px] rounded-tl-[24px] rounded-tr-[24px] rounded-br-none bg-[#ebf1ff] px-6 py-5",
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
