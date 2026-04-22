export type AiConciergeOpeningPromptTopic = {
  id: string;
  label: string;
  prompts: string[];
};

export type AiConciergeOpeningSupport =
  | {
      type: "helper-examples";
      helperText: string;
      examples: string[];
    }
  | {
      type: "topic-picker";
      helperText: string;
      topics: AiConciergeOpeningPromptTopic[];
    };

export const OPENING_HELPER_EXAMPLES = [
  "We need help with harder-to-fill roles. Where should we start?",
  "How do teams usually figure out which option fits?",
  "We're hiring across a few teams and not sure what we need.",
] as const;

export const OPENING_PROMPT_TOPICS: AiConciergeOpeningPromptTopic[] = [
  {
    id: "help-with-hiring",
    label: "Help with hiring",
    prompts: [
      "We're hiring a lot right now",
      "We have hard-to-fill roles",
      "We're hiring across teams",
    ],
  },
  {
    id: "find-the-right-fit",
    label: "Find the right fit",
    prompts: [
      "Which hiring solution fits my team?",
      "How is Recruiter different from Hiring Pro?",
      "Is this meant for teams my size?",
    ],
  },
  {
    id: "see-customer-stories",
    label: "See customer stories",
    prompts: [
      "Do companies like mine use this?",
      "What kinds of results do customers see?",
      "Any examples from my industry?",
    ],
  },
  {
    id: "get-started",
    label: "Get started",
    prompts: [
      "How fast could we get going?",
      "Does this connect to our ATS?",
      "What does onboarding look like?",
    ],
  },
];
