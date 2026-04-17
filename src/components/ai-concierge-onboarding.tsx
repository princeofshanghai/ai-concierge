"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { BackArrowIcon } from "@/components/back-arrow-icon";
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
  isLinkedInConnected?: boolean;
  isValid: boolean;
  linkedInIdentity: LinkedInIdentity | null;
  mode: "manual" | "prefill" | "welcome";
  onBack: () => void;
  onChange: (
    field: keyof ConciergeContactDetails,
    value: string,
  ) => void;
  onContinueWithoutLinkedIn?: () => void;
  onGetStarted: () => void;
  onContinueWithLinkedIn: () => void;
  onStartConversation: () => void;
  onUseAnotherAccount: () => void;
  showLinkedInPromptInManualMode?: boolean;
  showBackButton?: boolean;
  submitLabel?: string;
  welcomeVariant?: "legacy" | "profile-aware";
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
  showLinkedInPromptInManualMode = false,
  showBackButton,
  submitLabel = "Start chat",
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
  const isEditingKnownIdentity =
    isPrefill &&
    linkedInIdentity !== null &&
    isEditingPrefillDetails;
  const shouldShowRoleField =
    !shouldShowPrefillSummary || details.role.trim().length === 0;
  const shouldShowAllContactFields =
    mode === "manual" ||
    (isPrefill && isEditingPrefillDetails) ||
    (isPrefill && linkedInIdentity === null);
  const title =
    shouldShowPrefillSummary && linkedInIdentity
      ? `Looks right, ${getLinkedInIdentityFirstName(linkedInIdentity)}?`
      : isEditingKnownIdentity
        ? "Update your details"
      : copyVariant === "direct-entry" && mode === "manual"
        ? "Let's get acquainted"
        : "Confirm details";
  const shouldShowBackButton = showBackButton ?? copyVariant !== "direct-entry";
  const directEntryDescription =
    copyVariant !== "direct-entry"
      ? null
      : mode === "manual"
        ? "to get you the most relevant help"
        : isEditingKnownIdentity
          ? "Changes apply to this chat only"
        : shouldShowPrefillSummary
          ? null
          : "Before you start, confirm your details so we can connect you with the right sales rep.";
  const directEntryDescriptionClassName = isEditingKnownIdentity
    ? "ai-type-body-sm mt-3 text-ai-text-primary"
    : "ai-type-body-md-open mt-3 text-ai-text-primary";

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
              <BackArrowIcon className="h-4 w-4" />
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
              <p className={directEntryDescriptionClassName}>
                {directEntryDescription}
              </p>
            ) : null}
          </div>

          {shouldShowPrefillSummary && linkedInIdentity ? (
            <div className="mt-3">
              <LinkedInAccountSwitchRow
                linkedInIdentity={linkedInIdentity}
                onUseAnotherAccount={onUseAnotherAccount}
              />
            </div>
          ) : null}

          {mode === "manual" && showLinkedInPromptInManualMode ? (
            <ManualLinkedInPrompt
              onContinueWithLinkedIn={onContinueWithLinkedIn}
            />
          ) : shouldShowPrefillSummary ? (
            <LinkedInDetailsSummary
              details={details}
              onEdit={() => setIsEditingPrefillDetails(true)}
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
                {submitLabel}
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
  onEdit,
}: {
  details: ConciergeContactDetails;
  onEdit: () => void;
}) {
  const summaryFields = [
    { label: "First name", value: details.firstName },
    { label: "Last name", value: details.lastName },
    { label: "Company", value: details.company },
    { label: "Email", value: details.email },
    { label: "Phone number", value: details.phoneNumber },
    { label: "Country/region", value: details.countryRegion },
    { label: "Your role", value: details.role },
  ];

  return (
    <div className="mt-4">
      <div className="rounded-[20px] border border-ai-divider-subtle bg-ai-surface-base p-4">
        <div className="mb-6 flex justify-end">
          <Button size="compact" variant="secondary" onClick={onEdit}>
            Edit
          </Button>
        </div>
        <div className="divide-y divide-ai-divider-subtle">
          {summaryFields.map((field) => (
            <ReadOnlyDetail
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
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
        Sign in to LinkedIn
      </Button>
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
    <div className="grid grid-cols-[minmax(96px,112px)_minmax(0,1fr)] items-start gap-4 py-3 first:pt-0 last:pb-0">
      <p className="ai-type-body-sm text-ai-text-meta">{label}</p>
      <p
        className={[
          "min-w-0 text-right [overflow-wrap:anywhere]",
          hasValue
            ? "ai-type-heading-sm text-ai-text-primary"
            : "ai-type-body-sm text-ai-text-meta",
        ].join(" ")}
      >
        {hasValue ? value : "Not provided"}
      </p>
    </div>
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

function getLinkedInIdentityName(linkedInIdentity: LinkedInIdentity) {
  return `${linkedInIdentity.firstName} ${linkedInIdentity.lastName}`.trim();
}

function getLinkedInIdentityFirstName(linkedInIdentity: LinkedInIdentity) {
  return linkedInIdentity.firstName.trim() || getLinkedInIdentityName(linkedInIdentity);
}

function LinkedInAccountSwitchRow({
  linkedInIdentity,
  onUseAnotherAccount,
}: {
  linkedInIdentity: LinkedInIdentity;
  onUseAnotherAccount: () => void;
}) {
  return (
    <div className="flex items-center justify-start gap-1.5 text-left">
      <span className="ai-type-body-sm text-ai-text-primary">
        {`Not ${getLinkedInIdentityFirstName(linkedInIdentity)}?`}
      </span>
      <button
        type="button"
        onClick={onUseAnotherAccount}
        className="ai-type-heading-sm text-ai-blue-primary transition-colors hover:text-ai-blue-hover"
      >
        Switch account
      </button>
    </div>
  );
}

function LinkedInIdentityPrimaryButton({
  linkedInIdentity,
  onClick,
}: {
  linkedInIdentity: LinkedInIdentity;
  onClick: () => void;
}) {
  const fullName = getLinkedInIdentityName(linkedInIdentity);
  const firstName = getLinkedInIdentityFirstName(linkedInIdentity);
  const title = `Continue as ${firstName}`;
  const subtitle = linkedInIdentity.email;

  return (
    <Button
      fullWidth
      onClick={onClick}
      leadingVisual={
        <Avatar
          decorative
          name={fullName}
          seed={linkedInIdentity.email}
          size={40}
          src={linkedInIdentity.avatarSrc}
          className="border border-white/30 shadow-[0_2px_8px_rgba(4,33,64,0.18)]"
        />
      }
      className="!min-h-[64px] !justify-start !gap-3 !rounded-full !px-3 !py-1.5"
    >
      <span className="flex min-w-0 flex-col items-start text-left">
        <span className="ai-type-heading-md w-full truncate text-ai-text-inverse">
          {title}
        </span>
        <span className="ai-type-body-xs w-full truncate text-ai-text-inverse">
          {subtitle}
        </span>
      </span>
    </Button>
  );
}

export function AiConciergeOnboarding({
  copyVariant = "default",
  details,
  isPanelExpanded = false,
  isLinkedInConnected = false,
  isValid,
  linkedInIdentity,
  mode,
  onBack,
  onChange,
  onContinueWithoutLinkedIn,
  onGetStarted,
  onContinueWithLinkedIn,
  onStartConversation,
  onUseAnotherAccount,
  showLinkedInPromptInManualMode,
  showBackButton,
  submitLabel = "Start chat",
  welcomeVariant = "legacy",
}: AiConciergeOnboardingProps) {
  if (mode === "welcome") {
    const welcomeTitle = "Hire the right people, faster";
    const welcomeDescription =
      "Chat with our AI to find the right hiring solution for your team, and connect with a sales rep when you're ready.";

    return (
      <div className="relative flex h-full flex-col overflow-hidden px-5 pb-10 pt-8">
        <div className="relative mx-auto flex h-full w-full max-w-[360px] flex-col">
          <div>
            <h3 className="ai-type-display-md text-ai-text-primary">
              {welcomeTitle}
            </h3>
            <p className="ai-type-body-md-open mt-4 text-ai-text-primary">
              {welcomeDescription}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10">
            {welcomeVariant === "profile-aware" && isLinkedInConnected && linkedInIdentity ? (
              <>
                <LinkedInIdentityPrimaryButton
                  linkedInIdentity={linkedInIdentity}
                  onClick={onGetStarted}
                />
                <Button
                  variant="tertiary"
                  emphasis
                  size="medium"
                  onClick={onUseAnotherAccount}
                >
                  Use another account
                </Button>
              </>
            ) : welcomeVariant === "profile-aware" ? (
              <>
                <Button
                  fullWidth
                  onClick={onContinueWithLinkedIn}
                  leadingVisual={<LinkedInLogoIcon />}
                >
                  Sign in to LinkedIn
                </Button>
                <Button
                  variant="tertiary"
                  emphasis
                  size="medium"
                  onClick={onContinueWithoutLinkedIn}
                >
                  Continue manually
                </Button>
              </>
            ) : (
              <Button fullWidth onClick={onGetStarted}>
                Get started
              </Button>
            )}
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
        showLinkedInPromptInManualMode={showLinkedInPromptInManualMode}
        showBackButton={showBackButton}
        submitLabel={submitLabel}
      />
  );
}

export type { ConciergeContactDetails, LinkedInIdentity } from "@/lib/ai-concierge-types";
