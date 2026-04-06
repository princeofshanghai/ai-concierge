"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AiConciergeBody, type AiConciergeMessage } from "@/components/ai-concierge-body";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import { AiConciergeNextStepPanel } from "@/components/ai-concierge-next-step-panel";
import {
  AiConciergeOnboarding,
  type ConciergeContactDetails,
  type LinkedInIdentity,
} from "@/components/ai-concierge-onboarding";
import { AiConciergePhoneCallDialog } from "@/components/ai-concierge-phone-call-dialog";
import { AiConciergePhoneCallPrompt } from "@/components/ai-concierge-phone-call-prompt";
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

const SAMPLE_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "Jamie",
  lastName: "Chen",
  company: "Northstar Health",
  email: "jamie.chen@northstarhealth.com",
  phoneNumber: "(415) 555-0139",
  countryRegion: "United States",
  role: "Director - HR/Talent",
};

const SAMPLE_LINKEDIN_IDENTITY: LinkedInIdentity = {
  firstName: SAMPLE_CONTACT_DETAILS.firstName,
  lastName: SAMPLE_CONTACT_DETAILS.lastName,
  email: SAMPLE_CONTACT_DETAILS.email,
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
    body: "A recruiter solution plus a short conversation with sales could help you move quickly.",
    status: "complete",
    suggestedReplies: [
      {
        id: "suggested-reply-1",
        label: "Talk to a sales representative",
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
    agentName: "David S.",
    body: "I can walk you through what would get your team live fastest.",
    timestampLabel: "1:08 PM",
  },
];

const MATCHED_MEETING_DETAILS = {
  contactHelperText:
    "We'll send the meeting link to jamie.chen@northstarhealth.com.",
  dateLabel: "Tuesday, April 9",
  formatLabel: "Video call",
  representativeName: "David S.",
  timeLabel: "2:00 PM-2:30 PM PT",
};

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(" ");
}

