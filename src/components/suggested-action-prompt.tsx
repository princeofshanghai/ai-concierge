import type { ButtonHTMLAttributes, ReactNode } from "react";

type SuggestedActionPromptProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled" | "onClick" | "type"
>;

// Prompt chips are intentionally lighter than outlined buttons — they read
// as hints, not commands. Visual vocabulary mirrors the topic-picker toggle
// pills above the composer so both families look like they belong together.
export function SuggestedActionPrompt({
  ariaLabel,
  children,
  className = "",
  disabled = false,
  onClick,
  type = "button",
}: SuggestedActionPromptProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={[
        "font-panel-text inline-flex h-10 w-fit max-w-full shrink-0 items-center justify-start rounded-full border border-ai-border-subtle bg-ai-surface-base px-4 text-left text-[14px] font-medium leading-[1.25] text-ai-text-secondary transition-[background-color,border-color,color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
        disabled
          ? "cursor-not-allowed border-transparent bg-ai-surface-disabled text-ai-text-disabled"
          : "hover:border-ai-border-subtle-hover hover:bg-ai-surface-overlay-soft hover:text-ai-text-primary active:bg-ai-surface-overlay-active active:text-ai-text-primary",
        className,
      ].join(" ")}
    >
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}
