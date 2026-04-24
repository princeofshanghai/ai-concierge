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
  | "booking_pending"
  // Route 1 (High value, AE booking) — `docs/conversation-scripts.md`.
  // This is Jamie's canonical high-value flow: pressures (vague) → driver/scope
  // (funding + volume) → specialization → timeline → single-CTA rep card →
  // booking surface. The pressures → driver split keeps the conversation
  // pacing realistic (short first reply, richer second reply after AI probes).
  | "route_1_awaiting_pressures"
  | "route_1_awaiting_growth_driver"
  | "route_1_awaiting_specialization"
  | "route_1_awaiting_timeline"
  // Route 2 / Route 3 shared flow (Medium value). Both routes are identical
  // through bubble 4. The branch happens at the two-CTA recommendation card:
  // "Chat live now" → Route 2 live chat; "Schedule for later" → Route 3 booking.
  // Stage naming reflects the diagnostic the assistant is waiting on.
  | "route_23_awaiting_role_diagnostic"
  | "route_23_awaiting_timeline"
  // Route 4 (Low value, product card). Entry via pill "Find the right fit" →
  // starter prompt "Is this meant for teams my size?". Shortest flow in the
  // system: volume diagnostic → urgency chip → Hiring Pro product card. No
  // human handoff; the card CTA opens the external plans page.
  | "route_4_awaiting_volume_diagnostic"
  | "route_4_awaiting_urgency"
  // Route 5 (Low value, redirect link / nurture off-ramp). Entry via pill
  // "See customer stories" → starter prompt "Do companies like mine use
  // this?". Pure informational: no sales motion attached. Two typed diagnostic
  // turns → terminal bubble with an inline redirect link.
  | "route_5_awaiting_company_context"
  | "route_5_awaiting_role_context";

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
  // Optional acknowledge-only bubble rendered BEFORE `body` as its own assistant
  // message. Use this to express the "acknowledge then ask" rhythm from the
  // conversation scripts without baking both beats into a single bubble. The
  // acknowledge bubble never carries chips or an artifact — those always
  // attach to the main `body`.
  priorBubble?: string;
  nextState: AiConciergeConversationState;
  openingSupport?: AiConciergeOpeningSupport;
  postCompleteEffect?: "live-sales-handoff" | "representative-match";
  suggestedReplies?: AiConciergeSuggestedReply[];
  suggestedReplyDisplay?: "composer" | "inline";
};

// Flat opening chips (default `inline-prompts` variant). Each label is the
// exact user message submitted when the chip is tapped, so the matchers at
// the top of `createOpeningResponse` route them deterministically to the
// intended Phase-A route. See `docs/conversation-scripts.md` -> Shared opening.
const OPENING_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  {
    id: "find-right-solution",
    label: "Find the right solution for me",
  },
  {
    id: "discuss-hiring-challenges",
    label: "Discuss my hiring challenges",
  },
  {
    id: "show-success-stories",
    label: "Show me success stories",
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

// Route 1 composer-level scaffolding — the "Example responses" presenter
// clicks to speak as Jamie during the high-value demo. Single-item arrays are
// intentional: these are canned typed replies, not bounded choices.
// Jamie's replies are deliberately short + chunky (especially the first one)
// to mirror how a real visitor types mid-meeting: a phrase, not a paragraph.
// The AI's follow-up is what adds the context, which is the demo moment.
const ROUTE_1_PRESSURES_EXAMPLE: AiConciergeSuggestedReply[] = [
  {
    id: "route-1-pressures-jamie",
    label: "too many open roles rn",
  },
];

const ROUTE_1_GROWTH_DRIVER_EXAMPLE: AiConciergeSuggestedReply[] = [
  {
    id: "route-1-growth-driver-jamie",
    label:
      "pretty recent. Series C closed in Feb. ~40 roles across eng, clinical, sales, ops over 2 quarters.",
  },
];

const ROUTE_1_SPECIALIZATION_EXAMPLE: AiConciergeSuggestedReply[] = [
  {
    id: "route-1-specialization-jamie",
    label:
      "Yeah a few. ML engineers, clinical informatics, couple senior sales leaders. Open a while now.",
  },
];

// Route 1 B5 — bounded timeline options, surfaced at composer level per the
// script doc (consistent with the existing `URGENCY_SUGGESTIONS` pattern).
const ROUTE_1_TIMELINE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "route-1-timeline-milestones", label: "Specific milestones" },
  { id: "route-1-timeline-general", label: "Just general urgency" },
  { id: "route-1-timeline-both", label: "Bit of both" },
];

