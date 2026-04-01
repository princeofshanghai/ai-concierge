"use client";

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

const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
];

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
  isValid,
  mode,
  onBack,
  onChange,
  onStartConversation,
  onUseAnotherAccount,
}: Omit<
  AiConciergeOnboardingProps,
  "onContinueManual" | "onContinueWithLinkedIn"
>) {
  const isPrefilled = mode === "prefill";
  const initials = `${details.firstName.charAt(0)}${details.lastName.charAt(0)}`
    .trim()
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5">
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

        <div className="max-w-[320px]">
          <h3 className="font-panel-display text-[24px] font-semibold leading-[1.2] tracking-[0.01em] text-black/90">
            {isPrefilled ? "Review your details" : "Enter your details"}
          </h3>
          {!isPrefilled ? (
            <p className="font-panel-text mt-3 text-[15px] leading-[1.5] text-black/65">
              We need a few details to personalize the conversation and
              connect you with the right sales specialist.
            </p>
          ) : null}
          <p className="font-panel-text mt-3 text-[13px] leading-[1.5] text-black/50">
            All fields are required to begin.
          </p>
        </div>

        {isPrefilled ? (
          <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-black/8 bg-[rgba(10,102,194,0.03)] px-3 py-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(10,102,194,0.14)_0%,rgba(10,102,194,0.08)_100%)] text-[14px] font-semibold text-linkedin-blue">
              {initials || "LI"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-panel-text truncate text-[14px] font-semibold leading-[1.35] text-black/90">
                {details.firstName} {details.lastName}
              </p>
              <p className="font-panel-text truncate text-[13px] leading-[1.35] text-black/50">
                {details.email}
              </p>
            </div>
            <button
              type="button"
              onClick={onUseAnotherAccount}
              aria-label="Use another account"
              className="font-panel-text shrink-0 text-[12px] font-medium leading-[1.35] text-linkedin-blue transition-colors hover:text-linkedin-blue-dark"
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
          <OnboardingTextField
            label="Phone number"
            autoComplete="tel"
            type="tel"
            value={details.phoneNumber}
            onChange={(value) => onChange("phoneNumber", value)}
          />
          <OnboardingSelectField
            label="Country/region"
            placeholder="Select country or region"
            options={COUNTRY_OPTIONS}
            value={details.countryRegion}
            onChange={(value) => onChange("countryRegion", value)}
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
  );
}

export function AiConciergeOnboarding({
  details,
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
      <div className="relative flex h-full flex-col justify-center overflow-hidden px-5 py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-16%] top-[-8%] h-[280px] rounded-full bg-[radial-gradient(circle_at_top,rgba(10,102,194,0.18),rgba(10,102,194,0.05)_38%,rgba(255,255,255,0)_72%)]"
        />
        <div className="relative">
          <h3 className="font-panel-display text-[28px] font-semibold leading-[1.1] tracking-[0.01em] text-black/90">
            Start with AI Concierge
          </h3>
          <p className="font-panel-text mt-4 text-[15px] leading-[1.6] text-black/65">
            To personalize the conversation and connect you with the right
            sales specialist, we need a few details before you begin.
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
      isValid={isValid}
      mode={mode}
      onBack={onBack}
      onChange={onChange}
      onStartConversation={onStartConversation}
      onUseAnotherAccount={onUseAnotherAccount}
    />
  );
}

export type { ConciergeContactDetails };
