import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "compact" | "small" | "medium";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  emphasis?: boolean;
  fullWidth?: boolean;
  leadingVisual?: ReactNode;
  size?: ButtonSize;
  trailingVisual?: ReactNode;
  variant?: ButtonVariant;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function Button({
  children,
  className = "",
  disabled = false,
  emphasis = true,
  fullWidth = false,
  leadingVisual,
  onClick,
  size = "medium",
  trailingVisual,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const hasLeadingVisual = leadingVisual !== undefined;
  const hasTrailingVisual = trailingVisual !== undefined;
  const hasVisual = hasLeadingVisual || hasTrailingVisual;

  const sizeClassName =
    size === "compact"
      ? [
          "ai-type-heading-sm h-8 px-4",
          hasVisual ? "gap-2" : "",
        ]
          .filter(Boolean)
          .join(" ")
      : size === "small"
      ? [
          "ai-type-heading-sm min-h-12 px-4 py-[7px]",
          hasVisual ? "gap-2" : "",
        ]
          .filter(Boolean)
          .join(" ")
      : [
          fullWidth ? "min-h-12 px-4 py-[7px]" : "min-h-12 px-6 py-3",
          "ai-type-heading-md",
          hasVisual ? "gap-2" : "",
        ]
          .filter(Boolean)
          .join(" ");
  const radiusClassName = size === "compact" ? "rounded-[16px]" : "rounded-[24px]";

  const isBrandEmphasis = emphasis;
  const stateClassName = disabled
    ? "border-transparent bg-ai-surface-disabled text-ai-text-disabled"
    : variant === "secondary" && isBrandEmphasis
      ? "border border-ai-blue-primary bg-transparent text-ai-blue-primary hover:border-ai-blue-hover hover:bg-ai-blue-fill-hover hover:text-ai-blue-hover hover:ring-1 hover:ring-inset hover:ring-ai-blue-hover active:border-ai-blue-hover active:bg-ai-blue-fill-active active:text-ai-blue-hover active:ring-0"
      : variant === "secondary"
        ? "border border-ai-border-strong bg-transparent text-ai-text-secondary hover:border-ai-border-focus hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary hover:ring-1 hover:ring-inset hover:ring-ai-border-focus active:border-ai-border-focus active:bg-ai-surface-overlay-active active:text-ai-text-primary active:ring-0"
        : variant === "tertiary" && isBrandEmphasis
        ? "border-transparent bg-transparent text-ai-blue-primary hover:bg-ai-blue-fill-hover hover:text-ai-blue-hover active:bg-ai-blue-fill-active active:text-ai-blue-hover"
        : variant === "tertiary"
          ? "border-transparent bg-transparent text-ai-text-secondary hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary active:bg-ai-surface-overlay-active active:text-ai-text-primary"
        : "border-transparent bg-ai-blue-primary text-ai-text-inverse hover:bg-ai-blue-hover active:bg-ai-blue-hover active:text-ai-text-inverse-muted";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center border text-center transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
        fullWidth ? "w-full" : "",
        radiusClassName,
        sizeClassName,
        stateClassName,
        className,
      ].join(" ")}
      {...props}
    >
      {leadingVisual ? (
        <span className="inline-flex shrink-0 items-center justify-center">
          {leadingVisual}
        </span>
      ) : null}
      <span className="min-w-0 whitespace-normal">{children}</span>
      {trailingVisual ? (
        <span className="inline-flex shrink-0 items-center justify-center">
          {trailingVisual}
        </span>
      ) : null}
    </button>
  );
}