// Route 2/3 composer-level scaffolding. B1 is Jamie's canned typed reply for
// the diagnostic turn. B3 timeline is surfaced as 4 bounded chips matching the
// scripts doc.
const ROUTE_23_ROLE_DIAGNOSTIC_EXAMPLE: AiConciergeSuggestedReply[] = [
  {
    id: "route-23-roles-jamie",
    label:
      "Senior nursing and clinical informatics mostly. Few of them have been open for months.",
  },
];

const ROUTE_23_TIMELINE_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "route-23-timeline-quarter", label: "This quarter" },
  { id: "route-23-timeline-months", label: "In the next few months" },
  { id: "route-23-timeline-planning", label: "We're planning ahead" },
  { id: "route-23-timeline-exploring", label: "Still exploring" },
];

// Route 4 composer-level scaffolding. B1 is Jamie's canned typed reply for the
// volume diagnostic. B3 urgency is 4 bounded chips per the scripts doc.
const ROUTE_4_VOLUME_DIAGNOSTIC_EXAMPLE: AiConciergeSuggestedReply[] = [
  {
    id: "route-4-volume-jamie",
    label:
      "Pretty light on our end. Maybe 3-4 hires a year. Mostly sales and CS roles.",
  },
];

const ROUTE_4_URGENCY_SUGGESTIONS: AiConciergeSuggestedReply[] = [
  { id: "route-4-urgency-right-away", label: "Right away" },
  { id: "route-4-urgency-couple-months", label: "Within a couple months" },
  { id: "route-4-urgency-depends", label: "Depends on the role" },
  { id: "route-4-urgency-flexible", label: "We're flexible" },
];

// Route 5 composer-level scaffolding. Both turns surface a single canned
// typed reply for the presenter to tap during live-mode demos. These are
// NOT visitor-facing chips — Route 5's visitor experience remains fully
// open-typed. See the Route 5 script for the full rationale.
const ROUTE_5_COMPANY_CONTEXT_EXAMPLE: AiConciergeSuggestedReply[] = [
  {
    id: "route-5-company-context-jamie",
    label:
      "Startup, 15ish people. Haven't really hired much yet, but figuring we might need to soon.",
  },
];

