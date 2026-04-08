"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { ConciergeContactDetails } from "@/lib/ai-concierge-types";

const PHONE_CALL_CONFIRM_DELAY_MS = 900;
const PHONE_CALL_PROMPT_REVEAL_DELAY_MS = 1_800;

type PhoneCallPromptState = "available" | "dismissed" | "requested";

type ResetPhoneCallFlowParams = {
  phoneNumber: string;
  promptState: PhoneCallPromptState;
};

type UsePhoneCallFlowParams = {
  canOpenPhoneCallDialog: boolean;
  contactPhoneNumber: string;
  isOpen: boolean;
  setContactDetails: Dispatch<SetStateAction<ConciergeContactDetails>>;
  shouldDelayPromptReveal: boolean;
};

export function usePhoneCallFlow({
  canOpenPhoneCallDialog,
  contactPhoneNumber,
  isOpen,
  setContactDetails,
  shouldDelayPromptReveal,
}: UsePhoneCallFlowParams) {
  const [isPhoneCallDialogOpen, setIsPhoneCallDialogOpen] = useState(false);
  const [isPhoneCallSubmitting, setIsPhoneCallSubmitting] = useState(false);
  const [phoneCallNumberDraft, setPhoneCallNumberDraft] = useState(contactPhoneNumber);
  const [isPhoneCallPromptVisible, setIsPhoneCallPromptVisible] = useState(false);
  const [phoneCallPromptState, setPhoneCallPromptState] =
    useState<PhoneCallPromptState>("available");

  const phoneCallRequestTimerRef = useRef<number | null>(null);
  const phoneCallPromptTimerRef = useRef<number | null>(null);

  const clearPhoneCallPromptTimer = useCallback(() => {
    if (phoneCallPromptTimerRef.current !== null) {
      window.clearTimeout(phoneCallPromptTimerRef.current);
      phoneCallPromptTimerRef.current = null;
    }
  }, []);

  const clearPhoneCallTimers = useCallback(() => {
    if (phoneCallRequestTimerRef.current !== null) {
      window.clearTimeout(phoneCallRequestTimerRef.current);
      phoneCallRequestTimerRef.current = null;
    }

    clearPhoneCallPromptTimer();
  }, [clearPhoneCallPromptTimer]);

  const resetPhoneCallFlow = useCallback(
    ({ phoneNumber, promptState }: ResetPhoneCallFlowParams) => {
      clearPhoneCallTimers();
      setIsPhoneCallDialogOpen(false);
      setIsPhoneCallSubmitting(false);
      setPhoneCallNumberDraft(phoneNumber);
      setPhoneCallPromptState(promptState);
      setIsPhoneCallPromptVisible(false);
    },
    [clearPhoneCallTimers],
  );

  const resetPhoneCallTransientState = useCallback(() => {
    setIsPhoneCallDialogOpen(false);
    setIsPhoneCallSubmitting(false);
    setIsPhoneCallPromptVisible(false);
  }, []);

  const dismissPhoneCallPrompt = useCallback(() => {
    clearPhoneCallPromptTimer();
    setPhoneCallPromptState("dismissed");
    setIsPhoneCallPromptVisible(false);
  }, [clearPhoneCallPromptTimer]);

  const dismissAvailablePhoneCallPrompt = useCallback(() => {
    if (phoneCallPromptState !== "available") {
      return;
    }

    dismissPhoneCallPrompt();
  }, [dismissPhoneCallPrompt, phoneCallPromptState]);

  const handleOpenPhoneCallDialog = useCallback(() => {
    if (!canOpenPhoneCallDialog) {
      return;
    }

    setPhoneCallNumberDraft(contactPhoneNumber);
    setIsPhoneCallDialogOpen(true);
  }, [canOpenPhoneCallDialog, contactPhoneNumber]);

  const handleClosePhoneCallDialog = useCallback(() => {
    if (isPhoneCallSubmitting) {
      return;
    }

    setIsPhoneCallDialogOpen(false);
  }, [isPhoneCallSubmitting]);

  const handleConfirmPhoneCall = useCallback(() => {
    const trimmedPhoneNumber = phoneCallNumberDraft.trim();

    if (!trimmedPhoneNumber) {
      return;
    }

    setIsPhoneCallSubmitting(true);

    if (phoneCallRequestTimerRef.current !== null) {
      window.clearTimeout(phoneCallRequestTimerRef.current);
    }

    phoneCallRequestTimerRef.current = window.setTimeout(() => {
      phoneCallRequestTimerRef.current = null;
      setContactDetails((currentDetails) => ({
        ...currentDetails,
        phoneNumber: trimmedPhoneNumber,
      }));
      setIsPhoneCallSubmitting(false);
      setIsPhoneCallDialogOpen(false);
      setPhoneCallPromptState("requested");
    }, PHONE_CALL_CONFIRM_DELAY_MS);
  }, [phoneCallNumberDraft, setContactDetails]);

  useEffect(() => {
    clearPhoneCallPromptTimer();

    const showImmediately = isOpen && phoneCallPromptState === "requested";
    const revealDelay = shouldDelayPromptReveal
      ? PHONE_CALL_PROMPT_REVEAL_DELAY_MS
      : 0;

    phoneCallPromptTimerRef.current = window.setTimeout(() => {
      setIsPhoneCallPromptVisible(showImmediately || shouldDelayPromptReveal);
      phoneCallPromptTimerRef.current = null;
    }, revealDelay);

    return () => {
      clearPhoneCallPromptTimer();
    };
  }, [
    clearPhoneCallPromptTimer,
    isOpen,
    phoneCallPromptState,
    shouldDelayPromptReveal,
  ]);

  return {
    clearPhoneCallTimers,
    dismissAvailablePhoneCallPrompt,
    dismissPhoneCallPrompt,
    handleClosePhoneCallDialog,
    handleConfirmPhoneCall,
    handleOpenPhoneCallDialog,
    isPhoneCallDialogOpen,
    isPhoneCallPromptVisible,
    isPhoneCallSubmitting,
    phoneCallNumberDraft,
    phoneCallPromptState,
    resetPhoneCallFlow,
    resetPhoneCallTransientState,
    setPhoneCallNumberDraft,
  };
}
