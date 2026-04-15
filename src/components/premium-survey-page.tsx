"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
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
    id: "personal-goals",
    label: "I'd use Premium for my personal goals",
  },
  {
    id: "work",
    label: "I'd use Premium as part of my job",
  },
  {
    id: "other",
    label: "Other",
  },
] as const;

const DEFAULT_SURVEY_OPTION_ID = "work";
const PROGRESS_LABEL = "Choose plan";
const PROGRESS_VALUE_LABEL = "60%";
const PROGRESS_FILL_WIDTH_PERCENT = 81;

const CANDIDATE_SWITCHER_OPTIONS = [
  {
    id: "candidate-1",
    label: "Candidate 1",
  },
  {
    id: "candidate-2",
    label: "Candidate 2",
  },
] as const;

const LAUNCHER_SWITCHER_OPTIONS = [
  {
    id: "default",
    label: "Default FAB",
  },
  {
    id: "bubble",
    label: "Candidate 3 bubble",
  },
] as const;

export type PremiumSurveyCandidate = "candidate-1" | "candidate-2";
export type PremiumSurveyLauncherVariant = "default" | "bubble";

type PremiumSurveyPageProps = {
  candidate: PremiumSurveyCandidate;
  launcher: PremiumSurveyLauncherVariant;
};

export function PremiumSurveyPage({
  candidate,
  launcher,
}: PremiumSurveyPageProps) {
  const radioGroupName = useId();
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    DEFAULT_SURVEY_OPTION_ID,
  );
  const [chatLaunchNonce, setChatLaunchNonce] = useState(0);
  const [isChatMounted, setIsChatMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isBubbleLauncher = launcher === "bubble";

  useBodyScrollLock(isChatMounted);

  const openChat = () => {
    setChatLaunchNonce((currentValue) => currentValue + 1);
    setIsChatMounted(true);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-ai-surface-neutral-soft text-ai-text-primary">
      <InternalPrototypeNav
        drawerSections={
          <PremiumSurveyDrawerSections
            candidate={candidate}
            launcher={launcher}
          />
        }
        hidden={isChatMounted}
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

          <div className="border-t border-ai-divider-subtle">
            <div className="mx-auto flex w-full max-w-[762px] flex-col items-center gap-4 px-6 py-6 text-center sm:py-8">
              <div className="max-w-[676px]">
                <h1 className="ai-type-heading-xl text-ai-text-primary">
                  Premium members are 2.6x more likely to get hired on average
                </h1>
                <p className="ai-type-body-md-open mt-2 text-ai-text-primary">
                  Enjoy 1-month free on us. Cancel anytime. We&apos;ll remind
                  you 7 days before your trial ends.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <AvatarStack />
                <p className="ai-type-body-sm text-ai-text-meta">
                  Millions of members use Premium
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
          <div className="flex justify-center">
            <div className="w-full max-w-[558px]">
              <div className="rounded-[8px] bg-ai-surface-base px-6 py-6 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] sm:px-8">
                <div className="max-w-[494px]">
                  <h2 className="ai-type-heading-lg text-ai-text-primary">
                    Alex, are you interested in Premium for personal or
                    professional use?
                  </h2>
                  <p className="ai-type-body-sm mt-3 text-ai-text-meta">
                    We&apos;ll find the best plan for you.
                  </p>
                </div>

                <fieldset className="mt-6 flex flex-col gap-2">
                  <legend className="sr-only">Premium survey question</legend>
                  {SURVEY_OPTIONS.map((option) => {
                    const isSelected = option.id === selectedOptionId;

                    return (
                      <SurveyOptionCard
                        key={option.id}
                        checked={isSelected}
                        label={option.label}
                        name={radioGroupName}
                        value={option.id}
                        onSelect={setSelectedOptionId}
                      />
                    );
                  })}
                </fieldset>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-[8px]">
                <div className="h-12 w-[50px]" aria-hidden="true" />
                <Button size="small" className="min-w-[76px]">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      {!isChatMounted ? (
        isBubbleLauncher ? (
          <PremiumSurveyBubbleLauncher onOpen={openChat} />
        ) : (
          <IconButton
            ariaLabel="Open AI concierge"
            className="fixed bottom-6 right-6 z-40 shadow-[0px_4px_12px_rgba(0,0,0,0.3),0px_0px_1px_rgba(0,0,0,0.16)]"
            iconClassName="h-6 w-6"
            onClick={openChat}
            size="medium"
            variant="primary"
          >
            <PremiumSurveyFabIcon />
          </IconButton>
        )
      ) : null}
      {isChatMounted ? (
        <PremiumSurveyConciergePanel
          key={`${candidate}-${chatLaunchNonce}`}
          candidate={candidate}
          contactDetails={PREMIUM_ALEX_CONTACT_DETAILS}
          isOpen={isChatOpen}
          onClose={closeChat}
          onClosed={() => setIsChatMounted(false)}
        />
      ) : null}
    </main>
  );
}

