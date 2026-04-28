"use client";

import Image from "next/image";
import { type ReactNode, useId, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import { PremiumSurveyConciergePanel } from "@/components/premium-survey-concierge-panel";
import {
  PrototypeShellChipRow,
  PrototypeShellHelperText,
  PrototypeShellLabel,
  PrototypeShellLinkChip,
} from "@/components/prototype-shell";
import { PREMIUM_ALEX_CONTACT_DETAILS } from "@/lib/premium-ai-concierge-conversation";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const SURVEY_OPTIONS = [
  {
    id: "land-right-job",
    label: "Stand out and land the right job",
  },
  {
    id: "advance-career",
    label: "Stay competitive and advance my career",
  },
  {
    id: "expand-network",
    label: "Expand my network, business, or visibility",
  },
  {
    id: "find-leads",
    label: "Find and reach new leads",
  },
  {
    id: "hire-people",
    label: "Hire the right people",
  },
  {
    id: "other",
    label: "Other",
  },
] as const;

const ENTRY_VARIANT_OPTIONS = [
  {
    id: "companion",
    label: "Companion",
  },
  {
    id: "inline-help",
    label: "Inline help",
  },
  {
    id: "selection-nudge",
    label: "Selection nudge",
  },
] as const;

const PROGRESS_LABEL = "Choose plan";
const PROGRESS_VALUE_LABEL = "60%";
const PROGRESS_FILL_WIDTH_PERCENT = 81;

export type PremiumSurveyCandidate = "candidate-1" | "candidate-2";
export type PremiumSurveyEntryVariant =
  | "companion"
  | "inline-help"
  | "selection-nudge";

type PremiumSurveyPageProps = {
  candidate: PremiumSurveyCandidate;
  entryVariant: PremiumSurveyEntryVariant;
};

export function PremiumSurveyPage({
  candidate,
  entryVariant,
}: PremiumSurveyPageProps) {
  const checkboxGroupName = useId();
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [overlayLaunchNonce, setOverlayLaunchNonce] = useState(0);
  const [isOverlayChatMounted, setIsOverlayChatMounted] = useState(false);
  const [isOverlayChatOpen, setIsOverlayChatOpen] = useState(false);
  const hasSelectedOptions = selectedOptionIds.length > 0;
  const isCompanionVariant = entryVariant === "companion";
  const shouldShowInlineHelp = entryVariant === "inline-help";
  const shouldShowSelectionNudge =
    entryVariant === "selection-nudge" && hasSelectedOptions;

  useBodyScrollLock(isOverlayChatMounted);

  const openOverlayChat = () => {
    setOverlayLaunchNonce((currentValue) => currentValue + 1);
    setIsOverlayChatMounted(true);
    setIsOverlayChatOpen(true);
  };

  const closeOverlayChat = () => {
    setIsOverlayChatOpen(false);
  };

  const toggleSurveyOption = (optionId: string) => {
    setSelectedOptionIds((currentOptionIds) =>
      currentOptionIds.includes(optionId)
        ? currentOptionIds.filter((currentOptionId) => currentOptionId !== optionId)
        : [...currentOptionIds, optionId],
    );
  };

  const helperSlot = (
    <>
      {shouldShowInlineHelp ? (
        <PremiumSurveyAiHelperCard
          body="I found a likely Premium fit from the context here, so you do not have to compare every plan yourself."
          ctaLabel="View recommendation"
          onOpen={openOverlayChat}
          title="AI recommendation ready"
        />
      ) : null}
      {shouldShowSelectionNudge ? (
        <PremiumSurveyAiHelperCard
          body="I can use this as a starting point and show the plan I would begin with."
          ctaLabel="View recommendation"
          onOpen={openOverlayChat}
          title="Want help choosing?"
        />
      ) : null}
    </>
  );

  return (
    <main className="relative min-h-screen bg-ai-surface-neutral-soft text-ai-text-primary">
      <InternalPrototypeNav
        drawerSections={
          <PremiumSurveyDrawerSections
            candidate={candidate}
            entryVariant={entryVariant}
          />
        }
        hidden={isOverlayChatMounted}
        pageLinks={[]}
      />
      <div className="min-h-screen bg-ai-surface-neutral-soft">
        <header className="border-b border-ai-border-faint bg-ai-surface-base">
          <div className="mx-auto flex h-[52px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-[120px]">
            <Image
              src="/prototype/linkedin-in-26.svg"
              alt="LinkedIn"
              width={26}
              height={26}
              priority
              className="h-[26px] w-[26px] shrink-0"
            />

            <div className="w-full max-w-[500px] min-w-0">
              <div className="h-[6px] overflow-hidden rounded-full bg-ai-surface-disabled">
                <div
                  className="h-full rounded-full bg-[#c37d16]"
                  style={{ width: `${PROGRESS_FILL_WIDTH_PERCENT}%` }}
                />
              </div>
              <div className="ai-type-body-xs mt-2 flex items-center justify-between text-ai-text-meta">
                <span>{PROGRESS_LABEL}</span>
                <span>{PROGRESS_VALUE_LABEL}</span>
              </div>
            </div>

            <Avatar
              decorative
              fallbackSrc="/figma/avatar/entity-initials-04.svg"
              size={28}
            />
          </div>
        </header>

        <section className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="mx-auto max-w-[558px]">
            <PremiumSurveyQuestionCard
              checkboxGroupName={checkboxGroupName}
              helperSlot={helperSlot}
              selectedOptionIds={selectedOptionIds}
              onToggleOption={toggleSurveyOption}
            />
            <PremiumSurveyStepControls />
          </div>
        </section>
      </div>

      {isCompanionVariant && !isOverlayChatMounted ? (
        <PremiumSurveyRecommendationLauncher onOpen={openOverlayChat} />
      ) : null}

      {isOverlayChatMounted ? (
        <PremiumSurveyConciergePanel
          key={`${candidate}-${entryVariant}-${overlayLaunchNonce}`}
          candidate={candidate}
          contactDetails={PREMIUM_ALEX_CONTACT_DETAILS}
          isOpen={isOverlayChatOpen}
          onClose={closeOverlayChat}
          onClosed={() => setIsOverlayChatMounted(false)}
          presentationMode="overlay"
        />
      ) : null}
    </main>
  );
}

function PremiumSurveyDrawerSections({
  candidate,
  entryVariant,
}: {
  candidate: PremiumSurveyCandidate;
  entryVariant: PremiumSurveyEntryVariant;
}) {
  return (
    <section className="mt-7 border-t border-white/8 pt-6">
      <h3 className="font-panel-text text-[15px] leading-none font-semibold text-white">
        Premium survey
      </h3>

      <div className="mt-4">
        <PrototypeShellLabel className="px-0 pb-0 text-white/48">
          Candidate 1 variants
        </PrototypeShellLabel>
        <PrototypeShellChipRow className="mt-2 flex-wrap gap-1.5">
          {ENTRY_VARIANT_OPTIONS.map((option) => (
            <PrototypeShellLinkChip
              key={option.id}
              href={getEntryVariantHref(option.id)}
              selected={candidate === "candidate-1" && entryVariant === option.id}
              prefetch={false}
              className="min-h-9 px-3 text-[12px]"
            >
              {option.label}
            </PrototypeShellLinkChip>
          ))}
        </PrototypeShellChipRow>
      </div>

      <PrototypeShellHelperText className="mt-4 max-w-[28ch] text-white/58">
        All three variants reuse Candidate 1 recommendations. The survey stays
        static while the AI explains the likely plan fit.
      </PrototypeShellHelperText>
    </section>
  );
}

function getEntryVariantHref(entryVariant: PremiumSurveyEntryVariant) {
  return `/prototype/premium-survey?variant=${entryVariant}`;
}

function PremiumSurveyQuestionCard({
  checkboxGroupName,
  helperSlot,
  selectedOptionIds,
  onToggleOption,
}: {
  checkboxGroupName: string;
  helperSlot: ReactNode;
  selectedOptionIds: string[];
  onToggleOption: (optionId: string) => void;
}) {
  return (
    <div className="rounded-[8px] border border-ai-border-faint bg-ai-surface-base px-6 py-6 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] sm:px-8">
      <div className="max-w-[680px]">
        <h1 className="ai-type-heading-lg text-ai-text-primary">
          Premium subscribers get up to 11x more profile views. What do you
          need help with?
        </h1>
        <p className="ai-type-body-sm mt-3 text-ai-text-meta">
          We use AI to tailor your plan
        </p>
      </div>

      <fieldset className="mt-6 flex flex-col gap-2">
        <legend className="sr-only">Premium plan goals</legend>
        {SURVEY_OPTIONS.map((option) => (
          <SurveyOptionCard
            key={option.id}
            checked={selectedOptionIds.includes(option.id)}
            label={option.label}
            name={checkboxGroupName}
            value={option.id}
            onToggle={onToggleOption}
          />
        ))}
      </fieldset>

      <div className="mt-6 space-y-5">
        {helperSlot}
      </div>
    </div>
  );
}

function PremiumSurveyStepControls() {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <Button
        aria-label="Back to previous Premium survey step"
        className="min-w-[96px]"
        variant="secondary"
      >
        Back
      </Button>
      <Button
        aria-label="Continue to next Premium survey step"
        className="min-w-[96px]"
      >
        Next
      </Button>
    </div>
  );
}