const ROUTE_5_ROLE_CONTEXT_EXAMPLE: AiConciergeSuggestedReply[] = [
  {
    id: "route-5-role-context-jamie",
    label:
      "Honestly still up in the air. Maybe engineering and sales? No concrete plan yet.",
  },
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

function createOpeningCoreBody(contactDetails: ConciergeContactDetails) {
  const company = contactDetails.company.trim();
  const companyClause = company.length > 0 ? ` for ${company}` : "";

  return `I'm your AI hiring guide${companyClause}. Tell me what your team is working through and I'll help you find the right fit.`;
}

function createOpeningBody(contactDetails: ConciergeContactDetails) {
  const trimmedFirstName = contactDetails.firstName.trim();
  const openingCoreBody = createOpeningCoreBody(contactDetails);
  const welcomeLead =
    trimmedFirstName.length > 0
      ? `Hi ${trimmedFirstName}, glad you're here.`
      : "Hi, glad you're here.";

  return `${welcomeLead} ${openingCoreBody}`;
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
    body: openingBody,
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
    case "route_1_awaiting_pressures":
      assistantTurn = createRoute1PressuresAnswerResponse(state);
      break;
    case "route_1_awaiting_growth_driver":
      assistantTurn = createRoute1GrowthDriverResponse(input, state);
      break;
    case "route_1_awaiting_specialization":
      assistantTurn = createRoute1SpecializationResponse(input, state);
      break;
    case "route_1_awaiting_timeline":
      assistantTurn = createRoute1TimelineResponse(state, input);
      break;
    case "route_23_awaiting_role_diagnostic":
      assistantTurn = createRoute23RoleDiagnosticResponse(input, state);
      break;
    case "route_23_awaiting_timeline":
      assistantTurn = createRoute23TimelineResponse(input, state);
      break;
    case "route_4_awaiting_volume_diagnostic":
      assistantTurn = createRoute4VolumeDiagnosticResponse(input, state);
      break;
    case "route_4_awaiting_urgency":
      assistantTurn = createRoute4UrgencyResponse(input, state);
      break;
    case "route_5_awaiting_company_context":
      assistantTurn = createRoute5CompanyContextResponse(input, state);
      break;
    case "route_5_awaiting_role_context":
      assistantTurn = createRoute5RoleContextResponse(input, state);
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

// ============================================================================
// createOpeningResponse — the first-turn classifier.
//
// Ordered as follows, top to bottom:
//
// 1. Canonical Phase-A route entries (Routes 1-5). Each is the canonical pill
//    click from `docs/conversation-scripts.md`. Checked FIRST so a canonical
//    click always beats a generic paraphrase.
// 2. Legacy pre-Phase-A classifiers. These handle off-canonical typed inputs
//    (e.g. "pricing?", "I'm just getting started", "we hire consistently")
//    that don't match any of the five canonical pills. They route into the
//    legacy engine (`createHiringMotionResponse` → `createFitContextResponse`
//    → `createUrgencyResponse` → `createNextStepResponse`). That engine is
//    still used both for these paraphrases AND as a fallback inside
//    `createHandoffChoiceResponse` for canonical routes 1/2/3.
// 3. Generic fallback at the bottom — everything else routes to the hiring-
//    motion picker so the user still gets a helpful response.
// ============================================================================

function createOpeningResponse(input: string): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);

  // --- Flat-chip openings (default `inline-prompts` variant) ----------------
  // Tapping a flat opening chip submits the chip label verbatim. Matched
  // first so chip taps are deterministic; typed paraphrases below still
  // route to the same entry points via the legacy classifiers.

  if (
    normalized.includes("discuss my hiring challenges") ||
    normalized.includes("my hiring challenges") ||
    (normalized.includes("hiring") && normalized.includes("challenges"))
  ) {
    return createRoute1PressuresResponse();
  }

  if (
    normalized.includes("find the right solution") ||
    normalized.includes("right solution for me")
  ) {
    return createRoute23RolesDiagnosticResponse();
  }

  if (
    normalized.includes("show me success") ||
    normalized.includes("success stories")
  ) {
    return createRoute5CompanyContextDiagnosticResponse();
  }

  // --- Canonical Phase-A entries ---------------------------------------------

  // Route 1 (high value) entry — the "Help with hiring" pill's canonical
  // demo click ("We're hiring a lot right now") and similar phrasings.
  // Checked first so it doesn't get swallowed by the broader hiring intents.
  if (isRoute1HiringScaleIntent(normalized)) {
    return createRoute1PressuresResponse();
  }

  // Route 4 (low value, product card) entry — the "Find the right fit" pill's
  // canonical demo click ("Is this meant for teams my size?"). Narrow match so
  // the other pill-2 prompts still flow into the older solution-fit classifier
  // below. Checked early so "team size" framings don't accidentally route to
  // the broader hiring-motion paths.
  if (isRoute4FitIntent(normalized)) {
    return createRoute4FitDiagnosticResponse();
  }

  // Route 5 (low value, nurture off-ramp) entry — the "See customer stories"
  // pill's canonical demo click ("Do companies like mine use this?"). Checked
  // early so the peer-validation framing doesn't get misclassified as an
  // exploration-stage hiring intent further below.
  if (isRoute5CustomerStoriesIntent(normalized)) {
    return createRoute5CompanyContextDiagnosticResponse();
  }

  // --- Legacy pre-Phase-A classifiers (typed-paraphrase fallbacks) ----------
  // These handle off-canonical typed inputs. They route into the legacy
  // engine below. Kept for robustness when a visitor types something that
  // doesn't match any of the five canonical pill clicks.

  if (isPricingIntent(normalized)) {
    return {
      body: "Great question. Pricing really depends on your specific situation, so a specialist would be the best person to walk you through what fits. To point you the right way, which is closer to your hiring right now?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_hiring_motion",
        startingSituation: "pricing_guidance",
      },
      suggestedReplies: HIRING_MOTION_SUGGESTIONS,
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

  // Route 2/3 (medium value) entry — "We have hard-to-fill roles" from the
  // "Help with hiring" pill and paraphrases like "specialized hiring." Routed to
  // the shared Route 2/3 diagnostic flow; the branch into live-chat vs.
  // scheduled-booking happens later when the visitor taps a CTA on the
  // two-CTA recommendation card.
  if (isHardToFillIntent(normalized)) {
    return createRoute23RolesDiagnosticResponse();
  }

  if (isOccasionalHiringIntent(normalized)) {
    return {
      body: "Makes sense. When hiring is more occasional, a lighter-touch option can work better than a full sourcing workflow. What kinds of roles usually come up?",
      nextState: {
        ...DEFAULT_STATE,
        stage: "awaiting_fit_context",
        hiringMotion: "occasional_hiring",
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
      body: "Good question. Recruiter is most useful when your team needs to proactively find and reach candidates instead of waiting for inbound applications. It helps you search, narrow down, and reach out directly. To point you the right way, how does your team typically hire?",
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

// ============================================================================
// Legacy pre-Phase-A conversation engine.
//
// These four generators (`createHiringMotionResponse`,
// `createFitContextResponse`, `createUrgencyResponse`, `createNextStepResponse`)
// form a self-contained flow used in two situations:
//
//   1. Typed-paraphrase fallbacks. When a visitor types something that doesn't
//      match any of the five canonical pill clicks (e.g. "pricing?",
//      "we hire occasionally", "I'm just getting started"), the opening
//      classifier routes them into this engine so they still get a helpful
//      multi-turn experience.
//   2. Handoff fallback for canonical routes. `createHandoffChoiceResponse`
//      delegates to `createNextStepResponse` when no other branch matches —
//      so this code is on the critical path for Routes 1/2/3 too.
//
// The canonical five-route experience (Routes 1-5) is implemented further
// below in dedicated `createRoute1*` / `createRoute23*` / `createRoute4*` /
// `createRoute5*` functions. See `docs/conversation-scripts.md` for the
// canonical scripts those functions implement.
// ============================================================================

function createHiringMotionResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);
  const hiringMotion = classifyHiringMotion(normalized);

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
        body: "No problem. A good place to start is usually where the hiring pressure is strongest. Which teams or roles are most affected?",
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

  // Redirect off-ramp: when both motion and role signal are unclear, we do not
  // have enough to recommend a product or a rep. Point the visitor at a
  // broader LinkedIn resource and end the scripted flow gracefully.
  if (
    state.hiringMotion === "still_figuring_it_out" &&
    likelySolution === "unknown"
  ) {
    return {
      artifact: createRedirectRecommendationArtifact(),
      body: "No problem. It sounds like you're still scoping what hiring looks like. It might be worth starting with some background on how teams think about this before we narrow in.",
      nextState: {
        ...state,
        stage: "explore",
        hiringSummary: roleContext.summary,
        hiringUseCase: roleContext.hiringUseCase,
        hiringComplexity: roleContext.hiringComplexity,
        likelySolution,
        readiness: "exploring",
      },
    };
  }

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
      suggestedReplies: LIVE_HANDOFF_BRIDGE_SUGGESTIONS,
      suggestedReplyDisplay: "inline",
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

// ----------------------------------------------------------------------------
// Route 1 — High value (AE booking). See docs/conversation-scripts.md for the
// canonical script this code implements.
// ----------------------------------------------------------------------------

// Route 1 B1 — warm, direct challenge probe (no chips in chat; composer
// surfaces Jamie's deliberately vague canned reply for presenter scaffolding).
// The vague first reply is intentional: it lets the AI's B2 clarifier
// demonstrate Principle 1 ("Heard, not qualified") — warming an unclear input
// into something actionable.
function createRoute1PressuresResponse(): AiConciergeAssistantTurn {
  return {
    body: "Happy to help. What's been the hardest part of hiring for you lately?",
    nextState: {
      ...DEFAULT_STATE,
      stage: "route_1_awaiting_pressures",
      startingSituation: "consistent_hiring",
      hiringMotion: "broader_ongoing",
      likelySolution: "recruiter",
    },
    suggestedReplies: ROUTE_1_PRESSURES_EXAMPLE,
    suggestedReplyDisplay: "composer",
  };
}

// Route 1 B2 — ack + scope/driver clarifier. This is the turn that earns the
// richer follow-up reply from Jamie (funding round + 40 roles). Single bubble,
// no priorBubble: the acknowledge is short and leads directly into the
// question, since the user's previous reply was vague.
function createRoute1PressuresAnswerResponse(
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  return {
    body:
      "That's a real pressure to be under. What's driving it usually shapes what's worth trying. Is this a recent ramp, or has it been building?",
    nextState: {
      ...state,
      stage: "route_1_awaiting_growth_driver",
    },
    suggestedReplies: ROUTE_1_GROWTH_DRIVER_EXAMPLE,
    suggestedReplyDisplay: "composer",
  };
}

// Route 1 B3 + B4 — acknowledge-only bubble (priorBubble) followed by the
// specialization probe. The acknowledge beat is the Principle 1 proof moment
// from the scripts doc: concierge listens without immediately asking again.
function createRoute1GrowthDriverResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);
  const mentionsFunding =
    normalized.includes("funding") ||
    normalized.includes("series") ||
    normalized.includes("raised") ||
    normalized.includes("closed a round");

  const acknowledgeBody = mentionsFunding
    ? "Makes sense. Post-funding growth hiring across multiple functions tends to stretch teams fast, especially when the roles don't all look the same."
    : "Makes sense. Growth like that across multiple functions tends to stretch teams fast, especially when the roles don't all look the same.";

  return {
    priorBubble: acknowledgeBody,
    body:
      "In a mix that wide, it's common for a few roles to stay open longer than the rest. Any of the ones you mentioned sitting in that bucket for a while?",
    nextState: {
      ...state,
      stage: "route_1_awaiting_specialization",
      hiringSummary: "hiring across multiple functions after a funding round",
    },
    suggestedReplies: ROUTE_1_SPECIALIZATION_EXAMPLE,
    suggestedReplyDisplay: "composer",
  };
}

// Route 1 B5 — reflect + timeline question. Three bounded timeline options
// surface at composer level (matching the existing URGENCY_SUGGESTIONS
// pattern elsewhere in this file).
function createRoute1SpecializationResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const roleContext = summarizeHiringContext(input);

  return {
    body:
      "Those are roles where active search usually works better than waiting on inbound. And you're working on a tight runway. Is the timing tied to specific milestones, or is it more of a general urgency?",
    nextState: {
      ...state,
      stage: "route_1_awaiting_timeline",
      hiringSummary: roleContext.summary,
      hiringUseCase: roleContext.hiringUseCase,
      hiringComplexity: "specialized",
    },
    suggestedReplies: ROUTE_1_TIMELINE_SUGGESTIONS,
    suggestedReplyDisplay: "composer",
  };
}

// Route 1 B6 — reflect + commit + single-CTA rep card. Tapping the card's
// "Find a time" CTA runs through the existing representative-match flow
// (which transforms the artifact into matching → ready → booking surface).
function createRoute1TimelineResponse(
  state: AiConciergeConversationState,
  input: string,
): AiConciergeAssistantTurn {
  const urgency = classifyUrgency(input);

  return {
    artifact: createRoute1RepresentativeRecommendationArtifact(),
    body:
      "Given the scale, the specialized roles, and the timeline, this is exactly the kind of hiring setup a specialist can help with. Here's a quick way to set up time with one.",
    nextState: {
      ...state,
      stage: "awaiting_handoff_choice",
      readiness: "representative",
      urgency,
    },
  };
}

function createRoute1RepresentativeRecommendationArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText: "Talk with someone who knows situations like this",
    ctaLabel: "Find a time",
    titleText: "Meet with a hiring specialist",
    type: "recommendation",
  };
}

