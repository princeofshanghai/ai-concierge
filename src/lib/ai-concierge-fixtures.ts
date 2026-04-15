import type {
  ConciergeContactDetails,
  LinkedInIdentity,
  RepresentativeMeetingDetails,
} from "@/lib/ai-concierge-types";

export const DEFAULT_REPRESENTATIVE_NAME = "David S.";
export type DemoLinkedInAccountId = "jamie-chen" | "alex-rivera";

export const EMPTY_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phoneNumber: "",
  countryRegion: "",
  role: "",
};

export const PREFILLED_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "Jamie",
  lastName: "Chen",
  company: "Northstar Health",
  email: "jamie.chen@northstarhealth.com",
  phoneNumber: "(415) 555-0139",
  countryRegion: "United States",
  role: "Director - HR/Talent",
};

export const LINKEDIN_IDENTITY: LinkedInIdentity = {
  firstName: PREFILLED_CONTACT_DETAILS.firstName,
  lastName: PREFILLED_CONTACT_DETAILS.lastName,
  email: PREFILLED_CONTACT_DETAILS.email,
};

export const SECONDARY_PREFILLED_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "Alex",
  lastName: "Rivera",
  company: "Beacon Labs",
  email: "alex.rivera@beaconlabs.com",
  phoneNumber: "(628) 555-0188",
  countryRegion: "United States",
  role: "VP - Talent Acquisition",
};

export const SECONDARY_LINKEDIN_IDENTITY: LinkedInIdentity = {
  firstName: SECONDARY_PREFILLED_CONTACT_DETAILS.firstName,
  lastName: SECONDARY_PREFILLED_CONTACT_DETAILS.lastName,
  email: SECONDARY_PREFILLED_CONTACT_DETAILS.email,
};

export const DEMO_LINKEDIN_ACCOUNTS: Record<
  DemoLinkedInAccountId,
  {
    contactDetails: ConciergeContactDetails;
    id: DemoLinkedInAccountId;
    linkedInIdentity: LinkedInIdentity;
  }
> = {
  "alex-rivera": {
    contactDetails: SECONDARY_PREFILLED_CONTACT_DETAILS,
    id: "alex-rivera",
    linkedInIdentity: SECONDARY_LINKEDIN_IDENTITY,
  },
  "jamie-chen": {
    contactDetails: PREFILLED_CONTACT_DETAILS,
    id: "jamie-chen",
    linkedInIdentity: LINKEDIN_IDENTITY,
  },
};

export function getDemoLinkedInAccountById(accountId: DemoLinkedInAccountId) {
  return DEMO_LINKEDIN_ACCOUNTS[accountId];
}

export function getDemoLinkedInAccountByEmail(
  email: string,
  fallbackAccountId: DemoLinkedInAccountId = "jamie-chen",
) {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.includes("alex")) {
    return DEMO_LINKEDIN_ACCOUNTS["alex-rivera"];
  }

  if (normalizedEmail.includes("jamie")) {
    return DEMO_LINKEDIN_ACCOUNTS["jamie-chen"];
  }

  return DEMO_LINKEDIN_ACCOUNTS[fallbackAccountId];
}

export const REQUIRED_CONTACT_FIELDS: Array<keyof ConciergeContactDetails> = [
  "firstName",
  "lastName",
  "company",
  "email",
  "phoneNumber",
  "role",
];

export const DEFAULT_BOOKED_MEETING_DETAILS: RepresentativeMeetingDetails = {
  contactHelperText: "We'll send the meeting link shortly.",
  dateLabel: "Tuesday, April 9",
  formatLabel: "Video call",
  representativeName: DEFAULT_REPRESENTATIVE_NAME,
  timeLabel: "2:00 PM-2:30 PM PT",
};
