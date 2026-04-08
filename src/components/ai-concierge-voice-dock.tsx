"use client";

import Image from "next/image";
import { Avatar } from "@/components/avatar";

export type VoiceModeStatus =
  | "requesting-permission"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "unsupported";

type AiConciergeVoiceDockProps = {
  errorMessage?: string | null;
  isMuted: boolean;
  isPanelExpanded?: boolean;
  onClose: () => void;
  onDoneListening: () => void;
  onRetry: () => void;
  onStopSpeaking: () => void;
  onToggleMute: () => void;
  status: VoiceModeStatus;
  userName?: string;
  userCaption: string;
};

const MAX_VISIBLE_TEXT_HEIGHT = 96;

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
  isMuted,
  isPanelExpanded = false,
  onClose,
  onDoneListening,
  onRetry,
  onStopSpeaking,
  onToggleMute,
  status,
  userName,
  userCaption,
}: AiConciergeVoiceDockProps) {
  const primaryText = getPrimaryText({
    errorMessage,
    status,
    userCaption,
  });
  const isListeningPlaceholder =
    status === "listening" && !userCaption && primaryText !== null;
  const isSpeakerMutedControlVisible = status === "speaking";
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
          "mx-auto w-full",
          isPanelExpanded ? "max-w-[720px]" : "max-w-full",
        ].join(" ")}
      >
        <div
          className={[
            "rounded-[24px] border bg-ai-surface-base px-3 py-3 shadow-[0_8px_24px_rgba(10,102,194,0.08)] transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
            status === "listening" || status === "speaking"
              ? "border-ai-blue-border-soft shadow-[0_0_0_3px_var(--ai-blue-focus-ring)]"
              : status === "thinking"
                ? "border-ai-border-strong shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
                : "border-ai-border-faint",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <VoiceStageBadge status={status} userName={userName} />
            {primaryText ? (
              <div className="min-w-0 flex flex-1 items-center" aria-live="polite">
                <p
                  className={[
                    "ai-type-body-md-open min-w-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words pr-1",
                    isListeningPlaceholder
                      ? "text-ai-text-disabled"
                      : "text-ai-text-primary",
                  ].join(" ")}
                  style={{ maxHeight: `${MAX_VISIBLE_TEXT_HEIGHT}px` }}
                >
                  {primaryText}
                </p>
              </div>
            ) : (
              <div className="flex-1" />
            )}
            <div className="flex shrink-0 items-center gap-1.5">
              {isSpeakerMutedControlVisible ? (
                <button
                  type="button"
                  onClick={onToggleMute}
                  aria-label={isMuted ? "Unmute voice playback" : "Mute voice playback"}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
                    isMuted
                      ? "bg-ai-surface-overlay-active text-ai-text-primary"
                      : "bg-ai-surface-overlay-soft text-ai-text-secondary hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="block">
                    {isMuted ? <SpeakerMutedIcon /> : <SpeakerIcon />}
                  </span>
                </button>
              ) : null}
              {primaryAction ? (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="ai-type-heading-md inline-flex h-8 items-center rounded-full bg-ai-surface-overlay-soft px-3 text-ai-text-primary transition-colors hover:bg-ai-surface-overlay-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary"
                >
                  {primaryAction.label}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                aria-label="End voice mode"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ai-surface-overlay-soft text-ai-text-secondary transition-colors hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary"
              >
                <span aria-hidden="true" className="block">
                  <CloseIcon />
                </span>
              </button>
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
  const isUserTurn =
    status === "listening" ||
    status === "requesting-permission" ||
    status === "error";
  const isSpeakerPulseVisible =
    status === "listening" || status === "speaking";
  const isAssistantSpeaking = status === "speaking";
  const isAssistantThinking = status === "thinking";

  return (
    <div
      className="relative flex h-10 w-10 shrink-0 items-center justify-center"
      aria-label={STATUS_LABELS[status]}
      role="img"
    >
      <span className="sr-only">{STATUS_LABELS[status]}</span>
      {isSpeakerPulseVisible ? (
        <span className="absolute inset-0 rounded-full border border-ai-blue-border-soft opacity-80 animate-[ai-concierge-voice-pulse_1.9s_ease-out_infinite]" />
      ) : null}
      {isUserTurn ? (
        <Avatar
          decorative
          name={userName || "You"}
          size={36}
          className="relative z-10 border border-white/80 shadow-[0_4px_10px_rgba(10,102,194,0.12)]"
        />
      ) : (
        <span
          className={[
            "relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ai-surface-tint text-ai-blue-primary shadow-[inset_0_0_0_1px_var(--ai-blue-border-subtle)]",
            isAssistantSpeaking
              ? "shadow-[0_4px_12px_rgba(10,102,194,0.16),inset_0_0_0_1px_var(--ai-blue-border-subtle)]"
              : "",
            isAssistantThinking
              ? "animate-[ai-concierge-voice-think_1.6s_ease-in-out_infinite] motion-reduce:animate-none"
              : "",
          ].join(" ")}
        >
          <Image
            src="/figma/chat/ai-concierge-icon.svg"
            alt=""
            width={18}
            height={18}
            aria-hidden="true"
            className="h-[18px] w-[18px]"
          />
        </span>
      )}
    </div>
  );
}

function getPrimaryText({
  errorMessage,
  status,
  userCaption,
}: {
  errorMessage?: string | null;
  status: VoiceModeStatus;
  userCaption: string;
}): string | null {
  if (status === "listening") {
    return userCaption || "Speak naturally";
  }

  if (status === "thinking") {
    return userCaption || "Thinking...";
  }

  if (status === "speaking") {
    return null;
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
      label: "Done",
      onClick: onDoneListening,
    };
  }

  if (status === "speaking") {
    return {
      label: "Stop",
      onClick: onStopSpeaking,
    };
  }

  if (status === "error") {
    return {
      label: "Retry",
      onClick: onRetry,
    };
  }

  return null;
}

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 5.23C14 4.34 12.92 3.89 12.29 4.52L8.82 8H6C4.9 8 4 8.9 4 10V14C4 15.1 4.9 16 6 16H8.82L12.29 19.48C12.92 20.11 14 19.66 14 18.77V5.23ZM16.5 9.5C17.38 10.38 17.88 11.57 17.88 12.81C17.88 14.05 17.38 15.24 16.5 16.12M18.62 7.38C20.06 8.82 20.88 10.77 20.88 12.81C20.88 14.85 20.06 16.8 18.62 18.24"
        fill="currentColor"
        fillOpacity="0.78"
      />
    </svg>
  );
}

function SpeakerMutedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 5.23C14 4.34 12.92 3.89 12.29 4.52L8.82 8H6C4.9 8 4 8.9 4 10V14C4 15.1 4.9 16 6 16H8.82L12.29 19.48C12.92 20.11 14 19.66 14 18.77V5.23ZM18.59 8L17.17 9.41L19.05 11.29L17.17 13.17L18.59 14.59L20.46 12.71L22.34 14.59L23.76 13.17L21.88 11.29L23.76 9.41L22.34 8L20.46 9.88L18.59 8Z"
        fill="currentColor"
        fillOpacity="0.78"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 3L11 11M11 3L3 11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
