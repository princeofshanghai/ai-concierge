"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AiConciergeBody } from "@/components/ai-concierge-body";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeConfettiOverlay } from "@/components/ai-concierge-confetti-overlay";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import { AiConciergeMeetingCancelDialog } from "@/components/ai-concierge-meeting-cancel-dialog";
import { AiConciergeMicrophoneNotice } from "@/components/ai-concierge-microphone-notice";
import { AiConciergeNextStepPanel } from "@/components/ai-concierge-next-step-panel";
import { AiConciergeOnboarding } from "@/components/ai-concierge-onboarding";
import { AiConciergePhoneCallDialog } from "@/components/ai-concierge-phone-call-dialog";
import { AiConciergePhoneCallPrompt } from "@/components/ai-concierge-phone-call-prompt";
import { AiConciergePremiumPlanPanel } from "@/components/ai-concierge-premium-plan-panel";
import { AiConciergePremiumPlanRecommendations } from "@/components/ai-concierge-premium-plan-recommendations";
import { AiConciergeRecommendationCard } from "@/components/ai-concierge-recommendation-card";
import {
  AiConciergeRepresentativeMatchCard,
  AiConciergeRepresentativeReadyBanner,
} from "@/components/ai-concierge-representative-booking";
import { AiConciergeVoiceDock } from "@/components/ai-concierge-voice-dock";
import { Button } from "@/components/button";
import { ChatAssistantMessage } from "@/components/chat-assistant-message";
import { ChatLiveAgentMessage } from "@/components/chat-live-agent-message";
import { ChatUserMessage } from "@/components/chat-user-message";
import { ChoicePill } from "@/components/choice-pill";
import { CloseIcon } from "@/components/close-icon";
import { ContactSalesButton } from "@/components/contact-sales-button";
import { IconButton } from "@/components/icon-button";
import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import { LinkedInIdentityChip } from "@/components/linkedin-identity-chip";
import { PhoneCallIcon } from "@/components/phone-call-icon";
import { PrototypeLinkedInSignInScreen } from "@/components/prototype-linkedin-sign-in-screen";
import { SuggestedActionPrompt } from "@/components/suggested-action-prompt";
import { Tag } from "@/components/tag";
import {
  DEFAULT_BOOKED_MEETING_DETAILS,
  DEFAULT_REPRESENTATIVE_NAME,
  LINKEDIN_IDENTITY,
  PREFILLED_CONTACT_DETAILS,
} from "@/lib/ai-concierge-fixtures";
import { OPENING_PROMPT_TOPICS } from "@/lib/ai-concierge-opening-presentation";
import type {
  AiConciergePremiumPlanRecommendationsArtifact,
  AiConciergeMessage,
  ConciergeContactDetails,
} from "@/lib/ai-concierge-types";

const SAMPLE_RECOMMENDATION_ARTIFACT = {
  bodyText: "First I'll match you with the right one",
  ctaLabel: "Find my rep",
  titleText: "Talk to a sales rep",
  type: "recommendation" as const,
};

const SAMPLE_PREMIUM_RECOMMENDATIONS_ARTIFACT = {
  primaryRecommendation: {
    bodyText:
      "Sell, market, and hire in one tool",
    fitLabel: "Best overall fit",
    id: "all-in-one",
    priceText: "$74.99/mo",
    promptText: "Show me details for Premium All-in-One",
    trialText: "1 month free trial",
    titleText: "Premium All-in-One",
  },
  secondaryRecommendations: [
    {
      bodyText:
        "A lighter option centered on insights and relationship-building.",
      fitLabel: "If networking matters most",
      id: "business",
      priceText: "$44.99/mo",
      promptText: "Show me details for Premium Business",
      trialText: "1 month free trial",
      titleText: "Premium Business",
    },
    {
      bodyText:
        "Worth considering if finding and hiring talent becomes the main need.",
      fitLabel: "If hiring becomes the priority",
      id: "recruiter-lite",
      priceText: "$139.99/mo",
      promptText: "Show me details for Recruiter Lite",
      trialText: "1 month free trial",
      titleText: "Recruiter Lite",
    },
  ],
  type: "premium-plan-recommendations" as const,
} satisfies AiConciergePremiumPlanRecommendationsArtifact;

