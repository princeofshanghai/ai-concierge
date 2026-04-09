"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { IconButton } from "@/components/icon-button";
import { Tooltip } from "@/components/tooltip";

type AiConciergeComposerProps = {
  disabledPlaceholder?: string;
  disabled?: boolean;
  draft: string;
  focusComposerSignal?: number;
  isDictating?: boolean;
  isPanelExpanded?: boolean;
  isResponding?: boolean;
  idlePlaceholder?: string;
  onDraftChange: (draft: string) => void;
  onSend: (message: string) => void;
  onToggleDictation: () => void;
  onStopResponse: () => void;
  onStartVoiceMode: () => void;
  showVoiceModeAction?: boolean;
};

const MAX_VISIBLE_LINES = 4;
const TEXTAREA_LINE_HEIGHT = 24;

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12V6C8 3.8 9.8 2 12 2C14.2 2 16 3.8 16 6V12C16 14.2 14.2 16 12 16C9.8 16 8 14.2 8 12ZM17 10V12C17 14.8 14.8 17 12 17C9.2 17 7 14.8 7 12V10H6V12C6 15 8.2 17.4 11 17.9V20H8V22H16V20H13V17.9C15.8 17.4 18 15 18 12V10H17Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
      <path
        d="M5 11.75V1.75M5 1.75L1.5 5.25M5 1.75L8.5 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect
        x="1"
        y="1"
        width="10"
        height="10"
        rx="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

function StopSpinnerIcon() {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="ai-concierge-stop-answering-spinner absolute inset-0 h-full w-full"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          className="ai-concierge-stop-answering-spinner__arc"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="14 46"
          opacity="0.95"
        />
      </svg>
      <span className="relative z-10 inline-flex h-3 w-3 items-center justify-center">
        <StopIcon />
      </span>
    </span>
  );
}

function ComposerRespondingState({
  onStopResponse,
}: {
  onStopResponse: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-end">
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="ai-type-body-md-open min-w-0 truncate text-right text-ai-text-primary">
          Stop answering
        </span>
        <IconButton
          ariaLabel="Stop response"
          onClick={onStopResponse}
          size="small"
          variant="tertiary"
          className="h-8 w-8 rounded-full border-transparent bg-transparent p-0 text-ai-text-primary hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary active:bg-ai-surface-overlay-active active:text-ai-text-primary"
          iconClassName="h-7 w-7"
        >
          <StopSpinnerIcon />
        </IconButton>
      </div>
    </div>
  );
}

function ComposerSendButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <IconButton
      ariaLabel="Send message"
      disabled={disabled}
      onClick={onClick}
      size="small"
      variant="primary"
      iconClassName="translate-y-[-0.5px]"
    >
      <SendIcon />
    </IconButton>
  );
}

function VoiceWaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

function ComposerIconButton({
  active = false,
  ariaLabel,
  children,
  disabled = false,
  onClick,
}: {
  active?: boolean;
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip content="Dictate">
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
          disabled
            ? "cursor-default bg-ai-surface-overlay-active text-ai-text-disabled"
            : active
              ? "bg-ai-blue-fill-hover text-ai-blue-primary hover:bg-ai-blue-fill-active"
              : "text-ai-text-secondary hover:bg-ai-surface-overlay-hover",
        ].join(" ")}
      >
        <span aria-hidden="true">{children}</span>
      </button>
    </Tooltip>
  );
}

function ComposerPrimaryActionButton({
  disabled,
  hasText,
  onSend,
  onStartVoiceMode,
  showVoiceModeAction,
}: {
  disabled: boolean;
  hasText: boolean;
  onSend: () => void;
  onStartVoiceMode: () => void;
  showVoiceModeAction: boolean;
}) {
  if (hasText) {
    return <ComposerSendButton disabled={disabled} onClick={onSend} />;
  }

  if (!showVoiceModeAction) {
    return <ComposerSendButton disabled onClick={onSend} />;
  }

  return (
    <Tooltip content="Voice mode">
      <IconButton
        ariaLabel="Start voice conversation"
        disabled={disabled}
        onClick={onStartVoiceMode}
        size="small"
        variant="premium"
        iconClassName="h-[18px] w-[18px]"
      >
        <VoiceWaveIcon />
      </IconButton>
    </Tooltip>
  );
}

