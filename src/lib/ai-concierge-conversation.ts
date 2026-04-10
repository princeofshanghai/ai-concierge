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

const RECRUITER_NEXT_STEP_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "keep-exploring", label: "Keep exploring" },
  { id: "pricing-details", label: "How is pricing structured?" },
  {
    id: "talk-recruiter-representative",
    label: "Talk to a sales rep",
  },
];

const GENERAL_NEXT_STEP_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "keep-exploring", label: "Keep exploring" },
  { id: "pricing-details", label: "How is pricing structured?" },
  { id: "talk-hiring-representative", label: "Talk to a sales rep" },
];

const RECRUITER_EXPLORE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "compare-jobs", label: "How is it different from LinkedIn Jobs?" },
  { id: "worth-it", label: "When is Recruiter worth it?" },
  {
    id: "talk-recruiter-representative",
    label: "Talk to a sales rep",
  },
];

const GENERAL_EXPLORE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "compare-options", label: "Which option seems closest?" },
  { id: "pricing-details", label: "How is pricing structured?" },
  { id: "talk-hiring-representative", label: "Talk to a sales rep" },
];

const HANDOFF_BRIDGE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "book-meeting", label: "Schedule a call" },
];

const LIVE_HANDOFF_BRIDGE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "chat-live-now", label: "Chat live now" },
  { id: "book-meeting", label: "Schedule a call" },
];

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

