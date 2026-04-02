"use client";

import { useMemo, useState } from "react";
import type {
  LikelySolution,
  NextStepMode,
} from "@/lib/ai-concierge-conversation";

export type BookingSelection = {
  dateLabel: string;
  timeLabel: string;
};

type AiConciergeNextStepPanelProps = {
  company: string;
  hiringSummary: string | null;
  likelySolution: LikelySolution;
  mode: Exclude<NextStepMode, null>;
  onBackToChat: () => void;
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
    slots: ["10:00 AM", "1:30 PM", "3:00 PM"],
  },
  {
    id: "apr-8",
    label: "Wed, Apr 8",
    slots: ["9:00 AM", "12:30 PM", "4:00 PM"],
  },
  {
    id: "apr-9",
    label: "Thu, Apr 9",
    slots: ["11:00 AM", "2:00 PM", "4:30 PM"],
  },
];

export function AiConciergeNextStepPanel({
  company,
  hiringSummary,
  likelySolution,
  mode,
  onBackToChat,
  onConfirmBooking,
}: AiConciergeNextStepPanelProps) {
  const [selectedDateId, setSelectedDateId] = useState(DATE_OPTIONS[0].id);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmedSelection, setConfirmedSelection] =
    useState<BookingSelection | null>(null);

  const selectedDate =
    DATE_OPTIONS.find((option) => option.id === selectedDateId) ??
    DATE_OPTIONS[0];
  const isCallback = mode === "callback";
  const heading = createHeading({ likelySolution, mode });
  const supportingCopy = useMemo(
    () => createSupportingCopy(company, hiringSummary, likelySolution, mode),
    [company, hiringSummary, likelySolution, mode],
  );

  const handleDateSelect = (dateId: string) => {
    setSelectedDateId(dateId);
    setSelectedTime(null);
  };

  const handleConfirmBooking = () => {
    if (!selectedTime) {
      return;
    }

    const selection = {
      dateLabel: selectedDate.label,
      timeLabel: selectedTime,
    };

    setConfirmedSelection(selection);
    onConfirmBooking(selection);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#fafbfd] sm:animate-[ai-concierge-next-step-in_320ms_cubic-bezier(0.22,1,0.36,1)]">
      <div className="px-5 pt-5 sm:px-7 sm:pt-7">
        <button
          type="button"
          onClick={onBackToChat}
          className="font-panel-text inline-flex items-center gap-2 text-[14px] font-medium text-black/58 transition-colors hover:text-black/78"
        >
          <BackArrowIcon />
          Back to chat
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-4 sm:px-7 sm:pb-7 sm:pt-5">
        <div className="mx-auto flex h-full min-h-full w-full max-w-[560px] flex-col gap-7">
          {confirmedSelection ? (
            <ConfirmedBookingCard
              company={company}
              heading={heading}
              mode={mode}
              selection={confirmedSelection}
            />
          ) : (
            <div className="flex h-full min-h-full flex-1 flex-col">
              <div className="flex flex-col gap-3">
                <h3 className="font-panel-display text-[32px] font-[600] leading-[1.08] tracking-[-0.8px] text-black/90">
                  {heading}
                </h3>
                <p className="font-panel-text max-w-[46ch] text-[15px] leading-[1.6] text-black/66">
                  {supportingCopy}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <MetaTag
                    label={
                      isCallback
                        ? "20-minute phone call"
                        : "20-minute conversation"
                    }
                  />
                  <MetaTag label="No prep needed" />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-6 pt-7">
                <div>
                  <p className="font-panel-text text-[15px] font-semibold text-black/72">
                    Choose a day
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DATE_OPTIONS.map((option) => {
                      const isSelected = option.id === selectedDateId;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleDateSelect(option.id)}
                          className={[
                            "font-panel-text rounded-full border px-4 py-2 text-[14px] font-medium transition-colors",
                            isSelected
                              ? "border-linkedin-blue bg-[#eef5ff] text-linkedin-blue"
                              : "border-black/10 bg-white text-black/70 hover:bg-black/[0.03]",
                          ].join(" ")}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-panel-text text-[15px] font-semibold text-black/72">
                    Choose a time
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {selectedDate.slots.map((slot) => {
                      const isSelected = slot === selectedTime;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={[
                            "font-panel-text rounded-[18px] border px-4 py-3 text-left text-[15px] font-medium transition-colors",
                            isSelected
                              ? "border-linkedin-blue bg-[#eef5ff] text-linkedin-blue"
                              : "border-black/10 bg-white text-black/75 hover:bg-black/[0.03]",
                          ].join(" ")}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-black/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-panel-text text-[15px] leading-[1.5] text-black/55">
                    {selectedTime
                      ? `Selected: ${selectedDate.label} at ${selectedTime}`
                      : "Choose a time to continue."}
                  </p>
                  <button
                    type="button"
                    disabled={!selectedTime}
                    onClick={handleConfirmBooking}
                    className={[
                      "font-panel-text inline-flex items-center justify-center rounded-full px-5 py-3 text-[15px] font-semibold transition-colors",
                      selectedTime
                        ? "bg-linkedin-blue text-white hover:bg-[#0047c0]"
                        : "bg-black/[0.08] text-black/30",
                    ].join(" ")}
                  >
                    {isCallback ? "Request call" : "Confirm time"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaTag({ label }: { label: string }) {
  return (
    <span className="font-panel-text rounded-[8px] border border-black/8 bg-white px-2.5 py-1 text-[12px] font-medium text-black/56">
      {label}
    </span>
  );
}

function ConfirmedBookingCard({
  company,
  heading,
  mode,
  selection,
}: {
  company: string;
  heading: string;
  mode: Exclude<NextStepMode, null>;
  selection: BookingSelection;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f7ef] text-[#137333]">
        <CheckIcon />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-panel-display text-[30px] font-[600] leading-[1.15] tracking-[-0.6px] text-black/90">
          {mode === "callback" ? "Call requested" : "You're booked"}
        </h3>
        <p className="font-panel-text max-w-[48ch] text-[15px] leading-[1.6] text-black/65">
          {mode === "callback" ? (
            <>
              Your {heading.toLowerCase()} is requested for {selection.dateLabel}{" "}
              at {selection.timeLabel}. We&apos;ll use the details already shared
              for {company}.
            </>
          ) : (
            <>
              Your {heading.toLowerCase()} is scheduled for {selection.dateLabel}{" "}
              at {selection.timeLabel}. A confirmation will be sent using the
              details already shared for {company}.
            </>
          )}
        </p>
      </div>
      <p className="font-panel-text max-w-[46ch] text-[14px] leading-[1.55] text-black/58">
        You can return to chat if you want to keep exploring before the
        conversation.
      </p>
    </div>
  );
}

function BackArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.75 3.5L5.25 7L8.75 10.5M5.75 7H11.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 11.5L9.125 15.625L17 7.75"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function createSupportingCopy(
  company: string,
  hiringSummary: string | null,
  likelySolution: LikelySolution,
  mode: Exclude<NextStepMode, null>,
) {
  if (mode === "callback") {
    if (likelySolution === "lighter_touch") {
      return `For ${company}, a short phone call could help narrow which option fits ${formatHiringFocus(hiringSummary)}.`;
    }

    return `For ${company}, a short phone call could help you decide whether Recruiter fits ${formatHiringFocus(hiringSummary)}.`;
  }

  if (likelySolution === "lighter_touch") {
    return `Based on what you shared, a short conversation can help you compare which hiring option could make the most sense for ${company}.`;
  }

  const hiringFocus = formatHiringFocus(hiringSummary);

  return `Based on what you shared, a short conversation can help you see whether Recruiter is a fit for ${hiringFocus} at ${company}.`;
}

function createHeading({
  likelySolution,
  mode,
}: {
  likelySolution: LikelySolution;
  mode: Exclude<NextStepMode, null>;
}) {
  if (mode === "callback") {
    return likelySolution === "lighter_touch"
      ? "Request a phone call"
      : "Request a phone call";
  }

  return likelySolution === "lighter_touch"
    ? "Talk to a hiring specialist"
    : "Talk to a Recruiter specialist";
}

function formatHiringFocus(hiringSummary: string | null) {
  if (!hiringSummary) {
    return "your team's hiring needs";
  }

  if (hiringSummary === "harder-to-fill roles") {
    return "harder-to-fill roles";
  }

  return hiringSummary.replace(/ roles/g, " talent");
}
