"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { AVATAR_FALLBACK_SOURCES, Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { ChoicePill } from "@/components/choice-pill";
import { FormTextField } from "@/components/form-fields";
import { Tag } from "@/components/tag";

export type BookingFormat = "video" | "phone" | "whatsapp";

export type BookingSelection = {
  contactEmail?: string;
  contactPhoneNumber?: string;
  dateLabel: string;
  formatId: BookingFormat;
  note?: string;
  timeLabel: string;
};

export type BookingPanelInitialSelection = Partial<BookingSelection>;

type BookingContactDetails = {
  email: string;
  phoneNumber: string;
};

type AiConciergeNextStepPanelProps = {
  bookingMode?: "book" | "manage";
  contactDetails: BookingContactDetails;
  initialSelection?: BookingPanelInitialSelection | null;
  onBackToChat: () => void;
  onCancelMeeting?: () => void;
  onConfirmBooking: (selection: BookingSelection) => void;
};

type BookingDateOption = {
  id: string;
  label: string;
  slots: string[];
};

const DATE_OPTIONS: BookingDateOption[] = [
  {
    id: "apr-7",
    label: "Tue, Apr 7",
    slots: ["9:30 AM", "10:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"],
  },
  {
    id: "apr-8",
    label: "Wed, Apr 8",
    slots: ["9:00 AM", "11:30 AM", "12:30 PM", "2:30 PM", "4:00 PM"],
  },
  {
    id: "apr-9",
    label: "Thu, Apr 9",
    slots: ["10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM", "4:30 PM"],
  },
  {
    id: "apr-10",
    label: "Fri, Apr 10",
    slots: ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"],
  },
  {
    id: "apr-13",
    label: "Mon, Apr 13",
    slots: ["9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"],
  },
];

const BOOKING_FORMAT_OPTIONS: Array<{
  id: BookingFormat;
  label: string;
}> = [
  { id: "video", label: "Video call" },
  { id: "phone", label: "Phone call" },
  { id: "whatsapp", label: "WhatsApp call" },
];

const REPRESENTATIVE_NAME = "David S.";

