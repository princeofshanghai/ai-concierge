import type { PremiumPlanId } from "@/lib/ai-concierge-types";

export type PremiumPlanDetail = {
  benefits: string[];
  checkoutHref: string;
  id: PremiumPlanId;
  learnMoreHref: string;
  positioningLine: string;
  priceAfterTrialText: string;
  proofBannerText?: string;
  title: string;
  trialCtaLabel: string;
  trialText: string;
  whyThisFitsYou: string;
};

export const PREMIUM_PLAN_DETAILS: Record<PremiumPlanId, PremiumPlanDetail> = {
  career: {
    benefits: [
      "See jobs where you're likely to be a top applicant based on your skills.",
      "Improve your chances of hearing back by marking top-choice jobs.",
      "Message hiring managers directly with 5 InMail credits per month.",
    ],
    checkoutHref: "/prototype/premium-survey/checkout/career",
    id: "career",
    learnMoreHref: "https://premium.linkedin.com/careers/career",
    positioningLine: "Get hired and get ahead",
    priceAfterTrialText: "$19.99/mo after trial",
    title: "Premium Career",
    trialCtaLabel: "Redeem 1 month for $0",
    trialText: "1 month free trial",
    whyThisFitsYou:
      "If your focus is landing the right job and getting in front of hiring managers, Premium Career gives you the clearest boost to visibility and outreach.",
  },
  business: {
    benefits: [
      "Find industry contacts and decision-makers with unlimited people browsing.",
      "Stand out with exclusive profile customizations and a custom call to action.",
      "Access growth and hiring trends with company insights.",
    ],
    checkoutHref: "/prototype/premium-survey/checkout/business",
    id: "business",
    learnMoreHref: "https://premium.linkedin.com/small-business/business",
    positioningLine: "Grow your network and find the right people",
    priceAfterTrialText: "$44.99/mo after trial",
    proofBannerText:
      "Premium Business subscribers get 13x more profile views on average.",
    title: "Premium Business",
    trialCtaLabel: "Redeem 1 month for $0",
    trialText: "1 month free trial",
    whyThisFitsYou:
      "If your priority is building the right relationships and expanding your reach, Premium Business is the more focused fit.",
  },
  "all-in-one": {
    benefits: [
      "Find new clients with daily prospect suggestions and exclusive client insights.",
      "Expand your profile reach with monthly post boosts and 30 InMail credits per month.",
      "Get qualified applicants with monthly job promotions.",
    ],
    checkoutHref: "/prototype/premium-survey/checkout/all-in-one",
    id: "all-in-one",
    learnMoreHref: "https://premium.linkedin.com/small-business/all-in-one",
    positioningLine: "Sell, market, and hire in one tool",
    priceAfterTrialText: "$74.99/mo after trial",
    proofBannerText:
      "Premium All-in-One subscribers are 60% more likely to get replies from suggested prospects.",
    title: "Premium All-in-One",
    trialCtaLabel: "Redeem 1 month for $0",
    trialText: "1 month free trial",
    whyThisFitsYou:
      "If you want one Premium plan that supports growth, stronger networking, and some early hiring needs, Premium All-in-One is the broadest fit.",
  },
  "sales-navigator-core": {
    benefits: [
      "Find new leads with more than 50 search filters.",
      "Start more conversations with 50 InMail credits per month.",
      "Save time with smart lead recommendations and saved searches.",
    ],
    checkoutHref: "/prototype/premium-survey/checkout/sales-navigator-core",
    id: "sales-navigator-core",
    learnMoreHref: "https://business.linkedin.com/sales-solutions/compare-plans/",
    positioningLine: "Drive more leads and sales opportunities",
    priceAfterTrialText: "$89.99/mo after trial",
    title: "Sales Navigator Core",
    trialCtaLabel: "Redeem 1 month for $0",
    trialText: "1 month free trial",
    whyThisFitsYou:
      "If your main goal is finding leads and creating more sales opportunities, Sales Navigator Core is the dedicated fit.",
  },
  "recruiter-lite": {
    benefits: [
      "Find qualified candidates faster with 20+ advanced search filters.",
      "Get more responses with 30 InMail credits per month.",
      "Save time with daily candidate recommendations and search alerts.",
    ],
    checkoutHref: "/prototype/premium-survey/checkout/recruiter-lite",
    id: "recruiter-lite",
    learnMoreHref: "https://business.linkedin.com/hire/recruiter-lite",
    positioningLine: "Find and hire talent",
    priceAfterTrialText: "$139.99/mo after trial",
    proofBannerText:
      "Recruiter Lite subscribers are 2x more likely to get responses from qualified candidates on average.",
    title: "Recruiter Lite",
    trialCtaLabel: "Redeem 1 month for $0",
    trialText: "1 month free trial",
    whyThisFitsYou:
      "If hiring and candidate discovery are the biggest priorities, Recruiter Lite is the more focused fit.",
  },
};

export function getPremiumPlanDetail(
  planId: string,
): PremiumPlanDetail | null {
  return PREMIUM_PLAN_DETAILS[planId as PremiumPlanId] ?? null;
}

export function getPremiumPlanCheckoutHref(planId: PremiumPlanId) {
  return PREMIUM_PLAN_DETAILS[planId].checkoutHref;
}
