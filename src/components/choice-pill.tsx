import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChoicePillProps = {
  children: ReactNode;
  className?: string;
  selected?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function ChoicePill({
  children,
  className = "",
  disabled = false,
  selected = false,
  type = "button",
  ...props
}: ChoicePillProps) {
  const stateClassName = disabled
    ? "border-transparent bg-ai-surface-disabled text-ai-text-disabled"
    : selected
      ? "border-ai-checked-primary bg-ai-checked-primary text-ai-text-inverse hover:border-ai-checked-hover hover:bg-ai-checked-hover hover:text-ai-text-inverse active:border-ai-checked-active active:bg-ai-checked-active active:text-ai-text-inverse-muted"
      : "border-ai-border-subtle bg-ai-surface-base text-ai-text-secondary hover:border-ai-border-subtle-hover hover:bg-ai-surface-overlay-soft hover:text-ai-text-primary hover:ring-1 hover:ring-inset hover:ring-ai-border-subtle-hover active:border-ai-border-subtle-hover active:bg-ai-surface-disabled active:text-ai-text-primary active:ring-0";

  return (
    <button
      type={type}
      aria-pressed={selected}
      disabled={disabled}
      className={[
        "ai-type-heading-sm inline-flex h-8 items-center justify-center rounded-full border px-4 text-center whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
        stateClassName,
        className,
      ].join(" ")}
      {...props}
    >
      <span className="inline-flex min-h-6 items-center justify-center">
        {children}
      </span>
    </button>
  );
}
