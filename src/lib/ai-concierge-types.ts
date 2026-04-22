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

// Controls which downstream side effect a recommendation-card CTA triggers when
// tapped. "book-meeting" runs the representative match → booking flow; "live-chat"
// runs the live sales handoff flow. When intent is omitted we default to
// "book-meeting" for back-compat with single-CTA cards (Route 1).
export type AiConciergeRecommendationCtaIntent = "book-meeting" | "live-chat";

export type AiConciergeRecommendationArtifact = {
  bodyText?: string;
  ctaHref?: string;
  ctaLabel: string;
  // Present on two-CTA cards (e.g. Routes 2/3: "Chat live now" vs. "Schedule for
  // later"). When present, the card renders two buttons and each button's intent
  // determines the side effect.
  primaryCtaIntent?: AiConciergeRecommendationCtaIntent;
  secondaryCtaIntent?: AiConciergeRecommendationCtaIntent;
  secondaryCtaLabel?: string;
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
