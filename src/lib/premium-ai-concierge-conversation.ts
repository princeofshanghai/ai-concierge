import type {
  AiConciergeAssistantTurn,
  AiConciergeConversationState,
} from "@/lib/ai-concierge-conversation";
import type {
  AiConciergePremiumPlanRecommendation,
  AiConciergePremiumPlanRecommendationsArtifact,
  AiConciergeSuggestedReply,
  ConciergeContactDetails,
  LinkedInIdentity,
  PremiumPlanId,
} from "@/lib/ai-concierge-types";
import type { PrototypeScenario } from "@/lib/prototype-scenario";

const PREMIUM_DEFAULT_STATE: AiConciergeConversationState = {
  stage: "opening",
  startingSituation: "unknown",
  hiringMotion: "unknown",
  hiringSummary: null,
  hiringUseCase: "unknown",
  hiringComplexity: "unknown",
  likelySolution: "unknown",
  nextStepMode: null,
  readiness: "unknown",
  urgency: "unknown",
};

const PREMIUM_CANDIDATE_ONE_OPENING_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "premium-other-plans", label: "Show other plans" },
];

const PREMIUM_CANDIDATE_ONE_FOLLOW_UP_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "premium-other-plans", label: "Show other plans" },
  { id: "premium-benefits", label: "How Premium can help" },
  { id: "premium-trial", label: "Tell me about the free trial" },
];

const PREMIUM_CANDIDATE_TWO_OPENING_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "find-clients-leads", label: "Find clients and leads" },
  { id: "grow-network", label: "Grow my network" },
  { id: "hire-right-people", label: "Hire the right people" },
  { id: "build-brand", label: "Build my brand" },
];

const PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS: AiConciergeSuggestedReply[] =
  [
    { id: "compare-these-plans", label: "Compare these plans" },
    { id: "free-trial", label: "How the free trial works" },
    { id: "start-over", label: "Start over" },
  ];

type PremiumCandidateTwoGoal =
  | "clients-leads"
  | "network"
  | "hire"
  | "brand";

type PremiumCandidateTwoPriority =
  | "prospects"
  | "replies"
  | "relationships"
  | "reach-right-people"
  | "visibility"
  | "connections"
  | "qualified-candidates"
  | "candidate-responses"
  | "hiring-activity"
  | "grow-visibility"
  | "relevant-people"
  | "turn-views-opportunities";

type PremiumCandidateTwoPlanRanking = {
  primaryPlanId: PremiumPlanId;
  secondaryPlanIds: [PremiumPlanId, PremiumPlanId];
};

type PremiumCandidateTwoGoalConfig = {
  followUpPrompt: string;
  ranking: PremiumCandidateTwoPlanRanking;
  secondTurnSuggestions: AiConciergeSuggestedReply[];
};

const PREMIUM_CANDIDATE_TWO_GOAL_CONFIG: Record<
  PremiumCandidateTwoGoal,
  PremiumCandidateTwoGoalConfig
> = {
  "clients-leads": {
    followUpPrompt: "What would help most with that right now?",
    ranking: {
      primaryPlanId: "all-in-one",
      secondaryPlanIds: ["business", "sales-navigator-core"],
    },
    secondTurnSuggestions: [
      { id: "priority-prospects", label: "Find the right prospects" },
      { id: "priority-replies", label: "Get more replies" },
      { id: "priority-relationships", label: "Build relationships faster" },
    ],
  },
  network: {
    followUpPrompt: "What matters most there right now?",
    ranking: {
      primaryPlanId: "business",
      secondaryPlanIds: ["all-in-one", "sales-navigator-core"],
    },
    secondTurnSuggestions: [
      { id: "priority-reach-right-people", label: "Reach the right people" },
      { id: "priority-visibility", label: "Increase profile visibility" },
      { id: "priority-connections", label: "Build stronger connections" },
    ],
  },
  hire: {
    followUpPrompt: "What would make the biggest difference right now?",
    ranking: {
      primaryPlanId: "recruiter-lite",
      secondaryPlanIds: ["all-in-one", "business"],
    },
    secondTurnSuggestions: [
      {
        id: "priority-qualified-candidates",
        label: "Find qualified candidates faster",
      },
      {
        id: "priority-candidate-responses",
        label: "Get more candidate responses",
      },
      { id: "priority-hiring-activity", label: "Stay on top of hiring activity" },
    ],
  },
  brand: {
    followUpPrompt: "What are you trying to improve most?",
    ranking: {
      primaryPlanId: "business",
      secondaryPlanIds: ["all-in-one", "sales-navigator-core"],
    },
    secondTurnSuggestions: [
      { id: "priority-grow-visibility", label: "Grow visibility" },
      {
        id: "priority-relevant-people",
        label: "Reach more relevant people",
      },
      {
        id: "priority-turn-views-opportunities",
        label: "Turn profile views into opportunities",
      },
    ],
  },
};