const SAMPLE_BODY_MESSAGES: AiConciergeMessage[] = [
  {
    id: "assistant-message-1",
    role: "assistant",
    body: "I can help you compare what kind of hiring support fits your team, and I can bring in a sales rep when you want to move faster.",
    status: "complete",
  },
  {
    id: "user-message-1",
    role: "user",
    body: "We are hiring across product and engineering and want to ramp this quarter.",
  },
  {
    id: "assistant-message-2",
    role: "assistant",
    body: "Based on what you shared, talking to a sales rep looks like the right next step.",
    status: "complete",
    suggestedReplies: [
      {
        id: "suggested-reply-1",
        label: "Talk to a sales rep",
      },
      {
        id: "suggested-reply-2",
        label: "Show me the difference between options",
      },
    ],
    suggestedReplyDisplay: "inline",
  },
  {
    id: "agent-message-1",
    role: "agent",
    agentName: DEFAULT_REPRESENTATIVE_NAME,
    body: "I can walk you through what would get your team live fastest.",
    timestampLabel: "1:08 PM",
  },
];

const SAMPLE_VOICE_OPENING_MESSAGES: AiConciergeMessage[] = [
  {
    id: "assistant-message-1",
    role: "assistant",
    body: "Hi Jamie, glad you're here. I can help you explore hiring solutions for Northstar Health, answer your questions, and point you in the right direction from there. When you're ready, you can start talking or use what's on screen to get started.",
    openingSupport: {
      type: "topic-picker",
      helperText: "",
      topics: OPENING_PROMPT_TOPICS,
    },
    status: "complete",
  },
];

const MATCHED_MEETING_DETAILS = {
  ...DEFAULT_BOOKED_MEETING_DETAILS,
  contactHelperText:
    "We'll send the meeting link to jamie.chen@northstarhealth.com.",
};

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(" ");
}

