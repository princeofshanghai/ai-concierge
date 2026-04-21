import {
  OPENING_HELPER_EXAMPLES,
  OPENING_PROMPT_TOPICS,
  type AiConciergeOpeningSupport,
} from "@/lib/ai-concierge-opening-presentation";
import type {
  AiConciergeMessageArtifact,
  AiConciergeSuggestedReply,
  ConciergeContactDetails,
} from "@/lib/ai-concierge-types";
import type { PrototypeScenarioOpeningPromptVariant } from "@/lib/prototype-scenario";

type ConversationStage =
  | "opening"
  | "awaiting_hiring_motion"
  | "awaiting_fit_context"
  | "awaiting_urgency"
  | "awaiting_next_step"
  | "awaiting_handoff_choice"
  | "explore"
  | "booking_pending";

type StartingSituation =
  | "solution_fit"
  | "consistent_hiring"
  | "hard_to_fill"
  | "pricing_guidance"
  | "product_question"
  | "unknown";

type HiringMotion =
  | "consistent_hiring"
  | "hard_to_fill"
  | "occasional_hiring"
  | "still_figuring_it_out"
  | "broader_ongoing"
  | "smaller_scope"
  | "unknown";

type HiringComplexity = "broad" | "specialized" | "unknown";
type HiringUseCase =
  | "mixed_roles"
  | "product"
  | "sales"
  | "specialized"
  | "technical"
  | "unknown";
export type LikelySolution = "recruiter" | "lighter_touch" | "unknown";
type Readiness = "exploring" | "pricing" | "representative" | "unknown";
type Urgency =
  | "this_quarter"
  | "next_few_months"
  | "planning_ahead"
  | "still_exploring"
  | "unknown";
export type NextStepMode = "meeting" | null;

export type AiConciergeConversationState = {
  hiringComplexity: HiringComplexity;
  hiringMotion: HiringMotion;
  hiringSummary: string | null;
  hiringUseCase: HiringUseCase;
  likelySolution: LikelySolution;
  nextStepMode: NextStepMode;
  readiness: Readiness;
  stage: ConversationStage;
  startingSituation: StartingSituation;
  urgency: Urgency;
};

export type EntryMode = "manual" | "prefill";

export type AiConciergeAssistantTurn = {
  artifact?: AiConciergeMessageArtifact;
  body: string;
  nextState: AiConciergeConversationState;
  openingSupport?: AiConciergeOpeningSupport;
  postCompleteEffect?: "live-sales-handoff" | "representative-match";
  suggestedReplies?: AiConciergeSuggestedReply[];
  suggestedReplyDisplay?: "composer" | "inline";
};

const OPENING_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  {
    id: "solution-fit",
    label: "We're not sure which hiring solution fits",
  },
  {
    id: "hard-to-fill",
    label: "We need help with harder-to-fill roles",
  },
  {
    id: "pricing-guidance",
    label: "We have questions about pricing",
  },
  {
    id: "just-getting-started",
    label: "I'm just getting started",
  },
];

const HIRING_MOTION_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  {
    id: "consistent-hiring",
    label: "We hire consistently across teams",
  },
  {
    id: "hard-to-fill",
    label: "We need help with harder-to-fill roles",
  },
  {
    id: "occasional-hiring",
    label: "We're hiring occasionally",
  },
  {
    id: "still-figuring-out",
    label: "We're still figuring that out",
  },
];

const PRICING_SCOPE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  {
    id: "broader-ongoing",
    label: "Broader ongoing hiring",
  },
  {
    id: "smaller-scope",
    label: "Smaller number of roles",
  },
  {
    id: "hard-to-fill",
    label: "Harder-to-fill roles",
  },
  {
    id: "still-figuring-out",
    label: "We're still figuring that out",
  },
];

const ROLE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "role-engineering-product", label: "Engineering and product" },
  { id: "role-sales-cs", label: "Sales and customer success" },
  { id: "role-mixed", label: "Mix of roles" },
  { id: "role-specialized", label: "Hard-to-fill roles" },
];

const URGENCY_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "urgency-this-quarter", label: "This quarter" },
  { id: "urgency-next-few-months", label: "In the next few months" },
  { id: "urgency-planning-ahead", label: "We're planning ahead" },
  { id: "urgency-still-exploring", label: "Still exploring" },
];