// ============================================================================
// Route 2/3 (Medium value) — shared flow; branch decision happens on the card
// ============================================================================

// Route 2/3 B1 — acknowledge + role diagnostic. No inline chips (the scripts
// doc mandates typed input for diagnostic turns). The composer example is
// Jamie's canned healthcare reply so the presenter has a one-click path in
// live mode.
function createRoute23RolesDiagnosticResponse(): AiConciergeAssistantTurn {
  return {
    body:
      "Happy to help you figure that out. The right kind of support depends a lot on what's getting in the way. What's been toughest lately?",
    nextState: {
      ...DEFAULT_STATE,
      stage: "route_23_awaiting_role_diagnostic",
      startingSituation: "hard_to_fill",
      hiringMotion: "hard_to_fill",
      likelySolution: "recruiter",
    },
    suggestedReplies: ROUTE_23_ROLE_DIAGNOSTIC_EXAMPLE,
    suggestedReplyDisplay: "composer",
  };
}

// Route 2/3 B2 + B3 — acknowledge-only bubble (Principle 1 proof moment, same
// pattern as Route 1 B3) followed by the timeline question. The acknowledge
// copy mirrors Jamie's healthcare example when detected and falls back to a
// more generic framing otherwise.
function createRoute23RoleDiagnosticResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const normalized = normalizeInput(input);
  const mentionsHealthcare =
    normalized.includes("nurs") ||
    normalized.includes("clinical") ||
    normalized.includes("informatics") ||
    normalized.includes("healthcare");

  const acknowledgeBody = mentionsHealthcare
    ? "That tracks. Senior nursing and clinical informatics are both narrow talent pools, and waiting on inbound tends to drag those vacancies out."
    : "That tracks. Those are the kind of narrow talent pools where waiting on inbound tends to drag vacancies out.";

  const roleContext = summarizeHiringContext(input);

  return {
    priorBubble: acknowledgeBody,
    body:
      "That's the kind of gap where active outreach usually moves the needle faster than waiting on inbound. How soon do you need to see real progress?",
    nextState: {
      ...state,
      stage: "route_23_awaiting_timeline",
      hiringSummary: roleContext.summary,
      hiringUseCase: roleContext.hiringUseCase,
      hiringComplexity: "specialized",
    },
    suggestedReplies: ROUTE_23_TIMELINE_SUGGESTIONS,
    suggestedReplyDisplay: "composer",
  };
}

