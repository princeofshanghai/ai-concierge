import type { ReactNode } from "react";
import { Button } from "@/components/button";

type ContactSalesButtonProps = {
  ariaControls?: string;
  ariaExpanded?: boolean;
  className?: string;
  label?: string;
  leadingIcon?: ReactNode;
  onClick?: () => void;
  size?: "sm" | "md";
  variant?: "outline" | "solid";
};

export function ContactSalesButton({
  ariaControls,
  ariaExpanded,
  className = "",
  label = "Contact sales",
  leadingIcon,
  onClick,
  size = "md",
  variant = "solid",
}: ContactSalesButtonProps) {
  return (
    <Button
      type="button"
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      leadingVisual={leadingIcon}
      size={size === "sm" ? "small" : "medium"}
      variant={variant === "outline" ? "secondary" : "primary"}
      className={["whitespace-nowrap", className].join(" ").trim()}
    >
      {label}
    </Button>
  );
}