export function AiConciergeNextStepPanel({
  bookingMode = "book",
  contactDetails,
  initialSelection = null,
  onBackToChat,
  onCancelMeeting,
  onConfirmBooking,
}: AiConciergeNextStepPanelProps) {
  const [selectedDateId, setSelectedDateId] = useState<string | null>(
    getInitialDateId(initialSelection),
  );
  const [selectedFormatId, setSelectedFormatId] = useState<BookingFormat | null>(
    initialSelection?.formatId ?? null,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    initialSelection?.timeLabel ?? null,
  );
  const [noteDraft, setNoteDraft] = useState(initialSelection?.note ?? "");
  const [meetingEmailDraft, setMeetingEmailDraft] = useState(
    initialSelection?.contactEmail ?? contactDetails.email,
  );
  const [meetingPhoneNumberDraft, setMeetingPhoneNumberDraft] = useState(
    initialSelection?.contactPhoneNumber ?? contactDetails.phoneNumber,
  );
  const [isContactDestinationEditing, setIsContactDestinationEditing] =
    useState(false);

  const selectedDate =
    DATE_OPTIONS.find((option) => option.id === selectedDateId) ?? null;
  const selectedContactChannel = getBookingContactChannel(selectedFormatId);
  const selectedContactValue =
    selectedContactChannel === "email"
      ? meetingEmailDraft
      : selectedContactChannel === "phone"
        ? meetingPhoneNumberDraft
        : "";
  const trimmedSelectedContactValue = selectedContactValue.trim();
  const hasSelectedContactValue = trimmedSelectedContactValue.length > 0;
  const selectedFormatLabel = getBookingFormatLabel(selectedFormatId);
  const canConfirmBooking =
    Boolean(selectedFormatId) &&
    Boolean(selectedDate) &&
    Boolean(selectedTime) &&
    hasSelectedContactValue;

  const handleDateSelect = (dateId: string) => {
    setSelectedDateId(dateId);
    setSelectedTime(null);
  };

  const handleFormatSelect = (formatId: BookingFormat) => {
    const currentChannel = getBookingContactChannel(selectedFormatId);
    const nextChannel = getBookingContactChannel(formatId);

    setSelectedFormatId(formatId);

    if (currentChannel !== nextChannel) {
      setIsContactDestinationEditing(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedFormatId || !selectedTime || !hasSelectedContactValue) {
      return;
    }

    onConfirmBooking({
      contactEmail: meetingEmailDraft.trim() || undefined,
      contactPhoneNumber: meetingPhoneNumberDraft.trim() || undefined,
      dateLabel: selectedDate.label,
      formatId: selectedFormatId,
      note: noteDraft.trim().length > 0 ? noteDraft.trim() : undefined,
      timeLabel: selectedTime,
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ai-surface-panel-subtle sm:animate-[ai-concierge-next-step-in_320ms_cubic-bezier(0.22,1,0.36,1)]">
      <div className="px-6 pt-6 sm:px-8 sm:pt-8">
        <button
          type="button"
          onClick={onBackToChat}
          className="ai-type-heading-sm inline-flex items-center gap-2 text-ai-text-meta transition-colors hover:text-ai-text-secondary"
        >
          <BackArrowIcon />
          Back to chat
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-6 sm:px-8 sm:pt-7">
        <div className="mx-auto flex h-full min-h-full w-full max-w-[592px] flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="ai-type-heading-lg text-ai-text-primary">
                  {bookingMode === "manage" ? "Manage booking" : "Schedule a call"}
                </h3>
                <Tag size="small" tone="supportive1" className="w-fit">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon />
                    30 minutes
                  </span>
                </Tag>
              </div>
              <div className="flex items-center gap-3">
                <RepresentativeAvatar />
                <div className="min-w-0">
                  <p className="ai-type-body-md-bold text-ai-text-primary">
                    {REPRESENTATIVE_NAME}
                  </p>
                  <p className="ai-type-body-sm-open mt-1 text-ai-text-meta">
                    Sales rep
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-8">
            <BookingSection title="Meeting format">
              <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                {BOOKING_FORMAT_OPTIONS.map((option) => (
                  <ChoicePill
                    key={option.id}
                    selected={option.id === selectedFormatId}
                    onClick={() => handleFormatSelect(option.id)}
                  >
                    {option.label}
                  </ChoicePill>
                ))}
              </div>
              {selectedFormatId ? (
                <div className="flex flex-col items-start gap-2">
                  <p
                    className={[
                      "ai-type-body-sm",
                      hasSelectedContactValue
                        ? "text-ai-text-meta"
                        : "text-ai-text-secondary",
                    ].join(" ")}
                  >
                    {getBookingContactDestinationCopy({
                      formatId: selectedFormatId,
                      value: trimmedSelectedContactValue,
                    })}
                  </p>
                  <Button
                    size="compact"
                    variant="tertiary"
                    onClick={() =>
                      setIsContactDestinationEditing((current) => !current)
                    }
                    leadingVisual={<EditIcon className="h-3.5 w-3.5" />}
                    className="!h-7 !px-2 shrink-0"
                  >
                    <span className="ai-type-label-xs">
                      {selectedContactChannel === "email"
                        ? "Change email"
                        : "Change number"}
                    </span>
                  </Button>
                </div>
              ) : null}
              {isContactDestinationEditing && selectedContactChannel ? (
                <FormTextField
                  autoComplete={selectedContactChannel === "email" ? "email" : "tel"}
                  autoFocus
                  helperText="Only used for this meeting."
                  label={
                    selectedContactChannel === "email"
                      ? "Email for this meeting"
                      : "Phone number for this meeting"
                  }
                  placeholder={
                    selectedContactChannel === "email"
                      ? "name@company.com"
                      : "(415) 555-0139"
                  }
                  type={selectedContactChannel === "email" ? "email" : "tel"}
                  value={selectedContactValue}
                  onValueChange={(value) => {
                    if (selectedContactChannel === "email") {
                      setMeetingEmailDraft(value);
                    } else {
                      setMeetingPhoneNumberDraft(value);
                    }
                  }}
                />
              ) : null}
            </BookingSection>

            <BookingSection title="Date">
              <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                {DATE_OPTIONS.map((option) => (
                  <ChoicePill
                    key={option.id}
                    selected={option.id === selectedDateId}
                    onClick={() => handleDateSelect(option.id)}
                  >
                    {option.label}
                  </ChoicePill>
                ))}
              </div>
            </BookingSection>

            <BookingSection title="Time">
              {selectedDate ? (
                <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                  {selectedDate.slots.map((slot) => (
                    <ChoicePill
                      key={slot}
                      selected={slot === selectedTime}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </ChoicePill>
                  ))}
                </div>
              ) : (
                <p className="ai-type-body-sm text-ai-text-meta">
                  Choose a date to see available times.
                </p>
              )}
            </BookingSection>

            <label className="flex flex-col gap-2">
              <span className="ai-type-heading-sm text-ai-text-secondary">
                Anything you&apos;d like {REPRESENTATIVE_NAME} to know?
              </span>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Optional"
                className="ai-type-body-sm-open min-h-[104px] resize-none rounded-[12px] border border-ai-border-strong bg-ai-surface-base px-4 py-3 text-ai-text-primary outline-none transition-[border-color,box-shadow] placeholder:text-ai-text-placeholder hover:border-ai-border-focus focus:border-ai-border-focus focus:ring-1 focus:ring-ai-neutral-focus-ring"
              />
            </label>

            <div className="mt-auto flex flex-col gap-4 border-t border-ai-divider-subtle py-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="ai-type-body-sm-open text-ai-text-meta">
                {selectedFormatId && selectedDate && selectedTime
                  ? `${selectedFormatLabel} on ${selectedDate.label} at ${selectedTime}`
                  : "Choose a format, date, and time to continue."}
              </p>
              <button
                type="button"
                disabled={!canConfirmBooking}
                onClick={handleConfirmBooking}
                className={[
                  "ai-type-heading-md inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 transition-colors sm:min-w-[176px]",
                  canConfirmBooking
                    ? "bg-ai-blue-primary text-ai-text-inverse hover:bg-ai-blue-hover"
                    : "bg-ai-surface-overlay-active text-ai-text-disabled",
                ].join(" ")}
              >
                {bookingMode === "manage" ? "Save changes" : "Confirm"}
              </button>
              {bookingMode === "manage" && onCancelMeeting ? (
                <Button
                  variant="tertiary"
                  emphasis={false}
                  onClick={onCancelMeeting}
                  className="w-fit !px-0 hover:!bg-transparent active:!bg-transparent sm:order-first sm:mr-auto"
                >
                  Cancel meeting
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RepresentativeAvatar() {
  return (
    <Avatar
      decorative
      fallbackSrc={AVATAR_FALLBACK_SOURCES[0]}
      name={REPRESENTATIVE_NAME}
      seed="matched-representative"
      size={40}
    />
  );
}

function BookingSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="ai-type-body-sm-bold text-ai-text-secondary">{title}</p>
      {children}
    </div>
  );
}

function BackArrowIcon() {
  return (
    <Image
      src="/figma/chat/arrow-left.svg"
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    />
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12ZM4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M15.1 12.6L13 11.4V7C13 6.4 12.6 6 12 6C11.4 6 11 6.4 11 7V12C11 12.4 11.2 12.7 11.5 12.9L14.1 14.4C14.6 14.7 15.2 14.5 15.5 14C15.8 13.5 15.6 12.9 15.1 12.6Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function EditIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M21.1 2.9C20.6 2.3 19.8 2 19 2C18.2 2 17.5 2.3 16.9 2.9L3.9 15.9L2 22L8.2 20L21.1 7C21.7 6.5 22 5.7 22 5C22 4.2 21.7 3.5 21.1 2.9ZM6.8 18.6L5.5 17.3L16.6 6L18 7.4L6.8 18.6Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function getInitialDateId(selection: BookingPanelInitialSelection | null) {
  if (!selection) {
    return null;
  }

  return (
    DATE_OPTIONS.find((option) => option.label === selection.dateLabel)?.id ??
    null
  );
}

function getBookingContactChannel(formatId: BookingFormat | null) {
  if (formatId === "video") {
    return "email";
  }

  if (formatId === "phone" || formatId === "whatsapp") {
    return "phone";
  }

  return null;
}

function getBookingContactDestinationCopy({
  formatId,
  value,
}: {
  formatId: BookingFormat | null;
  value: string;
}) {
  if (!formatId) {
    return "Choose a meeting format to see where you'll be contacted.";
  }

  if (formatId === "video") {
    return value.length > 0
      ? `Meeting link will be sent to ${value}`
      : "Add an email address to receive your meeting link.";
  }

  if (formatId === "whatsapp") {
    return value.length > 0
      ? `We'll call you on WhatsApp at ${value}`
      : "Add a phone number for your WhatsApp call.";
  }

  return value.length > 0
    ? `We'll call ${value}`
    : "Add a phone number for your call.";
}

function getBookingFormatLabel(formatId: BookingFormat | null) {
  if (!formatId) {
    return "";
  }

  return (
    {
      phone: "Phone call",
      video: "Video call",
      whatsapp: "WhatsApp call",
    }[formatId] ?? "Video call"
  );
}
