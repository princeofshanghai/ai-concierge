import type {
  ConciergeContactDetails,
  LinkedInIdentity,
  RepresentativeMeetingDetails,
} from "@/lib/ai-concierge-types";

export const DEFAULT_REPRESENTATIVE_NAME = "David S.";

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

export const REQUIRED_CONTACT_FIELDS: Array<keyof ConciergeContactDetails> = [
  "firstName",
  "lastName",
  "company",
  "email",
  "role",
];

export const DEFAULT_BOOKED_MEETING_DETAILS: RepresentativeMeetingDetails = {
  contactHelperText: "We'll send the meeting link shortly.",
  dateLabel: "Tuesday, April 9",
  formatLabel: "Video call",
  representativeName: DEFAULT_REPRESENTATIVE_NAME,
  timeLabel: "2:00 PM-2:30 PM PT",
};