export function AiConciergeComposer({
  disabledPlaceholder = "Responding...",
  disabled = false,
  draft,
  focusComposerSignal = 0,
  isDictating = false,
  isPanelExpanded = false,
  isResponding = false,
  idlePlaceholder = "Type your message",
  onDraftChange,
  onSend,
  onToggleDictation,
  onStopResponse,
  onStartVoiceMode,
  showVoiceModeAction = true,
}: AiConciergeComposerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previousFocusComposerSignalRef = useRef(focusComposerSignal);
  const hasText = draft.trim().length > 0;
  const isShowingRespondingState = isResponding;
  const isComposerExpanded = isShowingRespondingState ? false : isExpanded;
  const isComposerFocused = isShowingRespondingState ? false : isFocused;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const maxHeight = TEXTAREA_LINE_HEIGHT * MAX_VISIBLE_LINES;

    if (!hasText) {
      textarea.style.height = `${TEXTAREA_LINE_HEIGHT}px`;
      textarea.style.overflowY = "hidden";
      return;
    }

    if (!isComposerExpanded) {
      textarea.style.height = `${TEXTAREA_LINE_HEIGHT}px`;
      textarea.style.overflowY = "hidden";
      return;
    }

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${Math.max(nextHeight, TEXTAREA_LINE_HEIGHT)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [draft, hasText, isComposerExpanded]);

  useLayoutEffect(() => {
    if (focusComposerSignal === previousFocusComposerSignalRef.current) {
      return;
    }
    previousFocusComposerSignalRef.current = focusComposerSignal;

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    requestAnimationFrame(() => {
      const activeTextarea = textareaRef.current;
      if (!activeTextarea) {
        return;
      }

      activeTextarea.focus();
      const nextPosition = activeTextarea.value.length;
      activeTextarea.setSelectionRange(nextPosition, nextPosition);

      const nextIsExpanded =
        activeTextarea.scrollHeight > TEXTAREA_LINE_HEIGHT + 1 ||
        activeTextarea.value.includes("\n");
      setIsExpanded(nextIsExpanded);
      setIsFocused(true);
    });
  }, [focusComposerSignal]);

  const handleSend = () => {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft) {
      return;
    }

    onSend(trimmedDraft);
    onDraftChange("");
    setIsFocused(false);
    setIsExpanded(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleDraftChange = (
    value: string,
    textarea: HTMLTextAreaElement,
  ) => {
    onDraftChange(value);

    if (value.length === 0) {
      setIsExpanded(false);
      return;
    }

    const isOverflowingCollapsedLine =
      textarea.scrollHeight > TEXTAREA_LINE_HEIGHT + 1 || value.includes("\n");

    if (isOverflowingCollapsedLine) {
      setIsExpanded(true);
    }
  };

  return (
    <div className="px-5 pb-5 pt-0">
      <div
        className={[
          "mx-auto w-full",
          isPanelExpanded ? "max-w-[720px]" : "max-w-full",
        ].join(" ")}
      >
        <div className="relative w-full">
          <div
            className={[
              "border bg-ai-surface-base px-3 py-3 transition-[border-radius,border-color,box-shadow] duration-150",
              isShowingRespondingState
                ? "rounded-full border-ai-border-faint"
                : isComposerExpanded
                  ? "rounded-[24px] border-ai-border-strong"
                  : isComposerFocused
                  ? "rounded-full border-ai-border-focus"
                  : "rounded-full border-ai-border-faint",
            ].join(" ")}
          >
            {isShowingRespondingState ? (
              <ComposerRespondingState onStopResponse={onStopResponse} />
            ) : (
              <div
                className={[
                  "flex",
                  isComposerExpanded ? "flex-col gap-2" : "items-center gap-4",
                ].join(" ")}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  disabled={disabled}
                  value={draft}
                  onChange={(event) =>
                    handleDraftChange(event.target.value, event.currentTarget)
                  }
                  onFocus={() => {
                    setIsFocused(true);
                  }}
                  onBlur={() => {
                    setIsFocused(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    disabled
                      ? disabledPlaceholder
                      : isDictating
                          ? "Listening..."
                          : isFocused
                            ? ""
                            : idlePlaceholder
                  }
                  aria-label="Message"
                  className={[
                    "ai-type-body-md-open w-full resize-none bg-transparent text-ai-text-primary outline-none",
                    disabled
                      ? "cursor-not-allowed placeholder:text-ai-text-placeholder"
                      : "placeholder:text-ai-text-disabled",
                    isComposerExpanded ? "min-h-[24px]" : "h-6 overflow-hidden",
                  ].join(" ")}
                />
                <div
                  className={[
                    "flex items-center gap-1",
                    isComposerExpanded ? "justify-end" : "",
                  ].join(" ")}
                >
                  <ComposerIconButton
                    active={isDictating}
                    ariaLabel={isDictating ? "Stop dictation" : "Start dictation"}
                    disabled={disabled}
                    onClick={onToggleDictation}
                  >
                    <MicIcon />
                  </ComposerIconButton>
                  <ComposerPrimaryActionButton
                    disabled={disabled}
                    hasText={hasText}
                    onSend={handleSend}
                    onStartVoiceMode={onStartVoiceMode}
                    showVoiceModeAction={showVoiceModeAction}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
