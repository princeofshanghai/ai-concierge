import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/button";

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
    <Button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      emphasis={false}
      size="small"
      variant="secondary"
      className={[
        "w-fit max-w-full justify-start text-left",
        className,
      ].join(" ")}
    >
      {children}
    </Button>
  );
}
