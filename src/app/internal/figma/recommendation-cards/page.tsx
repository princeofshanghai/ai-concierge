"use client";

import { AiConciergeRecommendationCard } from "@/components/ai-concierge-recommendation-card";
import type { AiConciergeRecommendationArtifact } from "@/lib/ai-concierge-types";

const DEFAULT_RECOMMENDATION_ARTIFACT: AiConciergeRecommendationArtifact = {
  bodyText: "First I'll match you with the right one",
  ctaLabel: "Find my rep",
  titleText: "Talk to a sales rep",
  type: "recommendation",
};

const LOWER_TOUCH_RECOMMENDATION_ARTIFACT: AiConciergeRecommendationArtifact = {
  ctaHref: "https://example.com",
  ctaLabel: "Browse plans",
  tagText: "Best for occasional hiring",
  titleText: "Explore what fits",
  type: "recommendation",
};

export default function RecommendationCardsCapturePage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_26%,#ffffff_100%)] px-6 py-10">
      <section
        id="capture-target"
        aria-label="AI Concierge recommendation card capture"
        className="w-full max-w-[760px] rounded-[24px] border border-ai-border-faint bg-ai-surface-base p-8 shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(140,140,140,0.2)]"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="max-w-[344px]">
            <AiConciergeRecommendationCard
              artifact={DEFAULT_RECOMMENDATION_ARTIFACT}
              onPrimaryAction={() => {}}
            />
          </div>
          <div className="max-w-[344px]">
            <AiConciergeRecommendationCard
              artifact={LOWER_TOUCH_RECOMMENDATION_ARTIFACT}
              onPrimaryAction={() => {}}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
