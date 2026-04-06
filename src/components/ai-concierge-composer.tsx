"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { IconButton } from "@/components/icon-button";
import { Tooltip } from "@/components/tooltip";

type AiConciergeComposerProps = {
  disabledPlaceholder?: string;
  disabled?: boolean;
  draft: string;
  dictateStatusMessage?: string | null;
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
        rx="2"
        fill="currentColor"
      />
    </svg>
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
    <svg width="18" height="20" viewBox="0 0 20 22" fill="none">
      <path
        d="M5.89967 8.89881C5.89967 8.5123 5.58634 8.19897 5.19983 8.19897C4.81333 8.19897 4.5 8.5123 4.5 8.89881V13.0978C4.5 13.4843 4.81333 13.7976 5.19983 13.7976C5.58634 13.7976 5.89967 13.4843 5.89967 13.0978V8.89881Z"
        fill="currentColor"
      />
      <path
        d="M8.29933 6.79932C8.29933 6.41281 7.986 6.09949 7.59949 6.09949C7.21298 6.09949 6.89966 6.41281 6.89966 6.79932V15.1973C6.89966 15.5838 7.21298 15.8972 7.59949 15.8972C7.986 15.8972 8.29933 15.5838 8.29933 15.1973V6.79932Z"
        fill="currentColor"
      />
      <path
        d="M10.699 4.69983C10.699 4.31333 10.3857 4 9.99915 4C9.61264 4 9.29932 4.31333 9.29932 4.69983V17.2968C9.29932 17.6833 9.61264 17.9967 9.99915 17.9967C10.3857 17.9967 10.699 17.6833 10.699 17.2968V4.69983Z"
        fill="currentColor"
      />
      <path
        d="M13.0986 6.79932C13.0986 6.41281 12.7853 6.09949 12.3988 6.09949C12.0123 6.09949 11.699 6.41281 11.699 6.79932V15.1973C11.699 15.5838 12.0123 15.8972 12.3988 15.8972C12.7853 15.8972 13.0986 15.5838 13.0986 15.1973V6.79932Z"
        fill="currentColor"
      />
      <path
        d="M15.4983 8.89881C15.4983 8.5123 15.185 8.19897 14.7985 8.19897C14.412 8.19897 14.0986 8.5123 14.0986 8.89881V13.0978C14.0986 13.4843 14.412 13.7976 14.7985 13.7976C15.185 13.7976 15.4983 13.4843 15.4983 13.0978V8.89881Z"
        fill="currentColor"
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
  isResponding,
  onSend,
  onStopResponse,
  onStartVoiceMode,
  showVoiceModeAction,
}: {
  disabled: boolean;
  hasText: boolean;
  isResponding: boolean;
  onSend: () => void;
  onStopResponse: () => void;
  onStartVoiceMode: () => void;
  showVoiceModeAction: boolean;
}) {
  if (isResponding) {
    return (
      <IconButton
        ariaLabel="Stop response"
        onClick={onStopResponse}
        size="small"
        variant="tertiary"
        className="h-8 w-8 rounded-full border-transparent bg-ai-surface-overlay-soft text-ai-text-secondary hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary active:bg-ai-surface-overlay-active active:text-ai-text-primary"
        iconClassName="h-3 w-3"
      >
        <StopIcon />
      </IconButton>
    );
  }

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
        variant="primary"
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
  dictateStatusMessage = null,
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

    if (!isExpanded) {
      textarea.style.height = `${TEXTAREA_LINE_HEIGHT}px`;
      textarea.style.overflowY = "hidden";
      return;
    }

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${Math.max(nextHeight, TEXTAREA_LINE_HEIGHT)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [draft, hasText, isExpanded]);

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
    setIsFocused(true);
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
              isExpanded
                ? "rounded-[24px] border-ai-border-strong"
                : isFocused
                  ? "rounded-full border-ai-border-focus"
                  : "rounded-full border-ai-border-faint",
            ].join(" ")}
          >
            <div
              className={[
                "flex",
                isExpanded ? "flex-col gap-2" : "items-center gap-4",
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
                    : dictateStatusMessage && !draft.trim().length
                      ? dictateStatusMessage
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
                  isExpanded ? "min-h-[24px]" : "h-6 overflow-hidden",
                ].join(" ")}
              />
              <div
                className={[
                  "flex items-center gap-1",
                  isExpanded ? "justify-end" : "",
                ].join(" ")}
              >
                {!isResponding ? (
                  <ComposerIconButton
                    active={isDictating}
                    ariaLabel={isDictating ? "Stop dictation" : "Start dictation"}
                    disabled={disabled}
                    onClick={onToggleDictation}
                  >
                    <MicIcon />
                  </ComposerIconButton>
                ) : null}
                <ComposerPrimaryActionButton
                  disabled={disabled}
                  hasText={hasText}
                  isResponding={isResponding}
                  onSend={handleSend}
                  onStopResponse={onStopResponse}
                  onStartVoiceMode={onStartVoiceMode}
                  showVoiceModeAction={showVoiceModeAction}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
