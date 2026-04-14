import { Tag } from "@/components/tag";
import type {
  AiConciergePremiumPlanRecommendation,
  AiConciergePremiumPlanRecommendationsArtifact,
  PremiumPlanId,
} from "@/lib/ai-concierge-types";

type AiConciergePremiumPlanRecommendationsProps = {
  artifact: AiConciergePremiumPlanRecommendationsArtifact;
  isPanelExpanded?: boolean;
  onPlanSelect: (planId: PremiumPlanId) => void;
};

export function AiConciergePremiumPlanRecommendations({
  artifact,
  isPanelExpanded = false,
  onPlanSelect,
}: AiConciergePremiumPlanRecommendationsProps) {
  const widthClassName = isPanelExpanded ? "max-w-[420px]" : "max-w-full";

  return (
    <div className={["w-full", widthClassName].join(" ")}>
      <div className="flex flex-col gap-3">
        <RecommendationCard
          recommendation={artifact.primaryRecommendation}
          variant="primary"
          onPlanSelect={onPlanSelect}
        />
        <div className="flex flex-col gap-2 pt-1">
          {artifact.secondaryRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              variant="secondary"
              onPlanSelect={onPlanSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  variant,
  onPlanSelect,
}: {
  recommendation: AiConciergePremiumPlanRecommendation;
  variant: "primary" | "secondary";
  onPlanSelect: (planId: PremiumPlanId) => void;
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      aria-label={`Open ${recommendation.titleText} plan details`}
      onClick={() => onPlanSelect(recommendation.id)}
      className={[
        "group w-full rounded-[18px] text-left transition-[border-color,background-color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
        isPrimary
          ? "border border-ai-blue-border-soft hover:border-ai-blue-primary"
          : "border border-ai-blue-border-soft bg-ai-surface-base hover:border-ai-blue-primary",
      ].join(" ")}
    >
      <div
        className={[
          "rounded-[17px]",
          isPrimary
            ? "ai-premium-recommendation-surface px-5 py-4"
            : "bg-ai-surface-base px-4 py-4",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Tag className="gap-0.5" tone="supportive1">
              {isPrimary ? <RecommendationStarIcon /> : null}
              <span>{recommendation.fitLabel}</span>
            </Tag>
            <div className="mt-3">
              <h3 className="ai-type-heading-md text-ai-text-primary">
                {recommendation.titleText}
              </h3>
              {isPrimary ? (
                <p className="ai-type-body-sm-open mt-1 text-ai-text-secondary">
                  {recommendation.bodyText}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-0.5 shrink-0 text-ai-text-secondary">
            <RecommendationChevronIcon />
          </div>
        </div>

        <div className={isPrimary ? "mt-5" : "mt-3"}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="ai-type-body-sm text-ai-text-primary line-through decoration-[1.2px]">
              {recommendation.priceText}
            </p>
            <p className="ai-type-body-sm-bold text-ai-text-primary">
              {recommendation.trialText}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function RecommendationStarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6.00003 0.375L7.72503 3.825L11.55 4.35L8.77503 7.05L9.45003 10.875L6.00003 9.075L2.62503 10.875L3.30003 7.05L0.525024 4.35L4.35003 3.825L6.00003 0.375Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function RecommendationChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11.4 3L15 8L11.4 13H9L11.8 9H2V7H11.8L9 3H11.4Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}
