"use client";

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  createRepresentativeMatchingTurn,
  type AiConciergeConversationState,
} from "@/lib/ai-concierge-conversation";
import { DEFAULT_REPRESENTATIVE_NAME } from "@/lib/ai-concierge-fixtures";
import type {
  AiConciergeMessage,
  BookingPanelInitialSelection,
  BookingSelection,
  RepresentativeMeetingDetails,
  RepresentativeMatchStatus,
} from "@/lib/ai-concierge-types";

const REPRESENTATIVE_MATCH_READY_MS = 6_000;
const RECOMMENDATION_ACTION_TRANSITION_MS = 260;

type UseRepresentativeFlowParams = {
  appendStandaloneBookingConfirmation: (body: string) => void;
  clearDictateStatusMessage: () => void;
  conversationState: AiConciergeConversationState | null;
  isAssistantResponding: boolean;
  isLiveAgentReplyPending: boolean;
  isLiveSalesChatConnecting: boolean;
  replaceAssistantArtifact: (
    messageId: string,
    artifact: AiConciergeMessage["artifact"],
  ) => void;
  resetLiveSalesChatFlow: () => void;
  setConversationState: Dispatch<
    SetStateAction<AiConciergeConversationState | null>
  >;
  setMessages: Dispatch<SetStateAction<AiConciergeMessage[]>>;
  setThreadScrollSignal: Dispatch<SetStateAction<number>>;
  stopDictationRecognition: () => void;
};


function createRepresentativeMeetingDetails(
  selection: BookingSelection,
): RepresentativeMeetingDetails {
  return {
    contactHelperText: formatRepresentativeMeetingContactHelperText(selection),
    dateLabel: formatRepresentativeMeetingDateLabel(selection.dateLabel),
    formatLabel: formatRepresentativeMeetingFormatLabel(selection.formatId),
    representativeName: DEFAULT_REPRESENTATIVE_NAME,
    timeLabel: formatRepresentativeMeetingTimeLabel(selection.timeLabel),
  };
}

function createCanceledRepresentativeMeetingDetails(
  selection: BookingSelection,
): RepresentativeMeetingDetails {
  return {
    contactHelperText: "You can book another time if you'd like.",
    dateLabel: formatRepresentativeMeetingDateLabel(selection.dateLabel),
    formatLabel: formatRepresentativeMeetingFormatLabel(selection.formatId),
    representativeName: DEFAULT_REPRESENTATIVE_NAME,
    timeLabel: formatRepresentativeMeetingTimeLabel(selection.timeLabel),
  };
}

export function createRepresentativeRebookingDraft(
  selection: BookingSelection | null,
): BookingPanelInitialSelection | null {
  if (!selection) {
    return null;
  }

  return {
    contactEmail: selection.contactEmail,
    contactPhoneNumber: selection.contactPhoneNumber,
    formatId: selection.formatId,
    note: selection.note,
  };
}