// Route 2/3 B4 — reflect + commit + two-CTA rep card. The card's primary CTA
// ("Chat live now") branches into Route 2 (live-sales handoff); the secondary
// CTA ("Schedule for later") branches into Route 3 (representative-match →
// booking surface). The body intentionally reflects the "couple of months"
// timeline — matches Jamie's canonical reply but still reads reasonably for
// the other bounded options.
function createRoute23TimelineResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const urgency = classifyUrgency(input);

  return {
    artifact: createRoute23RepresentativeRecommendationArtifact(),
    body:
      "Roles like these usually need a proactive sourcing approach, and a couple of months is enough time to make real progress. A hiring specialist can help you figure out the right setup.",
    nextState: {
      ...state,
      stage: "awaiting_handoff_choice",
      readiness: "representative",
      urgency,
    },
  };
}

// Two-CTA recommendation card for Routes 2 and 3. Primary = "Chat live now"
// (live-chat intent → live-sales handoff); secondary = "Schedule for later"
// (book-meeting intent → representative match → booking surface). No body
// text — the preceding assistant bubble already frames the handoff and the two
// CTAs are self-explanatory together. Contrast Route 1's single-CTA card,
// which keeps a body line because one button alone can't carry the context.
function createRoute23RepresentativeRecommendationArtifact(): AiConciergeMessageArtifact {
  return {
    ctaLabel: "Chat live now",
    primaryCtaIntent: "live-chat",
    secondaryCtaLabel: "Schedule for later",
    secondaryCtaIntent: "book-meeting",
    titleText: "Talk to a hiring specialist",
    type: "recommendation",
  };
}

