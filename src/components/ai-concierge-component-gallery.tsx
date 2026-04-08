"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AiConciergeBody } from "@/components/ai-concierge-body";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeConfettiOverlay } from "@/components/ai-concierge-confetti-overlay";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import { AiConciergeMicrophoneNotice } from "@/components/ai-concierge-microphone-notice";
import { AiConciergeNextStepPanel } from "@/components/ai-concierge-next-step-panel";
import { AiConciergeOnboarding } from "@/components/ai-concierge-onboarding";
import { AiConciergePhoneCallDialog } from "@/components/ai-concierge-phone-call-dialog";
import { AiConciergePhoneCallPrompt } from "@/components/ai-concierge-phone-call-prompt";
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
import { ContactSalesButton } from "@/components/contact-sales-button";
import { IconButton } from "@/components/icon-button";
import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import { LinkedInIdentityChip } from "@/components/linkedin-identity-chip";
import { PhoneCallIcon } from "@/components/phone-call-icon";
import { SuggestedActionPrompt } from "@/components/suggested-action-prompt";
import { Tag } from "@/components/tag";
import {
  DEFAULT_BOOKED_MEETING_DETAILS,
  DEFAULT_REPRESENTATIVE_NAME,
  LINKEDIN_IDENTITY,
  PREFILLED_CONTACT_DETAILS,
} from "@/lib/ai-concierge-fixtures";
import type {
  AiConciergeMessage,
  ConciergeContactDetails,
} from "@/lib/ai-concierge-types";

