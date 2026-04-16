"use client";

import { BackArrowIcon } from "@/components/back-arrow-icon";
import { Button } from "@/components/button";
import { Tag } from "@/components/tag";
import type { PremiumPlanId } from "@/lib/ai-concierge-types";
import { getPremiumPlanDetail } from "@/lib/premium-plan-details";

type AiConciergePremiumPlanPanelProps = {
  onBackToChat: () => void;
  onRedeem: (planId: PremiumPlanId) => void;
  planId: PremiumPlanId;
};

export function AiConciergePremiumPlanPanel({
  onBackToChat,
  onRedeem,
  planId,
}: AiConciergePremiumPlanPanelProps) {
  const planDetail = getPremiumPlanDetail(planId);
  const handleLearnMore = () => {
    if (!planDetail || typeof window === "undefined") {
      return;
    }

    window.open(planDetail.learnMoreHref, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ai-surface-panel-subtle sm:animate-[ai-concierge-next-step-in_320ms_cubic-bezier(0.22,1,0.36,1)]">
      <div className="px-6 pt-6 sm:px-8 sm:pt-8">
        <button
          type="button"
          onClick={onBackToChat}
          className="ai-type-heading-sm inline-flex items-center gap-2 text-ai-text-meta transition-colors hover:text-ai-text-secondary"
        >
          <BackArrowIcon className="h-4 w-4" />
          Back to chat
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
        <div className="mx-auto flex w-full max-w-[592px] flex-col gap-8">
          {planDetail ? (
            <div className="relative overflow-hidden rounded-[12px] border border-ai-divider bg-ai-surface-base p-6 sm:p-7">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-2 bg-ai-premium-gold-light"
              />
              <div className="flex flex-col gap-6">
                <Tag tone="supportive1" className="w-fit">
                  Recommended plan
                </Tag>
                <div className="flex flex-col gap-2">
                  <h3 className="ai-type-heading-lg text-ai-text-primary">
                    {planDetail.title}
                  </h3>
                  <p className="ai-type-body-md-open text-ai-text-primary">
                    {planDetail.positioningLine}
                  </p>
                </div>

                <section className="border-t border-ai-divider pt-6">
                  <div className="flex flex-col gap-4">
                    <h4 className="ai-type-heading-sm text-ai-text-primary">
                      Why this fits you
                    </h4>
                    <p className="ai-type-body-sm-open text-ai-text-primary">
                      {planDetail.whyThisFitsYou}
                    </p>
                  </div>
                </section>

                <section className="border-t border-ai-divider pt-6">
                  <div className="flex flex-col gap-4">
                    <h4 className="ai-type-heading-sm text-ai-text-primary">
                      What you get
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {planDetail.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0 text-ai-premium-gold">
                            <BenefitCheckIcon />
                          </span>
                          <span className="ai-type-body-sm-open text-ai-text-primary">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {planDetail.proofBannerText ? (
                      <div className="-mx-6 bg-ai-premium-gold-light px-6 py-6 sm:-mx-7 sm:px-7 sm:py-6">
                        <p className="ai-type-body-sm-bold text-ai-text-primary">
                          {planDetail.proofBannerText}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="pt-2">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="ai-type-body-sm text-ai-text-primary line-through decoration-[1.2px]">
                        {planDetail.priceAfterTrialText}
                      </p>
                      <p className="ai-type-body-sm-bold text-ai-text-primary">
                        {planDetail.trialText}
                      </p>
                    </div>
                    <div className="grid grid-cols-[156px_minmax(0,1fr)] gap-3">
                      <Button
                        className="[&>span:first-of-type]:whitespace-nowrap"
                        fullWidth
                        onClick={handleLearnMore}
                        trailingVisual={<ExternalLinkIcon />}
                        variant="secondary"
                      >
                        Learn more
                      </Button>
                      <Button
                        className="[&>span:first-of-type]:whitespace-nowrap"
                        fullWidth
                        onClick={() => onRedeem(planId)}
                        trailingVisual={<ExternalLinkIcon />}
                      >
                        {planDetail.trialCtaLabel}
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="rounded-[12px] border border-ai-divider bg-ai-surface-base p-6 sm:p-7">
              <h3 className="ai-type-heading-md text-ai-text-primary">
                Plan details unavailable
              </h3>
              <p className="ai-type-body-sm-open mt-3 text-ai-text-secondary">
                This prototype does not have content for that plan yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.7 11.9L2.4 8.6L1 10L6 15L15 2H12.6L5.7 11.9Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3V5H17.6L8 14.6L9.4 16L19 6.4V12H21V3H12Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M15 18C15 18.6 14.6 19 14 19H6C5.4 19 5 18.6 5 18V10C5 9.4 5.4 9 6 9H11V7H6C4.3 7 3 8.3 3 10V18C3 19.7 4.3 21 6 21H14C15.7 21 17 19.7 17 18V13H15V18Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
    </svg>
  );
}
