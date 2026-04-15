import Link from "next/link";
import { notFound } from "next/navigation";
import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import { getPremiumPlanDetail } from "@/lib/premium-plan-details";

export default async function PremiumSurveyCheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const planDetail = getPremiumPlanDetail(planId);

  if (!planDetail) {
    notFound();
  }

  return (
    <>
      <InternalPrototypeNav pageLinks={[]} />
      <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_30%,#ffffff_100%)] px-6 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          <Link
            href="/prototype/premium-survey"
            className="ai-type-heading-sm inline-flex w-fit items-center gap-2 text-ai-text-meta transition-colors hover:text-ai-text-secondary"
          >
            <BackArrowIcon />
            Back to Premium survey
          </Link>

          <section className="rounded-[32px] border border-ai-divider bg-ai-surface-base p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:p-9">
            <p className="ai-type-body-xs text-ai-blue-primary">
              Prototype checkout
            </p>
            <h1 className="ai-type-heading-xl mt-3 text-ai-text-primary">
              {planDetail.title}
            </h1>
            <p className="ai-type-body-lg-open mt-3 text-ai-text-primary">
              {planDetail.positioningLine}
            </p>

            <div className="mt-8 rounded-[24px] border border-ai-divider bg-ai-surface-panel-subtle p-5">
              <div className="flex flex-col gap-2">
                <p className="ai-type-heading-md text-ai-text-primary">
                  {planDetail.trialText}
                </p>
                <p className="ai-type-body-sm-open text-ai-text-meta">
                  {planDetail.priceAfterTrialText}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <h2 className="ai-type-heading-md text-ai-text-primary">
                Placeholder page
              </h2>
              <p className="ai-type-body-md-open text-ai-text-secondary">
                This is a generic prototype checkout destination for the Premium
                survey flow. It is only here to validate the handoff from the AI
                concierge side panel into a purchase step.
              </p>
            </div>

            <div className="mt-8 rounded-[24px] border border-ai-divider bg-ai-surface-panel-subtle p-5">
              <h2 className="ai-type-heading-md text-ai-text-primary">
                Included in this prototype
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {planDetail.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-ai-premium-gold">
                      <BenefitCheckIcon />
                    </span>
                    <span className="ai-type-body-md-open text-ai-text-primary">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.85333 3.14667L2 8L6.85333 12.8533L7.8 11.9L4.57333 8.66667H14V7.33333H4.57333L7.8 4.1L6.85333 3.14667Z"
        fill="currentColor"
      />
    </svg>
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
