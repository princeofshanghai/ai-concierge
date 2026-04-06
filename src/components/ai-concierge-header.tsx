import Image from "next/image";
import type { ReactNode } from "react";
import { Avatar, AVATAR_FALLBACK_SOURCES } from "@/components/avatar";
import { PhoneCallIcon } from "@/components/phone-call-icon";
import { Tooltip } from "@/components/tooltip";

function HeaderIconButton({
  ariaLabel,
  className = "",
  height,
  icon,
  iconSrc,
  onClick,
  pressed,
  tooltipContent,
  width,
}: {
  ariaLabel: string;
  className?: string;
  height: number;
  icon?: ReactNode;
  iconSrc?: string;
  onClick?: () => void;
  pressed?: boolean;
  tooltipContent?: string;
  width: number;
}) {
  const sharedClassName =
    "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-ai-surface-overlay-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary";
  const buttonClassName = [sharedClassName, className].join(" ").trim();
  const iconElement = icon ? (
    <span aria-hidden="true" className="inline-flex">
      {icon}
    </span>
  ) : iconSrc ? (
    <Image
      src={iconSrc}
      alt=""
      width={width}
      height={height}
      aria-hidden="true"
    />
  ) : null;

  if (onClick) {
    const button = (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={pressed}
        onClick={onClick}
        className={buttonClassName}
      >
        {iconElement}
      </button>
    );

    if (tooltipContent) {
      return (
        <Tooltip content={tooltipContent} placement="bottom">
          {button}
        </Tooltip>
      );
    }

    return button;
  }

  return (
    <span aria-hidden="true" className={buttonClassName}>
      {iconElement}
    </span>
  );
}

type AiConciergeHeaderProps = {
  isExpanded: boolean;
  liveAgentName?: string | null;
  onClose: () => void;
  onOpenPhoneCall?: () => void;
  onToggleExpand?: () => void;
  variant?: "default" | "welcome";
};

export function AiConciergeHeader({
  isExpanded,
  liveAgentName = null,
  onClose,
  onOpenPhoneCall,
  onToggleExpand,
  variant = "default",
}: AiConciergeHeaderProps) {
  const isWelcome = variant === "welcome";

  return (
    <header
      className={[
        "flex items-center justify-between overflow-clip pl-5 pr-4 py-4",
        isWelcome
          ? "border-b-0 bg-transparent"
          : "border-b border-ai-divider-strong bg-ai-surface-base",
        isExpanded ? "sm:rounded-t-[32px]" : "sm:rounded-t-[24px]",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <Image
          src="/figma/chat/ai-concierge-icon.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
        {liveAgentName ? (
          <div className="ml-4 flex min-w-0 items-center gap-3">
            <Avatar
              decorative
              fallbackSrc={AVATAR_FALLBACK_SOURCES[0]}
              name={liveAgentName}
              seed="live-sales-representative"
              size={28}
            />
            <p className="ai-type-body-sm-bold truncate text-ai-text-primary">
              Chatting with {liveAgentName}
            </p>
          </div>
        ) : (
          null
        )}
      </div>
      <div className="ml-3 flex items-center gap-1">
        {onOpenPhoneCall ? (
          <HeaderIconButton
            ariaLabel="Continue by phone"
            height={16}
            icon={<PhoneCallIcon className="h-4 w-4" />}
            onClick={onOpenPhoneCall}
            tooltipContent="Request a phone call"
            width={16}
          />
        ) : null}
        {onToggleExpand ? (
          <HeaderIconButton
            ariaLabel={isExpanded ? "Collapse panel" : "Maximize panel"}
            className="hidden sm:flex"
            height={14}
            iconSrc={
              isExpanded
                ? "/figma/chat/minimize.svg"
                : "/figma/chat/maximize.svg"
            }
            onClick={onToggleExpand}
            pressed={isExpanded}
            tooltipContent={isExpanded ? "Collapse" : "Expand"}
            width={14}
          />
        ) : null}
        <HeaderIconButton
          ariaLabel="Close chat"
          height={12}
          iconSrc="/figma/chat/close.svg"
          onClick={onClose}
          width={12}
        />
      </div>
    </header>
  );
}
