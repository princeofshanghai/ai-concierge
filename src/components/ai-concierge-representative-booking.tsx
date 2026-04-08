"use client";

import { AVATAR_FALLBACK_SOURCES, Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import {
  DEFAULT_BOOKED_MEETING_DETAILS,
  DEFAULT_REPRESENTATIVE_NAME,
} from "@/lib/ai-concierge-fixtures";
import type {
  RepresentativeMeetingDetails,
  RepresentativeMatchStatus,
} from "@/lib/ai-concierge-types";

type AiConciergeRepresentativeMatchCardProps = {
  bodyText?: string;
  isPanelExpanded?: boolean;
  onBookAgain: () => void;
  onBookMeeting: () => void;
  onManageBooking: () => void;
  meetingDetails?: RepresentativeMeetingDetails;
  status: RepresentativeMatchStatus;
  titleText?: string;
};

type AiConciergeRepresentativeReadyBannerProps = {
  isPanelExpanded?: boolean;
  onBookMeeting: () => void;
  onDismiss: () => void;
};

const MATCHING_AVATAR_SOURCES = [
  AVATAR_FALLBACK_SOURCES[0],
  AVATAR_FALLBACK_SOURCES[1],
  AVATAR_FALLBACK_SOURCES[2],
] as const;
const MATCH_CARD_BORDER_CLASS = "border-ai-blue-border-soft";
const DEFAULT_MATCHING_BODY_TEXT =
  "This may take up to 3 minutes. You can keep chatting in the meantime.";
const DEFAULT_MATCHING_TITLE_TEXT = "Matching you now...";

export function AiConciergeRepresentativeMatchCard({
  bodyText,
  isPanelExpanded = false,
  onBookAgain,
  onBookMeeting,
  onManageBooking,
  meetingDetails,
  status,
  titleText,
}: AiConciergeRepresentativeMatchCardProps) {
  const widthClassName = isPanelExpanded ? "max-w-[344px]" : "max-w-full";
  const resolvedBodyText =
    bodyText ?? (titleText ? undefined : DEFAULT_MATCHING_BODY_TEXT);

  if (status === "booked") {
    const bookedMeetingDetails = meetingDetails ?? DEFAULT_BOOKED_MEETING_DETAILS;

    return (
      <div
        className={[
          "w-full rounded-[16px] bg-ai-surface-tint px-5 py-4",
          widthClassName,
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-center gap-3">
            <MatchedRepresentativeAvatar showSuccessBadge size={40} />
            <div className="flex flex-col items-center gap-1">
              <h3 className="ai-type-body-md-bold w-full whitespace-nowrap text-ai-text-primary">
                Meeting booked with {bookedMeetingDetails.representativeName}
              </h3>
              <p className="ai-type-body-sm text-ai-text-primary">
                {bookedMeetingDetails.dateLabel} at {bookedMeetingDetails.timeLabel}
              </p>
            </div>
          </div>
          <p className="ai-type-body-xs text-ai-text-meta">
            {bookedMeetingDetails.contactHelperText}
          </p>
          <Button
            onClick={onManageBooking}
            size="compact"
            variant="secondary"
          >
            Manage booking
          </Button>
        </div>
      </div>
    );
  }

  if (status === "canceled") {
    const canceledMeetingDetails = meetingDetails ?? DEFAULT_BOOKED_MEETING_DETAILS;

    return (
      <div
        className={[
          "w-full rounded-[16px] bg-ai-surface-tint px-5 py-4",
          widthClassName,
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex flex-col items-center gap-3">
            <MatchedRepresentativeAvatar size={40} />
            <h3 className="ai-type-body-md-bold w-full whitespace-nowrap text-ai-text-primary">
              Meeting canceled with {canceledMeetingDetails.representativeName}
            </h3>
          </div>
          <p className="ai-type-body-xs text-ai-text-meta">
            {canceledMeetingDetails.contactHelperText ??
              "You can book another time if you'd like."}
          </p>
          <Button
            onClick={onBookAgain}
            size="compact"
            className="w-fit !rounded-[24px]"
          >
            Book again
          </Button>
        </div>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div
        className={[
          "w-full rounded-[16px] bg-ai-surface-tint pl-5 pr-3 py-5",
          widthClassName,
        ].join(" ")}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <MatchedRepresentativeAvatar size={32} />
            <h3 className="ai-type-heading-md text-ai-text-primary">
              {DEFAULT_REPRESENTATIVE_NAME} is your sales rep
            </h3>
          </div>
          <Button
            onClick={onBookMeeting}
            size="compact"
            className="w-fit !rounded-[24px]"
          >
            Schedule a call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "w-full rounded-[16px] border bg-ai-surface-base pl-5 pr-3 py-5",
        widthClassName,
        MATCH_CARD_BORDER_CLASS,
      ].join(" ")}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-3">
          <MatchingRepresentativeAvatarStack />
          <h3 className="ai-type-heading-md text-ai-text-primary">
            {titleText ?? DEFAULT_MATCHING_TITLE_TEXT}
          </h3>
        </div>
        {resolvedBodyText ? (
          <p className="ai-type-body-sm text-ai-text-meta">
            {resolvedBodyText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AiConciergeRepresentativeReadyBanner({
  isPanelExpanded = false,
  onBookMeeting,
  onDismiss,
}: AiConciergeRepresentativeReadyBannerProps) {
  return (
    <div
      aria-live="polite"
      className="w-full animate-[ai-concierge-phone-call-prompt-in_220ms_ease-out_both] motion-reduce:animate-none"
      role="status"
    >
      <div className="w-full border-b border-ai-divider bg-ai-surface-tint pl-5 pr-3 py-5">
        <div
          className={[
            "flex w-full gap-3",
            isPanelExpanded
              ? "items-center justify-between"
              : "flex-col",
          ].join(" ")}
        >
          <div className="flex min-w-0 items-center gap-2">
            <MatchedRepresentativeAvatar size={28} />
            <h3 className="ai-type-heading-md truncate text-ai-text-primary">
              {DEFAULT_REPRESENTATIVE_NAME} is your sales rep
            </h3>
          </div>
          <div
            className={[
              "flex w-full items-center gap-2",
              isPanelExpanded ? "w-auto shrink-0 justify-end" : "justify-end",
            ].join(" ")}
          >
            <Button
              onClick={onDismiss}
              size="compact"
              variant="tertiary"
              emphasis={false}
              className="!px-0 hover:!bg-transparent active:!bg-transparent"
            >
              Dismiss
            </Button>
            <Button onClick={onBookMeeting} size="compact">
              Schedule a call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchingRepresentativeAvatarStack() {
  const animationNames = [
    "ai-concierge-avatar-stack-a",
    "ai-concierge-avatar-stack-b",
    "ai-concierge-avatar-stack-c",
  ] as const;

  return (
    <div className="relative h-6 w-14" aria-hidden="true">
      {MATCHING_AVATAR_SOURCES.map((fallbackSrc, index) => (
        <span
          key={fallbackSrc}
          className="absolute left-0 top-0 will-change-transform motion-reduce:animate-none"
          style={{
            animationName: animationNames[index],
            animationDuration: "3.9s",
            animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            animationIterationCount: "infinite",
          }}
        >
          <Avatar
            decorative
            fallbackSrc={fallbackSrc}
            size={24}
          />
        </span>
      ))}
    </div>
  );
}

function MatchedRepresentativeAvatar({
  showSuccessBadge = false,
  size = 28,
}: {
  showSuccessBadge?: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex">
      <Avatar
        decorative
        fallbackSrc={AVATAR_FALLBACK_SOURCES[0]}
        name={DEFAULT_REPRESENTATIVE_NAME}
        seed="matched-representative"
        size={size}
      />
      {showSuccessBadge ? (
        <span className="absolute -bottom-0.5 -right-0.5 inline-flex rounded-full bg-white p-px">
          <SuccessSignalIcon className="h-4 w-4 text-ai-checked-primary" />
        </span>
      ) : null}
    </span>
  );
}

export type {
  AiConciergeRepresentativeMatchArtifact,
  RepresentativeMeetingDetails,
  RepresentativeMatchStatus,
} from "@/lib/ai-concierge-types";

function SuccessSignalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10.8 17L7 13.2L8.4 11.8L10.6 14L15.4 8H18L10.8 17Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}
