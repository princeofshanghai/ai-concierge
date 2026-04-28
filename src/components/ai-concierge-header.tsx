import Image from "next/image";
import type { ReactNode } from "react";
import { AiConciergeSignalIcon } from "@/components/ai-concierge-signal-icon";
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
  recommendationAvatarFallbackSrc?: string;
  recommendationAvatarName?: string;
  recommendationTitle?: string;
  variant?: "default" | "welcome";
};

export function AiConciergeHeader({
  isExpanded,
  liveAgentName = null,
  onClose,
  onOpenPhoneCall,
  onToggleExpand,
  recommendationAvatarFallbackSrc,
  recommendationAvatarName,
  recommendationTitle,
  variant = "default",
}: AiConciergeHeaderProps) {
  const isWelcome = variant === "welcome";
  const shouldShowRecommendationHeader =
    !liveAgentName && Boolean(recommendationTitle);

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
        {shouldShowRecommendationHeader ? (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              decorative
              fallbackSrc={recommendationAvatarFallbackSrc}
              name={recommendationAvatarName}
              size={28}
            />
            <p className="ai-type-body-sm-bold truncate text-ai-text-primary">
              {recommendationTitle}
            </p>
          </div>
        ) : (
          <AiConciergeSignalIcon className="h-6 w-6 text-ai-blue-primary" />
        )}
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
            className="hidden text-ai-icon-active sm:flex"
            height={14}
            icon={
              isExpanded ? (
                <MinimizePanelIcon className="h-4 w-4" />
              ) : (
                <MaximizePanelIcon className="h-4 w-4" />
              )
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
          className="text-ai-icon-active"
          icon={<HeaderCloseIcon className="h-4 w-4" />}
          onClick={onClose}
          width={12}
        />
      </div>
    </header>
  );
}

function MinimizePanelIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={["shrink-0", className].filter(Boolean).join(" ")}
    >
      <path
        d="M5 1H7V7H1V5H3.6L0 1.4L1.4 0L5 3.6V1ZM12.4 11H15V9H9V15H11V12.4L14.6 16L16 14.6L12.4 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MaximizePanelIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={["shrink-0", className].filter(Boolean).join(" ")}
    >
      <path
        d="M8 6.6L6.6 8L3 4.4V7H1V1H7V3H4.4L8 6.6ZM13 9V11.6L9.4 8L8 9.4L11.6 13H9V15H15V9H13Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeaderCloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={["shrink-0", className].filter(Boolean).join(" ")}
    >
      <path
        d="M12.6 2L8 6.6L3.4 2L2 3.4L6.6 8L2 12.6L3.4 14L8 9.4L12.6 14L14 12.6L9.4 8L14 3.4L12.6 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
