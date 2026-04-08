import { Button } from "@/components/button";
import type { AiConciergeRecommendationArtifact } from "@/lib/ai-concierge-types";

type AiConciergeRecommendationCardProps = {
  artifact: AiConciergeRecommendationArtifact;
  isPanelExpanded?: boolean;
  isPrimaryActionPending?: boolean;
  onPrimaryAction: () => void;
};

export function AiConciergeRecommendationCard({
  artifact,
  isPanelExpanded = false,
  isPrimaryActionPending = false,
  onPrimaryAction,
}: AiConciergeRecommendationCardProps) {
  const widthClassName = isPanelExpanded ? "max-w-[344px]" : "max-w-full";

  return (
    <div
      className={[
        "w-full rounded-[16px] border border-ai-blue-border-soft bg-ai-surface-base pl-5 pr-3 py-5",
        widthClassName,
      ].join(" ")}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="ai-type-heading-md text-ai-text-primary">
            {artifact.titleText}
          </h3>
          <p className="ai-type-body-sm text-ai-text-meta">
            {artifact.bodyText}
          </p>
        </div>
        <Button
          onClick={onPrimaryAction}
          size="compact"
          aria-disabled={isPrimaryActionPending}
          className={[
            "w-fit !rounded-[24px]",
            isPrimaryActionPending ? "pointer-events-none" : "",
          ].join(" ")}
        >
          {isPrimaryActionPending ? "Finding your rep..." : artifact.ctaLabel}
        </Button>
      </div>
    </div>
  );
}

export type { AiConciergeRecommendationArtifact } from "@/lib/ai-concierge-types";