export function AiConciergeComponentGallery() {
  const [composerDraft, setComposerDraft] = useState("");
  const [respondingComposerDraft, setRespondingComposerDraft] = useState("");
  const [confettiPreviewTrigger, setConfettiPreviewTrigger] = useState(0);
  const [phoneNumberDraft, setPhoneNumberDraft] = useState(
    PREFILLED_CONTACT_DETAILS.phoneNumber,
  );
  const [onboardingDetails, setOnboardingDetails] =
    useState<ConciergeContactDetails>(PREFILLED_CONTACT_DETAILS);

  return (
    <>
      <InternalPrototypeNav />
      <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_26%,#ffffff_100%)] px-6 pb-24 pt-24 sm:px-8">
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-16">
          <header className="max-w-[720px]">
            <h1 className="ai-type-display-md text-ai-text-primary">
              AI Concierge components
            </h1>
            <nav
              aria-label="Component gallery sections"
              className="mt-6 flex flex-wrap gap-x-5 gap-y-3"
            >
              <SectionLink href="#full-surfaces">Full surfaces</SectionLink>
              <SectionLink href="#conversation-system">
                Conversation system
              </SectionLink>
              <SectionLink href="#handoff">Handoff</SectionLink>
              <SectionLink href="#shared-primitives">
                Shared primitives
              </SectionLink>
            </nav>
          </header>

          <GallerySection id="full-surfaces" title="Full Surfaces">
            <ComponentRow
              description="Top-level panel that assembles onboarding, conversation, voice, and handoff surfaces."
              states={["Main prototype"]}
              title="AiConciergePanel"
            >
              <PreviewSurface label="Routes">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/"
                    className="ai-type-heading-sm w-fit text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                  >
                    Main prototype
                  </Link>
                  <p className="ai-type-body-sm max-w-[28rem] text-ai-text-meta">
                    This is the sales lead qualification prototype shell with
                    onboarding, handoff, and voice behavior.
                  </p>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Premium-specific concierge panel that reuses the shared chat UI language while keeping recommendation behavior separate from the sales lead qualification prototype."
              states={["Premium survey prototype"]}
              title="PremiumSurveyConciergePanel"
            >
              <PreviewSurface label="Routes">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/prototype/premium-survey"
                    className="ai-type-heading-sm w-fit text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                  >
                    Premium survey prototype
                  </Link>
                  <p className="ai-type-body-sm max-w-[28rem] text-ai-text-meta">
                    This route keeps the same panel styling, but its behavior is
                    fully self-serve and limited to plan and product
                    recommendations.
                  </p>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Entry flow for LinkedIn connection and contact-detail confirmation, including the lighter signed-in review state, 14px regular darker-neutral edit-mode helper copy, denser read-only summary rows, and the manual intro copy."
              states={[
                "Signed out",
                "Signed in",
                "Confirm details / manual",
                "Confirm details / prefilled",
              ]}
              title="AiConciergeOnboarding"
            >
              <div className="grid gap-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  <PreviewSurface
                    className="overflow-hidden"
                    label="Profile-aware welcome / signed out"
                    padded={false}
                  >
                    <AiConciergeOnboarding
                      details={onboardingDetails}
                      isLinkedInConnected={false}
                      isValid
                      linkedInIdentity={null}
                      mode="welcome"
                      onBack={() => {}}
                      onChange={(field, value) =>
                        setOnboardingDetails((currentDetails) => ({
                          ...currentDetails,
                          [field]: value,
                        }))
                      }
                      onContinueWithoutLinkedIn={() => {}}
                      onContinueWithLinkedIn={() => {}}
                      onGetStarted={() => {}}
                      onStartConversation={() => {}}
                      onUseAnotherAccount={() => {}}
                      welcomeVariant="profile-aware"
                    />
                  </PreviewSurface>

                  <PreviewSurface
                    className="overflow-hidden"
                    label="Profile-aware welcome / signed in"
                    padded={false}
                  >
                    <AiConciergeOnboarding
                      details={onboardingDetails}
                      isLinkedInConnected
                      isValid
                      linkedInIdentity={LINKEDIN_IDENTITY}
                      mode="welcome"
                      onBack={() => {}}
                      onChange={(field, value) =>
                        setOnboardingDetails((currentDetails) => ({
                          ...currentDetails,
                          [field]: value,
                        }))
                      }
                      onContinueWithoutLinkedIn={() => {}}
                      onContinueWithLinkedIn={() => {}}
                      onGetStarted={() => {}}
                      onStartConversation={() => {}}
                      onUseAnotherAccount={() => {}}
                      welcomeVariant="profile-aware"
                    />
                  </PreviewSurface>
                </div>

                <PreviewSurface
                  className="overflow-hidden"
                  label="Confirm details / manual"
                  padded={false}
                >
                  <AiConciergeOnboarding
                    copyVariant="direct-entry"
                    details={onboardingDetails}
                    isLinkedInConnected={false}
                    isValid
                    linkedInIdentity={null}
                    mode="manual"
                    onBack={() => {}}
                    onChange={(field, value) =>
                      setOnboardingDetails((currentDetails) => ({
                        ...currentDetails,
                        [field]: value,
                      }))
                    }
                    onContinueWithoutLinkedIn={() => {}}
                    onContinueWithLinkedIn={() => {}}
                    onGetStarted={() => {}}
                    onStartConversation={() => {}}
                    onUseAnotherAccount={() => {}}
                    showBackButton
                    welcomeVariant="profile-aware"
                  />
                </PreviewSurface>

                <PreviewSurface
                  className="overflow-hidden"
                  label="Confirm details / prefilled"
                  padded={false}
                >
                  <AiConciergeOnboarding
                    copyVariant="direct-entry"
                    details={onboardingDetails}
                    isLinkedInConnected
                    isValid
                    linkedInIdentity={LINKEDIN_IDENTITY}
                    mode="prefill"
                    onBack={() => {}}
                    onChange={(field, value) =>
                      setOnboardingDetails((currentDetails) => ({
                        ...currentDetails,
                        [field]: value,
                      }))
                    }
                    onContinueWithoutLinkedIn={() => {}}
                    onContinueWithLinkedIn={() => {}}
                    onGetStarted={() => {}}
                    onStartConversation={() => {}}
                    onUseAnotherAccount={() => {}}
                    showBackButton
                  />
                </PreviewSurface>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Prototype sign-in screen used to simulate returning from LinkedIn auth."
              states={["Sign in flow", "Use another account"]}
              title="PrototypeLinkedInSignInScreen"
            >
              <div className="grid gap-6 xl:grid-cols-2">
                <PreviewSurface
                  className="overflow-hidden"
                  label="Sign in flow"
                  padded={false}
                >
                  <PrototypeLinkedInSignInScreen
                    defaultAccountId="jamie-chen"
                    isEmbeddedPreview
                    onSubmit={() => {}}
                  />
                </PreviewSurface>

                <PreviewSurface
                  className="overflow-hidden"
                  label="Use another account flow"
                  padded={false}
                >
                  <PrototypeLinkedInSignInScreen
                    defaultAccountId="alex-rivera"
                    isEmbeddedPreview
                    onSubmit={() => {}}
                  />
                </PreviewSurface>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Scheduling surface for format choice, slot selection, and contact details."
              states={["Scheduling"]}
              title="AiConciergeNextStepPanel"
            >
              <PreviewSurface
                className="h-[760px] overflow-hidden"
                label="Scheduling"
                padded={false}
              >
                <AiConciergeNextStepPanel
                  contactDetails={{
                    email: PREFILLED_CONTACT_DETAILS.email,
                    phoneNumber: PREFILLED_CONTACT_DETAILS.phoneNumber,
                  }}
                  initialSelection={{
                    contactEmail: PREFILLED_CONTACT_DETAILS.email,
                    contactPhoneNumber: PREFILLED_CONTACT_DETAILS.phoneNumber,
                    dateLabel: "Tue, Apr 7",
                    formatId: "video",
                    timeLabel: "10:00 AM",
                  }}
                  onBackToChat={() => {}}
                  onConfirmBooking={() => {}}
                />
              </PreviewSurface>
            </ComponentRow>
          </GallerySection>

          <GallerySection id="conversation-system" title="Conversation System">
            <ComponentRow
              description="Header bar for close and expand controls. The phone action is parked for MVP and hidden in the live prototype."
              states={["Prototype default", "Phone action parked"]}
              title="AiConciergeHeader"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <StatePreview label="Prototype default">
                  <PreviewSurface
                    className="overflow-hidden"
                    padded={false}
                  >
                    <AiConciergeHeader
                      isExpanded={false}
                      liveAgentName={DEFAULT_REPRESENTATIVE_NAME}
                      onClose={() => {}}
                      onToggleExpand={() => {}}
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Phone action parked">
                  <PreviewSurface
                    className="overflow-hidden"
                    padded={false}
                  >
                    <AiConciergeHeader
                      isExpanded={false}
                      liveAgentName={DEFAULT_REPRESENTATIVE_NAME}
                      onClose={() => {}}
                      onOpenPhoneCall={() => {}}
                      onToggleExpand={() => {}}
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Conversation thread for assistant, user, system, and rep messages."
              states={["In-progress chat", "Voice opening"]}
              title="AiConciergeBody"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <StatePreview label="In-progress chat">
                  <PreviewSurface
                    className="h-[560px] overflow-hidden"
                    padded={false}
                  >
                    <AiConciergeBody
                      messages={SAMPLE_BODY_MESSAGES}
                      onBookAgain={() => {}}
                      onBookMeeting={() => {}}
                      onManageBooking={() => {}}
                      onPremiumPlanSelect={() => {}}
                      onRecommendationPrimaryAction={() => {}}
                      onSelectSuggestedReply={() => {}}
                      voiceDraftText="We need the quickest rollout path for this quarter."
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Voice opening">
                  <PreviewSurface
                    className="h-[560px] overflow-hidden"
                    padded={false}
                  >
                    <AiConciergeBody
                      isVoiceModeActive
                      messages={SAMPLE_VOICE_OPENING_MESSAGES}
                      onBookAgain={() => {}}
                      onBookMeeting={() => {}}
                      onInsertOpeningPrompt={() => {}}
                      onManageBooking={() => {}}
                      onPremiumPlanSelect={() => {}}
                      onRecommendationPrimaryAction={() => {}}
                      onSelectSuggestedReply={() => {}}
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Input composer for typing, sending, dictation, and the primary-blue voice entry action."
              states={["Default", "Chat-only", "Responding"]}
              title="AiConciergeComposer"
            >
              <div className="grid gap-6 md:grid-cols-3">
                <StatePreview label="Default">
                  <PreviewSurface
                    className="overflow-hidden"
                    padded={false}
                  >
                    <AiConciergeComposer
                      draft={composerDraft}
                      onDraftChange={setComposerDraft}
                      onSend={() => setComposerDraft("")}
                      onStartVoiceMode={() => {}}
                      onStopResponse={() => {}}
                      onToggleDictation={() => {}}
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Chat-only">
                  <PreviewSurface
                    className="overflow-hidden"
                    padded={false}
                  >
                    <AiConciergeComposer
                      draft={composerDraft}
                      onDraftChange={setComposerDraft}
                      onSend={() => setComposerDraft("")}
                      onStartVoiceMode={() => {}}
                      onStopResponse={() => {}}
                      onToggleDictation={() => {}}
                      showDictationAction={false}
                      showVoiceModeAction={false}
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Responding">
                  <PreviewSurface
                    className="overflow-hidden"
                    padded={false}
                  >
                    <AiConciergeComposer
                      draft={respondingComposerDraft}
                      isResponding
                      onDraftChange={setRespondingComposerDraft}
                      onSend={() => setRespondingComposerDraft("")}
                      onStartVoiceMode={() => {}}
                      onStopResponse={() => {}}
                      onToggleDictation={() => {}}
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Parked callback banner kept in the library for a possible post-MVP return."
              states={["Available", "Requested"]}
              title="AiConciergePhoneCallPrompt"
            >
              <div className="flex flex-col gap-6">
                <StatePreview label="Available">
                  <PreviewSurface className="py-4" padded={false}>
                    <AiConciergePhoneCallPrompt
                      onDismiss={() => {}}
                      onOpenDialog={() => {}}
                      phoneNumber={PREFILLED_CONTACT_DETAILS.phoneNumber}
                      state="available"
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Requested">
                  <PreviewSurface className="py-4" padded={false}>
                    <AiConciergePhoneCallPrompt
                      onDismiss={() => {}}
                      onOpenDialog={() => {}}
                      phoneNumber={PREFILLED_CONTACT_DETAILS.phoneNumber}
                      state="requested"
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Parked callback dialog kept in the library for a possible post-MVP return."
              states={["Open"]}
              title="AiConciergePhoneCallDialog"
            >
              <PreviewSurface
                className="relative min-h-[320px] overflow-hidden bg-[linear-gradient(180deg,#eff5ff_0%,#ffffff_100%)]"
                label="Open"
                padded={false}
              >
                <AiConciergePhoneCallDialog
                  autoFocusInput={false}
                  isOpen
                  onClose={() => {}}
                  onConfirm={() => {}}
                  onPhoneNumberChange={setPhoneNumberDraft}
                  phoneNumber={phoneNumberDraft}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Compact live voice stage that keeps turn-taking visible near the composer."
              states={["Assistant speaking", "User speaking"]}
              title="AiConciergeVoiceDock"
            >
              <div className="flex flex-col gap-6">
                <StatePreview label="Assistant speaking">
                  <PreviewSurface className="pt-6" padded={false}>
                    <AiConciergeVoiceDock
                      onClose={() => {}}
                      onDoneListening={() => {}}
                      onRetry={() => {}}
                      onStopSpeaking={() => {}}
                      status="speaking"
                      userName={`${PREFILLED_CONTACT_DETAILS.firstName} ${PREFILLED_CONTACT_DETAILS.lastName}`}
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="User speaking">
                  <PreviewSurface className="pt-6" padded={false}>
                    <AiConciergeVoiceDock
                      onClose={() => {}}
                      onDoneListening={() => {}}
                      onRetry={() => {}}
                      onStopSpeaking={() => {}}
                      status="listening"
                      userName={`${PREFILLED_CONTACT_DETAILS.firstName} ${PREFILLED_CONTACT_DETAILS.lastName}`}
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="System notice for blocked microphone access or browser voice errors."
              states={["Microphone blocked", "Browser issue"]}
              title="AiConciergeMicrophoneNotice"
            >
              <div className="flex flex-col gap-6">
                <StatePreview label="Microphone blocked">
                  <PreviewSurface className="pt-6" padded={false}>
                    <AiConciergeMicrophoneNotice
                      message="Turn on microphone access and try again"
                      onDismiss={() => {}}
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Browser issue">
                  <PreviewSurface className="pt-6" padded={false}>
                    <AiConciergeMicrophoneNotice
                      message="Voice capture hit a browser issue. Try again."
                      onDismiss={() => {}}
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Dialog for canceling a meeting that has already been booked."
              states={["Open"]}
              title="AiConciergeMeetingCancelDialog"
            >
              <PreviewSurface
                className="relative min-h-[320px] overflow-hidden bg-[linear-gradient(180deg,#eff5ff_0%,#ffffff_100%)]"
                label="Open"
                padded={false}
              >
                <AiConciergeMeetingCancelDialog
                  isOpen
                  onClose={() => {}}
                  onConfirm={() => {}}
                  representativeName={DEFAULT_REPRESENTATIVE_NAME}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Primary assistant message treatment used in the conversation, with a slightly narrower reading width instead of full-bleed copy."
              states={[
                "Default",
                "Expanded panel",
                "Streaming",
                "Voice speaking",
              ]}
              title="ChatAssistantMessage"
            >
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatePreview label="Default">
                  <PreviewSurface>
                    <ChatAssistantMessage body="Based on what you shared, talking to a sales rep looks like the right next step." />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Expanded panel">
                  <PreviewSurface>
                    <ChatAssistantMessage
                      body="Hi Jamie, glad you're here. I can help you explore hiring solutions for Northstar Health, answer your questions, and point you in the right direction from there without making the thread feel like a wall of copy."
                      isPanelExpanded
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Streaming fade">
                  <PreviewSurface>
                    <ChatAssistantMessage
                      body="Hi Jamie, glad you're here. I can help you explore hiring solutions for Northstar Health and point you in the right direction from there."
                      status="streaming"
                      streamedChunks={[
                        "Hi Jamie, glad you're here. ",
                        "I can help you explore hiring solutions ",
                        "for Northstar Health ",
                        "and point you in the right direction from there.",
                      ]}
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Voice speaking">
                  <PreviewSurface>
                    <ChatAssistantMessage
                      body="Hi Jamie, glad you're here. I can help you explore hiring solutions for Northstar Health, answer your questions, and point you in the right direction from there. When you're ready, you can start talking or use what's on screen to get started."
                      isActiveVoiceTurn
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="User message styling inside the conversation thread."
              states={["Standard", "Live draft"]}
              title="ChatUserMessage"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <StatePreview label="Standard">
                  <PreviewSurface>
                    <ChatUserMessage>
                      We want something that helps us move this quarter, not
                      next quarter.
                    </ChatUserMessage>
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Live draft">
                  <PreviewSurface>
                    <ChatUserMessage isDraft>
                      We want something that helps us move this quarter, not
                      next quarter.
                    </ChatUserMessage>
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Sales rep message treatment once a human joins the chat."
              states={["Active reply"]}
              title="ChatLiveAgentMessage"
            >
              <PreviewSurface label="Active reply">
                <ChatLiveAgentMessage
                  body="I can show you how similar teams usually structure this rollout."
                  name={DEFAULT_REPRESENTATIVE_NAME}
                  timestampLabel="1:08 PM"
                />
              </PreviewSurface>
            </ComponentRow>
          </GallerySection>

          <GallerySection id="handoff" title="Handoff">
            <ComponentRow
              description="Recommendation card that turns a suggestion into a clear next action."
              states={["Default"]}
              title="AiConciergeRecommendationCard"
            >
              <PreviewSurface label="Default">
                <ChatCardPreview>
                  <AiConciergeRecommendationCard
                    artifact={SAMPLE_RECOMMENDATION_ARTIFACT}
                    onPrimaryAction={() => {}}
                  />
                </ChatCardPreview>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Grouped plan recommendations with a primary option and supporting alternatives."
              states={["Default"]}
              title="AiConciergePremiumPlanRecommendations"
            >
              <PreviewSurface label="Default">
                <ChatCardPreview>
                  <AiConciergePremiumPlanRecommendations
                    artifact={SAMPLE_PREMIUM_RECOMMENDATIONS_ARTIFACT}
                    onPlanSelect={() => {}}
                  />
                </ChatCardPreview>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Plan-detail panel shown beside chat after a recommendation is selected."
              states={["Plan details"]}
              title="AiConciergePremiumPlanPanel"
            >
              <PreviewSurface
                className="h-[760px] overflow-hidden"
                label="Plan details"
                padded={false}
              >
                <AiConciergePremiumPlanPanel
                  onBackToChat={() => {}}
                  onRedeem={() => {}}
                  planId="all-in-one"
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Thread-level status card for matching, ready, booked, and canceled states."
              states={["Matching", "Connecting", "Ready", "Booked", "Canceled"]}
              title="AiConciergeRepresentativeMatchCard"
            >
              <div className="flex flex-col gap-6">
                <StatePreview label="Matching">
                  <ChatCardPreview>
                    <AiConciergeRepresentativeMatchCard
                      onBookAgain={() => {}}
                      onBookMeeting={() => {}}
                      onManageBooking={() => {}}
                      status="matching"
                    />
                  </ChatCardPreview>
                </StatePreview>
                <StatePreview label="Connecting">
                  <ChatCardPreview>
                    <AiConciergeRepresentativeMatchCard
                      onBookAgain={() => {}}
                      onBookMeeting={() => {}}
                      onManageBooking={() => {}}
                      status="matching"
                      titleText="Connecting you now..."
                    />
                  </ChatCardPreview>
                </StatePreview>
                <StatePreview label="Ready">
                  <ChatCardPreview>
                    <AiConciergeRepresentativeMatchCard
                      onBookAgain={() => {}}
                      onBookMeeting={() => {}}
                      onManageBooking={() => {}}
                      status="ready"
                    />
                  </ChatCardPreview>
                </StatePreview>
                <StatePreview label="Booked">
                  <ChatCardPreview>
                    <AiConciergeRepresentativeMatchCard
                      meetingDetails={MATCHED_MEETING_DETAILS}
                      onBookAgain={() => {}}
                      onBookMeeting={() => {}}
                      onManageBooking={() => {}}
                      status="booked"
                    />
                  </ChatCardPreview>
                </StatePreview>
                <StatePreview label="Canceled">
                  <ChatCardPreview>
                    <AiConciergeRepresentativeMatchCard
                      meetingDetails={{
                        ...MATCHED_MEETING_DETAILS,
                        contactHelperText:
                          "You can book another time if you'd like.",
                      }}
                      onBookAgain={() => {}}
                      onBookMeeting={() => {}}
                      onManageBooking={() => {}}
                      status="canceled"
                    />
                  </ChatCardPreview>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Foreground banner that appears when a representative is ready."
              states={["Ready"]}
              title="AiConciergeRepresentativeReadyBanner"
            >
              <PreviewSurface
                className="overflow-hidden"
                label="Ready"
                padded={false}
              >
                <AiConciergeRepresentativeReadyBanner
                  onBookMeeting={() => {}}
                  onDismiss={() => {}}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Canvas overlay that celebrates a successful booking."
              states={["Celebration"]}
              title="AiConciergeConfettiOverlay"
            >
              <PreviewSurface
                className="overflow-hidden"
                label="Celebration"
                padded={false}
              >
                <div className="relative flex min-h-[240px] items-end bg-[radial-gradient(circle_at_top,#e6f2ff_0%,#f7fbff_40%,#ffffff_100%)] px-6 py-6">
                  <AiConciergeConfettiOverlay trigger={confettiPreviewTrigger} />
                  <div className="relative z-10">
                    <Button
                      onClick={() =>
                        setConfettiPreviewTrigger(
                          (currentTrigger) => currentTrigger + 1,
                        )
                      }
                    >
                      Replay celebration
                    </Button>
                  </div>
                </div>
              </PreviewSurface>
            </ComponentRow>
          </GallerySection>

          <GallerySection id="shared-primitives" title="Shared Primitives">
            <ComponentRow
              description="Shared button component aligned to the design system button matrix, including brand, neutral, text-only, and overlay treatments."
              states={["Primary", "Secondary", "Tertiary", "Overlay", "Compact with icon", "Full width"]}
              title="Button"
            >
              <PreviewSurface label="Variants">
                <div className="flex flex-wrap items-center gap-3">
                  <Button>Schedule a call</Button>
                  <Button variant="secondary" emphasis={false}>
                    Keep exploring
                  </Button>
                  <Button variant="tertiary">Learn more</Button>
                  <div className="rounded-[28px] bg-ai-surface-overlay-soft px-4 py-3">
                    <Button variant="overlay">Use overlay action</Button>
                  </div>
                  <Button
                    size="compact"
                    leadingVisual={<PhoneCallIcon className="h-4 w-4" />}
                  >
                    Continue by phone
                  </Button>
                </div>
              </PreviewSurface>
              <PreviewSurface label="Full width">
                <div className="grid max-w-[280px] gap-3">
                  <Button fullWidth>Primary full width</Button>
                  <Button fullWidth variant="secondary">
                    Secondary full width
                  </Button>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Compact icon-only button for utility and quick actions."
              states={["Premium", "Primary", "Secondary", "Tertiary"]}
              title="IconButton"
            >
              <PreviewSurface label="Variants">
                <div className="flex flex-wrap gap-3">
                  <IconButton ariaLabel="Phone premium" variant="premium">
                    <PhoneCallIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton ariaLabel="Phone primary" variant="primary">
                    <PhoneCallIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    ariaLabel="Phone secondary"
                    emphasis={false}
                    variant="secondary"
                  >
                    <PhoneCallIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    ariaLabel="Phone tertiary"
                    emphasis={false}
                    variant="tertiary"
                  >
                    <PhoneCallIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    ariaLabel="Close tertiary"
                    emphasis={false}
                    variant="tertiary"
                    className="rounded-full"
                  >
                    <CloseIcon className="h-full w-full" />
                  </IconButton>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Selection pill used for quick choices like dates and formats."
              states={["Selected", "Default"]}
              title="ChoicePill"
            >
              <PreviewSurface label="Variants">
                <div className="flex flex-wrap gap-3">
                  <ChoicePill selected>Tue, Apr 7</ChoicePill>
                  <ChoicePill>Wed, Apr 8</ChoicePill>
                  <ChoicePill>Phone call</ChoicePill>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Small tag used for status and supporting metadata."
              states={["Default", "Supportive"]}
              title="Tag"
            >
              <PreviewSurface label="Variants">
                <div className="flex flex-wrap items-center gap-3">
                  <Tag tone="default">30-minute conversation</Tag>
                  <Tag tone="supportive1">Representative ready</Tag>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Prompt chip used to help users start or continue the conversation."
              states={["Default"]}
              title="SuggestedActionPrompt"
            >
              <PreviewSurface label="Default">
                <div className="flex flex-wrap gap-2">
                  <SuggestedActionPrompt>
                    We&apos;re not sure which hiring solution fits
                  </SuggestedActionPrompt>
                  <SuggestedActionPrompt>
                    Talk to a sales rep
                  </SuggestedActionPrompt>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Identity chip used during LinkedIn prefill and account confirmation."
              states={["Connected identity"]}
              title="LinkedInIdentityChip"
            >
              <PreviewSurface label="Connected identity">
                <LinkedInIdentityChip
                  linkedInIdentity={LINKEDIN_IDENTITY}
                  onUseAnotherAccount={() => {}}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Shared internal-only floating pill that opens the prototype drawer, with optional page links and route-specific controls."
              states={["Main route", "Premium survey route", "Scenario controls", "No Pages section"]}
              title="InternalPrototypeNav"
            >
              <PreviewSurface label="Routes">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/"
                    className="ai-type-heading-sm w-fit text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                  >
                    Main prototype
                  </Link>
                  <Link
                    href="/prototype/premium-survey"
                    className="ai-type-heading-sm w-fit text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                  >
                    Premium survey prototype
                  </Link>
                  <p className="ai-type-body-sm max-w-[32rem] text-ai-text-meta">
                    The main route uses the drawer for shared prototype state,
                    while the premium survey uses the same shell with only its
                    own controls and no Pages section.
                  </p>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Landing-page CTA wrapper that now composes the shared Button while keeping the simpler landing-page API."
              states={["Outline", "Solid"]}
              title="ContactSalesButton"
            >
              <PreviewSurface label="Variants">
                <div className="flex flex-wrap gap-4">
                  <ContactSalesButton
                    label="Contact sales"
                    onClick={() => {}}
                    variant="outline"
                  />
                  <ContactSalesButton
                    label="Ask AI Concierge"
                    onClick={() => {}}
                  />
                </div>
              </PreviewSurface>
            </ComponentRow>
          </GallerySection>
        </div>
      </main>
    </>
  );
}