const PREMIUM_PLAN_RECOMMENDATION_CONTENT: Record<
  PremiumPlanId,
  Omit<
    AiConciergePremiumPlanRecommendation,
    "fitLabel" | "promptText"
  >
> = {
  career: {
    bodyText: "Get hired and get ahead",
    id: "career",
    priceText: "$19.99/mo",
    titleText: "Premium Career",
    trialText: "1 month free trial",
  },
  business: {
    bodyText: "Grow your network and find the right people",
    id: "business",
    priceText: "$44.99/mo",
    titleText: "Premium Business",
    trialText: "1 month free trial",
  },
  "all-in-one": {
    bodyText: "Sell, market, and hire in one tool",
    id: "all-in-one",
    priceText: "$74.99/mo",
    titleText: "Premium All-in-One",
    trialText: "1 month free trial",
  },
  "sales-navigator-core": {
    bodyText: "Drive more leads and sales opportunities",
    id: "sales-navigator-core",
    priceText: "$89.99/mo",
    titleText: "Sales Navigator Core",
    trialText: "1 month free trial",
  },
  "recruiter-lite": {
    bodyText: "Find and hire talent",
    id: "recruiter-lite",
    priceText: "$139.99/mo",
    titleText: "Recruiter Lite",
    trialText: "1 month free trial",
  },
};

const PREMIUM_CANDIDATE_ONE_PRIMARY_ARTIFACT: AiConciergePremiumPlanRecommendationsArtifact =
  createPremiumPlanRecommendationsArtifact({
    primary: {
      fitLabel: "Best overall fit",
      planId: "all-in-one",
    },
    secondary: [],
  });

const PREMIUM_CANDIDATE_ONE_COMPARE_ARTIFACT: AiConciergePremiumPlanRecommendationsArtifact =
  createPremiumPlanRecommendationsArtifact({
    primary: {
      fitLabel: "Best overall fit",
      planId: "all-in-one",
    },
    secondary: [
      {
        fitLabel: "If networking matters most",
        planId: "business",
      },
      {
        fitLabel: "If hiring becomes the priority",
        planId: "recruiter-lite",
      },
    ],
  });

export const PREMIUM_ALEX_CONTACT_DETAILS: ConciergeContactDetails = {
  firstName: "Alex",
  lastName: "Kim",
  company: "Northstar Studio",
  email: "alex.kim@northstarstudio.com",
  phoneNumber: "(415) 555-0172",
  countryRegion: "United States",
  role: "Founder",
};

export const PREMIUM_ALEX_LINKEDIN_IDENTITY: LinkedInIdentity = {
  firstName: PREMIUM_ALEX_CONTACT_DETAILS.firstName,
  lastName: PREMIUM_ALEX_CONTACT_DETAILS.lastName,
  email: PREMIUM_ALEX_CONTACT_DETAILS.email,
};

export function createPremiumCandidateOneOpeningTurn(_args: {
  contactDetails: ConciergeContactDetails;
  openingPromptVariant: PrototypeScenario["openingPromptVariant"];
}): AiConciergeAssistantTurn {
  void _args;

  return {
    artifact: PREMIUM_CANDIDATE_ONE_PRIMARY_ARTIFACT,
    body: "I'd start with Premium All-in-One because it covers the widest mix of goals here.",
    nextState: PREMIUM_DEFAULT_STATE,
    suggestedReplies: PREMIUM_CANDIDATE_ONE_OPENING_SUGGESTIONS,
    suggestedReplyDisplay: "inline",
  };
}