function createOpeningCoreBody(contactDetails: ConciergeContactDetails) {
  const trimmedCompany = contactDetails.company.trim();

  if (trimmedCompany.length > 0) {
    return `I can help you explore hiring solutions for ${trimmedCompany}, answer your questions, and point you in the right direction from there.`;
  }

  return "I can help you explore hiring solutions, answer your questions, and point you in the right direction from there.";
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
      body: `No problem. I can keep helping you compare which hiring option could fit ${companyReference} best, and we can revisit the account rep option anytime.`,
      nextState,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  return {
    body: `No problem. I can keep helping you understand where Recruiter could fit for ${companyReference}, and we can revisit the account rep option anytime.`,
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
      body: "I can help with that. Pricing usually depends on how a team plans to use the product, including hiring volume, role complexity, and the level of support needed. At a high level, it tends to make the most sense for teams with ongoing or harder-to-fill hiring needs rather than one-off hiring.\n\nTo make this more useful, is this for broader ongoing hiring or for a smaller number of roles?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "pricing_guidance",
      },
      suggestedReplies: PRICING_SCOPE_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (isSolutionFitIntent(normalized)) {
    return {
      body: "I can help with that. The right fit usually depends on whether your team is hiring consistently across teams, needs more proactive sourcing for harder-to-fill roles, or is looking for a lighter-touch option.\n\nWhich is closer to your situation right now?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "solution_fit",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (isConsistentHiringIntent(normalized)) {
    return {
      body: "That helps. Teams hiring consistently across multiple functions usually need a more structured, proactive approach than teams hiring occasionally.\n\nWhich teams or roles are most affected right now?",
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
      body: "That helps. When teams are struggling with harder-to-fill roles, they often need a more proactive sourcing approach instead of relying only on inbound applicants.\n\nWhat kinds of roles are most affected right now?",
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

  if (isDifferenceQuestion(normalized)) {
    return {
      body: "LinkedIn Jobs helps bring in inbound interest. Recruiter is better when a team needs to proactively search for talent, narrow to the right candidates, and reach out directly. To point you in the right direction, is your team hiring consistently across teams, working on harder-to-fill roles, or mostly exploring options right now?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "product_question",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  if (isRecruiterQuestion(normalized)) {
    return {
      body: "LinkedIn Recruiter is most useful when a team needs to proactively find and reach candidates instead of waiting only for inbound applications. It helps recruiters search for talent, narrow to the right people, and reach out directly.\n\nTo point you in the right direction, is your team hiring consistently across teams, working on harder-to-fill roles, or mostly exploring options right now?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "product_question",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
      suggestedReplyDisplay: "composer",
    };
  }

  return {
    body: "I can help with that. The right fit usually depends on the kind of hiring motion your team is dealing with and how proactive the process needs to be.\n\nWhich is closer to your situation right now?",
    nextState: {
      ...DEFAULT_STATE,
      stage: "awaiting_hiring_motion",
      startingSituation: "unknown",
    },
    suggestedReplies: HIRING_MOTION_SUGGESTIONS,
    suggestedReplyDisplay: "composer",
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
        body: "That helps. When teams are struggling with harder-to-fill roles, they often need a more proactive sourcing approach instead of relying only on inbound applicants.\n\nWhat kinds of roles are most affected right now?",
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
        body: "That helps. Teams hiring consistently across multiple functions usually need a more structured, proactive approach than teams hiring occasionally.\n\nWhich teams or roles are most affected right now?",
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
        body: "That helps. When hiring is more occasional or limited to a smaller number of roles, a lighter-touch option can make more sense than a full proactive sourcing workflow.\n\nWhat kinds of roles usually come up when the need appears?",
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
        body: "That's okay. A good way to narrow it down is to look at where the hiring pressure is strongest.\n\nWhich teams or roles are most affected right now?",
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
        body: "A good way to narrow this down is to look at where the hiring pressure is strongest.\n\nWhich teams or roles are most affected right now?",
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

  return {
    body: "That gives me a better sense of the hiring pattern.\n\nHow soon do you need to make progress on this?",
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
      body: `${recommendation}\n\nBased on what you shared, talking to a sales rep looks like the right next step.`,
      nextState: {
        ...state,
        stage: "awaiting_handoff_choice",
        nextStepMode: null,
        readiness: "representative",
        urgency,
      },
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
    suggestedReplyDisplay: "composer",
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
    normalized.includes("representative")
  ) {
    const shouldUseRecommendationCard = state.likelySolution === "recruiter";

    return {
      body:
        state.likelySolution === "lighter_touch"
          ? `That makes sense. If you'd like, I can connect you with an account rep here in chat now, or help you book time.`
          : state.likelySolution === "recruiter"
          ? "Based on what you shared, talking to a sales rep looks like the right next step."
          : `That makes sense. A short conversation with an account rep could help narrow the right option for ${companyReference}.\n\nI can help you book a meeting.`,
      nextState: {
        ...state,
        stage: "awaiting_handoff_choice",
        readiness: "representative",
        nextStepMode: null,
      },
      suggestedReplies:
        state.likelySolution === "lighter_touch"
          ? LIVE_HANDOFF_BRIDGE_SUGGESTIONS
          : shouldUseRecommendationCard
            ? undefined
            : HANDOFF_BRIDGE_SUGGESTIONS,
      suggestedReplyDisplay:
        state.likelySolution === "lighter_touch"
          ? "inline"
          : shouldUseRecommendationCard
            ? undefined
            : "inline",
    };
  }

  if (normalized.includes("pricing")) {
    return {
      body:
        state.likelySolution === "recruiter"
          ? "Pricing usually depends on hiring volume, role complexity, and the level of support your team needs. For teams with broader ongoing or harder-to-fill hiring needs, that is usually where Recruiter becomes easier to justify. If helpful, I can keep helping you gauge fit or connect you with an account rep for specifics."
          : "Pricing usually depends on hiring volume, role complexity, and how much ongoing support the team needs. If your hiring is more occasional, it may make sense to compare a lighter-touch option before jumping into a full proactive sourcing workflow.",
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
          ? `Got it. For teams hiring for ${roleClause}, Recruiter is often strongest when recruiters need to search, narrow, and reach out to targeted candidates instead of relying only on inbound applicants.`
          : `Got it. For teams hiring for ${roleClause}, it may be worth comparing a lighter-touch option with a more proactive sourcing workflow so you can see how much structure and outreach your team actually needs.`,
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

  if (normalized.includes("worth it")) {
    return {
      body: `Recruiter tends to be worth it when a team has ongoing hiring needs, harder-to-fill roles, or a need to proactively reach candidates instead of relying only on inbound applicants. For ${roleClause}, that's usually where the value becomes most visible.`,
      nextState: state,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalized.includes("different") || normalized.includes("jobs")) {
    return {
      body: "LinkedIn Jobs helps teams generate inbound interest. Recruiter is better when your team needs to proactively search for talent, narrow to the right candidates, and reach out directly. They can work together, but they solve different parts of the hiring motion.",
      nextState: state,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  if (normalized.includes("which option") || normalized.includes("closest")) {
    return {
      body:
        state.likelySolution === "lighter_touch"
          ? "Based on what you've shared so far, a lighter-touch option looks more aligned than a full proactive sourcing workflow. If your hiring becomes broader or more specialized, that's when Recruiter becomes more relevant."
          : "Based on what you've shared so far, Recruiter looks more aligned because your team has a more ongoing or specialized hiring motion than a lightweight option usually supports.",
      nextState: state,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  return {
    body: `I can keep helping you understand what could fit ${companyReference}, or, if helpful, connect you with a ${representativeLabel}.`,
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

  if (isBookMeetingIntent(normalized)) {
    return createRepresentativeMatchingTurn(state);
  }

  if (shouldUseLiveSalesHandoff(normalized, state)) {
    return createLiveSalesHandoffTurn(state);
  }

  if (normalized.includes("phone") || normalized.includes("call")) {
    return {
      body: "I can help you schedule a call here in chat.",
      nextState: state,
      suggestedReplies: HANDOFF_BRIDGE_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
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
    return `It sounds like ${companyReference} is hiring for ${summary}, and ${urgencyPhrase}. Because the hiring need sounds more occasional or limited in scope, a lighter-touch hiring option may be worth comparing before jumping into a full proactive sourcing workflow.`;
  }

  if (summary === "harder-to-fill roles") {
    return `It sounds like the biggest pressure is around harder-to-fill roles, and ${urgencyPhrase}. A more proactive sourcing approach is usually what helps in that situation, which is where Recruiter tends to be most useful.`;
  }

  return `It sounds like ${companyReference} is hiring for ${summary}, and ${urgencyPhrase}. A more proactive sourcing approach is usually what helps in that situation, which is where Recruiter tends to be most useful.`;
}

function createNextStepQuestion(
  company: string,
  likelySolution: LikelySolution,
) {
  const companyReference = getCompanyReference(company);

  if (likelySolution === "lighter_touch") {
    return `Would it be more helpful to keep exploring, get pricing guidance, or talk with a representative about which option could fit ${companyReference} best?`;
  }

  return `Would it be more helpful to keep exploring, get pricing guidance, or talk with a representative about what this could look like for ${companyReference}?`;
}

function createNextStepSuggestions(likelySolution: LikelySolution) {
  return likelySolution === "lighter_touch"
    ? GENERAL_NEXT_STEP_SUGGESTIONS
    : RECRUITER_NEXT_STEP_SUGGESTIONS;
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
    state.likelySolution === "recruiter"
  );
}

function createRepresentativeRecommendationArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText: "First I'll match you with the right one",
    ctaLabel: "Find my rep",
    titleText: "Talk to a sales rep",
    type: "recommendation",
  };
}

function createRepresentativeMatchingArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText:
      "This may take up to 3 minutes. You can keep chatting in the meantime.",
    titleText: "Matching you now...",
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

function isDifferenceQuestion(normalized: string) {
  return normalized.includes("different") || normalized.includes("jobs");
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