function PremiumSurveyAiHelperCard({
  body,
  ctaLabel,
  onOpen,
  title,
}: {
  body: string;
  ctaLabel: string;
  onOpen: () => void;
  title: string;
}) {
  return (
    <div className="rounded-[16px] border border-ai-blue-border-soft bg-ai-blue-fill px-5 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="ai-type-heading-sm text-ai-text-primary">{title}</p>
          <p className="ai-type-body-sm-open mt-1 max-w-[48rem] text-ai-text-secondary">
            {body}
          </p>
        </div>
        <Button
          aria-label={`${ctaLabel} with AI Concierge`}
          className="shrink-0"
          leadingVisual={<PremiumSurveyAiIcon className="h-4 w-4" />}
          onClick={onOpen}
          size="small"
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}

function PremiumSurveyRecommendationLauncher({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex max-w-[calc(100vw-48px)] flex-col items-end gap-2">
      <div
        aria-hidden="true"
        className="pointer-events-none animate-[ai-concierge-panel-enter_320ms_cubic-bezier(0.22,1,0.36,1)_900ms_both] rounded-[14px] border border-ai-blue-border-soft bg-ai-surface-base px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.16),0_0_1px_rgba(0,0,0,0.12)] motion-reduce:animate-none"
      >
        <p className="ai-type-body-sm-bold text-ai-text-primary">
          Plan picked for you
        </p>
      </div>
      <Button
        aria-label="Open AI recommendation"
        className="shadow-[0px_4px_12px_rgba(0,0,0,0.3),0px_0px_1px_rgba(0,0,0,0.16)]"
        leadingVisual={<PremiumSurveyAiIcon className="h-4 w-4" />}
        onClick={onOpen}
        size="small"
      >
        AI recommendation
      </Button>
    </div>
  );
}

type SurveyOptionCardProps = {
  checked: boolean;
  label: string;
  name: string;
  onToggle: (value: string) => void;
  value: string;
};

function SurveyOptionCard({
  checked,
  label,
  name,
  onToggle,
  value,
}: SurveyOptionCardProps) {
  return (
    <label
      className={[
        "flex items-center gap-3 rounded-[8px] border bg-ai-surface-base px-4 py-4 transition-colors",
        checked
          ? "border-ai-checked-primary"
          : "border-ai-border-faint hover:border-ai-border-subtle",
      ].join(" ")}
    >
      <input
        checked={checked}
        name={name}
        type="checkbox"
        value={value}
        className="sr-only"
        onChange={() => onToggle(value)}
      />
      <span
        aria-hidden="true"
        className={[
          "flex size-6 shrink-0 items-center justify-center rounded-[4px] border",
          checked
            ? "border-ai-checked-primary bg-ai-checked-primary text-ai-text-inverse"
            : "border-ai-border-strong bg-ai-surface-base text-transparent",
        ].join(" ")}
      >
        <CheckIcon />
      </span>
      <span className="ai-type-body-sm-bold min-w-0 text-ai-text-primary">
        {label}
      </span>
    </label>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
    >
      <path
        d="M3 8.5L6.25 11.75L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PremiumSurveyAiIcon({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      <path
        d="M12 2.75L13.18 6.03C13.35 6.5 13.72 6.87 14.19 7.04L17.47 8.22L14.19 9.4C13.72 9.57 13.35 9.94 13.18 10.41L12 13.69L10.82 10.41C10.65 9.94 10.28 9.57 9.81 9.4L6.53 8.22L9.81 7.04C10.28 6.87 10.65 6.5 10.82 6.03L12 2.75ZM18.25 11.5L18.88 13.2C18.98 13.47 19.19 13.68 19.46 13.78L21.16 14.41L19.46 15.04C19.19 15.14 18.98 15.35 18.88 15.62L18.25 17.32L17.62 15.62C17.52 15.35 17.31 15.14 17.04 15.04L15.34 14.41L17.04 13.78C17.31 13.68 17.52 13.47 17.62 13.2L18.25 11.5ZM6.14 13.77L6.83 15.61C6.93 15.88 7.14 16.09 7.41 16.19L9.25 16.88L7.41 17.57C7.14 17.67 6.93 17.88 6.83 18.15L6.14 19.99L5.45 18.15C5.35 17.88 5.14 17.67 4.87 17.57L3.03 16.88L4.87 16.19C5.14 16.09 5.35 15.88 5.45 15.61L6.14 13.77Z"
        fill="currentColor"
      />
    </svg>
  );
}