export function AiConciergeComponentGallery() {
  const [composerDraft, setComposerDraft] = useState("");
  const [phoneNumberDraft, setPhoneNumberDraft] = useState(
    SAMPLE_CONTACT_DETAILS.phoneNumber,
  );
  const [onboardingDetails, setOnboardingDetails] =
    useState<ConciergeContactDetails>(SAMPLE_CONTACT_DETAILS);

  return (
    <>
      <InternalPrototypeNav />
      <main className="min-h-screen bg-[linear-gradient(180deg,#f6faff_0%,#ffffff_24%,#ffffff_100%)] px-5 pb-16 pt-24 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-12">
          <section className="max-w-[880px]">
            <p className="ai-type-heading-sm text-ai-blue-primary">
              Internal reference
            </p>
            <h1 className="ai-type-display-md mt-3 text-ai-text-primary">
              AI Concierge components
            </h1>
            <p className="ai-type-body-md-open mt-4 max-w-[62ch] text-ai-text-meta">
              A quick system scan for PM and engineering. This page shows the
              current export names and representative states without turning the
              whole review into a card gallery.
            </p>
            <p className="ai-type-body-sm-open mt-3 max-w-[62ch] text-ai-text-meta">
              It is intentionally selective: enough to understand the current
              surfaces, loading and handoff moments, and how the pieces map back
              to code.
            </p>
            <nav
              aria-label="Component gallery sections"
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2"
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
          </section>

          <GallerySection
            id="full-surfaces"
            description="The largest pieces that define the overall experience and flow ownership."
            title="Full surfaces"
          >
            <GalleryItem
              description="The fixed overlay container that orchestrates onboarding, chat, voice, phone, booking, and celebration states."
              details="Best reviewed in context because it owns layout transitions and full-screen behavior."
              name="AiConciergePanel"
            >
              <div className="flex flex-col gap-4">
                <p className="ai-type-body-md-open max-w-[62ch] text-ai-text-primary">
                  This is the composition layer rather than a simple standalone
                  preview. It pulls together the exports below and handles the
                  state transitions between them.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "AiConciergeHeader",
                    "AiConciergeOnboarding",
                    "AiConciergeBody",
                    "AiConciergeComposer",
                    "AiConciergePhoneCallPrompt",
                    "AiConciergeVoiceDock",
                    "AiConciergePhoneCallDialog",
                    "AiConciergeNextStepPanel",
                    "AiConciergeRepresentativeReadyBanner",
                    "AiConciergeConfettiOverlay",
                  ].map((childName) => (
                    <ComponentNamePill key={childName}>{childName}</ComponentNamePill>
                  ))}
                </div>
                <p className="ai-type-body-sm-open text-ai-text-meta">
                  Responsive note: this is the place where compact chat, expanded
                  panel, and dual-column booking behavior converge.
                </p>
                <Link
                  href="/"
                  className="ai-type-heading-sm w-fit text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
                >
                  Open the main prototype route
                </Link>
              </div>
            </GalleryItem>

            <GalleryItem
              description="Entry flow for welcome, LinkedIn prefill, and manual detail collection."
              details="Representative state shown: prefill. Other supported modes: welcome and manual."
              name="AiConciergeOnboarding"
            >
              <Stage className="overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base">
                <AiConciergeOnboarding
                  details={onboardingDetails}
                  isValid
                  linkedInIdentity={SAMPLE_LINKEDIN_IDENTITY}
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
              </Stage>
            </GalleryItem>

            <GalleryItem
              description="Scheduling surface for format selection, slot picking, contact destination, and notes."
              details="Representative state shown: active scheduling. This is the main post-handoff booking experience."
              name="AiConciergeNextStepPanel"
            >
              <Stage className="h-[760px] overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base">
                <AiConciergeNextStepPanel
                  contactDetails={{
                    email: SAMPLE_CONTACT_DETAILS.email,
                    phoneNumber: SAMPLE_CONTACT_DETAILS.phoneNumber,
                  }}
                  initialSelection={{
                    contactEmail: SAMPLE_CONTACT_DETAILS.email,
                    contactPhoneNumber: SAMPLE_CONTACT_DETAILS.phoneNumber,
                    dateLabel: "Tue, Apr 7",
                    formatId: "video",
                    timeLabel: "10:00 AM",
                  }}
                  onBackToChat={() => {}}
                  onConfirmBooking={() => {}}
                />
              </Stage>
            </GalleryItem>
          </GallerySection>

          <GallerySection
            id="conversation-system"
            description="The pieces that make the core chat feel coherent, responsive, and readable."
            title="Conversation system"
          >
            <GalleryItem
              description="The main chat shell as it is typically reviewed together."
              details="Shows the empty composer state plus inline suggested replies. Thinking, streaming, and voice-active states still live inside these same exports."
              name="AiConciergeHeader / AiConciergeBody / AiConciergeComposer"
            >
              <div className="grid gap-6">
                <SubcomponentBlock name="AiConciergeHeader">
                  <Stage className="overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base">
                    <AiConciergeHeader
                      isExpanded={false}
                      liveAgentName="David S."
                      onClose={() => {}}
                      onOpenPhoneCall={() => {}}
                      onToggleExpand={() => {}}
                    />
                  </Stage>
                </SubcomponentBlock>

                <SubcomponentBlock name="AiConciergeBody">
                  <Stage className="h-[520px] overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base">
                    <AiConciergeBody
                      messages={SAMPLE_BODY_MESSAGES}
                      onBookMeeting={() => {}}
                      onSelectSuggestedReply={() => {}}
                    />
                  </Stage>
                </SubcomponentBlock>

                <SubcomponentBlock name="AiConciergeComposer">
                  <Stage className="overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base">
                    <AiConciergeComposer
                      draft={composerDraft}
                      onDraftChange={setComposerDraft}
                      onSend={setComposerDraft}
                      onStartVoiceMode={() => {}}
                      onStopResponse={() => {}}
                      onToggleDictation={() => {}}
                    />
                  </Stage>
                </SubcomponentBlock>
              </div>
            </GalleryItem>

            <GalleryItem
              description="Phone and voice entry points that sit alongside the main chat flow."
              details="Representative states shown: available and requested phone prompt, open phone dialog, and speaking voice dock. Error and unsupported voice states still exist but are not duplicated here."
              name="AiConciergePhoneCallPrompt / AiConciergePhoneCallDialog / AiConciergeVoiceDock"
            >
              <div className="grid gap-6">
                <SubcomponentBlock name="AiConciergePhoneCallPrompt">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Stage className="overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base py-4">
                      <AiConciergePhoneCallPrompt
                        onDismiss={() => {}}
                        onOpenDialog={() => {}}
                        phoneNumber={SAMPLE_CONTACT_DETAILS.phoneNumber}
                        state="available"
                      />
                    </Stage>
                    <Stage className="overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base py-4">
                      <AiConciergePhoneCallPrompt
                        onDismiss={() => {}}
                        onOpenDialog={() => {}}
                        phoneNumber={SAMPLE_CONTACT_DETAILS.phoneNumber}
                        state="requested"
                      />
                    </Stage>
                  </div>
                </SubcomponentBlock>

                <SubcomponentBlock name="AiConciergePhoneCallDialog">
                  <Stage className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-ai-divider bg-[linear-gradient(180deg,#eff5ff_0%,#ffffff_100%)]">
                    <AiConciergePhoneCallDialog
                      isOpen
                      onClose={() => {}}
                      onConfirm={() => {}}
                      onPhoneNumberChange={setPhoneNumberDraft}
                      phoneNumber={phoneNumberDraft}
                    />
                  </Stage>
                </SubcomponentBlock>

                <SubcomponentBlock name="AiConciergeVoiceDock">
                  <Stage className="overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base pt-6">
                    <AiConciergeVoiceDock
                      assistantCaption="I can compare the fastest path for hiring support and set up a rep conversation when you are ready."
                      isMuted={false}
                      onClose={() => {}}
                      onRetry={() => {}}
                      onToggleMute={() => {}}
                      status="speaking"
                      userCaption="We need to hire quickly across two functions."
                    />
                  </Stage>
                </SubcomponentBlock>
              </div>
            </GalleryItem>

            <GalleryItem
              description="The message-level building blocks used inside the chat thread."
              details="Representative states shown: complete assistant, user, and live agent. The assistant export also supports thinking and streaming states."
              name="ChatAssistantMessage / ChatUserMessage / ChatLiveAgentMessage"
            >
              <div className="grid gap-6">
                <SubcomponentBlock name="ChatAssistantMessage">
                  <ChatAssistantMessage body="I can help you compare the right hiring path for your team." />
                </SubcomponentBlock>
                <SubcomponentBlock name="ChatUserMessage">
                  <ChatUserMessage>
                    We want something that helps us move this quarter, not next
                    quarter.
                  </ChatUserMessage>
                </SubcomponentBlock>
                <SubcomponentBlock name="ChatLiveAgentMessage">
                  <ChatLiveAgentMessage
                    body="I can show you how similar teams usually structure this rollout."
                    name="David S."
                    timestampLabel="1:08 PM"
                  />
                </SubcomponentBlock>
              </div>
            </GalleryItem>
          </GallerySection>

          <GallerySection
            id="handoff"
            description="The booking and representative moments that make the transition from AI to human support feel explicit."
            title="Handoff"
          >
            <GalleryItem
              description="Matching and ready states used during the sales representative transition."
              details="Representative states shown: matching, ready, booked, plus the banner version that can sit above the thread."
              name="AiConciergeRepresentativeMatchCard / AiConciergeRepresentativeReadyBanner"
            >
              <div className="grid gap-6">
                <SubcomponentBlock name="AiConciergeRepresentativeMatchCard">
                  <div className="grid gap-4 xl:grid-cols-3">
                    <AiConciergeRepresentativeMatchCard
                      onBookMeeting={() => {}}
                      status="matching"
                    />
                    <AiConciergeRepresentativeMatchCard
                      onBookMeeting={() => {}}
                      status="ready"
                    />
                    <AiConciergeRepresentativeMatchCard
                      meetingDetails={MATCHED_MEETING_DETAILS}
                      onBookMeeting={() => {}}
                      status="booked"
                    />
                  </div>
                </SubcomponentBlock>

                <SubcomponentBlock name="AiConciergeRepresentativeReadyBanner">
                  <Stage className="overflow-hidden rounded-[28px] border border-ai-divider bg-ai-surface-base">
                    <AiConciergeRepresentativeReadyBanner
                      onBookMeeting={() => {}}
                      onDismiss={() => {}}
                    />
                  </Stage>
                </SubcomponentBlock>
              </div>
            </GalleryItem>
          </GallerySection>

          <GallerySection
            id="shared-primitives"
            description="Lightweight building blocks reused across onboarding, chat, handoff, and landing page moments."
            title="Shared primitives"
          >
            <GalleryItem
              description="Reusable actions, prompts, and identity cues used throughout the system."
              details="Utility exports used inside these previews also include Avatar, Tooltip, and PhoneCallIcon."
              name="Button / IconButton / ChoicePill / Tag / SuggestedActionPrompt / LinkedInIdentityChip / ContactSalesButton"
            >
              <div className="grid gap-6">
                <SubcomponentBlock name="Button">
                  <div className="flex flex-wrap gap-3">
                    <Button>Book meeting</Button>
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
                </SubcomponentBlock>

                <SubcomponentBlock name="IconButton">
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
                </SubcomponentBlock>

                <SubcomponentBlock name="ChoicePill / Tag / SuggestedActionPrompt">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <ChoicePill selected>Tue, Apr 7</ChoicePill>
                      <ChoicePill>Wed, Apr 8</ChoicePill>
                      <Tag tone="default">20-minute conversation</Tag>
                      <Tag tone="supportive1">Representative ready</Tag>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SuggestedActionPrompt>
                        We&apos;re not sure which hiring solution fits
                      </SuggestedActionPrompt>
                      <SuggestedActionPrompt>
                        Talk to a sales representative
                      </SuggestedActionPrompt>
                    </div>
                  </div>
                </SubcomponentBlock>

                <SubcomponentBlock name="LinkedInIdentityChip / ContactSalesButton">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_auto] lg:items-center">
                    <LinkedInIdentityChip
                      linkedInIdentity={SAMPLE_LINKEDIN_IDENTITY}
                      onUseAnotherAccount={() => {}}
                    />
                    <div className="flex flex-wrap gap-4">
                      <ContactSalesButton label="Contact sales" variant="outline" />
                      <ContactSalesButton label="Ask AI Concierge" />
                    </div>
                  </div>
                </SubcomponentBlock>
              </div>
            </GalleryItem>
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
    <section id={id} className="border-t border-ai-divider pt-10">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="max-w-[240px]">
          <h2 className="ai-type-heading-xl text-ai-text-primary">{title}</h2>
          <p className="ai-type-body-sm-open mt-2 text-ai-text-meta">
            {description}
          </p>
        </div>
        <div className="grid gap-10">{children}</div>
      </div>
    </section>
  );
}

function GalleryItem({
  children,
  description,
  details,
  name,
}: {
  children: ReactNode;
  description: string;
  details: string;
  name: string;
}) {
  return (
    <div className="grid gap-6 border-t border-ai-divider pt-8 first:border-t-0 first:pt-0 xl:grid-cols-[280px_minmax(0,1fr)]">
      <div className="max-w-[260px]">
        <ExportName>{name}</ExportName>
        <p className="ai-type-body-sm-open mt-3 text-ai-text-primary">
          {description}
        </p>
        <p className="ai-type-body-xs mt-3 text-ai-text-meta">{details}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SubcomponentBlock({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  return (
    <div className="grid gap-3">
      <ExportName className="text-ai-text-secondary">{name}</ExportName>
      {children}
    </div>
  );
}

function ExportName({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={joinClassNames(
        "font-mono text-[13px] leading-5 font-semibold tracking-[-0.01em] text-ai-text-primary",
        className,
      )}
    >
      {children}
    </p>
  );
}

function ComponentNamePill({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[12px] leading-none font-semibold text-ai-text-secondary">
      {children}
    </span>
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
      className="ai-type-heading-sm text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
    >
      {children}
    </a>
  );
}

function Stage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClassNames("w-full", className)}>{children}</div>;
}