// ============================================================================
// Route 4 (Low value, product card) — shortest flow; ends in self-serve card
// ============================================================================

// Route 4 B1 — acknowledge the fit question + turn it into a diagnostic about
// hiring volume. No chips (typed input, matching the scripts-doc chip policy
// for diagnostic turns).
function createRoute4FitDiagnosticResponse(): AiConciergeAssistantTurn {
  return {
    body:
      "Good question. The right fit depends on how much hiring you typically do. What does a usual year look like for your team?",
    nextState: {
      ...DEFAULT_STATE,
      stage: "route_4_awaiting_volume_diagnostic",
      startingSituation: "solution_fit",
      // Don't commit to a hiring motion yet — we learn that from the volume
      // answer. `likelySolution` stays "unknown" here so the later Route 4
      // generator can set "lighter_touch" once the lighter cadence is confirmed.
    },
    suggestedReplies: ROUTE_4_VOLUME_DIAGNOSTIC_EXAMPLE,
    suggestedReplyDisplay: "composer",
  };
}

// Route 4 B2 + B3 — acknowledge-only bubble (Principle 1 proof moment) then the
// urgency question with 4 composer chips. The acknowledge copy reflects the
// "lighter cadence, narrow mix" framing from the scripts doc; we don't name the
// product yet — that happens in B4.
function createRoute4VolumeDiagnosticResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const roleContext = summarizeHiringContext(input);

  return {
    priorBubble:
      "Got it. For teams at that volume, a lighter-touch option usually fits better than a full sourcing workflow.",
    body:
      "One more thing that tends to shape what fits best. When a role opens up, how fast do you usually need to fill it?",
    nextState: {
      ...state,
      stage: "route_4_awaiting_urgency",
      hiringMotion: "occasional_hiring",
      hiringSummary: roleContext.summary,
      hiringUseCase: roleContext.hiringUseCase,
      hiringComplexity: "broad",
      likelySolution: "lighter_touch",
    },
    suggestedReplies: ROUTE_4_URGENCY_SUGGESTIONS,
    suggestedReplyDisplay: "composer",
  };
}

