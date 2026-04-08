"use client";

import Image from "next/image";
import { useState } from "react";
import { LinkedInIdentityChip } from "@/components/linkedin-identity-chip";
import { Button } from "@/components/button";
import {
  FormSelectField,
  FormTextField,
} from "@/components/form-fields";
import type {
  ConciergeContactDetails,
  LinkedInIdentity,
} from "@/lib/ai-concierge-types";
import {
  COUNTRY_REGION_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/onboarding-options";

type AiConciergeOnboardingProps = {
  copyVariant?: "default" | "direct-entry";
  details: ConciergeContactDetails;
  isPanelExpanded?: boolean;
  isValid: boolean;
  linkedInIdentity: LinkedInIdentity | null;
  mode: "manual" | "prefill" | "welcome";
  onBack: () => void;
  onChange: (
    field: keyof ConciergeContactDetails,
    value: string,
  ) => void;
  onGetStarted: () => void;
  onContinueWithLinkedIn: () => void;
  onStartConversation: () => void;
  onUseAnotherAccount: () => void;
};

const LINKEDIN_DETAILS_FIELDS: Array<keyof ConciergeContactDetails> = [
  "firstName",
  "lastName",
  "company",
  "email",
  "phoneNumber",
  "countryRegion",
];

function getMissingLinkedInDetails(
  details: ConciergeContactDetails,
): Array<keyof ConciergeContactDetails> {
  return LINKEDIN_DETAILS_FIELDS.filter(
    (field) => details[field].trim().length === 0,
  );
}

function OnboardingDetailsForm({
  copyVariant = "default",
  details,
  isPanelExpanded = false,
  isValid,
  linkedInIdentity,
  mode,
  onBack,
  onChange,
  onContinueWithLinkedIn,
  onStartConversation,
  onUseAnotherAccount,
}: Omit<
  AiConciergeOnboardingProps,
  "onGetStarted"
>) {
  const isPrefill = mode === "prefill";
  const [isEditingPrefillDetails, setIsEditingPrefillDetails] = useState(false);
  const missingPrefillDetails = getMissingLinkedInDetails(details);
  const hasMissingPrefillDetails = missingPrefillDetails.length > 0;
  const shouldShowPrefillSummary =
    isPrefill &&
    linkedInIdentity !== null &&
    !isEditingPrefillDetails;
  const shouldShowRoleField =
    !shouldShowPrefillSummary || details.role.trim().length === 0;
  const shouldShowAllContactFields =
    mode === "manual" ||
    (isPrefill && isEditingPrefillDetails) ||
    (isPrefill && linkedInIdentity === null);
  const title = isPrefill ? "Confirm details" : "Confirm details";
  const shouldShowBackButton = copyVariant !== "direct-entry";
  const directEntryDescription =
    copyVariant === "direct-entry" && !isPrefill
      ? "Before we start, share a few details so I can tailor the conversation and connect you with the right account rep."
      : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-20 pt-5">
        <div
          className={[
            "mx-auto w-full max-w-[360px]",
            isPanelExpanded ? "sm:max-w-[448px]" : "",
          ].join(" ")}
        >
          {shouldShowBackButton ? (
            <button
              type="button"
              onClick={onBack}
              className="ai-type-heading-sm mb-5 inline-flex items-center gap-2 text-ai-text-meta transition-colors hover:text-ai-text-primary"
            >
              <Image
                src="/figma/chat/arrow-left.svg"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
                className="h-6 w-6"
              />
              Back
            </button>
          ) : null}

          <div
            className={[
              "max-w-[320px]",
              isPanelExpanded ? "sm:max-w-[384px]" : "",
            ].join(" ")}
          >
            <h3 className="ai-type-heading-xl text-ai-text-primary">{title}</h3>
            {directEntryDescription ? (
              <p className="ai-type-body-md-open mt-3 text-ai-text-primary">
                {directEntryDescription}
              </p>
            ) : null}
          </div>

          {mode === "manual" ? (
            <ManualLinkedInPrompt
              onContinueWithLinkedIn={onContinueWithLinkedIn}
            />
          ) : shouldShowPrefillSummary ? (
            <LinkedInDetailsSummary
              details={details}
              isPanelExpanded={isPanelExpanded}
              linkedInIdentity={linkedInIdentity}
              onEdit={() => setIsEditingPrefillDetails(true)}
              onUseAnotherAccount={onUseAnotherAccount}
            />
          ) : isPrefill ? (
            <LinkedInProfileSection
              linkedInIdentity={linkedInIdentity}
              onUseAnotherAccount={onUseAnotherAccount}
            />
          ) : null}

          <form
            className="mt-5 flex flex-col gap-4 pb-6"
            onSubmit={(event) => {
              event.preventDefault();
              onStartConversation();
            }}
          >
            {shouldShowAllContactFields ? (
              <ContactDetailFields
                details={details}
                isPanelExpanded={isPanelExpanded}
                onChange={onChange}
              />
            ) : hasMissingPrefillDetails ? (
              <ContactDetailFields
                details={details}
                isPanelExpanded={isPanelExpanded}
                visibleFields={missingPrefillDetails}
                onChange={onChange}
              />
            ) : null}

            {shouldShowRoleField ? (
              <FormSelectField
                label="Your role"
                placeholder="Select your role"
                options={ROLE_OPTIONS}
                value={details.role}
                onValueChange={(value) => onChange("role", value)}
              />
            ) : null}

            <div className="pt-2">
              <Button type="submit" fullWidth disabled={!isValid}>
                Start conversation
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactDetailFields({
  details,
  isPanelExpanded,
  onChange,
  visibleFields = LINKEDIN_DETAILS_FIELDS,
}: {
  details: ConciergeContactDetails;
  isPanelExpanded: boolean;
  onChange: (
    field: keyof ConciergeContactDetails,
    value: string,
  ) => void;
  visibleFields?: Array<keyof ConciergeContactDetails>;
}) {
  const visibleFieldSet = new Set<keyof ConciergeContactDetails>(visibleFields);
  const shouldShowNameFields =
    visibleFieldSet.has("firstName") || visibleFieldSet.has("lastName");
  const shouldShowPhoneRegionFields =
    visibleFieldSet.has("phoneNumber") || visibleFieldSet.has("countryRegion");

  return (
    <>
      {shouldShowNameFields ? (
        <div
          className={[
            "grid gap-4",
            isPanelExpanded ? "sm:grid-cols-2" : "",
          ].join(" ")}
        >
          {visibleFieldSet.has("firstName") ? (
            <FormTextField
              label="First name"
              autoComplete="given-name"
              value={details.firstName}
              onValueChange={(value) => onChange("firstName", value)}
            />
          ) : null}
          {visibleFieldSet.has("lastName") ? (
            <FormTextField
              label="Last name"
              autoComplete="family-name"
              value={details.lastName}
              onValueChange={(value) => onChange("lastName", value)}
            />
          ) : null}
        </div>
      ) : null}

      {visibleFieldSet.has("company") ? (
        <FormTextField
          label="Company"
          autoComplete="organization"
          value={details.company}
          onValueChange={(value) => onChange("company", value)}
        />
      ) : null}

      {visibleFieldSet.has("email") ? (
        <FormTextField
          label="Email"
          autoComplete="email"
          type="email"
          value={details.email}
          onValueChange={(value) => onChange("email", value)}
        />
      ) : null}

      {shouldShowPhoneRegionFields ? (
        <div
          className={[
            "grid gap-4",
            isPanelExpanded ? "sm:grid-cols-2" : "",
          ].join(" ")}
        >
          {visibleFieldSet.has("phoneNumber") ? (
            <FormTextField
              label="Phone number"
              autoComplete="tel"
              type="tel"
              value={details.phoneNumber}
              onValueChange={(value) => onChange("phoneNumber", value)}
            />
          ) : null}
          {visibleFieldSet.has("countryRegion") ? (
            <FormSelectField
              label="Country/region"
              autoComplete="country-name"
              placeholder="Select country or region"
              options={COUNTRY_REGION_OPTIONS}
              value={details.countryRegion}
              onValueChange={(value) => onChange("countryRegion", value)}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function LinkedInDetailsSummary({
  details,
  isPanelExpanded,
  linkedInIdentity,
  onEdit,
  onUseAnotherAccount,
}: {
  details: ConciergeContactDetails;
  isPanelExpanded: boolean;
  linkedInIdentity: LinkedInIdentity;
  onEdit: () => void;
  onUseAnotherAccount: () => void;
}) {
  return (
    <div className="mt-4">
      <LinkedInProfileSection
        linkedInIdentity={linkedInIdentity}
        onUseAnotherAccount={onUseAnotherAccount}
      />

      <div className="mt-4 rounded-[20px] border border-ai-divider-subtle bg-ai-surface-base p-4">
        <div className="mb-4 flex justify-end">
          <Button
            size="compact"
            variant="tertiary"
            onClick={onEdit}
            leadingVisual={<EditIcon className="h-3.5 w-3.5" />}
            className="!h-7 !px-2 shrink-0"
          >
            <span className="ai-type-label-xs">Edit</span>
          </Button>
        </div>
        <div
          className={[
            "grid gap-4",
            isPanelExpanded ? "sm:grid-cols-2" : "",
          ].join(" ")}
        >
          <ReadOnlyDetail label="First name" value={details.firstName} />
          <ReadOnlyDetail label="Last name" value={details.lastName} />
        </div>
        <div className="mt-4">
          <ReadOnlyDetail label="Company" value={details.company} />
        </div>
        <div className="mt-4">
          <ReadOnlyDetail label="Email" value={details.email} />
        </div>
        <div
          className={[
            "mt-4 grid gap-4",
            isPanelExpanded ? "sm:grid-cols-2" : "",
          ].join(" ")}
        >
          <ReadOnlyDetail label="Phone number" value={details.phoneNumber} />
          <ReadOnlyDetail
            label="Country/region"
            value={details.countryRegion}
          />
        </div>
        <div className="mt-4">
          <ReadOnlyDetail label="Your role" value={details.role} />
        </div>
      </div>
    </div>
  );
}

function ManualLinkedInPrompt({
  onContinueWithLinkedIn,
}: {
  onContinueWithLinkedIn: () => void;
}) {
  return (
    <div className="mt-4">
      <Button
        fullWidth
        onClick={onContinueWithLinkedIn}
        leadingVisual={<LinkedInLogoIcon />}
      >
        Sign in with LinkedIn
      </Button>
    </div>
  );
}

function LinkedInProfileSection({
  linkedInIdentity,
  onUseAnotherAccount,
}: {
  linkedInIdentity: LinkedInIdentity | null;
  onUseAnotherAccount: () => void;
}) {
  if (!linkedInIdentity) {
    return null;
  }

  return (
    <div className="mt-4">
      <LinkedInIdentityChip
        linkedInIdentity={linkedInIdentity}
        onUseAnotherAccount={onUseAnotherAccount}
      />
    </div>
  );
}

function ReadOnlyDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const hasValue = value.trim().length > 0;

  return (
    <div>
      <p className="ai-type-label-xs text-ai-text-meta">{label}</p>
      <p
        className={[
          "mt-1",
          hasValue
            ? "ai-type-body-sm text-ai-text-primary"
            : "ai-type-body-sm text-ai-text-meta",
        ].join(" ")}
      >
        {hasValue ? value : "Not provided"}
      </p>
    </div>
  );
}

function EditIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M21.1 2.9C20.6 2.3 19.8 2 19 2C18.2 2 17.5 2.3 16.9 2.9L3.9 15.9L2 22L8.2 20L21.1 7C21.7 6.5 22 5.7 22 5C22 4.2 21.7 3.5 21.1 2.9ZM6.8 18.6L5.5 17.3L16.6 6L18 7.4L6.8 18.6Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function LinkedInLogoIcon() {
  return (
    <svg viewBox="0 0 26 26" className="h-[18px] w-[18px]" fill="none">
      <path
        d="M26 2V24C26 24.5304 25.7893 25.0391 25.4142 25.4142C25.0391 25.7893 24.5304 26 24 26H2C1.46957 26 0.960858 25.7893 0.585785 25.4142C0.210712 25.0391 0 24.5304 0 24V2C0 1.46957 0.210712 0.960859 0.585785 0.585786C0.960858 0.210714 1.46957 0 2 0L24 0C24.5304 0 25.0391 0.210714 25.4142 0.585786C25.7893 0.960859 26 1.46957 26 2ZM8 10H4V22H8V10ZM8.25 6C8.25994 5.553 8.13647 5.11317 7.89536 4.73664C7.65424 4.36011 7.30641 4.06396 6.89625 3.88597C6.48609 3.70798 6.0322 3.65622 5.5925 3.73731C5.1528 3.8184 4.74723 4.02865 4.42754 4.34124C4.10785 4.65382 3.88854 5.05456 3.79759 5.49233C3.70665 5.9301 3.74819 6.38503 3.91692 6.79909C4.08564 7.21314 4.37391 7.56754 4.74493 7.81706C5.11594 8.06657 5.55289 8.19989 6 8.2C6.29345 8.20805 6.58552 8.15701 6.85885 8.04994C7.13218 7.94286 7.3812 7.78192 7.59109 7.57669C7.80099 7.37146 7.96748 7.12612 8.08067 6.85526C8.19387 6.5844 8.25145 6.29355 8.25 6ZM22 14.56C22 10.91 19.71 9.66 17.53 9.66C16.7782 9.65542 16.0375 9.84096 15.3766 10.1994C14.7158 10.5578 14.1562 11.0774 13.75 11.71V10H10V22H14V15.47C13.956 15.1525 13.9801 14.8292 14.0706 14.5216C14.1611 14.2141 14.316 13.9294 14.525 13.6863C14.7341 13.4432 14.9924 13.2474 15.2829 13.1118C15.5734 12.9763 15.8894 12.9041 16.21 12.9C17.31 12.9 18 13.49 18 15.42V22H22V14.56Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AiConciergeOnboarding({
  copyVariant = "default",
  details,
  isPanelExpanded = false,
  isValid,
  linkedInIdentity,
  mode,
  onBack,
  onChange,
  onGetStarted,
  onContinueWithLinkedIn,
  onStartConversation,
  onUseAnotherAccount,
}: AiConciergeOnboardingProps) {
  if (mode === "welcome") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden px-5 pb-10 pt-8">
        <div className="relative mx-auto flex h-full w-full max-w-[360px] flex-col">
          <div>
            <h3 className="ai-type-display-md text-ai-text-primary">
              Got hiring questions? Just ask.
            </h3>
            <p className="ai-type-body-md-open mt-4 text-ai-text-primary">
              Chat with our AI to find the right hiring solution for your team,
              and connect with a sales rep when you&apos;re ready.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10">
            <Button fullWidth onClick={onGetStarted}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <OnboardingDetailsForm
        key={mode}
        copyVariant={copyVariant}
        details={details}
        isPanelExpanded={isPanelExpanded}
        isValid={isValid}
      linkedInIdentity={linkedInIdentity}
      mode={mode}
      onBack={onBack}
      onChange={onChange}
      onContinueWithLinkedIn={onContinueWithLinkedIn}
      onStartConversation={onStartConversation}
      onUseAnotherAccount={onUseAnotherAccount}
    />
  );
}

export type { ConciergeContactDetails, LinkedInIdentity } from "@/lib/ai-concierge-types";
