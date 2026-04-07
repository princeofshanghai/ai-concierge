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
  "What would pricing depend on for a team like ours?",
  "How do teams usually decide which option fits best?",
  "We need help with harder-to-fill roles. Where should we start?",
] as const;

export const OPENING_PROMPT_TOPICS: AiConciergeOpeningPromptTopic[] = [
  {
    id: "finding-the-right-fit",
    label: "Finding the right fit",
    prompts: [
      "We're not sure which hiring solution fits",
      "Which hiring solution seems right for us?",
      "When is Recruiter worth it?",
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    prompts: [
      "We have questions about pricing",
      "What would pricing depend on for a team like ours?",
      "How is pricing structured?",
    ],
  },
  {
    id: "team-needs",
    label: "Team needs",
    prompts: [
      "We hire consistently across teams",
      "We need help with harder-to-fill roles",
      "We're still figuring out what we need",
    ],
  },
  {
    id: "compare-options",
    label: "Compare options",
    prompts: [
      "How is it different from LinkedIn Jobs?",
      "What is LinkedIn Recruiter?",
      "Which option seems closest for us?",
    ],
  },
];