// Route 4 B4 — reflect + commit + Hiring Pro product card. Terminal state for
// this route: `stage: "explore"` so the composer stays open and any typed
// follow-up routes through the generic next-step handler (the organic "override
// to rep" path the scripts doc calls out).
function createRoute4UrgencyResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const urgency = classifyUrgency(input);

  return {
    artifact: createRoute4HiringProRecommendationArtifact(),
    body:
      "For 3-4 hires a year, there's a lighter-touch option designed exactly for this.",
    nextState: {
      ...state,
      stage: "explore",
      readiness: "exploring",
      urgency,
    },
  };
}

// Product recommendation card for Route 4. External CTA — the existing
// `openRecommendationLink` handler in the panel opens `ctaHref` in a new tab
// without touching conversation state, matching the scripts doc's "script ends
// on the card" note.
function createRoute4HiringProRecommendationArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText:
      "Best for occasional hiring and attracting inbound candidates",
    ctaHref: LOWER_TOUCH_PLANS_CTA_HREF,
    ctaLabel: "View product",
    tagText: "Recommended for you",
    titleText: "Hiring Pro",
    type: "recommendation",
  };
}

// ============================================================================
// Route 5 (Low value, redirect link / nurture off-ramp) — no sales motion,
// terminates in an inline styled link. Zero chips anywhere in the flow.
// ============================================================================

// External destination for Route 5's terminal redirect. Using example.com per
// prototype conventions — we never actually navigate off-app in demos. The
// scripts doc points at LinkedIn's hire product-overview page; update this
// constant when production-bound.
const ROUTE_5_REDIRECT_HREF = "https://example.com";

// Route 5 B1 — acknowledge + open diagnostic about company context. No
// visitor-facing chips; Route 5's script keeps the conversation surface fully
// open-typed to reinforce the "low-structure, exploratory conversation"
// shape. The composer-level sample reply below is presenter scaffolding for
// live-mode demos (same pattern as Routes 1-4) and doesn't change the visitor
// experience.
function createRoute5CompanyContextDiagnosticResponse(): AiConciergeAssistantTurn {
  return {
    body:
      "Plenty of teams use LinkedIn for hiring, and the most relevant examples depend on your setup. What kind of team are we talking about?",
    nextState: {
      ...DEFAULT_STATE,
      stage: "route_5_awaiting_company_context",
      // Leave startingSituation as "unknown" — Route 5 visitors explicitly
      // haven't defined a situation yet. Nothing downstream branches on this
      // field, so adding a new enum variant would be bloat.
    },
    suggestedReplies: ROUTE_5_COMPANY_CONTEXT_EXAMPLE,
    suggestedReplyDisplay: "composer",
  };
}

// Route 5 B2 + B3 — acknowledge-only bubble (Principle 1 proof) then a gentle
// role probe. Still no visitor-facing chips: the probe is intentionally
// open-ended so the visitor isn't forced to commit to a concrete role signal
// they don't have. Composer-level sample reply is presenter scaffolding for
// live-mode demos.
function createRoute5CompanyContextResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const roleContext = summarizeHiringContext(input);

  return {
    priorBubble:
      "Totally fair. At that stage, the useful question usually isn't which tool, it's what kind of hiring you'll actually need first.",
    body:
      "When you say you might need to soon, do you have a sense of what that looks like? Specific role in mind, or still up in the air?",
    nextState: {
      ...state,
      stage: "route_5_awaiting_role_context",
      hiringSummary: roleContext.summary,
      hiringUseCase: roleContext.hiringUseCase,
    },
    suggestedReplies: ROUTE_5_ROLE_CONTEXT_EXAMPLE,
    suggestedReplyDisplay: "composer",
  };
}

// Route 5 B4 — reflect + commit + inline redirect link. The link is embedded
// in the body via the `[label](url)` parser in ChatAssistantMessage. No
// artifact — this is deliberately lighter than Route 4's product card to
// reinforce "every route is a good route; low value gets a polite bookmark,
// not a pitch." Terminal state is `explore` so the composer stays open for
// any typed follow-up (organic re-route to a rep if the visitor decides they
// want one).
function createRoute5RoleContextResponse(
  input: string,
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  const roleContext = summarizeHiringContext(input);

  return {
    body: `That's a pretty common spot to be in. Here's a good starting point to browse what LinkedIn has for hiring. Come back anytime.\n\n[LinkedIn hiring products →](${ROUTE_5_REDIRECT_HREF})`,
    nextState: {
      ...state,
      hiringSummary: roleContext.summary || state.hiringSummary,
      hiringUseCase: roleContext.hiringUseCase,
      readiness: "exploring",
      stage: "explore",
      urgency: "unknown",
    },
  };
}

