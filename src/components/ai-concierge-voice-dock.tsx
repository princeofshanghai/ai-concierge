"use client";

import Image from "next/image";
import { Button } from "@/components/button";

export type VoiceModeStatus =
  | "requesting-permission"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "unsupported";

type AiConciergeVoiceDockProps = {
  assistantCaption: string;
  errorMessage?: string | null;
  isMuted: boolean;
  isPanelExpanded?: boolean;
  onClose: () => void;
  onRetry: () => void;
  onToggleMute: () => void;
  status: VoiceModeStatus;
  userCaption: string;
};

const STATUS_LABELS: Record<VoiceModeStatus, string> = {
  "requesting-permission": "Connecting microphone",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Voice paused",
  unsupported: "Voice unavailable",
};

export function AiConciergeVoiceDock({
  assistantCaption,
  errorMessage,
  isMuted,
  isPanelExpanded = false,
  onClose,
  onRetry,
  onToggleMute,
  status,
  userCaption,
}: AiConciergeVoiceDockProps) {
  const isRecoverableState = status === "error";
  const primaryText = getPrimaryText({
    assistantCaption,
    errorMessage,
    status,
    userCaption,
  });
  const isListeningPlaceholder = status === "listening" && !userCaption;
  const secondaryText = getSecondaryText({
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
            "rounded-full border bg-ai-surface-base px-3 py-3 shadow-[0_8px_24px_rgba(10,102,194,0.08)] transition-[border-color,box-shadow] duration-150",
            status === "listening" || status === "speaking"
              ? "border-ai-blue-border-soft shadow-[0_0_0_4px_var(--ai-blue-focus-ring)]"
              : "border-ai-border-faint",
          ].join(" ")}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={[
                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ai-surface-tint",
                status === "listening" || status === "speaking"
                  ? "after:absolute after:inset-0 after:rounded-full after:border after:border-ai-blue-border-soft after:animate-[ai-concierge-voice-pulse_1.8s_ease-out_infinite]"
                  : "",
              ].join(" ")}
              aria-label={STATUS_LABELS[status]}
            >
              <span className="sr-only">{STATUS_LABELS[status]}</span>
              <Image
                src="/figma/chat/voice-wave.svg"
                alt=""
                width={20}
                height={22}
                className="relative z-10 opacity-85"
              />
            </div>

            <div
              className="min-w-0 flex flex-1 items-center gap-2"
              aria-live="polite"
            >
              <p
                className={[
                  "ai-type-body-md-open min-w-0 flex-1 truncate",
                  isListeningPlaceholder
                    ? "text-ai-text-disabled"
                    : "text-ai-text-primary",
                ].join(" ")}
              >
                {primaryText}
              </p>
              {secondaryText ? (
                <p className="ai-type-body-xs shrink-0 truncate text-ai-text-meta">
                  {secondaryText}
                </p>
              ) : null}
              {isRecoverableState ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="ai-type-heading-md shrink-0 text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                >
                  Retry
                </button>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? "Unmute voice playback" : "Mute voice playback"}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  isMuted
                    ? "bg-ai-surface-overlay-active text-ai-text-primary"
                    : "bg-ai-surface-overlay-soft text-ai-text-secondary hover:bg-ai-surface-overlay-hover",
                ].join(" ")}
              >
                <span aria-hidden="true" className="block">
                  {isMuted ? <MicOffIcon /> : <MicIcon />}
                </span>
              </button>
              <Button
                size="compact"
                onClick={onClose}
                className="shrink-0"
              >
                End
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPrimaryText({
  assistantCaption,
  errorMessage,
  status,
  userCaption,
}: {
  assistantCaption: string;
  errorMessage?: string | null;
  status: VoiceModeStatus;
  userCaption: string;
}) {
  if (status === "listening") {
    return userCaption || "Speak naturally";
  }

  if (status === "thinking") {
    return userCaption || "Turning what you said into the next reply.";
  }

  if (status === "speaking") {
    return assistantCaption || "Reading the reply out loud.";
  }

  if (status === "requesting-permission") {
    return "Allow microphone access to start a spoken conversation.";
  }

  if (status === "unsupported") {
    return "This browser does not support live voice conversation in this prototype.";
  }

  return errorMessage ?? "I didn't catch that. Try again.";
}

function getSecondaryText({
  status,
}: {
  status: VoiceModeStatus;
}) {
  if (status === "speaking") {
    return "Speaking";
  }

  if (status === "thinking") {
    return "Thinking";
  }

  return null;
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12V6C8 3.8 9.8 2 12 2C14.2 2 16 3.8 16 6V12C16 14.2 14.2 16 12 16C9.8 16 8 14.2 8 12ZM17 10V12C17 14.8 14.8 17 12 17C9.2 17 7 14.8 7 12V10H6V12C6 15 8.2 17.4 11 17.9V20H8V22H16V20H13V17.9C15.8 17.4 18 15 18 12V10H17Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.17 15.05L16.42 14.3C16.795 13.5909 16.994 12.802 17 12V9.99996H18V12C18.0009 13.0725 17.7143 14.1258 17.17 15.05ZM16 12V5.99996C16.0146 4.93909 15.6071 3.91588 14.8673 3.15542C14.1275 2.39496 13.1159 1.95955 12.055 1.94496C10.9941 1.93037 9.97092 2.33781 9.21046 3.07764C8.45 3.81747 8.01459 4.82909 8 5.88996L15.67 13.56C15.8865 13.0683 15.9989 12.5372 16 12ZM15.87 16.58L21.29 22L22 21.29L8 7.28996L2.71 1.99996L2 2.70996L8 8.70996V12C8 13.0608 8.42143 14.0782 9.17157 14.8284C9.92172 15.5785 10.9391 16 12 16C12.8859 15.9997 13.7457 15.7002 14.44 15.15L15.15 15.85C14.2666 16.5896 13.1521 16.9965 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5978 7 13.326 7 12V9.99996H6V12C6.00144 13.4168 6.50425 14.7875 7.41939 15.8692C8.33452 16.9509 9.60294 17.6738 11 17.91V20H8V22H16V20H13V17.91C14.0573 17.7276 15.0474 17.2687 15.87 16.58Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}