export function useRepresentativeFlow({
  appendStandaloneBookingConfirmation,
  clearDictateStatusMessage,
  conversationState,
  isAssistantResponding,
  isLiveAgentReplyPending,
  isLiveSalesChatConnecting,
  replaceAssistantArtifact,
  resetLiveSalesChatFlow,
  setConversationState,
  setMessages,
  setThreadScrollSignal,
  stopDictationRecognition,
}: UseRepresentativeFlowParams) {
  const [representativeMatchStatus, setRepresentativeMatchStatus] =
    useState<RepresentativeMatchStatus | null>(null);
  const [representativeMatchMessageId, setRepresentativeMatchMessageId] =
    useState<string | null>(null);
  const [pendingRecommendationMessageId, setPendingRecommendationMessageId] =
    useState<string | null>(null);
  const [isRepresentativeReadyBannerVisible, setIsRepresentativeReadyBannerVisible] =
    useState(false);
  const [isRepresentativeReadyCardVisible, setIsRepresentativeReadyCardVisible] =
    useState<boolean | null>(null);
  const [representativeBookedSelection, setRepresentativeBookedSelection] =
    useState<BookingSelection | null>(null);
  const [representativeBookingDraft, setRepresentativeBookingDraft] =
    useState<BookingPanelInitialSelection | null>(null);
  const [bookingCelebrationTrigger, setBookingCelebrationTrigger] = useState(0);
  const [isMatchedBookingSurfaceVisible, setIsMatchedBookingSurfaceVisible] =
    useState(false);
  const [isMeetingCancelDialogOpen, setIsMeetingCancelDialogOpen] =
    useState(false);
  const [isMeetingCancelSubmitting, setIsMeetingCancelSubmitting] =
    useState(false);

  const recommendationActionTimerRef = useRef<number | null>(null);
  const representativeMatchReadyTimerRef = useRef<number | null>(null);
  const meetingCancelTimerRef = useRef<number | null>(null);

  const clearRepresentativeMatchTimers = useCallback(() => {
    if (representativeMatchReadyTimerRef.current !== null) {
      window.clearTimeout(representativeMatchReadyTimerRef.current);
      representativeMatchReadyTimerRef.current = null;
    }
  }, []);

  const clearRecommendationActionTimer = useCallback(() => {
    if (recommendationActionTimerRef.current !== null) {
      window.clearTimeout(recommendationActionTimerRef.current);
      recommendationActionTimerRef.current = null;
    }
  }, []);

  const clearMeetingCancelTimer = useCallback(() => {
    if (meetingCancelTimerRef.current !== null) {
      window.clearTimeout(meetingCancelTimerRef.current);
      meetingCancelTimerRef.current = null;
    }
  }, []);

  const clearRepresentativeFlowTimers = useCallback(() => {
    clearRecommendationActionTimer();
    clearRepresentativeMatchTimers();
    clearMeetingCancelTimer();
  }, [
    clearMeetingCancelTimer,
    clearRecommendationActionTimer,
    clearRepresentativeMatchTimers,
  ]);

  const updateRepresentativeMatchMessage = useCallback(
    (
      messageId: string,
      updates: {
        meetingDetails?: RepresentativeMeetingDetails;
        status: RepresentativeMatchStatus;
      },
    ) => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId &&
          message.artifact?.type === "representative-match"
            ? {
                ...message,
                artifact: {
                  ...message.artifact,
                  meetingDetails: updates.meetingDetails,
                  status: updates.status,
                },
              }
            : message,
        ),
      );
    },
    [setMessages],
  );

  const resetRepresentativeFlowState = useCallback(() => {
    setRepresentativeMatchStatus(null);
    setRepresentativeMatchMessageId(null);
    setPendingRecommendationMessageId(null);
    setIsRepresentativeReadyBannerVisible(false);
    setIsRepresentativeReadyCardVisible(null);
    setRepresentativeBookedSelection(null);
    setRepresentativeBookingDraft(null);
    setIsMatchedBookingSurfaceVisible(false);
    setIsMeetingCancelDialogOpen(false);
    setIsMeetingCancelSubmitting(false);
  }, []);

  const resetRepresentativeMatchFlow = useCallback(() => {
    clearRepresentativeFlowTimers();
    resetRepresentativeFlowState();
  }, [clearRepresentativeFlowTimers, resetRepresentativeFlowState]);

  const startRepresentativeMatchFlow = useCallback(
    (messageId: string) => {
      clearRepresentativeMatchTimers();
      resetLiveSalesChatFlow();
      setRepresentativeMatchMessageId(messageId);
      setRepresentativeMatchStatus("matching");
      setIsRepresentativeReadyBannerVisible(false);
      setIsRepresentativeReadyCardVisible(null);
      setRepresentativeBookedSelection(null);
      setIsMatchedBookingSurfaceVisible(false);

      representativeMatchReadyTimerRef.current = window.setTimeout(() => {
        setRepresentativeMatchStatus("ready");
        updateRepresentativeMatchMessage(messageId, { status: "ready" });
        setIsRepresentativeReadyBannerVisible(true);
        representativeMatchReadyTimerRef.current = null;
      }, REPRESENTATIVE_MATCH_READY_MS);
    },
    [
      clearRepresentativeMatchTimers,
      resetLiveSalesChatFlow,
      updateRepresentativeMatchMessage,
    ],
  );

  const openMatchedBookingSurface = useCallback(() => {
    setIsRepresentativeReadyBannerVisible(false);
    setIsMeetingCancelDialogOpen(false);
    setIsMatchedBookingSurfaceVisible(true);
  }, []);

  const closeMatchedBookingSurface = useCallback(() => {
    setIsMatchedBookingSurfaceVisible(false);
  }, []);

  const dismissRepresentativeReadyBanner = useCallback(() => {
    setIsRepresentativeReadyBannerVisible(false);
  }, []);

  const openMeetingCancelDialog = useCallback(() => {
    if (representativeMatchStatus !== "booked" || !representativeBookedSelection) {
      return;
    }

    setIsMeetingCancelDialogOpen(true);
  }, [representativeBookedSelection, representativeMatchStatus]);

  const closeMeetingCancelDialog = useCallback(() => {
    if (isMeetingCancelSubmitting) {
      return;
    }

    setIsMeetingCancelDialogOpen(false);
  }, [isMeetingCancelSubmitting]);

  const handleRecommendationPrimaryAction = useCallback(
    (messageId: string) => {
      if (
        !conversationState ||
        pendingRecommendationMessageId !== null ||
        isAssistantResponding ||
        isLiveAgentReplyPending ||
        isLiveSalesChatConnecting
      ) {
        return;
      }

      const assistantTurn = createRepresentativeMatchingTurn(conversationState);

      clearRecommendationActionTimer();
      clearRepresentativeMatchTimers();
      resetLiveSalesChatFlow();
      stopDictationRecognition();
      clearDictateStatusMessage();
      setIsMatchedBookingSurfaceVisible(false);
      setIsRepresentativeReadyBannerVisible(false);
      setRepresentativeBookingDraft(null);
      setConversationState(assistantTurn.nextState);
      setPendingRecommendationMessageId(messageId);

      recommendationActionTimerRef.current = window.setTimeout(() => {
        recommendationActionTimerRef.current = null;
        setPendingRecommendationMessageId(null);
        replaceAssistantArtifact(messageId, assistantTurn.artifact!);
        startRepresentativeMatchFlow(messageId);
      }, RECOMMENDATION_ACTION_TRANSITION_MS);
    },
    [
      clearDictateStatusMessage,
      clearRecommendationActionTimer,
      clearRepresentativeMatchTimers,
      conversationState,
      isAssistantResponding,
      isLiveAgentReplyPending,
      isLiveSalesChatConnecting,
      pendingRecommendationMessageId,
      replaceAssistantArtifact,
      resetLiveSalesChatFlow,
      setConversationState,
      startRepresentativeMatchFlow,
      stopDictationRecognition,
    ],
  );

  const handleConfirmMeetingCancellation = useCallback(() => {
    if (
      !representativeBookedSelection ||
      !representativeMatchMessageId ||
      representativeMatchStatus !== "booked"
    ) {
      return;
    }

    clearMeetingCancelTimer();
    setIsMeetingCancelSubmitting(true);

    meetingCancelTimerRef.current = window.setTimeout(() => {
      meetingCancelTimerRef.current = null;
      setRepresentativeMatchStatus("canceled");
      updateRepresentativeMatchMessage(representativeMatchMessageId, {
        meetingDetails: createCanceledRepresentativeMeetingDetails(
          representativeBookedSelection,
        ),
        status: "canceled",
      });
      setIsMeetingCancelSubmitting(false);
      setIsMeetingCancelDialogOpen(false);
      setIsMatchedBookingSurfaceVisible(false);
      setIsRepresentativeReadyBannerVisible(false);
      setThreadScrollSignal((currentValue) => currentValue + 1);
    }, 700);
  }, [
    clearMeetingCancelTimer,
    representativeBookedSelection,
    representativeMatchMessageId,
    representativeMatchStatus,
    setThreadScrollSignal,
    updateRepresentativeMatchMessage,
  ]);

  const handleNextStepConfirmed = useCallback(
    (selection: BookingSelection) => {
      const meetingDetails = createRepresentativeMeetingDetails(selection);
      const isUpdatingExistingMeeting = representativeMatchStatus === "booked";
      const confirmationBody = isUpdatingExistingMeeting
        ? `I updated your meeting with ${meetingDetails.representativeName} to ${meetingDetails.dateLabel} at ${meetingDetails.timeLabel}.`
        : `You're all set. I've booked ${meetingDetails.dateLabel} at ${meetingDetails.timeLabel} with ${meetingDetails.representativeName}.`;

      clearRepresentativeMatchTimers();

      if (representativeMatchStatus && representativeMatchMessageId) {
        setRepresentativeBookedSelection(selection);
        setRepresentativeBookingDraft(selection);
        setRepresentativeMatchStatus("booked");
        updateRepresentativeMatchMessage(representativeMatchMessageId, {
          meetingDetails,
          status: "booked",
        });
        setIsRepresentativeReadyBannerVisible(false);
        setIsMatchedBookingSurfaceVisible(false);
        setIsMeetingCancelDialogOpen(false);
        setThreadScrollSignal((currentValue) => currentValue + 1);
        if (!isUpdatingExistingMeeting) {
          setBookingCelebrationTrigger((currentValue) => currentValue + 1);
        }
        return;
      }

      appendStandaloneBookingConfirmation(confirmationBody);
    },
    [
      appendStandaloneBookingConfirmation,
      clearRepresentativeMatchTimers,
      representativeMatchMessageId,
      representativeMatchStatus,
      setThreadScrollSignal,
      updateRepresentativeMatchMessage,
    ],
  );

  return {
    bookingCelebrationTrigger,
    clearRepresentativeFlowTimers,
    closeMatchedBookingSurface,
    closeMeetingCancelDialog,
    dismissRepresentativeReadyBanner,
    handleConfirmMeetingCancellation,
    handleNextStepConfirmed,
    handleRecommendationPrimaryAction,
    isMatchedBookingSurfaceVisible,
    isMeetingCancelDialogOpen,
    isMeetingCancelSubmitting,
    isRepresentativeReadyBannerVisible,
    isRepresentativeReadyCardVisible,
    openMatchedBookingSurface,
    openMeetingCancelDialog,
    pendingRecommendationMessageId,
    representativeBookingDraft,
    representativeBookedSelection,
    representativeMatchStatus,
    resetRepresentativeFlowState,
    resetRepresentativeMatchFlow,
    setRepresentativeBookingDraft,
    setRepresentativeReadyCardVisible: setIsRepresentativeReadyCardVisible,
    startRepresentativeMatchFlow,
  };
}

