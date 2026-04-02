import type { AiConciergeSuggestedReply } from "@/components/ai-concierge-body";
import type { ConciergeContactDetails } from "@/components/ai-concierge-onboarding";

type ConversationStage =
  | "opening"
  | "awaiting_hiring_motion"
  | "awaiting_fit_context"
  | "awaiting_next_step"
  | "awaiting_handoff_choice"
  | "explore"
  | "booking_pending"
  | "callback_pending";

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
type Readiness = "exploring" | "pricing" | "specialist" | "unknown";
export type NextStepMode = "meeting" | "callback" | null;

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
};

export type EntryMode = "manual" | "prefill";

type AssistantTurn = {
  body: string;
  nextState: AiConciergeConversationState;
  suggestedReplies?: AiConciergeSuggestedReply[];
  suggestedReplyDisplay?: "composer" | "inline";
};

const OPENING_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  {
    id: "solution-fit",
    label: "We're not sure which hiring solution fits",
  },
  {
    id: "consistent-hiring",
    label: "We hire consistently across teams",
  },
  {
    id: "hard-to-fill",
    label: "We need help with harder-to-fill roles",
  },
  {
    id: "pricing-guidance",
    label: "We'd like pricing guidance",
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

const RECRUITER_NEXT_STEP_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "keep-exploring", label: "Keep exploring" },
  { id: "pricing-details", label: "How is pricing structured?" },
  { id: "talk-recruiter-specialist", label: "Talk to a Recruiter specialist" },
];

const GENERAL_NEXT_STEP_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "keep-exploring", label: "Keep exploring" },
  { id: "pricing-details", label: "How is pricing structured?" },
  { id: "talk-hiring-specialist", label: "Talk to a hiring specialist" },
];

const RECRUITER_EXPLORE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "compare-jobs", label: "How is it different from LinkedIn Jobs?" },
  { id: "worth-it", label: "When is Recruiter worth it?" },
  { id: "talk-recruiter-specialist", label: "Talk to a Recruiter specialist" },
];

const GENERAL_EXPLORE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "compare-options", label: "Which option seems closest?" },
  { id: "pricing-details", label: "How is pricing structured?" },
  { id: "talk-hiring-specialist", label: "Talk to a hiring specialist" },
];

const HANDOFF_BRIDGE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "see-available-times", label: "See available times" },
  { id: "request-phone-call", label: "Request a phone call" },
  { id: "keep-exploring", label: "Keep exploring" },
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
};

export function createOpeningTurn({
  contactDetails,
  entryMode,
}: {
  contactDetails: ConciergeContactDetails;
  entryMode: EntryMode;
}): AssistantTurn {
  const intro =
    entryMode === "manual" ? "thanks for sharing your details. " : "";

  return {
    body: `Hi ${contactDetails.firstName}, ${intro}I can help you figure out which hiring solutions could make sense for ${contactDetails.company}, answer questions about how they fit different hiring needs, and connect you with a specialist if that becomes useful.\n\nHere are a few ways to get started:`,
    nextState: DEFAULT_STATE,
    suggestedReplies: OPENING_SUGGESTIONS,
    suggestedReplyDisplay: "inline",
  };
}

export function createReturnToChatTurn({
  contactDetails,
  state,
}: {
  contactDetails: ConciergeContactDetails;
  state: AiConciergeConversationState;
}): AssistantTurn {
  const nextState: AiConciergeConversationState = {
    ...state,
    stage: "explore",
    nextStepMode: null,
    readiness: "exploring",
  };

  if (state.likelySolution === "lighter_touch") {
    return {
      body: `No problem. I can keep helping you compare which hiring option could fit ${contactDetails.company} best, and we can revisit the specialist option anytime.`,
      nextState,
      suggestedReplies: createExploreSuggestions(state.likelySolution),
      suggestedReplyDisplay: "composer",
    };
  }

  return {
    body: `No problem. I can keep helping you understand where Recruiter could fit for ${contactDetails.company}, and we can revisit the specialist option anytime.`,
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
}): AssistantTurn {
  switch (state.stage) {
    case "opening":
      return createOpeningResponse(input);
    case "awaiting_hiring_motion":
      return createHiringMotionResponse(input, state);
    case "awaiting_fit_context":
      return createFitContextResponse(input, state, contactDetails);
    case "awaiting_next_step":
    case "explore":
      return createNextStepResponse(input, state, contactDetails);
    case "awaiting_handoff_choice":
      return createHandoffChoiceResponse(input, state, contactDetails);
    case "booking_pending":
    case "callback_pending":
      return {
        body: "I can also answer any other questions you have while we get that set up.",
        nextState: state,
      };
  }
}