export function getPremiumCandidateOneAssistantTurn({
  input,
}: {
  contactDetails: ConciergeContactDetails;
  input: string;
  state: AiConciergeConversationState;
}): AiConciergeAssistantTurn {
  const normalizedInput = normalizeInput(input);

  if (
    normalizedInput.includes("show other plans") ||
    normalizedInput.includes("other plans") ||
    normalizedInput.includes("show plan options") ||
    normalizedInput.includes("plan options") ||
    normalizedInput.includes("compare")
  ) {
    return {
      artifact: PREMIUM_CANDIDATE_ONE_COMPARE_ARTIFACT,
      body: "Here are the other plans I considered alongside Premium All-in-One. I'd still start with All-in-One, but Premium Business is worth comparing if networking is the main goal, and Recruiter Lite is worth comparing if hiring becomes the priority.",
      nextState: PREMIUM_DEFAULT_STATE,
      suggestedReplies: PREMIUM_CANDIDATE_ONE_FOLLOW_UP_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  return createPremiumCandidateOneChatFollowUpTurn();
}

function createPremiumCandidateOneChatFollowUpTurn(): AiConciergeAssistantTurn {
  return {
    artifact: PREMIUM_CANDIDATE_ONE_COMPARE_ARTIFACT,
    body: "That helps. I’d still keep Premium All-in-One as the best starting point, with Premium Business and Recruiter Lite as alternatives if networking or hiring becomes the clearer priority.",
    nextState: PREMIUM_DEFAULT_STATE,
    suggestedReplies: PREMIUM_CANDIDATE_ONE_FOLLOW_UP_SUGGESTIONS,
    suggestedReplyDisplay: "composer",
  };
}

export function createPremiumCandidateTwoOpeningTurn({
  contactDetails,
}: {
  contactDetails: ConciergeContactDetails;
  openingPromptVariant: PrototypeScenario["openingPromptVariant"];
}): AiConciergeAssistantTurn {
  const greetingName = contactDetails.firstName.trim() || "there";

  return {
    body: `Hi ${greetingName}, I can help you find the right LinkedIn Premium plan or point you toward the option that fits best.\n\nWhat are you hoping Premium helps with most right now?`,
    nextState: PREMIUM_DEFAULT_STATE,
    suggestedReplies: PREMIUM_CANDIDATE_TWO_OPENING_SUGGESTIONS,
    suggestedReplyDisplay: "inline",
  };
}

export function getPremiumCandidateTwoAssistantTurn({
  input,
  state,
}: {
  contactDetails: ConciergeContactDetails;
  input: string;
  state: AiConciergeConversationState;
}): AiConciergeAssistantTurn {
  const normalizedInput = normalizeInput(input);

  if (state.stage === "opening") {
    const goal = inferCandidateTwoGoal(normalizedInput);

    if (!goal) {
      return {
        body: "I can help with that. To keep this simple, what are you hoping Premium helps with most right now?",
        nextState: PREMIUM_DEFAULT_STATE,
        suggestedReplies: PREMIUM_CANDIDATE_TWO_OPENING_SUGGESTIONS,
        suggestedReplyDisplay: "inline",
      };
    }

    const goalConfig = PREMIUM_CANDIDATE_TWO_GOAL_CONFIG[goal];

    return {
      body: `${createCandidateTwoGoalAcknowledgement(goal)}\n\n${goalConfig.followUpPrompt}`,
      nextState: {
        ...PREMIUM_DEFAULT_STATE,
        stage: "awaiting_fit_context",
        hiringSummary: goal,
      },
      suggestedReplies: goalConfig.secondTurnSuggestions,
      suggestedReplyDisplay: "inline",
    };
  }

  if (state.stage === "awaiting_fit_context") {
    const goal = state.hiringSummary
      ? (state.hiringSummary as PremiumCandidateTwoGoal)
      : null;

    if (!goal || !(goal in PREMIUM_CANDIDATE_TWO_GOAL_CONFIG)) {
      return {
        body: "I can still help with that. Let's start with the main outcome you're looking for from Premium.",
        nextState: PREMIUM_DEFAULT_STATE,
        suggestedReplies: PREMIUM_CANDIDATE_TWO_OPENING_SUGGESTIONS,
        suggestedReplyDisplay: "inline",
      };
    }

    const priority = inferCandidateTwoPriority(goal, normalizedInput);

    if (!priority) {
      return {
        body: PREMIUM_CANDIDATE_TWO_GOAL_CONFIG[goal].followUpPrompt,
        nextState: state,
        suggestedReplies: PREMIUM_CANDIDATE_TWO_GOAL_CONFIG[goal].secondTurnSuggestions,
        suggestedReplyDisplay: "inline",
      };
    }

    const recommendation = createCandidateTwoRecommendation(goal, priority);

    return {
      artifact: recommendation.artifact,
      body: recommendation.body,
      nextState: {
        ...PREMIUM_DEFAULT_STATE,
        stage: "explore",
        hiringSummary: `${goal}:${priority}`,
        likelySolution:
          recommendation.artifact.primaryRecommendation.id === "recruiter-lite"
            ? "recruiter"
            : "lighter_touch",
        readiness: "exploring",
      },
      suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  return createCandidateTwoPostRecommendationTurn(input, state);
}

function createCandidateTwoPostRecommendationTurn(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const normalizedInput = normalizeInput(input);

  if (normalizedInput.includes("start over") || normalizedInput.includes("another path")) {
    return {
      body: "Absolutely. What are you hoping Premium helps with most right now?",
      nextState: PREMIUM_DEFAULT_STATE,
      suggestedReplies: PREMIUM_CANDIDATE_TWO_OPENING_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  if (
    normalizedInput.includes("trial") ||
    normalizedInput.includes("$0") ||
    normalizedInput.includes("free")
  ) {
    return {
      body: "For this prototype, every plan includes a 1 month free trial. After that, monthly pricing depends on which option you choose.",
      nextState: state,
      suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalizedInput.includes("compare") || normalizedInput.includes("difference")) {
    return {
      body: "The top recommendation is the broadest or strongest fit for the goal you selected, while the other two give you narrower alternatives if you want to optimize for one specific priority.",
      nextState: state,
      suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalizedInput.includes("all-in-one") || normalizedInput.includes("all in one")) {
    return {
      body: "Premium All-in-One is the broadest option in this prototype. It works best when you want one plan that can flex across networking, growth, and lighter hiring needs.",
      nextState: state,
      suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalizedInput.includes("business")) {
    return {
      body: "Premium Business is the stronger fit when visibility, network growth, and finding the right people matter more than a broader all-in-one bundle.",
      nextState: state,
      suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalizedInput.includes("sales navigator") || normalizedInput.includes("leads")) {
    return {
      body: "Sales Navigator Core is the more dedicated option when your main goal is prospecting and sales outreach rather than a broader Premium plan.",
      nextState: state,
      suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalizedInput.includes("recruiter lite") || normalizedInput.includes("candidate")) {
    return {
      body: "Recruiter Lite is the hiring-focused option here. It becomes the strongest recommendation when finding qualified candidates and getting more responses is the main priority.",
      nextState: state,
      suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  return {
    body: "I can keep helping compare these options, explain how the trial works, or restart the recommendation if you'd like to take a different path.",
    nextState: state,
    suggestedReplies: PREMIUM_CANDIDATE_TWO_POST_RECOMMENDATION_SUGGESTIONS,
    suggestedReplyDisplay: "composer",
  };
}

function createCandidateTwoGoalAcknowledgement(goal: PremiumCandidateTwoGoal) {
  switch (goal) {
    case "clients-leads":
      return "That makes sense.";
    case "network":
      return "Got it.";
    case "hire":
      return "Understood.";
    case "brand":
      return "Makes sense.";
  }
}

function inferCandidateTwoGoal(
  normalizedInput: string,
): PremiumCandidateTwoGoal | null {
  if (
    normalizedInput.includes("client") ||
    normalizedInput.includes("lead") ||
    normalizedInput.includes("prospect") ||
    normalizedInput.includes("sales")
  ) {
    return "clients-leads";
  }

  if (
    normalizedInput.includes("hire") ||
    normalizedInput.includes("candidate") ||
    normalizedInput.includes("talent")
  ) {
    return "hire";
  }

  if (
    normalizedInput.includes("network") ||
    normalizedInput.includes("connection")
  ) {
    return "network";
  }

  if (
    normalizedInput.includes("brand") ||
    normalizedInput.includes("visibility") ||
    normalizedInput.includes("profile")
  ) {
    return "brand";
  }

  return null;
}

function inferCandidateTwoPriority(
  goal: PremiumCandidateTwoGoal,
  normalizedInput: string,
): PremiumCandidateTwoPriority | null {
  switch (goal) {
    case "clients-leads":
      if (normalizedInput.includes("prospect")) {
        return "prospects";
      }
      if (normalizedInput.includes("repl")) {
        return "replies";
      }
      if (normalizedInput.includes("relationship")) {
        return "relationships";
      }
      return null;
    case "network":
      if (normalizedInput.includes("right people")) {
        return "reach-right-people";
      }
      if (normalizedInput.includes("visibility") || normalizedInput.includes("profile")) {
        return "visibility";
      }
      if (normalizedInput.includes("connection")) {
        return "connections";
      }
      return null;
    case "hire":
      if (normalizedInput.includes("qualified")) {
        return "qualified-candidates";
      }
      if (normalizedInput.includes("response")) {
        return "candidate-responses";
      }
      if (normalizedInput.includes("activity")) {
        return "hiring-activity";
      }
      return null;
    case "brand":
      if (normalizedInput.includes("grow visibility") || normalizedInput === "grow visibility") {
        return "grow-visibility";
      }
      if (normalizedInput.includes("relevant people")) {
        return "relevant-people";
      }
      if (
        normalizedInput.includes("profile views") ||
        normalizedInput.includes("opportunit")
      ) {
        return "turn-views-opportunities";
      }
      return null;
  }
}

function createCandidateTwoRecommendation(
  goal: PremiumCandidateTwoGoal,
  priority: PremiumCandidateTwoPriority,
): {
  artifact: AiConciergePremiumPlanRecommendationsArtifact;
  body: string;
} {
  switch (goal) {
    case "clients-leads":
      return {
        artifact: createPremiumPlanRecommendationsArtifact({
          primary: {
            fitLabel: "Best overall fit",
            planId: "all-in-one",
          },
          secondary: [
            {
              fitLabel: "If networking matters most",
              planId: "business",
            },
            {
              fitLabel: "If you want a dedicated sales workflow",
              planId: "sales-navigator-core",
            },
          ],
        }),
        body: `Based on that, I'd start with Premium All-in-One. ${getCandidateTwoPrimaryReason(
          goal,
          priority,
        )} I also pulled two narrower options if you'd rather lean more toward networking or a dedicated sales workflow.`,
      };
    case "network":
      return {
        artifact: createPremiumPlanRecommendationsArtifact({
          primary: {
            fitLabel: "Best overall fit",
            planId: "business",
          },
          secondary: [
            {
              fitLabel: "If you want broader coverage",
              planId: "all-in-one",
            },
            {
              fitLabel: "If sales outreach is the main focus",
              planId: "sales-navigator-core",
            },
          ],
        }),
        body: `Based on that, I'd start with Premium Business. ${getCandidateTwoPrimaryReason(
          goal,
          priority,
        )} I also included a broader option and a more dedicated outreach option below.`,
      };
    case "hire":
      return {
        artifact: createPremiumPlanRecommendationsArtifact({
          primary: {
            fitLabel: "Best overall fit",
            planId: "recruiter-lite",
          },
          secondary: [
            {
              fitLabel: "If you want a broader all-in-one plan",
              planId: "all-in-one",
            },
            {
              fitLabel: "If networking is still the bigger need",
              planId: "business",
            },
          ],
        }),
        body: `Based on that, I'd start with Recruiter Lite. ${getCandidateTwoPrimaryReason(
          goal,
          priority,
        )} I also included two alternatives in case hiring is only part of what you're trying to solve.`,
      };
    case "brand":
      return {
        artifact: createPremiumPlanRecommendationsArtifact({
          primary: {
            fitLabel: "Best overall fit",
            planId: "business",
          },
          secondary: [
            {
              fitLabel: "If you want broader coverage",
              planId: "all-in-one",
            },
            {
              fitLabel: "If outbound outreach matters more",
              planId: "sales-navigator-core",
            },
          ],
        }),
        body: `Based on that, I'd start with Premium Business. ${getCandidateTwoPrimaryReason(
          goal,
          priority,
        )} I also included a broader bundle and a more outreach-focused option below.`,
      };
  }
}

function getCandidateTwoPrimaryReason(
  goal: PremiumCandidateTwoGoal,
  priority: PremiumCandidateTwoPriority,
) {
  switch (goal) {
    case "clients-leads":
      switch (priority) {
        case "prospects":
          return "It gives you the broadest support if you want to find the right prospects while still keeping networking and lighter hiring options in the same plan.";
        case "replies":
          return "It gives you a stronger all-around package for outreach and visibility while still keeping the rest of your Premium workflow in one place.";
        case "relationships":
          return "It gives you room to build relationships and opportunities without narrowing you into a single sales-only workflow too early.";
      }
      break;
    case "network":
      switch (priority) {
        case "reach-right-people":
          return "It fits best if your main goal is reaching the right people and growing the quality of your network.";
        case "visibility":
          return "It is the strongest fit when profile visibility and discoverability are what matter most right now.";
        case "connections":
          return "It gives you a lighter, network-first option for building stronger connections without paying for a broader bundle you may not need.";
      }
      break;
    case "hire":
      switch (priority) {
        case "qualified-candidates":
          return "It is the strongest fit if your priority is finding qualified candidates faster with more dedicated hiring tools.";
        case "candidate-responses":
          return "It is the better fit if you want more candidate responses and a workflow built around hiring outreach.";
        case "hiring-activity":
          return "It gives you the clearest hiring-focused workflow if staying on top of search, outreach, and responses is the main goal.";
      }
      break;
    case "brand":
      switch (priority) {
        case "grow-visibility":
          return "It is the strongest fit if your main goal is growing visibility and being found by more of the right people.";
        case "relevant-people":
          return "It works well if you want more relevant reach and a stronger network-building plan without moving all the way into a sales product.";
        case "turn-views-opportunities":
          return "It gives you the best balance if you want profile visibility to translate into more meaningful opportunities.";
      }
      break;
  }

  return "It gives you the strongest overall fit for what you said matters most right now.";
}

function createPremiumPlanRecommendationsArtifact({
  primary,
  secondary,
}: {
  primary: {
    fitLabel: string;
    planId: PremiumPlanId;
  };
  secondary: Array<{
    fitLabel: string;
    planId: PremiumPlanId;
  }>;
}): AiConciergePremiumPlanRecommendationsArtifact {
  return {
    primaryRecommendation: createPremiumPlanRecommendation({
      fitLabel: primary.fitLabel,
      planId: primary.planId,
    }),
    secondaryRecommendations: secondary.map(({ fitLabel, planId }) =>
      createPremiumPlanRecommendation({
        fitLabel,
        planId,
      }),
    ),
    type: "premium-plan-recommendations",
  };
}

function createPremiumPlanRecommendation({
  fitLabel,
  planId,
}: {
  fitLabel: string;
  planId: PremiumPlanId;
}): AiConciergePremiumPlanRecommendation {
  const baseContent = PREMIUM_PLAN_RECOMMENDATION_CONTENT[planId];

  return {
    ...baseContent,
    fitLabel,
    promptText: `Show me details for ${baseContent.titleText}`,
  };
}

function normalizeInput(input: string) {
  return input.trim().toLowerCase();
}

export function createPremiumPlaceholderOpeningTurn(args: {
  contactDetails: ConciergeContactDetails;
  openingPromptVariant: PrototypeScenario["openingPromptVariant"];
}) {
  return createPremiumCandidateOneOpeningTurn(args);
}

export function getPremiumPlaceholderAssistantTurn(args: {
  contactDetails: ConciergeContactDetails;
  input: string;
  state: AiConciergeConversationState;
}) {
  return getPremiumCandidateOneAssistantTurn(args);
}
