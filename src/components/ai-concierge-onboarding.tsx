"use client";

import Image from "next/image";
import type { ReactNode } from "react";

type ConciergeContactDetails = {
  company: string;
  countryRegion: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
};

type AiConciergeOnboardingProps = {
  details: ConciergeContactDetails;
  isPanelExpanded?: boolean;
  isValid: boolean;
  mode: "manual" | "prefill" | "welcome";
  onBack: () => void;
  onChange: (
    field: keyof ConciergeContactDetails,
    value: string,
  ) => void;
  onContinueManual: () => void;
  onContinueWithLinkedIn: () => void;
  onStartConversation: () => void;
  onUseAnotherAccount: () => void;
};

const ROLE_OPTIONS = [
  "Recruiter",
  "Recruiting Manager",
  "Talent Acquisition Leader",
  "HR Leader",
  "Business Leader",
];

function OnboardingActionButton({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  secondary?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "font-panel-text inline-flex min-h-11 w-full items-center justify-center rounded-full border px-5 text-[15px] font-semibold leading-[1.4] transition-colors",
        secondary
          ? "border-black/10 bg-white text-black/80 hover:border-black/20 hover:bg-black/[0.03]"
          : disabled
            ? "cursor-not-allowed border-transparent bg-black/10 text-black/40"
            : "border-transparent bg-linkedin-blue text-white hover:bg-linkedin-blue-dark",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function OnboardingTextField({
  autoComplete,
  label,
  onChange,
  type = "text",
  value,
}: {
  autoComplete?: string;
  label: string;
  onChange: (value: string) => void;
  type?: "email" | "tel" | "text";
  value: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-panel-text text-[13px] font-medium leading-[1.4] text-black/70">
        {label}
      </span>
      <input
        autoComplete={autoComplete}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="font-panel-text h-11 rounded-[14px] border border-black/10 bg-white px-4 text-[15px] leading-[1.5] text-black/90 outline-none transition-colors placeholder:text-black/30 focus:border-black/70"
      />
    </label>
  );
}

function OnboardingSelectField({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-panel-text text-[13px] font-medium leading-[1.4] text-black/70">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "font-panel-text h-11 w-full appearance-none rounded-[14px] border border-black/10 bg-white px-4 pr-10 text-[15px] leading-[1.5] outline-none transition-colors focus:border-black/70",
            value ? "text-black/90" : "text-black/30",
          ].join(" ")}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50"
        >
          <path
            d="M4 6.5L8 10L12 6.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </label>
  );
}

