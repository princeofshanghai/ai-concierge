"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import type { AiConciergeSuggestedReply } from "@/components/ai-concierge-body";

type AiConciergeComposerProps = {
  disabled?: boolean;
  isPanelExpanded?: boolean;
  onSend: (message: string) => void;
  suggestedReplies?: AiConciergeSuggestedReply[];
};

const MAX_VISIBLE_LINES = 4;
const TEXTAREA_LINE_HEIGHT = 24;

function ComposerIconButton({
  ariaLabel,
  children,
  disabled = false,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        disabled
          ? "cursor-default bg-black/[0.08] text-black/25"
          : "text-black/80 hover:bg-black/[0.06]",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 10.667C9.473 10.667 10.667 9.473 10.667 8V5.333C10.667 3.861 9.473 2.667 8 2.667C6.527 2.667 5.333 3.861 5.333 5.333V8C5.333 9.473 6.527 10.667 8 10.667Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M3.667 7.667V8C3.667 10.393 5.607 12.333 8 12.333C10.393 12.333 12.333 10.393 12.333 8V7.667M8 12.333V14"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
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

function ComposerSendButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Send message"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        disabled
          ? "bg-[rgba(140,140,140,0.2)] text-black/25"
          : "bg-[#2962ff] text-white hover:bg-[#2457e6]",
      ].join(" ")}
    >
      <span aria-hidden="true" className="translate-y-[-0.5px]">
        <SendIcon />
      </span>
    </button>
  );
}

export function AiConciergeComposer({
  disabled = false,
  isPanelExpanded = false,
  onSend,
  suggestedReplies = [],
}: AiConciergeComposerProps) {
  const [draft, setDraft] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSuggestionMenuOpen, setIsSuggestionMenuOpen] = useState(false);
  const [hasDismissedSuggestionCue, setHasDismissedSuggestionCue] =
    useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasText = draft.trim().length > 0 && !disabled;
  const hasSuggestedReplies = suggestedReplies.length > 0 && !disabled;

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

  const handleSend = () => {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft) {
      return;
    }

    onSend(trimmedDraft);
    setDraft("");
    setIsFocused(true);
    setIsExpanded(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleSuggestedReplySelect = (
    suggestedReply: AiConciergeSuggestedReply,
  ) => {
    setDraft(suggestedReply.label);
    setIsExpanded(false);
    setIsSuggestionMenuOpen(false);
    setHasDismissedSuggestionCue(true);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      const nextPosition = suggestedReply.label.length;
      textarea.setSelectionRange(nextPosition, nextPosition);
    });
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
    setDraft(value);
    if (value.length > 0) {
      setIsSuggestionMenuOpen(false);
      setHasDismissedSuggestionCue(true);
    }

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
          "relative mx-auto w-full",
          isPanelExpanded ? "max-w-[720px]" : "max-w-full",
        ].join(" ")}
      >
        {hasSuggestedReplies && !hasDismissedSuggestionCue && !draft.trim() ? (
          <div className="pointer-events-none absolute bottom-full left-3 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe7f7] bg-white/95 px-3 py-1.5 text-[12px] font-medium text-black/60 shadow-[0_8px_20px_rgba(0,0,0,0.08)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#2962ff] animate-pulse" />
              Click in the composer for suggestions
            </div>
          </div>
        ) : null}
        {hasSuggestedReplies && isSuggestionMenuOpen && !draft.trim() ? (
          <div className="absolute bottom-full left-0 right-0 mb-3">
            <div className="overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
              <div className="border-b border-black/6 px-4 py-3">
                <p className="font-panel-text text-[12px] font-semibold uppercase tracking-[0.14em] text-black/45">
                  Suggested replies
                </p>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {suggestedReplies.map((suggestedReply) => (
                  <button
                    key={suggestedReply.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestedReplySelect(suggestedReply)}
                    className="font-panel-text rounded-[16px] px-4 py-3 text-left text-[14px] leading-[1.45] text-black/80 transition-colors hover:bg-[#f4f8ff] hover:text-black"
                  >
                    {suggestedReply.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <div
          className={[
            "border bg-white px-3 py-3 transition-[border-radius,border-color,box-shadow] duration-150",
            isExpanded
              ? "rounded-[24px] border-black/75"
              : isFocused
                ? "rounded-full border-black/90"
                : hasSuggestedReplies && !hasDismissedSuggestionCue && !draft.trim()
                  ? "rounded-full border-[#a9c9ff] shadow-[0_0_0_4px_rgba(41,98,255,0.08)]"
                  : "rounded-full border-[rgba(140,140,140,0.2)]",
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
                setHasDismissedSuggestionCue(true);

                if (hasSuggestedReplies && draft.trim().length === 0) {
                  setIsSuggestionMenuOpen(true);
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                setIsSuggestionMenuOpen(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                disabled
                  ? "AI Concierge is responding..."
                  : isFocused
                    ? ""
                    : "Message AI Concierge"
              }
              aria-label="Message AI Concierge"
              className={[
                "font-panel-text w-full resize-none bg-transparent text-[16px] leading-[1.5] tracking-[-0.32px] text-black/90 outline-none",
                disabled
                  ? "cursor-not-allowed placeholder:text-black/35"
                  : "placeholder:text-black/30",
                isExpanded ? "min-h-[24px]" : "h-6 overflow-hidden",
              ].join(" ")}
            />
            <div
              className={[
                "flex items-center gap-2",
                isExpanded ? "justify-end" : "",
              ].join(" ")}
            >
              <ComposerIconButton ariaLabel="Voice input">
                <MicIcon />
              </ComposerIconButton>
              <ComposerSendButton disabled={!hasText} onClick={handleSend} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
