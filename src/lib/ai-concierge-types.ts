import type { AiConciergeOpeningSupport } from "@/lib/ai-concierge-opening-presentation";

export type AiConciergeSuggestedReply = {
  id: string;
  label: string;
};

export type PremiumPlanId =
  | "career"
  | "business"
  | "all-in-one"
  | "sales-navigator-core"
  | "recruiter-lite";

export type AiConciergeRecommendationArtifact = {
  bodyText?: string;
  ctaHref?: string;
  ctaLabel: string;
  metaText?: string;
  tagText?: string;
  titleText: string;
  type: "recommendation";
};

export type AiConciergePremiumPlanRecommendation = {
  bodyText: string;
  fitLabel: string;
  id: PremiumPlanId;
  priceText: string;
  promptText: string;
  trialText: string;
  titleText: string;
};

export type AiConciergePremiumPlanRecommendationsArtifact = {
  primaryRecommendation: AiConciergePremiumPlanRecommendation;
  secondaryRecommendations: AiConciergePremiumPlanRecommendation[];
  type: "premium-plan-recommendations";
};

export type RepresentativeMatchStatus =
  | "matching"
  | "ready"
  | "booked"
  | "canceled";

export type RepresentativeMeetingDetails = {
  contactHelperText?: string;
  dateLabel: string;
  formatLabel: string;
  representativeName: string;
  timeLabel: string;
};

export type AiConciergeRepresentativeMatchArtifact = {
  bodyText?: string;
  meetingDetails?: RepresentativeMeetingDetails;
  titleText?: string;
  type: "representative-match";
  status: RepresentativeMatchStatus;
};

export type AiConciergeMessageArtifact =
  | AiConciergeRecommendationArtifact
  | AiConciergePremiumPlanRecommendationsArtifact
  | AiConciergeRepresentativeMatchArtifact;

export type AiConciergeMessage = {
  agentName?: string;
  artifact?: AiConciergeMessageArtifact;
  body: string;
  id: string;
  openingSupport?: AiConciergeOpeningSupport;
  role: "agent" | "assistant" | "system" | "user";
  status?: "complete" | "streaming" | "thinking";
  streamedChunks?: string[];
  suggestedReplies?: AiConciergeSuggestedReply[];
  suggestedReplyDisplay?: "composer" | "inline";
  timestampLabel?: string;
};

export type ConciergeContactDetails = {
  company: string;
  countryRegion: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
};

export type LinkedInIdentity = {
  avatarSrc?: string | null;
  email: string;
  firstName: string;
  lastName: string;
};

export type BookingFormat = "video" | "phone" | "whatsapp";

export type BookingSelection = {
  contactEmail?: string;
  contactPhoneNumber?: string;
  dateLabel: string;
  formatId: BookingFormat;
  note?: string;
  timeLabel: string;
};

export type BookingPanelInitialSelection = Partial<BookingSelection>;