// ----------------------------------------------------------------------------

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
    ctaLabel: "View product",
    tagText: "Recommended for you",
    titleText: "Hiring Pro",
    type: "recommendation",
  };
}

function createRedirectRecommendationArtifact(): AiConciergeMessageArtifact {
  return {
    ctaHref: LOWER_TOUCH_PLANS_CTA_HREF,
    ctaLabel: "Visit site",
    titleText: "Learn how teams hire on LinkedIn",
    type: "recommendation",
  };
}

export function createRepresentativeMatchingArtifact(): AiConciergeMessageArtifact {
  return {
    bodyText:
      "This usually takes a minute or two. You can keep chatting in the meantime.",
    titleText: "Connecting you with the right person",
    type: "representative-match",
    status: "matching",
  };
}

// Matching artifact shown during the live-sales handoff delay (before the agent
// message appears in the chat). Title is intentionally shorter than the booking
// variant because the follow-up is immediate (seconds, not minutes).
export function createLiveSalesMatchingArtifact(): AiConciergeMessageArtifact {
  return {
    titleText: "Connecting you now...",
    type: "representative-match",
    status: "matching",
  };
}

function createLiveSalesHandoffTurn(
  state: AiConciergeConversationState,
): AiConciergeAssistantTurn {
  return {
    body: "",
    artifact: createLiveSalesMatchingArtifact(),
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

// Narrow classifier for the Route 4 canonical demo click ("Is this meant for
// teams my size?"). Intentionally tight so other pill-2 prompts still fall
// through to the older `isSolutionFitIntent` handler.
function isRoute4FitIntent(normalized: string) {
  return (
    normalized.includes("teams my size") ||
    normalized.includes("team my size") ||
    normalized.includes("meant for teams") ||
    normalized.includes("right size for")
  );
}

// Narrow classifier for the Route 5 canonical demo click ("Do companies like
// mine use this?") and other peer-validation / customer-story framings from the
// "See customer stories" pill. Narrow on purpose so paraphrases that are really
// about "I'm just getting started" still fall through to the legacy
// `isJustGettingStartedIntent` path.
function isRoute5CustomerStoriesIntent(normalized: string) {
  return (
    normalized.includes("companies like mine") ||
    normalized.includes("companies like ours") ||
    normalized.includes("companies like us") ||
    normalized.includes("customer stories") ||
    normalized.includes("who uses this") ||
    normalized.includes("who else uses")
  );
}

function isConsistentHiringIntent(normalized: string) {
  return (
    normalized.includes("hire consistently") ||
    normalized.includes("hiring consistently") ||
    normalized.includes("across teams")
  );
}

// "We're hiring a lot right now" and phrasings that signal scaled growth
// hiring without yet naming the shape of the problem. This is Jamie's demo
// click for Route 1 (high value, AE booking).
function isRoute1HiringScaleIntent(normalized: string) {
  return (
    normalized.includes("hiring a lot") ||
    normalized.includes("lots of hiring") ||
    normalized.includes("lot of hiring") ||
    normalized.includes("hiring a ton") ||
    normalized.includes("scaling up hiring") ||
    normalized.includes("scaling fast and hiring")
  );
}

function isHardToFillIntent(normalized: string) {
  return (
    // Accept both hyphenated ("hard-to-fill") and spaced ("hard to fill")
    // phrasings plus the "harder" comparative. The canonical Route 2/3 pill
    // prompt is "We have hard-to-fill roles" (hyphenated).
    normalized.includes("hard-to-fill") ||
    normalized.includes("harder-to-fill") ||
    normalized.includes("hard to fill") ||
    normalized.includes("harder to fill") ||
    normalized.includes("specialized hiring")
  );
}

function isOccasionalHiringIntent(normalized: string) {
  return (
    normalized.includes("hiring occasionally") ||
    normalized.includes("hire occasionally") ||
    normalized.includes("occasional hiring") ||
    normalized.includes("occasionally")
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
    normalized.includes("schedule for later") ||
    normalized.includes("schedule") ||
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
  if (state.stage !== "awaiting_handoff_choice") {
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
