"use client";

import { AiConciergeBody } from "@/components/ai-concierge-body";
import { AiConciergeComposer } from "@/components/ai-concierge-composer";
import { AiConciergeHeader } from "@/components/ai-concierge-header";
import type { AiConciergeMessage } from "@/lib/ai-concierge-types";

const CAPTURE_MESSAGES: AiConciergeMessage[] = [
  {
    id: "assistant-message-1",
    role: "assistant",
    body: "I can help you compare hiring options, answer questions about setup, and bring in a sales rep if you want to move faster.",
    status: "complete",
  },
  {
    id: "user-message-1",
    role: "user",
    body: "We're hiring across product and engineering this quarter and want to understand what would help us ramp fastest.",
  },
];

export default function ChatPanelCapturePage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_26%,#ffffff_100%)] px-6 py-10">
      <section
        id="capture-target"
        aria-label="AI Concierge chat panel capture"
        className="flex h-[780px] w-full max-w-[392px] flex-col overflow-hidden rounded-[24px] border border-ai-border-faint bg-ai-surface-base shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)]"
      >
        <AiConciergeHeader
          isExpanded={false}
          onClose={() => {}}
          onToggleExpand={() => {}}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <AiConciergeBody
            messages={CAPTURE_MESSAGES}
            onBookAgain={() => {}}
            onBookMeeting={() => {}}
            onManageBooking={() => {}}
            onPremiumPlanSelect={() => {}}
            onRecommendationPrimaryAction={() => {}}
            onSelectSuggestedReply={() => {}}
          />
          <AiConciergeComposer
            draft=""
            idlePlaceholder="Type your message"
            onDraftChange={() => {}}
            onSend={() => {}}
            onStopResponse={() => {}}
            onStartVoiceMode={() => {}}
            onToggleDictation={() => {}}
            showDictationAction
            showVoiceModeAction
          />
        </div>
      </section>
    </main>
  );
}
