"use client";

type AiConciergeMicrophoneNoticeProps = {
  isPanelExpanded?: boolean;
  message: string;
  onDismiss: () => void;
};

export function AiConciergeMicrophoneNotice({
  isPanelExpanded = false,
  message,
  onDismiss,
}: AiConciergeMicrophoneNoticeProps) {
  return (
    <div className="px-5 pb-3 pt-0">
      <div
        className={[
          "mx-auto w-full",
          isPanelExpanded ? "max-w-[720px]" : "max-w-full",
        ].join(" ")}
      >
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-3 rounded-[18px] border border-[#D6D9DE] bg-[#F3F4F6] px-3 py-2.5"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center"
          >
            <MicrophoneBlockedIcon />
          </span>
          <p className="ai-type-body-sm-open min-w-0 flex-1 text-ai-text-primary">
            {message}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notice"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ai-text-secondary transition-colors hover:bg-ai-surface-overlay-hover hover:text-ai-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary"
          >
            <span aria-hidden="true" className="block">
              <CloseIcon />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MicrophoneBlockedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 2L2 8V16L8 22H16L22 16V8L16 2H8ZM18 13H6V11H18V13Z"
        fill="#CB112D"
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
