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
  showDictationAction?: boolean;
  showVoiceModeAction?: boolean;
};

const MAX_VISIBLE_LINES = 4;
const TEXTAREA_LINE_HEIGHT = 24;

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.1213 9.12132C9.55871 9.68393 8.79565 10 8 10C7.20435 10 6.44129 9.68393 5.87868 9.12132C5.31607 8.55871 5 7.79565 5 7V4C5 3.20435 5.31607 2.44129 5.87868 1.87868C6.44129 1.31607 7.20435 1 8 1C8.79565 1 9.55871 1.31607 10.1213 1.87868C10.6839 2.44129 11 3.20435 11 4V7C11 7.79565 10.6839 8.55871 10.1213 9.12132Z"
        fill="currentColor"
      />
      <path
        d="M12 7V6H13V7C13.0002 8.15265 12.6022 9.26999 11.8733 10.1629C11.1444 11.0558 10.1294 11.6695 9 11.9V13H11V15H5V13H7V11.9C5.87064 11.6695 4.8556 11.0558 4.12669 10.1629C3.39778 9.26999 2.99977 8.15265 3 7V6H4V7C4 8.06087 4.42143 9.07828 5.17157 9.82843C5.92172 10.5786 6.93913 11 8 11C9.06087 11 10.0783 10.5786 10.8284 9.82843C11.5786 9.07828 12 8.06087 12 7Z"
        fill="currentColor"
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
    <svg
      viewBox="0 0 12 18"
      fill="none"
      aria-hidden="true"
      className="h-full w-full"
    >
      <path
        d="M1.5 8V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.75 6.25V11.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 4.5V13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.25 6.25V11.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.5 8V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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
        variant="primary"
        iconClassName="h-5 w-[13px]"
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
  showDictationAction = true,
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
                    "ai-type-body-md-open w-full resize-none bg-transparent pl-1 text-ai-text-primary outline-none",
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
                  {showDictationAction ? (
                    <ComposerIconButton
                      active={isDictating}
                      ariaLabel={
                        isDictating ? "Stop dictation" : "Start dictation"
                      }
                      disabled={disabled}
                      onClick={onToggleDictation}
                    >
                      <MicIcon />
                    </ComposerIconButton>
                  ) : null}
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
