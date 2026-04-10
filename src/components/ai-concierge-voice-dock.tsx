"use client";

import Image from "next/image";
import { Avatar } from "@/components/avatar";
import { CloseIcon } from "@/components/close-icon";
import { IconButton } from "@/components/icon-button";
import { Tooltip } from "@/components/tooltip";

export type VoiceModeStatus =
  | "requesting-permission"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "unsupported";

type AiConciergeVoiceDockProps = {
  errorMessage?: string | null;
  isPanelExpanded?: boolean;
  onClose: () => void;
  onDoneListening: () => void;
  onRetry: () => void;
  onStopSpeaking: () => void;
  status: VoiceModeStatus;
  userName?: string;
};

const STATUS_LABELS: Record<VoiceModeStatus, string> = {
  "requesting-permission": "Preparing your turn",
  listening: "Your turn",
  thinking: "Assistant is thinking",
  speaking: "Assistant is speaking",
  error: "Voice paused",
  unsupported: "Voice unavailable",
};

export function AiConciergeVoiceDock({
  errorMessage,
  isPanelExpanded = false,
  onClose,
  onDoneListening,
  onRetry,
  onStopSpeaking,
  status,
  userName,
}: AiConciergeVoiceDockProps) {
  const statusAnnouncement = getStatusAnnouncement({
    errorMessage,
    status,
  });
  const isLiveTurn = status === "listening" || status === "speaking";
  const primaryAction = getPrimaryAction({
    onDoneListening,
    onRetry,
    onStopSpeaking,
    status,
  });

  return (
    <div className="px-5 pb-5 pt-0">
      <div
        className={[
          "relative mx-auto w-fit max-w-full",
        ].join(" ")}
      >
        {isLiveTurn ? (
          <span
            aria-hidden="true"
            className="ai-premium-gradient-pill-pulse pointer-events-none absolute -inset-[6px] rounded-full animate-[ai-concierge-voice-shell-pulse_1.9s_cubic-bezier(0.33,0,0.2,1)_infinite] motion-reduce:animate-none motion-reduce:opacity-45"
          />
        ) : null}
        <div
          className={[
            "ai-premium-gradient-frame relative z-10 rounded-full p-px transition-[box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
            status === "listening" || status === "speaking"
              ? "shadow-[0_14px_34px_rgba(15,23,42,0.12),0_3px_10px_rgba(15,23,42,0.05)]"
              : status === "thinking"
                ? "shadow-[0_12px_28px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.04)]"
                : "shadow-[0_10px_24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)]",
          ].join(" ")}
        >
          <div className="rounded-full bg-ai-surface-base px-[3px] py-[3px]">
            <p className="sr-only" aria-live="polite">
              {statusAnnouncement}
            </p>
            <div
              className={[
                "grid min-h-12 items-center gap-0",
                isPanelExpanded
                  ? "grid-cols-[48px_60px_48px]"
                  : "grid-cols-[48px_56px_48px]",
              ].join(" ")}
            >
              <div className="flex min-w-0 justify-start">
                <Tooltip content="Exit voice mode">
                  <IconButton
                    onClick={onClose}
                    ariaLabel="Exit voice mode"
                    emphasis={false}
                    variant="tertiary"
                    className="rounded-full"
                    iconClassName="h-5 w-5"
                    size="medium"
                  >
                    <CloseIcon className="h-full w-full" />
                  </IconButton>
                </Tooltip>
              </div>
              <div className="flex items-center justify-center">
                <VoiceStageBadge status={status} userName={userName} />
              </div>
              <div className="flex min-w-0 justify-end">
                {primaryAction ? (
                  <Tooltip content={primaryAction.tooltip}>
                    <IconButton
                      onClick={primaryAction.onClick}
                    ariaLabel={primaryAction.tooltip}
                    emphasis={false}
                    variant="tertiary"
                    className="rounded-full"
                    iconClassName="h-[22px] w-[22px]"
                    size="medium"
                  >
                    {primaryAction.icon}
                  </IconButton>
                </Tooltip>
              ) : (
                  <span aria-hidden="true" className="block h-12 w-12" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceStageBadge({
  status,
  userName,
}: {
  status: VoiceModeStatus;
  userName?: string;
}) {
  const isPreparingTurn = status === "requesting-permission";
  const isUserTurn = status === "listening" || status === "error";
  const isAssistantSpeaking = status === "speaking";

  return (
    <div
      className="relative flex h-10 w-10 shrink-0 items-center justify-center"
      aria-label={STATUS_LABELS[status]}
      role="img"
    >
      <span className="sr-only">{STATUS_LABELS[status]}</span>
      {isPreparingTurn ? (
        <span className="ai-premium-gradient-frame relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-ai-text-inverse shadow-[0_8px_18px_rgba(10,102,194,0.18)]">
          <VoicePrepIcon />
        </span>
      ) : isUserTurn ? (
        <Avatar
          decorative
          name={userName || "You"}
          size={36}
          className="relative z-10 border border-white/80 shadow-[0_4px_10px_rgba(10,102,194,0.12)]"
        />
      ) : (
        <span
          className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/75 bg-[#f1f4f8] shadow-[0_4px_10px_rgba(15,23,42,0.05),inset_0_0_0_1px_var(--ai-divider)]"
        >
          <Image
            src="/figma/chat/ai-concierge-icon.svg"
            alt=""
            width={isAssistantSpeaking ? 20 : 16}
            height={isAssistantSpeaking ? 20 : 16}
            aria-hidden="true"
            className={isAssistantSpeaking ? "h-5 w-5" : "h-4 w-4"}
          />
        </span>
      )}
    </div>
  );
}

function VoicePrepIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M2 10V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 3V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 5V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 10V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getStatusAnnouncement({
  errorMessage,
  status,
}: {
  errorMessage?: string | null;
  status: VoiceModeStatus;
}) {
  if (status === "listening" || status === "thinking" || status === "speaking") {
    return STATUS_LABELS[status];
  }

  if (status === "requesting-permission") {
    return "Turn on your mic to reply.";
  }

  if (status === "unsupported") {
    return "Voice isn't available in this browser.";
  }

  return errorMessage ?? "I didn't catch that. Try again.";
}

function getPrimaryAction({
  onDoneListening,
  onRetry,
  onStopSpeaking,
  status,
}: {
  onDoneListening: () => void;
  onRetry: () => void;
  onStopSpeaking: () => void;
  status: VoiceModeStatus;
}) {
  if (status === "listening") {
    return {
      icon: <DoneIcon />,
      onClick: onDoneListening,
      tooltip: "Done speaking",
    };
  }

  if (status === "speaking") {
    return {
      icon: <StopPlaybackIcon />,
      onClick: onStopSpeaking,
      tooltip: "Stop reply",
    };
  }

  if (status === "error") {
    return {
      icon: <RetryIcon />,
      onClick: onRetry,
      tooltip: "Try again",
    };
  }

  return null;
}

function DoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden="true">
      <path
        d="M18.6 4L9.7 16.9L5.4 12.6L4 14L10 20L21 4H18.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StopPlaybackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden="true">
      <path d="M20 4H4V20H20V4Z" fill="currentColor" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden="true">
      <path
        d="M12 3L10 0H12.4L15 4L12.4 8H10L12 5C8.2 5 5 8.2 5 12C5 15.9 8.1 19 12 19C15.9 19 19 15.9 19 12C19 10.5 18.5 9.1 17.7 8H20.1C20.7 9.2 21 10.6 21 12C21 17 17 21 12 21C7 21 3 17 3 12C3 7 7 3 12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}
