"use client";

type ContactSalesButtonProps = {
  ariaControls?: string;
  ariaExpanded?: boolean;
  className?: string;
  label?: string;
  onClick?: () => void;
  size?: "sm" | "md";
  variant?: "outline" | "solid";
};

const sizeClasses = {
  sm: "px-4 py-[7px] text-[14px] leading-[1.25] tracking-[-0.011em]",
  md: "px-6 py-3 text-[16px] leading-[1.25] tracking-[-0.02em]",
};

const variantClasses = {
  solid:
    "bg-linkedin-blue text-white hover:bg-linkedin-blue-dark focus-visible:outline-linkedin-blue",
  outline:
    "border border-linkedin-blue bg-white text-linkedin-blue hover:bg-[#f3f8fd] focus-visible:outline-linkedin-blue",
};

export function ContactSalesButton({
  ariaControls,
  ariaExpanded,
  className = "",
  label = "Contact sales",
  onClick,
  size = "md",
  variant = "solid",
}: ContactSalesButtonProps) {
  return (
    <button
      type="button"
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      className={[
        "font-panel-text inline-flex cursor-pointer items-center justify-center rounded-full font-semibold whitespace-nowrap transition-colors duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {label}
    </button>
  );
}