function PremiumSurveyDrawerSections({
  candidate,
  launcher,
}: {
  candidate: PremiumSurveyCandidate;
  launcher: PremiumSurveyLauncherVariant;
}) {
  return (
    <section className="mt-7 border-t border-white/8 pt-6">
      <h3 className="font-panel-text text-[15px] leading-none font-semibold text-white">
        Premium survey
      </h3>

      <div className="mt-4 space-y-5">
        <div>
          <PrototypeShellLabel className="px-0 pb-0 text-white/48">
            Conversation
          </PrototypeShellLabel>
          <PrototypeShellChipRow className="mt-2 flex-wrap gap-1.5">
            {CANDIDATE_SWITCHER_OPTIONS.map((option) => (
              <PrototypeShellLinkChip
                key={option.id}
                href={getConversationSwitcherHref(option.id)}
                selected={candidate === option.id}
                prefetch={false}
                className="min-h-9 px-3 text-[12px]"
              >
                {option.label}
              </PrototypeShellLinkChip>
            ))}
          </PrototypeShellChipRow>
        </div>

        <div>
          <PrototypeShellLabel className="px-0 pb-0 text-white/48">
            Launcher
          </PrototypeShellLabel>
          <PrototypeShellChipRow className="mt-2 flex-wrap gap-1.5">
            {LAUNCHER_SWITCHER_OPTIONS.map((option) => (
              <PrototypeShellLinkChip
                key={option.id}
                href={getLauncherSwitcherHref(option.id, candidate)}
                selected={launcher === option.id}
                prefetch={false}
                className="min-h-9 px-3 text-[12px]"
              >
                {option.label}
              </PrototypeShellLinkChip>
            ))}
          </PrototypeShellChipRow>
        </div>
      </div>

      <PrototypeShellHelperText className="mt-4 max-w-[28ch] text-white/58">
        Candidate 3 reuses Candidate 1 underneath and only changes the entry
        hook. Switching modes resets the chat so each review starts clean.
      </PrototypeShellHelperText>
    </section>
  );
}

function getConversationSwitcherHref(candidate: PremiumSurveyCandidate) {
  return `/prototype/premium-survey?candidate=${candidate === "candidate-2" ? "2" : "1"}`;
}

function getLauncherSwitcherHref(
  launcher: PremiumSurveyLauncherVariant,
  candidate: PremiumSurveyCandidate,
) {
  if (launcher === "bubble") {
    return "/prototype/premium-survey?candidate=3";
  }

  return getConversationSwitcherHref(candidate);
}

function AvatarStack() {
  return (
    <div className="flex items-center pr-2">
      <Avatar
        decorative
        size={24}
        src="/figma/chat/linkedin-avatar.png"
        className="border border-ai-surface-base"
      />
      <Avatar
        decorative
        size={24}
        fallbackSrc="/figma/avatar/entity-initials-02.svg"
        className="-ml-2 border border-ai-surface-base"
      />
      <Avatar
        decorative
        size={24}
        fallbackSrc="/figma/avatar/entity-initials-05.svg"
        className="-ml-2 border border-ai-surface-base"
      />
    </div>
  );
}

function PremiumSurveyBubbleLauncher({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex max-w-[calc(100vw-48px)] items-center gap-2">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 items-center rounded-full border border-ai-border-faint bg-ai-surface-base px-4 py-3 text-left shadow-[0px_4px_12px_rgba(0,0,0,0.18),0px_0px_1px_rgba(0,0,0,0.1)] transition-[border-color,background-color] duration-150 hover:border-ai-border-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary"
      >
        <span className="ai-type-body-sm-bold min-w-0 truncate text-ai-text-primary">
          Find the right Premium plan
        </span>
      </button>
      <IconButton
        ariaLabel="Open AI concierge"
        className="shadow-[0px_4px_12px_rgba(0,0,0,0.3),0px_0px_1px_rgba(0,0,0,0.16)]"
        iconClassName="h-6 w-6"
        onClick={onOpen}
        size="medium"
        variant="primary"
      >
        <PremiumSurveyFabIcon />
      </IconButton>
    </div>
  );
}

type SurveyOptionCardProps = {
  checked: boolean;
  label: string;
  name: string;
  onSelect: (value: string) => void;
  value: string;
};

function SurveyOptionCard({
  checked,
  label,
  name,
  onSelect,
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
        type="radio"
        value={value}
        className="sr-only"
        onChange={() => onSelect(value)}
      />
      <span
        aria-hidden="true"
        className={[
          "flex size-6 shrink-0 items-center justify-center rounded-[4px] border",
          checked
            ? "border-ai-checked-primary bg-ai-checked-primary text-ai-text-inverse"
            : "border-ai-border-subtle bg-ai-surface-base text-transparent",
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

function PremiumSurveyFabIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
    >
      <path
        d="M19.4 4.65L5.73 10.46C4.8 10.86 4.83 12.19 5.78 12.53L10.98 14.39L12.84 19.59C13.18 20.54 14.51 20.57 14.91 19.64L20.72 5.97C21.06 5.16 20.21 4.31 19.4 4.65ZM12.03 13.04L8.2 11.67L17.33 7.79L12.03 13.04ZM13.7 15.77L12.33 11.94L17.58 6.64L13.7 15.77Z"
        fill="currentColor"
      />
    </svg>
  );
}