const NEXT_STEP_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "talk-hiring-representative", label: "Talk to a rep" },
  { id: "keep-exploring", label: "Keep exploring" },
  { id: "pricing-details", label: "Tell me about pricing" },
];

const RECRUITER_EXPLORE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "compare-hiring-pro", label: "How is Recruiter different from Hiring Pro?" },
  { id: "biggest-shift", label: "What's changed in our hiring landscape?" },
  {
    id: "talk-recruiter-representative",
    label: "Talk to a sales rep",
  },
];

const GENERAL_EXPLORE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "compare-options", label: "Which option seems closest for us?" },
  { id: "fix-one-thing", label: "What would make the biggest difference?" },
  { id: "talk-hiring-representative", label: "Talk to a sales rep" },
];

const HANDOFF_BRIDGE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "book-meeting", label: "Book a meeting" },
  { id: "keep-exploring", label: "Keep exploring" },
];

const LIVE_HANDOFF_BRIDGE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "chat-live-now", label: "Chat live now" },
  { id: "book-meeting", label: "Schedule for later" },
];

const LIGHTER_TOUCH_NEXT_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "talk-hiring-representative", label: "Talk to a rep anyway" },
  { id: "keep-exploring", label: "Keep exploring" },
];

const LOWER_TOUCH_PLANS_CTA_HREF = "https://example.com";