function formatRepresentativeMeetingDateLabel(dateLabel: string) {
  const [, dayAbbreviation, monthAbbreviation, dayNumber] =
    dateLabel.match(/^([A-Za-z]{3}), ([A-Za-z]{3}) (\d{1,2})$/) ?? [];

  if (!dayAbbreviation || !monthAbbreviation || !dayNumber) {
    return dateLabel;
  }

  const fullDayLabel =
    {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    }[dayAbbreviation] ?? dayAbbreviation;
  const fullMonthLabel =
    {
      Jan: "January",
      Feb: "February",
      Mar: "March",
      Apr: "April",
      May: "May",
      Jun: "June",
      Jul: "July",
      Aug: "August",
      Sep: "September",
      Oct: "October",
      Nov: "November",
      Dec: "December",
    }[monthAbbreviation] ?? monthAbbreviation;

  return `${fullDayLabel}, ${fullMonthLabel} ${dayNumber}`;
}

function formatRepresentativeMeetingTimeLabel(timeLabel: string) {
  const match = timeLabel.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);

  if (!match) {
    return `${timeLabel} PT`;
  }

  const [, rawHours, rawMinutes, meridiem] = match;
  let hours = Number(rawHours) % 12;
  const minutes = Number(rawMinutes);

  if (meridiem === "PM") {
    hours += 12;
  }

  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + 30;

  return `${timeLabel}-${formatRepresentativeMeetingEndTime(endMinutes)} PT`;
}

