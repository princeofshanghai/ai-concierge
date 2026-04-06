"use client";

import { Button } from "@/components/button";
import { PhoneCallIcon } from "@/components/phone-call-icon";

type PhoneCallPromptState = "available" | "requested";

type AiConciergePhoneCallPromptProps = {
  isPanelExpanded?: boolean;
  onDismiss: () => void;
  onOpenDialog: () => void;
  phoneNumber: string;
  state: PhoneCallPromptState;
};

export function AiConciergePhoneCallPrompt({
  isPanelExpanded = false,
  onDismiss,
  onOpenDialog,
  phoneNumber,
  state,
}: AiConciergePhoneCallPromptProps) {
  const hasPhoneNumber = phoneNumber.trim().length > 0;

  return (
    <div className="px-5 pb-3 pt-0 animate-[ai-concierge-phone-call-prompt-in_220ms_ease-out_both] motion-reduce:animate-none">
      <div
        className={[
          "mx-auto w-full",
          isPanelExpanded ? "max-w-[720px]" : "max-w-full",
        ].join(" ")}
      >
        <div className="rounded-[20px] border border-ai-blue-border-subtle bg-ai-surface-tint px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ai-surface-base text-ai-blue-primary shadow-[inset_0_0_0_1px_var(--ai-blue-border-subtle)]">
              <PhoneCallIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              {state === "requested" ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="ai-type-heading-sm text-ai-text-primary">
                      Phone call requested
                    </p>
                    <button
                      type="button"
                      onClick={onDismiss}
                      aria-label="Dismiss phone call status"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ai-text-secondary transition-colors hover:bg-ai-surface-overlay-soft hover:text-ai-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  {hasPhoneNumber ? (
                    <p className="ai-type-body-xs mt-0.5 text-ai-text-meta">
                      {phoneNumber}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="ai-type-heading-sm text-ai-text-primary">
                    Prefer a phone call?
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Button size="compact" onClick={onOpenDialog}>
                      Continue by phone
                    </Button>
                    <Button
                      size="compact"
                      variant="tertiary"
                      emphasis={false}
                      onClick={onDismiss}
                    >
                      Dismiss
                    </Button>
                  </div>
                </>
              )}
            </div>
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
