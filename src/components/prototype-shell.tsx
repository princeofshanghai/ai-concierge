import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  HTMLAttributes,
  ReactNode,
} from "react";

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(" ");
}

const shellCardClassName =
  "rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,28,41,0.98)_0%,rgba(8,13,23,0.94)_100%)] p-2.5 text-white shadow-[0_16px_40px_rgba(2,6,23,0.34)] backdrop-blur-md";

const shellLabelClassName =
  "font-panel-text px-2 pb-2 text-[10px] leading-none font-semibold text-white/60";

const shellChipTypographyClassName =
  "font-panel-text inline-flex min-h-10 items-center justify-center whitespace-nowrap text-[13px] leading-none font-semibold";

const shellChipInteractionClassName =
  "rounded-full border px-4 transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

const shellChipDefaultClassName =
  "border-transparent bg-white/[0.08] text-white/78 hover:bg-white/[0.14] hover:text-white";

const shellChipSelectedClassName =
  "border-white/[0.12] bg-[linear-gradient(180deg,#f8fafc_0%,#dbe4f3_100%)] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]";

const shellActionButtonClassName =
  "font-panel-text inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.08] px-4 text-[13px] leading-none font-semibold text-white transition-[background-color,border-color,color,box-shadow] duration-150 hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

type PrototypeShellCardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function PrototypeShellCard({
  children,
  className = "",
  ...props
}: PrototypeShellCardProps) {
  return (
    <div className={joinClassNames(shellCardClassName, className)} {...props}>
      {children}
    </div>
  );
}

type PrototypeShellLabelProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLParagraphElement>;

export function PrototypeShellLabel({
  children,
  className = "",
  ...props
}: PrototypeShellLabelProps) {
  return (
    <p className={joinClassNames(shellLabelClassName, className)} {...props}>
      {children}
    </p>
  );
}

type PrototypeShellChipRowProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function PrototypeShellChipRow({
  children,
  className = "",
  ...props
}: PrototypeShellChipRowProps) {
  return (
    <div
      className={joinClassNames("flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

type PrototypeShellChipProps = {
  children: ReactNode;
  className?: string;
  selected?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function PrototypeShellChip({
  children,
  className = "",
  selected = false,
  type = "button",
  ...props
}: PrototypeShellChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={joinClassNames(
        shellChipTypographyClassName,
        shellChipInteractionClassName,
        selected ? shellChipSelectedClassName : shellChipDefaultClassName,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type PrototypeShellLinkChipProps = {
  children: ReactNode;
  className?: string;
  selected?: boolean;
} & Omit<ComponentProps<typeof Link>, "children" | "className">;

export function PrototypeShellLinkChip({
  children,
  className = "",
  selected = false,
  ...props
}: PrototypeShellLinkChipProps) {
  return (
    <Link
      className={joinClassNames(
        shellChipTypographyClassName,
        shellChipInteractionClassName,
        selected ? shellChipSelectedClassName : shellChipDefaultClassName,
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

type PrototypeShellActionButtonProps = {
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function PrototypeShellActionButton({
  children,
  className = "",
  type = "button",
  ...props
}: PrototypeShellActionButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(shellActionButtonClassName, className)}
      {...props}
    >
      {children}
    </button>
  );
}

type PrototypeShellSwitcherProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

export function PrototypeShellSwitcher({
  children,
  className = "",
  label = "Views",
}: PrototypeShellSwitcherProps) {
  return (
    <PrototypeShellCard className={className}>
      <PrototypeShellLabel>{label}</PrototypeShellLabel>
      <PrototypeShellChipRow>{children}</PrototypeShellChipRow>
    </PrototypeShellCard>
  );
}
