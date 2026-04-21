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
    id: "finding-the-right-fit",
    label: "Finding the right fit",
    prompts: [
      "We're not sure which hiring solution fits",
    ],
  },
  {
    id: "harder-to-fill-roles",
    label: "Harder-to-fill roles",
    prompts: [
      "We need help with harder-to-fill roles",
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    prompts: [
      "We have questions about pricing",
    ],
  },
  {
    id: "just-getting-started",
    label: "Just getting started",
    prompts: [
      "I'm just getting started",
    ],
  },
];