const DEFAULT_STATE: AiConciergeConversationState = {
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

function getCompanyReference(company: string) {
  const trimmedCompany = company.trim();

  return trimmedCompany.length > 0 ? trimmedCompany : "your team";
}

function getCompanyHiringNeedsReference(company: string) {
  const trimmedCompany = company.trim();

  if (trimmedCompany.length === 0) {
    return "your hiring needs";
  }

  const possessiveSuffix = trimmedCompany.toLowerCase().endsWith("s")
    ? "'"
    : "'s";

  return `${trimmedCompany}${possessiveSuffix} hiring needs`;
}

function createOpeningCoreBody(contactDetails: ConciergeContactDetails) {
  const companyNeedsReference = getCompanyHiringNeedsReference(
    contactDetails.company,
  );

  return `I'm your AI hiring expert from LinkedIn, here to help with ${companyNeedsReference}. Feel free to ask me anything, but my main goal is to understand your hiring needs and help tackle whatever challenges you're facing.`;
}

function createOpeningBody(contactDetails: ConciergeContactDetails) {
  const trimmedFirstName = contactDetails.firstName.trim();
  const openingCoreBody = createOpeningCoreBody(contactDetails);

  if (trimmedFirstName.length > 0) {
    return `Hi ${trimmedFirstName}, ${openingCoreBody}`;
  }

  return openingCoreBody;
}

export function createOpeningTurn({
  contactDetails,
  openingPromptVariant,
}: {
  contactDetails: ConciergeContactDetails;
  openingPromptVariant: PrototypeScenarioOpeningPromptVariant;
}): AiConciergeAssistantTurn {
  const openingBody = createOpeningBody(contactDetails);

  if (openingPromptVariant === "helper-examples") {
    return {
      body: openingBody,
      nextState: DEFAULT_STATE,
      openingSupport: {
        type: "helper-examples",
        helperText: "Others ask things like:",
        examples: [...OPENING_HELPER_EXAMPLES],
      },
    };
  }

  if (openingPromptVariant === "topic-picker") {
    return {
      body: openingBody,
      nextState: DEFAULT_STATE,
      openingSupport: {
        type: "topic-picker",
        helperText: "",
        topics: OPENING_PROMPT_TOPICS,
      },
    };
  }

  return {
    body: `${openingBody}\n\nHere are a few ways to get started:`,
    nextState: DEFAULT_STATE,
    suggestedReplies: OPENING_SUGGESTIONS,
    suggestedReplyDisplay: "inline",
  };
}

export function createVoiceModeIntro({
  contactDetails,
}: {
  contactDetails: ConciergeContactDetails;
}) {
  const trimmedFirstName = contactDetails.firstName.trim();
  const welcomeLead =
    trimmedFirstName.length > 0
      ? `Hi ${trimmedFirstName}, glad you're here.`
      : "Hi, glad you're here.";
  const openingCoreBody = createOpeningCoreBody(contactDetails);

  return `${welcomeLead} ${openingCoreBody} When you're ready, you can start talking or use what's on screen to get started.`;
}

export function createReturnToChatTurn({
  contactDetails,
  state,
}: {
  contactDetails: ConciergeContactDetails;
  state: AiConciergeConversationState;
}): AiConciergeAssistantTurn {
  const nextState: AiConciergeConversationState = {
    ...state,
    stage: "explore",
    nextStepMode: null,
    readiness: "exploring",
  };
  const companyReference = getCompanyReference(contactDetails.company);

  if (state.likelySolution === "lighter_touch") {
    return {
      body: `No problem! I can keep helping you compare options for ${companyReference}. We can always revisit the rep option later.`,
      nextState,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  return {
    body: `No problem! I can keep helping you figure out where Recruiter fits for ${companyReference}. We can always revisit the rep option later.`,
    nextState,
    suggestedReplies: createExploreSuggestions(state.likelySolution),
    suggestedReplyDisplay: "composer",
  };
}

export function getAssistantTurn({
  contactDetails,
  input,
  state,
}: {
  contactDetails: ConciergeContactDetails;
  input: string;
  state: AiConciergeConversationState;
}): AiConciergeAssistantTurn {
  let assistantTurn: AiConciergeAssistantTurn;

  switch (state.stage) {
    case "opening":
      assistantTurn = createOpeningResponse(input);
      break;
    case "awaiting_hiring_motion":
      assistantTurn = createHiringMotionResponse(input, state);
      break;
    case "awaiting_fit_context":
      assistantTurn = createFitContextResponse(input, state);
      break;
    case "awaiting_urgency":
      assistantTurn = createUrgencyResponse(state, input, contactDetails);
      break;
    case "awaiting_next_step":
    case "explore":
      assistantTurn = createNextStepResponse(input, state, contactDetails);
      break;
    case "awaiting_handoff_choice":
      assistantTurn = createHandoffChoiceResponse(input, state, contactDetails);
      break;
    case "booking_pending":
      assistantTurn = {
        body: "I can also answer any other questions you have while we get that set up.",
        nextState: state,
      };
      break;
  }

  if (shouldShowRepresentativeRecommendationCard({ assistantTurn, state })) {
    return {
      ...assistantTurn,
      artifact: createRepresentativeRecommendationArtifact(),
    };
  }

  return assistantTurn;
}

function createOpeningResponse(input: string): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);

  if (isPricingIntent(normalized)) {
    return {
      body: "Great question. Pricing really depends on your specific situation, so a specialist would be the best person to walk you through what fits. To make sure I connect you with the right one, can you tell me a bit about your hiring?\n\nIs it more ongoing or more occasional?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "pricing_guidance",
      },
      suggestedReplies: PRICING_SCOPE_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  if (isSolutionFitIntent(normalized)) {
    return {
      body: "Totally, let's figure that out. It usually comes down to how your team hires. Which is closer to your situation right now?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "solution_fit",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  if (isConsistentHiringIntent(normalized)) {
    return {
      body: "Got it. Teams hiring consistently usually need a more structured, proactive approach. Which teams or roles are feeling the most pressure right now?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_fit_context",
        startingSituation: "consistent_hiring",
        hiringMotion: "consistent_hiring",
      },
      suggestedReplies: ROLE_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (isHardToFillIntent(normalized)) {
    return {
      body: "That's a common challenge. When roles are hard to fill, teams usually need a more proactive sourcing approach instead of relying on inbound applicants. What kinds of roles are giving you the most trouble?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_fit_context",
        startingSituation: "hard_to_fill",
        hiringMotion: "hard_to_fill",
      },
      suggestedReplies: ROLE_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (isJustGettingStartedIntent(normalized)) {
    return {
      body: "No problem! A good place to start is understanding the kind of hiring your team is dealing with. That usually points us in the right direction. Which of these sounds closest?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "solution_fit",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  if (isDifferenceQuestion(normalized)) {
    return {
      body: "Good question. Hiring Pro is great for bringing in inbound interest. Recruiter is better when your team needs to proactively search and reach out to candidates directly. To point you in the right direction, how does your team typically hire?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "product_question",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  if (isRecruiterQuestion(normalized)) {
    return {
      body: "Recruiter is most useful when your team needs to proactively find and reach candidates instead of waiting for inbound applications. It helps you search, narrow down, and reach out directly. To point you the right way, how does your team typically hire?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "product_question",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  return {
    body: "I can help with that! It usually comes down to how your team hires and how proactive the process needs to be. Which is closer to your situation?",
    nextState: {
      ...DEFAULT_STATE,
      stage: "awaiting_hiring_motion",
      startingSituation: "unknown",
    },
    suggestedReplies: HIRING_MOTION_SUGGESTIONS,
    suggestedReplyDisplay: "inline",
  };
}

function createHiringMotionResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);
  const hiringMotion =
    state.startingSituation === "pricing_guidance"
      ? classifyPricingScope(normalized)
      : classifyHiringMotion(normalized);

  switch (hiringMotion) {
    case "hard_to_fill":
      return {
        body: "That makes sense. When roles are hard to fill, a more proactive sourcing approach usually helps. What kinds of roles are giving you the most trouble?",
        nextState: {
          ...state,
          stage: "awaiting_fit_context",
          hiringMotion,
        },
        suggestedReplies: ROLE_SUGGESTIONS,
        suggestedReplyDisplay: "composer",
      };
    case "consistent_hiring":
    case "broader_ongoing":
      return {
        body: "Got it. Teams hiring consistently usually need a more structured approach than teams hiring occasionally. Which teams or roles are feeling the most pressure?",
        nextState: {
          ...state,
          stage: "awaiting_fit_context",
          hiringMotion,
        },
        suggestedReplies: ROLE_SUGGESTIONS,
        suggestedReplyDisplay: "composer",
      };
    case "occasional_hiring":
    case "smaller_scope":
      return {
        body: "Makes sense. When hiring is more occasional, a lighter-touch option can work better than a full sourcing workflow. What kinds of roles usually come up?",
        nextState: {
          ...state,
          stage: "awaiting_fit_context",
          hiringMotion,
        },
        suggestedReplies: ROLE_SUGGESTIONS,
        suggestedReplyDisplay: "composer",
      };
    case "still_figuring_it_out":
      return {
        body: "Totally fine. A good way to narrow it down is to look at where the hiring pressure is strongest. Which teams or roles are most affected?",
        nextState: {
          ...state,
          stage: "awaiting_fit_context",
          hiringMotion,
        },
        suggestedReplies: ROLE_SUGGESTIONS,
        suggestedReplyDisplay: "composer",
      };
    case "unknown":
      return {
        body: "A good place to start is where the hiring pressure is strongest. Which teams or roles are most affected?",
        nextState: {
          ...state,
          stage: "awaiting_fit_context",
          hiringMotion,
        },
        suggestedReplies: ROLE_SUGGESTIONS,
        suggestedReplyDisplay: "composer",
      };
  }
}

function createFitContextResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const roleContext = summarizeHiringContext(input);
  const likelySolution = determineLikelySolution({
    hiringComplexity: roleContext.hiringComplexity,
    hiringMotion: state.hiringMotion,
    hiringUseCase: roleContext.hiringUseCase,
  });

  const reflection = `Got it, ${roleContext.summary}.`;

  return {
    body: `${reflection} How soon do you need to make progress on this?`,
    nextState: {
      ...state,
      stage: "awaiting_urgency",
      hiringSummary: roleContext.summary,
      hiringUseCase: roleContext.hiringUseCase,
      hiringComplexity: roleContext.hiringComplexity,
      likelySolution,
    },
    suggestedReplies: URGENCY_SUGGESTIONS,
    suggestedReplyDisplay: "composer",
  };
}

function createUrgencyResponse(
  state: AiConciergeConversationState,
  input: string,
  contactDetails: ConciergeContactDetails,
): AiConciergeAssistantTurn {
  const urgency = classifyUrgency(input);
  const recommendation = createRecommendationMessage({
    company: contactDetails.company,
    likelySolution: state.likelySolution,
    summary: state.hiringSummary ?? "several functions",
    urgency,
  });

  if (state.likelySolution === "recruiter") {
    return {
      body: `${recommendation} A quick conversation with someone on our team could help you figure out the right setup.`,
      nextState: {
        ...state,
        stage: "awaiting_handoff_choice",
        readiness: "representative",
        urgency,
      },
    };
  }

  if (state.likelySolution === "lighter_touch") {
    return {
      artifact: createLighterTouchRecommendationArtifact(),
      body: `${recommendation} Here's what I'd recommend.`,
      nextState: {
        ...state,
        stage: "awaiting_handoff_choice",
        urgency,
      },
      suggestedReplies: LIGHTER_TOUCH_NEXT_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  return {
    body: `${recommendation}\n\n${createNextStepQuestion(contactDetails.company, state.likelySolution)}`,
    nextState: {
      ...state,
      stage: "awaiting_next_step",
      urgency,
    },
    suggestedReplies: createNextStepSuggestions(state.likelySolution),
    suggestedReplyDisplay: "inline",
  };
}

function createNextStepResponse(
  input: string,
  state: AiConciergeConversationState,
  contactDetails: ConciergeContactDetails,
): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);
  const roleClause = createRoleClause(state.hiringSummary);
  const representativeLabel = "sales rep";
  const companyReference = getCompanyReference(contactDetails.company);

  if (
    normalized.includes("talk to a") ||
    normalized.includes("specialist") ||
    normalized.includes("representative") ||
    isGetConnectedIntent(normalized)
  ) {
    return {
      body: `Great idea. Let me connect you with someone who can help ${companyReference}.`,
      nextState: {
        ...state,
        stage: "awaiting_handoff_choice",
        readiness: "representative",
        nextStepMode: null,
      },
      suggestedReplies: HANDOFF_BRIDGE_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  if (normalized.includes("pricing")) {
    return {
      body: `Pricing really depends on your specific setup, so a specialist would be the best person to walk through the details. I can connect you with one, or we can keep exploring what fits ${companyReference} first.`,
      nextState: {
        ...state,
        stage: "awaiting_next_step",
        nextStepMode: null,
        readiness: "pricing",
      },
      suggestedReplies: createNextStepSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalized.includes("keep exploring")) {
    return {
      body:
        state.likelySolution === "recruiter"
          ? `Sure thing. For teams hiring for ${roleClause}, Recruiter really shines when you need to proactively search and reach out to candidates instead of waiting for applicants.`
          : `Sure thing. For teams hiring for ${roleClause}, it's worth comparing a lighter-touch option with a more proactive approach to see what your team actually needs.`,
      nextState: {
        ...state,
        stage: "explore",
        nextStepMode: null,
        readiness: "exploring",
      },
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  if (
    normalized.includes("biggest") ||
    normalized.includes("changed") ||
    normalized.includes("shift") ||
    normalized.includes("difference")
  ) {
    return {
      body:
        state.likelySolution === "recruiter"
          ? `For teams hiring for ${roleClause}, the biggest difference usually comes from being able to proactively reach the right candidates instead of waiting for them to apply. That's where Recruiter tends to have the most impact.`
          : `For teams hiring for ${roleClause}, the biggest difference usually comes from finding the right balance between proactive outreach and a simpler, lighter-touch approach.`,
      nextState: state,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalized.includes("different") || normalized.includes("hiring pro")) {
    return {
      body: "Hiring Pro is great for generating inbound interest. Recruiter is better when your team needs to proactively search and reach out to candidates directly. They solve different parts of the hiring motion, and they can work together.",
      nextState: state,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalized.includes("which option") || normalized.includes("closest")) {
    return {
      body:
        state.likelySolution === "lighter_touch"
          ? "Based on what you've shared, a lighter-touch option looks like the better fit right now. If your hiring grows or gets more specialized, that's when Recruiter becomes more relevant."
          : "Based on what you've shared, Recruiter looks like the stronger fit since your hiring is more ongoing or specialized.",
      nextState: state,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  if (
    normalized.includes("fix one thing") ||
    normalized.includes("make the biggest")
  ) {
    return {
      body:
        state.likelySolution === "recruiter"
          ? `For ${roleClause}, the biggest unlock is usually getting in front of the right candidates proactively instead of waiting for them to find you.`
          : `For ${roleClause}, the biggest unlock is usually figuring out whether you need proactive outreach or if a simpler approach covers what your team needs.`,
      nextState: state,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  return {
    body: `I can keep helping you figure out what fits ${companyReference}, or connect you with a rep if that would be more useful.`,
    nextState: state,
    suggestedReplies: createExploreSuggestions(state.likelySolution),
    suggestedReplyDisplay: "composer",
  };
}

function createHandoffChoiceResponse(
  input: string,
  state: AiConciergeConversationState,
  contactDetails: ConciergeContactDetails,
): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);

  if (normalized.includes("keep exploring")) {
    return createReturnToChatTurn({
      contactDetails,
      state,
    });
  }

  if (isBookMeetingIntent(normalized) || isGetConnectedIntent(normalized)) {
    return createRepresentativeMatchingTurn(state);
  }

  if (shouldUseLiveSalesHandoff(normalized, state)) {
    return createLiveSalesHandoffTurn(state);
  }

  if (normalized.includes("phone") || normalized.includes("call")) {
    return createRepresentativeMatchingTurn(state);
  }

  if (
    normalized.includes("talk to a") ||
    normalized.includes("rep anyway") ||
    normalized.includes("representative")
  ) {
    return {
      body: "Absolutely. Let me connect you with someone who can help.",
      nextState: {
        ...state,
        stage: "awaiting_handoff_choice",
        readiness: "representative",
      },
    };
  }

  return createNextStepResponse(
    input,
    {
      ...state,
      nextStepMode: null,
      stage: "explore",
    },
    contactDetails,
  );
}

export function createRepresentativeMatchingTurn(
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  return {
    body: "I'm working on that now.",
    nextState: {
      ...state,
      nextStepMode: null,
      readiness: "exploring",
      stage: "explore",
    },
    artifact: createRepresentativeMatchingArtifact(),
    postCompleteEffect: "representative-match",
  };
}

function determineLikelySolution({
  hiringComplexity,
  hiringMotion,
  hiringUseCase,
}: {
  hiringComplexity: HiringComplexity;
  hiringMotion: HiringMotion;
  hiringUseCase: HiringUseCase;
}): LikelySolution {
  if (
    hiringMotion === "hard_to_fill" ||
    hiringMotion === "consistent_hiring" ||
    hiringMotion === "broader_ongoing" ||
    hiringComplexity === "specialized" ||
    hiringUseCase === "specialized" ||
    hiringUseCase === "technical" ||
    hiringUseCase === "mixed_roles"
  ) {
    return "recruiter";
  }

  if (
    hiringMotion === "occasional_hiring" ||
    hiringMotion === "smaller_scope"
  ) {
    return "lighter_touch";
  }

  return "unknown";
}

function createRecommendationMessage({
  company,
  likelySolution,
  summary,
  urgency,
}: {
  company: string;
  likelySolution: LikelySolution;
  summary: string;
  urgency: Urgency;
}) {
  const urgencyPhrase = createUrgencyPhrase(urgency);
  const companyReference = getCompanyReference(company);

  if (likelySolution === "lighter_touch") {
    return `It sounds like ${companyReference} is hiring for ${summary}, and ${urgencyPhrase}. Since it's more occasional, a lighter-touch option might be worth looking at first.`;
  }

  if (summary === "harder-to-fill roles") {
    return `It sounds like the biggest pressure is around harder-to-fill roles, and ${urgencyPhrase}. That's where a proactive sourcing approach like Recruiter tends to make the biggest difference.`;
  }

  return `It sounds like ${companyReference} is hiring for ${summary}, and ${urgencyPhrase}. That's where a proactive sourcing approach like Recruiter tends to make the biggest difference.`;
}

function createNextStepQuestion(
  company: string,
  _likelySolution: LikelySolution,
) {
  void _likelySolution;
  const companyReference = getCompanyReference(company);

  return `Would it help to talk with a rep about what this could look like for ${companyReference}, or do you want to keep exploring?`;
}

function createNextStepSuggestions(_likelySolution: LikelySolution) {
  void _likelySolution;
  return NEXT_STEP_SUGGESTIONS;
}

function createExploreSuggestions(likelySolution: LikelySolution) {
  return likelySolution === "lighter_touch"
    ? GENERAL_EXPLORE_SUGGESTIONS
    : RECRUITER_EXPLORE_SUGGESTIONS;
}

function shouldShowRepresentativeRecommendationCard({
  assistantTurn,
  state,
}: {
  assistantTurn: AiConciergeAssistantTurn;
  state: AiConciergeConversationState;
}) {
  return (
    !assistantTurn.artifact &&
    assistantTurn.nextState.stage === "awaiting_handoff_choice" &&
    assistantTurn.nextState.likelySolution === "recruiter" &&
    (state.likelySolution === "recruiter" || state.stage === "awaiting_urgency")
  );
}

function createRepresentativeRecommendationArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText: "I'll connect you with someone who specializes in this",
    ctaLabel: "Get connected",
    titleText: "Talk to a hiring specialist",
    type: "recommendation",
  };
}

function createLighterTouchRecommendationArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText:
      "Best for occasional hiring and attracting inbound candidates",
    ctaHref: LOWER_TOUCH_PLANS_CTA_HREF,
    ctaLabel: "Learn more",
    tagText: "Recommended for you",
    titleText: "Hiring Pro",
    type: "recommendation",
  };
}

function createRepresentativeMatchingArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText:
      "This usually takes a minute or two. You can keep chatting in the meantime.",
    titleText: "Connecting you with the right person",
    type: "representative-match",
    status: "matching",
  };
}

function createLiveSalesHandoffTurn(
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  return {
    body: "",
    artifact: {
      titleText: "Connecting you now...",
      type: "representative-match",
      status: "matching",
    },
    nextState: {
      ...state,
      nextStepMode: null,
      readiness: "representative",
      stage: "explore",
    },
    postCompleteEffect: "live-sales-handoff",
  };
}

function summarizeHiringContext(input: string): {
  summary: string;
  hiringComplexity: HiringComplexity;
  hiringUseCase: HiringUseCase;
} {
  const normalized = normalizeInput(input);
  const roles = new Set<string>();

  if (normalized.includes("mix of roles")) {
    roles.add("engineering");
    roles.add("product");
    roles.add("sales");
    roles.add("customer success");
  }

  if (
    normalized.includes("ai engineer") ||
    normalized.includes("ai engineering")
  ) {
    roles.add("AI engineering");
  } else if (
    normalized.includes("engineering") ||
    normalized.includes("engineer") ||
    normalized.includes("technical roles")
  ) {
    roles.add("engineering");
  }

  if (normalized.includes("product")) {
    roles.add("product");
  }

  if (normalized.includes("sales")) {
    roles.add("sales");
  }

  if (normalized.includes("customer success")) {
    roles.add("customer success");
  }

  if (normalized.includes("nurse") || normalized.includes("nursing")) {
    roles.add("nursing");
  }

  const hasSpecializedSignal =
    normalized.includes("hard-to-fill") ||
    normalized.includes("specialized") ||
    normalized.includes("specialised") ||
    normalized.includes("ai engineer") ||
    normalized.includes("nurse");

  if (roles.size === 0 && hasSpecializedSignal) {
    return {
      summary: "harder-to-fill roles",
      hiringComplexity: "specialized",
      hiringUseCase: "specialized",
    };
  }

  if (roles.size === 0) {
    return {
      summary: "several functions",
      hiringComplexity: "broad",
      hiringUseCase: "unknown",
    };
  }

  const roleList = Array.from(roles);
  const summary = formatRoleList(roleList);

  return {
    summary: hasSpecializedSignal
      ? `${summary}, including some harder-to-fill positions`
      : summary,
    hiringComplexity: hasSpecializedSignal ? "specialized" : "broad",
    hiringUseCase: classifyUseCase(roleList, hasSpecializedSignal),
  };
}

function createRoleClause(summary: string | null): string {
  if (!summary) {
    return "several functions";
  }

  return summary;
}

function classifyUseCase(
  roleList: string[],
  hasSpecializedSignal: boolean,
): HiringUseCase {
  if (hasSpecializedSignal) {
    return "specialized";
  }

  if (roleList.includes("engineering") || roleList.includes("AI engineering")) {
    return roleList.length > 1 ? "mixed_roles" : "technical";
  }

  if (roleList.includes("product")) {
    return "product";
  }

  if (roleList.includes("sales")) {
    return "sales";
  }

  if (roleList.length > 1) {
    return "mixed_roles";
  }

  return "unknown";
}

function classifyHiringMotion(input: string): HiringMotion {
  const normalized = normalizeInput(input);

  if (isHardToFillIntent(normalized)) {
    return "hard_to_fill";
  }

  if (isConsistentHiringIntent(normalized)) {
    return "consistent_hiring";
  }

  if (
    normalized.includes("hiring occasionally") ||
    normalized.includes("occasional") ||
    normalized.includes("occasionally")
  ) {
    return "occasional_hiring";
  }

  if (
    normalized.includes("still figuring") ||
    normalized.includes("not sure yet") ||
    normalized.includes("still exploring")
  ) {
    return "still_figuring_it_out";
  }

  return "unknown";
}

function classifyPricingScope(input: string): HiringMotion {
  const normalized = normalizeInput(input);

  if (isHardToFillIntent(normalized)) {
    return "hard_to_fill";
  }

  if (
    normalized.includes("broader ongoing") ||
    normalized.includes("ongoing hiring") ||
    normalized.includes("across teams")
  ) {
    return "broader_ongoing";
  }

  if (
    normalized.includes("smaller number of roles") ||
    normalized.includes("smaller scope") ||
    normalized.includes("few roles")
  ) {
    return "smaller_scope";
  }

  if (
    normalized.includes("still figuring") ||
    normalized.includes("not sure yet")
  ) {
    return "still_figuring_it_out";
  }

  return "unknown";
}

function classifyUrgency(input: string): Urgency {
  const normalized = normalizeInput(input);

  if (
    normalized.includes("this quarter") ||
    normalized.includes("this q") ||
    normalized.includes("quarter")
  ) {
    return "this_quarter";
  }

  if (
    normalized.includes("next few months") ||
    normalized.includes("few months") ||
    normalized.includes("next couple months")
  ) {
    return "next_few_months";
  }

  if (
    normalized.includes("planning ahead") ||
    normalized.includes("plan ahead") ||
    normalized.includes("later this year")
  ) {
    return "planning_ahead";
  }

  if (
    normalized.includes("still exploring") ||
    normalized.includes("still figuring") ||
    normalized.includes("just exploring")
  ) {
    return "still_exploring";
  }

  return "unknown";
}

function createUrgencyPhrase(urgency: Urgency) {
  switch (urgency) {
    case "this_quarter":
      return "the need feels fairly near-term";
    case "next_few_months":
      return "this looks like something you'll need to make progress on soon";
    case "planning_ahead":
      return "this feels more like planning ahead than an immediate fire drill";
    case "still_exploring":
      return "you're still figuring out the right path";
    case "unknown":
      return "this seems important enough to evaluate now";
  }
}

function isPricingIntent(normalized: string) {
  return (
    normalized.includes("pricing") ||
    normalized.includes("price") ||
    normalized.includes("cost")
  );
}

function isSolutionFitIntent(normalized: string) {
  return (
    normalized.includes("which hiring solution") ||
    normalized.includes("solution fits") ||
    normalized.includes("right for us") ||
    normalized.includes("not sure which")
  );
}

function isConsistentHiringIntent(normalized: string) {
  return (
    normalized.includes("hire consistently") ||
    normalized.includes("hiring consistently") ||
    normalized.includes("across teams")
  );
}

function isHardToFillIntent(normalized: string) {
  return (
    normalized.includes("harder-to-fill") ||
    normalized.includes("hard to fill") ||
    normalized.includes("specialized hiring")
  );
}

function isJustGettingStartedIntent(normalized: string) {
  return (
    normalized.includes("just getting started") ||
    normalized.includes("just exploring") ||
    normalized.includes("just looking") ||
    normalized.includes("getting started") ||
    normalized.includes("browsing")
  );
}

function isDifferenceQuestion(normalized: string) {
  return (
    normalized.includes("different") ||
    normalized.includes("jobs") ||
    normalized.includes("hiring pro")
  );
}

function isRecruiterQuestion(normalized: string) {
  return (
    normalized.includes("what is recruiter") ||
    normalized.includes("what's recruiter") ||
    normalized.includes("what is linkedin recruiter") ||
    normalized.includes("recruiter")
  );
}

function isBookMeetingIntent(normalized: string) {
  return (
    normalized.includes("schedule a call") ||
    normalized.includes("schedule call") ||
    normalized.includes("book meeting") ||
    normalized.includes("book a meeting") ||
    (normalized.includes("book") && normalized.includes("meeting")) ||
    normalized.includes("available times")
  );
}

function isGetConnectedIntent(normalized: string) {
  return (
    normalized.includes("get connected") ||
    normalized.includes("connect me") ||
    normalized.includes("set it up") ||
    normalized.includes("let's do it") ||
    normalized.includes("sounds good")
  );
}

function shouldUseLiveSalesHandoff(
  normalized: string,
  state: AiConciergeConversationState,
) {
  if (
    state.stage !== "awaiting_handoff_choice" ||
    state.likelySolution !== "lighter_touch"
  ) {
    return false;
  }

  return (
    normalized.includes("chat live") ||
    normalized.includes("live now") ||
    normalized.includes("live chat")
  );
}

function formatRoleList(roleList: string[]): string {
  if (roleList.length === 1) {
    return `${roleList[0]} roles`;
  }

  if (roleList.length === 2) {
    return `${roleList[0]} and ${roleList[1]} roles`;
  }

  return `${roleList.slice(0, -1).join(", ")}, and ${
    roleList[roleList.length - 1]
  } roles`;
}

function normalizeInput(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}
