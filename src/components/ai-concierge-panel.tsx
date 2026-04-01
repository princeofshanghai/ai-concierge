"use client";

import { useEffect, useState } from "react";
import {
  AiConciergeBody,
  type AiConciergeMessage,
} from "@/components/ai-concierge-body";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import {
  AiConciergeOnboarding,
  type ConciergeContactDetails,
} from "@/components/ai-concierge-onboarding";

type AiConciergePanelProps = {
  onClose: () => void;
};

const EMPTY_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phoneNumber: "",
  countryRegion: "",
  role: "",
};

const PREFILLED_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "Jamie",
  lastName: "Chen",
  company: "Northstar Health",
  email: "jamie.chen@northstarhealth.com",
  phoneNumber: "(415) 555-0139",
  countryRegion: "United States",
  role: "Talent Acquisition Leader",
};

const INITIAL_MESSAGES: AiConciergeMessage[] = [
  {
    id: "assistant-greeting",
    role: "assistant",
    body: "Hi, I’m AI Concierge. I can help you learn about LinkedIn Recruiter, answer a few questions, and connect you with sales when you’re ready.",
  },
];

export function AiConciergePanel({ onClose }: AiConciergePanelProps) {
  const [panelState, setPanelState] = useState<
    "chat" | "manual" | "prefill" | "welcome"
  >("welcome");
  const [contactDetails, setContactDetails] =
    useState<ConciergeContactDetails>(EMPTY_CONTACT_DETAILS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const isContactDetailsValid = Object.values(contactDetails).every((value) =>
    value.trim().length > 0,
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSendMessage = (body: string) => {
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-message-${currentMessages.length + 1}`,
        role: "user",
        body: trimmedBody,
      },
    ]);
  };

  const handleContactDetailChange = (
    field: keyof ConciergeContactDetails,
    value: string,
  ) => {
    setContactDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
    }));
  };

  const handleStartWithLinkedIn = () => {
    setContactDetails(PREFILLED_CONTACT_DETAILS);
    setPanelState("prefill");
  };

  const handleStartManualEntry = () => {
    setContactDetails(EMPTY_CONTACT_DETAILS);
    setPanelState("manual");
  };

  const handleBackFromDetails = () => {
    setPanelState("welcome");
  };

  const handleUseAnotherAccount = () => {
    setPanelState("welcome");
  };

  const handleStartConversation = () => {
    if (!isContactDetailsValid) {
      return;
    }

    setPanelState("chat");
  };

  return (
    <div className="fixed inset-0 z-50 sm:left-auto sm:right-6 sm:top-6 sm:bottom-6 sm:w-[392px]">
      <section
        id="ai-concierge-panel"
        role="dialog"
        aria-label="AI Concierge"
        aria-modal="false"
        className="flex h-full w-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)] sm:rounded-[24px]"
      >
        <AiConciergeHeader onClose={onClose} />
        {panelState === "chat" ? (
          <>
            <AiConciergeBody messages={messages} />
            <AiConciergeComposer onSend={handleSendMessage} />
          </>
        ) : (
          <AiConciergeOnboarding
            details={contactDetails}
            isValid={isContactDetailsValid}
            mode={panelState}
            onBack={handleBackFromDetails}
            onChange={handleContactDetailChange}
            onContinueManual={handleStartManualEntry}
            onContinueWithLinkedIn={handleStartWithLinkedIn}
            onStartConversation={handleStartConversation}
            onUseAnotherAccount={handleUseAnotherAccount}
          />
        )}
      </section>
    </div>
  );
}