function formatRepresentativeMeetingEndTime(totalMinutes: number) {
  const normalizedMinutes = totalMinutes % (24 * 60);
  const hours24 = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hourOnTwelveHourClock = hours24 % 12 || 12;

  return `${hourOnTwelveHourClock}:${minutes.toString().padStart(2, "0")} ${meridiem}`;
}

function formatRepresentativeMeetingFormatLabel(
  formatId: BookingSelection["formatId"],
) {
  return (
    {
      phone: "Phone call",
      video: "Video call",
      whatsapp: "WhatsApp call",
    }[formatId] ?? "Video call"
  );
}

function formatRepresentativeMeetingContactHelperText(selection: BookingSelection) {
  const trimmedEmail = selection.contactEmail?.trim() ?? "";
  const trimmedPhoneNumber = selection.contactPhoneNumber?.trim() ?? "";

  if (selection.formatId === "video") {
    return trimmedEmail.length > 0
      ? `We'll send the meeting link to ${trimmedEmail}.`
      : "We'll send the meeting link shortly.";
  }

  if (selection.formatId === "whatsapp") {
    return trimmedPhoneNumber.length > 0
      ? `We'll call you on WhatsApp at ${trimmedPhoneNumber}.`
      : "We'll reach you on WhatsApp shortly.";
  }

  return trimmedPhoneNumber.length > 0
    ? `We'll call ${trimmedPhoneNumber}.`
    : "We'll call you shortly.";
}
