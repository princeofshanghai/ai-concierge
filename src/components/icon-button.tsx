import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant =
  | "premium"
  | "primary"
  | "secondary"
  | "tertiary"
  | "overlay";
type IconButtonSize = "small" | "medium";

type IconButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  emphasis?: boolean;
  iconClassName?: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children">;

export function IconButton({
  ariaLabel,
  children,
  className = "",
  disabled = false,
  emphasis = true,
  iconClassName = "",
  size = "small",
  type = "button",
  variant = "primary",
  ...props
}: IconButtonProps) {
  const sizeClassName =
    size === "small"
      ? "h-8 w-8 rounded-[16px] p-2"
      : "h-12 w-12 rounded-[24px] p-3";

  const iconSizeClassName = size === "small" ? "h-4 w-4" : "h-6 w-6";

  const stateClassName = disabled
    ? "border-transparent bg-ai-surface-disabled text-ai-text-disabled"
    : variant === "premium"
      ? "ai-premium-gradient-button border-0 text-ai-text-inverse"
    : variant === "secondary" && emphasis
      ? "border border-ai-blue-primary bg-transparent text-ai-blue-primary hover:border-2 hover:border-ai-blue-hover hover:bg-ai-blue-fill-hover hover:text-ai-blue-hover active:border-ai-blue-hover active:bg-ai-blue-fill-active active:text-ai-blue-hover"
      : variant === "secondary"
        ? "border border-ai-border-strong bg-transparent text-ai-text-secondary hover:border-2 hover:border-ai-border-focus hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary active:border-ai-border-focus active:bg-ai-surface-overlay-active active:text-ai-text-primary"
        : variant === "tertiary" && emphasis
          ? "border-transparent bg-transparent text-ai-blue-primary hover:bg-ai-blue-fill-hover hover:text-ai-blue-hover active:bg-ai-blue-fill-active active:text-ai-blue-hover"
          : variant === "tertiary"
            ? "border-transparent bg-transparent text-ai-text-secondary hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary active:bg-ai-surface-overlay-active active:text-ai-text-primary"
            : variant === "overlay"
              ? "border-transparent bg-ai-border-strong text-ai-text-inverse hover:bg-ai-border-focus active:bg-ai-border-focus active:text-ai-text-inverse-muted"
              : "border-transparent bg-ai-blue-primary text-ai-text-inverse hover:bg-ai-blue-hover active:bg-ai-blue-hover active:text-ai-text-inverse-muted";

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[
        "inline-flex shrink-0 items-center justify-center border transition-[background-color,border-color,color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
        sizeClassName,
        stateClassName,
        className,
      ].join(" ")}
      {...props}
    >
      <span
        aria-hidden="true"
        className={[
          "inline-flex shrink-0 items-center justify-center",
          iconSizeClassName,
          iconClassName,
        ].join(" ")}
      >
        {children}
      </span>
    </button>
  );
}