function createOpeningResponse(input: string): AssistantTurn {
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
): AssistantTurn {
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
  contactDetails: ConciergeContactDetails,
): AssistantTurn {
  const roleContext = summarizeHiringContext(input);
  const likelySolution = determineLikelySolution({
    hiringComplexity: roleContext.hiringComplexity,
    hiringMotion: state.hiringMotion,
    hiringUseCase: roleContext.hiringUseCase,
  });

  const recommendation = createRecommendationMessage({
    company: contactDetails.company,
    likelySolution,
    summary: roleContext.summary,
  });

  return {
    body: `${recommendation}\n\n${createNextStepQuestion(contactDetails.company, likelySolution)}`,
    nextState: {
      ...state,
      stage: "awaiting_next_step",
      hiringSummary: roleContext.summary,
      hiringUseCase: roleContext.hiringUseCase,
      hiringComplexity: roleContext.hiringComplexity,
      likelySolution,
    },
    suggestedReplies: createNextStepSuggestions(likelySolution),
    suggestedReplyDisplay: "composer",
  };
}

function createNextStepResponse(
  input: string,
  state: AiConciergeConversationState,
  contactDetails: ConciergeContactDetails,
): AssistantTurn {
  const normalized = normalizeInput(input);
  const roleClause = createRoleClause(state.hiringSummary);
  const specialistLabel =
    state.likelySolution === "recruiter"
      ? "Recruiter specialist"
      : "hiring specialist";

  if (normalized.includes("talk to a") || normalized.includes("specialist")) {
    return {
      body:
        state.likelySolution === "recruiter"
          ? `That makes sense. Based on what you shared, a short conversation with a Recruiter specialist could be a useful next step for ${contactDetails.company}.\n\nI can show you a few available times, request a phone call, or we can keep exploring first.`
          : `That makes sense. A short conversation with a hiring specialist could help narrow the right option for ${contactDetails.company}.\n\nI can show you a few available times, request a phone call, or we can keep exploring first.`,
      nextState: {
        ...state,
        stage: "awaiting_handoff_choice",
        readiness: "specialist",
        nextStepMode: null,
      },
      suggestedReplies: HANDOFF_BRIDGE_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
    };
  }

  if (normalized.includes("pricing")) {
    return {
      body:
        state.likelySolution === "recruiter"
          ? "Pricing usually depends on hiring volume, role complexity, and the level of support your team needs. For teams with broader ongoing or harder-to-fill hiring needs, that is usually where Recruiter becomes easier to justify. If helpful, I can keep helping you gauge fit or connect you with a Recruiter specialist for specifics."
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
    body: `I can keep helping you understand what could fit ${contactDetails.company}, or, if helpful, connect you with a ${specialistLabel}.`,
    nextState: state,
    suggestedReplies: createExploreSuggestions(state.likelySolution),
    suggestedReplyDisplay: "composer",
  };
}

function createHandoffChoiceResponse(
  input: string,
  state: AiConciergeConversationState,
  contactDetails: ConciergeContactDetails,
): AssistantTurn {
  const normalized = normalizeInput(input);

  if (normalized.includes("keep exploring")) {
    return createReturnToChatTurn({
      contactDetails,
      state,
    });
  }

  if (normalized.includes("available times") || normalized.includes("see")) {
    return {
      body:
        state.likelySolution === "lighter_touch"
          ? `Here are a few times to talk with a hiring specialist about which option could fit ${contactDetails.company} best.`
          : `Here are a few times to talk with a Recruiter specialist about ${contactDetails.company}.`,
      nextState: {
        ...state,
        stage: "booking_pending",
        nextStepMode: "meeting",
      },
    };
  }

  if (normalized.includes("phone") || normalized.includes("call")) {
    return {
      body:
        state.likelySolution === "lighter_touch"
          ? `No problem. I can help you request a phone call with a hiring specialist.`
          : `No problem. I can help you request a phone call with a Recruiter specialist.`,
      nextState: {
        ...state,
        stage: "callback_pending",
        nextStepMode: "callback",
      },
    };
  }

  return createReturnToChatTurn({
    contactDetails,
    state,
  });
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
}: {
  company: string;
  likelySolution: LikelySolution;
  summary: string;
}) {
  if (likelySolution === "lighter_touch") {
    return `It sounds like ${company} is hiring for ${summary}. Because the hiring need sounds more occasional or limited in scope, a lighter-touch hiring option may be worth comparing before jumping into a full proactive sourcing workflow.`;
  }

  if (summary === "harder-to-fill roles") {
    return "It sounds like the biggest pressure is around harder-to-fill roles. A more proactive sourcing approach is usually what helps in that situation, which is where Recruiter tends to be most useful.";
  }

  return `It sounds like ${company} is hiring for ${summary}. A more proactive sourcing approach is usually what helps in that situation, which is where Recruiter tends to be most useful.`;
}

function createNextStepQuestion(
  company: string,
  likelySolution: LikelySolution,
) {
  if (likelySolution === "lighter_touch") {
    return `Would it be more helpful to keep exploring, get pricing guidance, or talk with a specialist about which option could fit ${company} best?`;
  }

  return `Would it be more helpful to keep exploring, get pricing guidance, or talk with a specialist about what this could look like for ${company}?`;
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