function GallerySection({
  children,
  id,
  title,
}: {
  children: ReactNode;
  id: string;
  title: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-ai-divider pt-14">
      <h2 className="ai-type-heading-xl text-ai-text-primary">{title}</h2>
      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </section>
  );
}

function ComponentRow({
  children,
  description,
  states,
  title,
}: {
  children: ReactNode;
  description: string;
  states: string[];
  title: string;
}) {
  return (
    <article className="border-t border-ai-divider pt-8 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-5">
        <div className="max-w-[760px]">
          <h3 className="ai-type-heading-lg text-ai-text-primary">{title}</h3>
          <p className="ai-type-body-sm-open mt-2 text-ai-text-primary">
            {description}
          </p>
          <StateList states={states} title={title} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </article>
  );
}

function StateList({
  states,
  title,
}: {
  states: string[];
  title: string;
}) {
  return (
    <div className="mt-4">
      <p className="ai-type-body-xs text-ai-text-meta">States</p>
      <ul
        aria-label={`${title} states`}
        className="mt-3 flex flex-wrap gap-2"
      >
        {states.map((state) => (
          <li key={state}>
            <span className="ai-type-body-xs inline-flex rounded-full border border-ai-divider bg-ai-surface-panel-subtle px-3 py-1 text-ai-text-secondary">
              {state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      className="ai-type-body-sm-open text-ai-blue-primary underline-offset-4 transition-colors hover:text-ai-blue-hover hover:underline"
    >
      {children}
    </a>
  );
}

function PreviewSurface({
  children,
  className,
  label,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  padded?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {label ? (
        <p className="ai-type-body-xs text-ai-text-meta">{label}</p>
      ) : null}
      <div
        className={joinClassNames(
          "w-full rounded-[20px] border border-ai-divider bg-ai-surface-base",
          padded ? "p-6" : "",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function StatePreview({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="ai-type-body-xs text-ai-text-meta">{label}</p>
      {children}
    </div>
  );
}

function ChatCardPreview({ children }: { children: ReactNode }) {
  return <div className="max-w-[344px]">{children}</div>;
}
