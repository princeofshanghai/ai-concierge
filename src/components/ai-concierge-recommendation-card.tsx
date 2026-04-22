import { Button } from "@/components/button";
import { Tag } from "@/components/tag";
import type { AiConciergeRecommendationArtifact } from "@/lib/ai-concierge-types";

type AiConciergeRecommendationCardProps = {
  artifact: AiConciergeRecommendationArtifact;
  isPanelExpanded?: boolean;
  isPrimaryActionPending?: boolean;
  isSecondaryActionPending?: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
};

export function AiConciergeRecommendationCard({
  artifact,
  isPanelExpanded = false,
  isPrimaryActionPending = false,
  isSecondaryActionPending = false,
  onPrimaryAction,
  onSecondaryAction,
}: AiConciergeRecommendationCardProps) {
  const widthClassName = isPanelExpanded ? "max-w-[344px]" : "max-w-full";
  const hasSecondaryCta = Boolean(artifact.secondaryCtaLabel);
  const isEitherActionPending =
    isPrimaryActionPending || isSecondaryActionPending;

  return (
    <div
      className={[
        "w-full rounded-[16px] border border-ai-blue-border-soft bg-ai-surface-base pl-5 pr-3 py-5",
        widthClassName,
      ].join(" ")}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {artifact.tagText ? (
            <Tag className="w-fit" tone="supportive5">
              {artifact.tagText}
            </Tag>
          ) : null}
          <h3 className="ai-type-heading-md text-ai-text-primary">
            {artifact.titleText}
          </h3>
          {artifact.bodyText ? (
            <p className="ai-type-body-sm text-ai-text-meta">
              {artifact.bodyText}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onPrimaryAction}
            size="compact"
            aria-disabled={isEitherActionPending}
            className={[
              "w-fit !rounded-[24px]",
              isEitherActionPending ? "pointer-events-none" : "",
            ].join(" ")}
          >
            {isPrimaryActionPending ? "Finding your rep..." : artifact.ctaLabel}
          </Button>
          {hasSecondaryCta && artifact.secondaryCtaLabel ? (
            <Button
              onClick={onSecondaryAction}
              size="compact"
              variant="secondary"
              aria-disabled={isEitherActionPending}
              className={[
                "w-fit !rounded-[24px]",
                isEitherActionPending ? "pointer-events-none" : "",
              ].join(" ")}
            >
              {isSecondaryActionPending
                ? "Finding your rep..."
                : artifact.secondaryCtaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type { AiConciergeRecommendationArtifact } from "@/lib/ai-concierge-types";
