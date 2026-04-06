import type { ButtonHTMLAttributes, ReactNode } from "react";

type SuggestedActionPromptProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled" | "onClick" | "type"
>;

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
        "ai-type-heading-sm inline-flex max-w-[320px] items-center gap-1 rounded-[16px] border border-ai-border-subtle bg-ai-surface-base p-4 text-left text-ai-text-primary transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
        disabled
          ? "cursor-not-allowed border-ai-divider-subtle bg-ai-surface-base text-ai-text-disabled"
          : "hover:border-ai-border-subtle-hover hover:bg-ai-surface-overlay-active active:border-ai-border-subtle-hover active:bg-ai-surface-overlay-active",
        className,
      ].join(" ")}
    >
      <span className="flex-1 whitespace-normal">{children}</span>
    </button>
  );
}