function OnboardingDetailsForm({
  details,
  isPanelExpanded = false,
  isValid,
  mode,
  onBack,
  onChange,
  onContinueWithLinkedIn,
  onStartConversation,
  onUseAnotherAccount,
}: Omit<
  AiConciergeOnboardingProps,
  "onContinueManual"
>) {
  const isPrefilled = mode === "prefill";
  const isManual = mode === "manual";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-20 pt-5">
        <div
          className={[
            "mx-auto w-full max-w-[360px]",
            isPanelExpanded ? "sm:max-w-[448px]" : "",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onBack}
            className="font-panel-text mb-5 inline-flex items-center gap-2 text-[14px] font-medium leading-[1.4] text-black/60 transition-colors hover:text-black/80"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
              <path
                d="M10 3.5L5.5 8L10 12.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            Back
          </button>

          <div
            className={[
              "max-w-[320px]",
              isPanelExpanded ? "sm:max-w-[384px]" : "",
            ].join(" ")}
          >
            <h3 className="font-panel-display text-[24px] font-semibold leading-[1.2] tracking-[0.01em] text-black/90">
              {isPrefilled ? "Review your details" : "Enter your details"}
            </h3>
            {isManual ? (
              <div className="mt-3 flex items-center gap-1.5">
                <p className="font-panel-text text-[13px] leading-[1.35] text-black/55">
                  Want to save time?
                </p>
                <button
                  type="button"
                  onClick={onContinueWithLinkedIn}
                  className="font-panel-text inline-flex text-[13px] font-medium leading-[1.35] text-linkedin-blue transition-colors hover:text-linkedin-blue-dark"
                >
                  Use LinkedIn profile
                </button>
              </div>
            ) : null}
          </div>

          {isPrefilled ? (
            <div className="mt-4 inline-flex max-w-full items-center gap-2.5 rounded-full border border-black/6 bg-black/[0.04] px-2.5 py-2">
              <Image
                src="/figma/chat/linkedin-avatar.png"
                alt=""
                width={32}
                height={32}
                aria-hidden="true"
                className="h-8 w-8 shrink-0 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <p className="font-panel-text truncate text-[13px] font-semibold leading-[1.25] text-black/90">
                  {details.firstName} {details.lastName}
                </p>
                <p className="font-panel-text truncate text-[12px] leading-[1.25] text-black/50">
                  {details.email}
                </p>
              </div>
              <button
                type="button"
                onClick={onUseAnotherAccount}
                aria-label="Use another account"
                className="font-panel-text shrink-0 text-[12px] font-medium leading-[1.25] text-linkedin-blue transition-colors hover:text-linkedin-blue-dark"
              >
                Switch
              </button>
            </div>
          ) : null}

          <form
            className="mt-5 flex flex-col gap-4 pb-6"
            onSubmit={(event) => {
              event.preventDefault();
              onStartConversation();
            }}
          >
            <div
              className={[
                "grid gap-4",
                isPanelExpanded ? "sm:grid-cols-2" : "",
              ].join(" ")}
            >
              <OnboardingTextField
                label="First name"
                autoComplete="given-name"
                value={details.firstName}
                onChange={(value) => onChange("firstName", value)}
              />
              <OnboardingTextField
                label="Last name"
                autoComplete="family-name"
                value={details.lastName}
                onChange={(value) => onChange("lastName", value)}
              />
            </div>
            <OnboardingTextField
              label="Company"
              autoComplete="organization"
              value={details.company}
              onChange={(value) => onChange("company", value)}
            />
            <OnboardingTextField
              label="Email"
              autoComplete="email"
              type="email"
              value={details.email}
              onChange={(value) => onChange("email", value)}
            />
            <OnboardingSelectField
              label="Your role"
              placeholder="Select your role"
              options={ROLE_OPTIONS}
              value={details.role}
              onChange={(value) => onChange("role", value)}
            />

            <div className="pt-2">
              <OnboardingActionButton type="submit" disabled={!isValid}>
                Start conversation
              </OnboardingActionButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AiConciergeOnboarding({
  details,
  isPanelExpanded = false,
  isValid,
  mode,
  onBack,
  onChange,
  onContinueManual,
  onContinueWithLinkedIn,
  onStartConversation,
  onUseAnotherAccount,
}: AiConciergeOnboardingProps) {
  if (mode === "welcome") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden px-5 pb-8 pt-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-16%] top-[-8%] h-[280px] rounded-full bg-[radial-gradient(circle_at_top,rgba(10,102,194,0.18),rgba(10,102,194,0.05)_38%,rgba(255,255,255,0)_72%)]"
        />
        <div className="relative mx-auto w-full max-w-[360px]">
          <h3 className="font-panel-display text-[28px] font-semibold leading-[1.1] tracking-[0.01em] text-black/90">
            Before we begin
          </h3>
          <p className="font-panel-text mt-4 text-[15px] leading-[1.6] text-black/65">
            Share a few details so AI Concierge can tailor the conversation to
            your hiring needs and connect you with the right specialist.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <OnboardingActionButton onClick={onContinueWithLinkedIn}>
              Use LinkedIn profile
            </OnboardingActionButton>
            <OnboardingActionButton secondary onClick={onContinueManual}>
              Enter details manually
            </OnboardingActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingDetailsForm
      details={details}
      isPanelExpanded={isPanelExpanded}
      isValid={isValid}
      mode={mode}
      onBack={onBack}
      onChange={onChange}
      onContinueWithLinkedIn={onContinueWithLinkedIn}
      onStartConversation={onStartConversation}
      onUseAnotherAccount={onUseAnotherAccount}
    />
  );
}

export type { ConciergeContactDetails };
