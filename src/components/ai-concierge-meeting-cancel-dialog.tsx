"use client";

import { useId } from "react";
import { Button } from "@/components/button";

type AiConciergeMeetingCancelDialogProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  representativeName: string;
};

export function AiConciergeMeetingCancelDialog({
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  representativeName,
}: AiConciergeMeetingCancelDialogProps) {
  const headingId = useId();
  const descriptionId = useId();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-end bg-black/40 sm:items-center sm:justify-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-busy={isSubmitting}
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        className="w-full rounded-t-[28px] bg-ai-surface-base shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(0,0,0,0.3)] sm:w-[368px] sm:min-w-[320px] sm:rounded-[8px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-6">
          <h3 id={headingId} className="ai-type-heading-lg text-ai-text-primary">
            Cancel your meeting with {representativeName}?
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close meeting cancellation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[16px] text-ai-text-secondary transition-colors hover:bg-ai-surface-overlay-soft hover:text-ai-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary disabled:cursor-default disabled:text-ai-text-disabled"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 pb-6">
          <p id={descriptionId} className="ai-type-body-sm text-ai-text-primary">
            You can always book another time later.
          </p>
        </div>

        <div className="border-t border-ai-border-faint px-6 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              fullWidth
              variant="secondary"
              emphasis={false}
              disabled={isSubmitting}
              onClick={onClose}
            >
              Keep meeting
            </Button>
            <Button
              fullWidth
              disabled={isSubmitting}
              onClick={onConfirm}
            >
              {isSubmitting ? "Canceling..." : "Cancel meeting"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
