"use client";

import { AiConciergeOnboarding } from "@/components/ai-concierge-onboarding";
import {
  LINKEDIN_IDENTITY,
  PREFILLED_CONTACT_DETAILS,
} from "@/lib/ai-concierge-fixtures";

export default function PrefilledConfirmDetailsCapturePage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_26%,#ffffff_100%)] px-6 py-10">
      <section
        id="capture-target"
        className="w-full max-w-[392px] overflow-hidden rounded-[20px] border border-ai-divider bg-ai-surface-base"
      >
        <AiConciergeOnboarding
          copyVariant="direct-entry"
          details={PREFILLED_CONTACT_DETAILS}
          isLinkedInConnected
          isValid
          linkedInIdentity={LINKEDIN_IDENTITY}
          mode="prefill"
          onBack={() => {}}
          onChange={() => {}}
          onContinueWithoutLinkedIn={() => {}}
          onContinueWithLinkedIn={() => {}}
          onGetStarted={() => {}}
          onStartConversation={() => {}}
          onUseAnotherAccount={() => {}}
          showBackButton
          welcomeVariant="profile-aware"
        />
      </section>
    </main>
  );
}