const SAMPLE_RECOMMENDATION_ARTIFACT = {
  bodyText: "First I'll match you with the right one",
  ctaLabel: "Find my rep",
  titleText: "Talk to a sales rep",
  type: "recommendation" as const,
};

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
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-20">
          <header className="max-w-[720px]">
            <p className="ai-type-body-xs text-ai-blue-primary">
              Internal reference
            </p>
            <h1 className="ai-type-display-md mt-3 text-ai-text-primary">
              AI Concierge components
            </h1>
            <p className="ai-type-body-md-open mt-5 text-ai-text-primary">
              A cleaner review surface for checking individual components,
              reading hierarchy, and previewing the current handoff moments
              without digging through the full prototype.
            </p>
            <p className="ai-type-body-sm-open mt-3 text-ai-text-meta">
              Each component now sits in its own row so it is easier to scan,
              discuss, and compare states one piece at a time.
            </p>
            <p className="ai-type-body-xs mt-3 text-ai-text-meta">
              The gallery now pulls its default identity and representative data
              from the same shared fixtures as the main prototype so examples
              stay aligned.
            </p>
            <nav
              aria-label="Component gallery sections"
              className="mt-8 flex flex-wrap gap-x-5 gap-y-3"
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

          <GallerySection
            id="full-surfaces"
            description="The largest surfaces that define the overall AI Concierge flow."
            title="Full Surfaces"
          >
            <ComponentRow
              description="The orchestration layer that owns onboarding, chat, matching, booking, voice, and celebration transitions."
              details="Best reviewed in the main prototype because it coordinates full-screen state changes. Internal refactor note: representative matching, booking, live-sales handoff, phone callback, and voice state now flow through dedicated hooks, and handoff routing now lives in the shared conversation engine, with no intended UI change."
              title="AiConciergePanel"
            >
              <PreviewSurface label="How to review">
                <div className="flex flex-col gap-5">
                  <p className="ai-type-body-sm-open max-w-[60ch] text-ai-text-primary">
                    This is the composition layer rather than a standalone preview.
                    It is where the onboarding, conversation, matching, booking,
                    and phone surfaces all come together.
                  </p>
                  <ul className="ai-type-body-sm-open flex list-disc flex-col gap-1 pl-5 text-ai-text-secondary">
                    {[
                      "AiConciergeHeader",
                      "AiConciergeOnboarding",
                      "AiConciergeBody",
                      "AiConciergeComposer",
                      "AiConciergeConfettiOverlay",
                      "AiConciergePhoneCallPrompt",
                      "AiConciergeVoiceDock",
                      "AiConciergePhoneCallDialog",
                      "AiConciergeNextStepPanel",
                      "AiConciergeRecommendationCard",
                      "AiConciergeRepresentativeMatchCard",
                      "AiConciergeRepresentativeReadyBanner",
                    ].map((childName) => (
                      <li key={childName}>{childName}</li>
                    ))}
                  </ul>
                  <Link
                    href="/"
                    className="ai-type-heading-sm w-fit text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                  >
                    Open the main prototype route
                  </Link>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Entry flow for welcome, LinkedIn prefill, and manual detail collection."
              details="Preview shown: prefill. Welcome-state copy uses 'sales rep' language."
              title="AiConciergeOnboarding"
            >
              <PreviewSurface
                className="overflow-hidden"
                label="Preview"
                padded={false}
              >
                <AiConciergeOnboarding
                  details={onboardingDetails}
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
                  onContinueWithLinkedIn={() => {}}
                  onGetStarted={() => {}}
                  onStartConversation={() => {}}
                  onUseAnotherAccount={() => {}}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Scheduling surface for format selection, slot picking, contact destination, and notes."
              details="Preview shown: active scheduling. In the main prototype this can stay paired with the voice rail for guidance-first voice mode."
              title="AiConciergeNextStepPanel"
            >
              <PreviewSurface
                className="h-[760px] overflow-hidden"
                label="Preview"
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

          <GallerySection
            id="conversation-system"
            description="The pieces that make the core chat feel coherent, responsive, and readable."
            title="Conversation System"
          >
            <ComponentRow
              description="Header chrome for close, expand, and phone entry points."
              details="Preview shown: default chat header."
              title="AiConciergeHeader"
            >
              <PreviewSurface
                className="overflow-hidden"
                label="Preview"
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
            </ComponentRow>

            <ComponentRow
              description="Main thread surface for assistant, user, system, and rep messages."
              details="Preview shown: an in-progress chat with inline reply suggestions."
              title="AiConciergeBody"
            >
              <PreviewSurface
                className="h-[560px] overflow-hidden"
                label="Preview"
                padded={false}
              >
                <AiConciergeBody
                  messages={SAMPLE_BODY_MESSAGES}
                  onBookAgain={() => {}}
                  onBookMeeting={() => {}}
                  onManageBooking={() => {}}
                  onRecommendationPrimaryAction={() => {}}
                  onSelectSuggestedReply={() => {}}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Composer for typed input, suggested replies, voice mode, and sending messages."
              details="Preview shown: default and responding states."
              title="AiConciergeComposer"
            >
              <div className="grid gap-6 md:grid-cols-2">
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
              description="Inline prompt that offers a phone callback as an alternate entry point."
              details="Preview shown: available and requested states with the neutral gray container styling."
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
              description="Dialog used to confirm the number for a callback request."
              details="Preview shown: open state."
              title="AiConciergePhoneCallDialog"
            >
              <PreviewSurface
                className="relative min-h-[320px] overflow-hidden bg-[linear-gradient(180deg,#eff5ff_0%,#ffffff_100%)]"
                label="Preview"
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
              description="The compact live voice stage that keeps turn-taking visible inside the composer area."
              details="Preview shown: controls-only assistant-speaking state and live user-speaking state with the same pulse halo around the active speaker."
              title="AiConciergeVoiceDock"
            >
              <div className="flex flex-col gap-6">
                <StatePreview label="Assistant speaking">
                  <PreviewSurface className="pt-6" padded={false}>
                    <AiConciergeVoiceDock
                      isMuted={false}
                      onClose={() => {}}
                      onDoneListening={() => {}}
                      onRetry={() => {}}
                      onStopSpeaking={() => {}}
                      onToggleMute={() => {}}
                      status="speaking"
                      userCaption=""
                      userName={`${PREFILLED_CONTACT_DETAILS.firstName} ${PREFILLED_CONTACT_DETAILS.lastName}`}
                    />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="User speaking">
                  <PreviewSurface className="pt-6" padded={false}>
                    <AiConciergeVoiceDock
                      isMuted={false}
                      onClose={() => {}}
                      onDoneListening={() => {}}
                      onRetry={() => {}}
                      onStopSpeaking={() => {}}
                      onToggleMute={() => {}}
                      status="listening"
                      userCaption="We need to hire quickly across product and engineering this quarter."
                      userName={`${PREFILLED_CONTACT_DETAILS.firstName} ${PREFILLED_CONTACT_DETAILS.lastName}`}
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="Shared system notice for blocked microphone access and browser-level voice or dictation failures, kept separate from live conversation text."
              details="Preview shown: blocked-mic and generic browser-error states on the neutral gray banner."
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
              description="Primary assistant message treatment used inside the conversation."
              details="Preview shown: default and voice-speaking states with matching text styling, including conversational voice fallbacks that stay in the thread."
              title="ChatAssistantMessage"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <StatePreview label="Default">
                  <PreviewSurface label="Preview">
                    <ChatAssistantMessage body="Based on what you shared, talking to a sales rep looks like the right next step." />
                  </PreviewSurface>
                </StatePreview>
                <StatePreview label="Voice speaking">
                  <PreviewSurface label="Preview">
                    <ChatAssistantMessage
                      body="I can help you explore hiring solutions for Northstar Health and answer questions as we go. When you're ready, just start talking."
                      isActiveVoiceTurn
                    />
                  </PreviewSurface>
                </StatePreview>
              </div>
            </ComponentRow>

            <ComponentRow
              description="User message styling inside the conversation thread."
              details="Preview shown: standard text message."
              title="ChatUserMessage"
            >
              <PreviewSurface label="Preview">
                <ChatUserMessage>
                  We want something that helps us move this quarter, not next
                  quarter.
                </ChatUserMessage>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Live sales rep message treatment once a human joins the chat."
              details="Preview shown: active rep reply."
              title="ChatLiveAgentMessage"
            >
              <PreviewSurface label="Preview">
                <ChatLiveAgentMessage
                  body="I can show you how similar teams usually structure this rollout."
                  name={DEFAULT_REPRESENTATIVE_NAME}
                  timestampLabel="1:08 PM"
                />
              </PreviewSurface>
            </ComponentRow>
          </GallerySection>

          <GallerySection
            id="handoff"
            description="The recommendation, matching, and booking-adjacent moments that bridge from AI guidance to human support."
            title="Handoff"
          >
            <ComponentRow
              description="The simplified recommendation artifact that turns a smart suggestion into a clear next action."
              details="Preview shown: current copy and CTA for the matched sales rep flow."
              title="AiConciergeRecommendationCard"
            >
              <PreviewSurface label="Preview">
                <ChatCardPreview>
                  <AiConciergeRecommendationCard
                    artifact={SAMPLE_RECOMMENDATION_ARTIFACT}
                    onPrimaryAction={() => {}}
                  />
                </ChatCardPreview>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="The durable thread-level status card for matching, ready, booked, and canceled states."
              details="Preview shown: matching, connecting, ready, booked, and canceled states."
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
              description="Foreground banner that pulls the user back when matching is complete."
              details="Preview shown: ready state. In the main prototype this banner can remain visible while voice mode stays active."
              title="AiConciergeRepresentativeReadyBanner"
            >
              <PreviewSurface
                className="overflow-hidden"
                label="Preview"
                padded={false}
              >
                <AiConciergeRepresentativeReadyBanner
                  onBookMeeting={() => {}}
                  onDismiss={() => {}}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Canvas overlay that celebrates a successful booking without interrupting the scheduling flow."
              details="Preview shown: denser, slower, single-burst celebration. Use Replay to trigger it again."
              title="AiConciergeConfettiOverlay"
            >
              <PreviewSurface
                className="overflow-hidden"
                label="Preview"
                padded={false}
              >
                <div className="relative min-h-[240px] bg-[radial-gradient(circle_at_top,#e6f2ff_0%,#f7fbff_40%,#ffffff_100%)] px-6 py-6">
                  <AiConciergeConfettiOverlay trigger={confettiPreviewTrigger} />
                  <div className="relative z-10 flex min-h-[192px] flex-col justify-end gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-[34ch]">
                      <p className="ai-type-heading-sm text-ai-text-primary">
                        Booking celebration
                      </p>
                      <p className="ai-type-body-sm-open mt-2 text-ai-text-secondary">
                        Tuned to a single, fuller burst so the success moment
                        feels more intentional and less distracting.
                      </p>
                    </div>
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

          <GallerySection
            id="shared-primitives"
            description="The reusable building blocks shared across onboarding, chat, handoff, and landing page moments."
            title="Shared Primitives"
          >
            <ComponentRow
              description="Primary, secondary, tertiary, and compact button treatments."
              details="Preview shown: common variants."
              title="Button"
            >
              <PreviewSurface label="Preview">
                <div className="flex flex-wrap gap-3">
                  <Button>Schedule a call</Button>
                  <Button variant="secondary" emphasis={false}>
                    Keep exploring
                  </Button>
                  <Button variant="tertiary">Learn more</Button>
                  <Button
                    size="compact"
                    leadingVisual={<PhoneCallIcon className="h-4 w-4" />}
                  >
                    Continue by phone
                  </Button>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Compact icon-only button treatments used for utility actions."
              details="Preview shown: primary, secondary, and tertiary."
              title="IconButton"
            >
              <PreviewSurface label="Preview">
                <div className="flex flex-wrap gap-3">
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
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Selection pills used for quick choices like dates, formats, and focus areas."
              details="Preview shown: selected and unselected."
              title="ChoicePill"
            >
              <PreviewSurface label="Preview">
                <div className="flex flex-wrap gap-3">
                  <ChoicePill selected>Tue, Apr 7</ChoicePill>
                  <ChoicePill>Wed, Apr 8</ChoicePill>
                  <ChoicePill>Phone call</ChoicePill>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Small metadata tags used for status and compact supporting information."
              details="Preview shown: default and supportive."
              title="Tag"
            >
              <PreviewSurface label="Preview">
                <div className="flex flex-wrap items-center gap-3">
                  <Tag tone="default">30-minute conversation</Tag>
                  <Tag tone="supportive1">Representative ready</Tag>
                </div>
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Reply chips used to help users start or continue the conversation quickly."
              details="Preview shown: common prompts."
              title="SuggestedActionPrompt"
            >
              <PreviewSurface label="Preview">
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
              details="Preview shown: connected identity with subtle gray border and light gray background."
              title="LinkedInIdentityChip"
            >
              <PreviewSurface label="Preview">
                <LinkedInIdentityChip
                  linkedInIdentity={LINKEDIN_IDENTITY}
                  onUseAnotherAccount={() => {}}
                />
              </PreviewSurface>
            </ComponentRow>

            <ComponentRow
              description="Landing-page CTA button used to enter the AI Concierge experience."
              details="Preview shown: outline and solid variants."
              title="ContactSalesButton"
            >
              <PreviewSurface label="Preview">
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
  description,
  id,
  title,
}: {
  children: ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-ai-divider pt-14">
      <div className="max-w-[720px]">
        <p className="ai-type-body-xs text-ai-text-meta">Section</p>
        <h2 className="ai-type-heading-xl mt-2 text-ai-text-primary">
          {title}
        </h2>
        <p className="ai-type-body-sm-open mt-3 text-ai-text-meta">
          {description}
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </section>
  );
}

function ComponentRow({
  children,
  description,
  details,
  title,
}: {
  children: ReactNode;
  description: string;
  details: string;
  title: string;
}) {
  return (
    <article className="border-t border-ai-divider pt-10 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-6">
        <div className="max-w-[720px]">
          <p className="ai-type-body-xs text-ai-text-meta">Component</p>
          <h3 className="ai-type-heading-lg mt-2 text-ai-text-primary">
            {title}
          </h3>
          <p className="ai-type-body-sm-open mt-3 text-ai-text-primary">
            {description}
          </p>
          <p className="ai-type-body-xs mt-3 text-ai-text-meta">{details}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </article>
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
