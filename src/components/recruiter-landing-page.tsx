"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import recruiterHero from "../../public/figma/recruiter-hero.png";
import { AiConciergePanel } from "@/components/ai-concierge-panel";
import { ContactSalesButton } from "@/components/contact-sales-button";
import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import { clearStoredAiConciergeEntrySession } from "@/lib/ai-concierge-entry-session";
import {
  getDemoLinkedInAccountById,
  type DemoLinkedInAccountId,
} from "@/lib/ai-concierge-fixtures";
import {
  beginPrototypeLinkedInAuth,
  consumeCompletedPrototypeLinkedInAuth,
  PROTOTYPE_LINKEDIN_SIGN_IN_PATH,
  type PrototypeLinkedInAuthReason,
} from "@/lib/prototype-linkedin-auth";
import {
  DEFAULT_PROTOTYPE_SCENARIO,
  normalizePrototypeScenario,
  type PrototypeScenario,
} from "@/lib/prototype-scenario";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const navItems = ["Products", "Compare Products", "Resources & Support"];

type RecruiterLandingPageProps = {
  initialPrototypeLinkedInAuthReturn?: string | null;
};

export function RecruiterLandingPage({
  initialPrototypeLinkedInAuthReturn = null,
}: RecruiterLandingPageProps) {
  const router = useRouter();
  const [completedPrototypeLinkedInAuth] = useState(() =>
    typeof window !== "undefined" &&
    initialPrototypeLinkedInAuthReturn === "success"
      ? consumeCompletedPrototypeLinkedInAuth()
      : null,
  );
  const [isChatMounted, setIsChatMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [scenarioResetVersion, setScenarioResetVersion] = useState(0);
  const [prototypeScenario, setPrototypeScenario] = useState<PrototypeScenario>(
    completedPrototypeLinkedInAuth
      ? normalizePrototypeScenario({
          ...completedPrototypeLinkedInAuth.prototypeScenario,
          authState: "linkedin-connected",
        })
      : DEFAULT_PROTOTYPE_SCENARIO,
  );
  const [activeAccountId] = useState<DemoLinkedInAccountId>(
    completedPrototypeLinkedInAuth?.accountId ?? "jamie-chen",
  );
  const [authReturnNonce, setAuthReturnNonce] = useState<number | undefined>(
    () => (completedPrototypeLinkedInAuth ? 1 : undefined),
  );
  const shouldAutoOpenAfterPrototypeAuth = completedPrototypeLinkedInAuth !== null;
  useBodyScrollLock(isChatMounted);
  const activeAccount = useMemo(
    () => getDemoLinkedInAccountById(activeAccountId),
    [activeAccountId],
  );

  const openChat = () => {
    if (!isChatOpen) {
      setScenarioResetVersion((currentValue) => currentValue + 1);
    }
    setIsChatMounted(true);
    setIsChatOpen(true);
  };
  const closeChat = () => {
    clearStoredAiConciergeEntrySession();
    setIsChatExpanded(false);
    setIsChatOpen(false);
  };
  const handlePrototypeScenarioChange = (nextScenario: PrototypeScenario) => {
    clearStoredAiConciergeEntrySession();
    setPrototypeScenario(normalizePrototypeScenario(nextScenario));
    setScenarioResetVersion((currentValue) => currentValue + 1);
  };
  const handlePrototypeScenarioSync = (nextScenario: PrototypeScenario) => {
    setPrototypeScenario(normalizePrototypeScenario(nextScenario));
  };
  const handlePrototypeScenarioRestart = () => {
    clearStoredAiConciergeEntrySession();
    setScenarioResetVersion((currentValue) => currentValue + 1);
  };
  const handlePrototypeLinkedInAuthRequest = (
    reason: PrototypeLinkedInAuthReason,
  ) => {
    beginPrototypeLinkedInAuth({
      currentAccountId: activeAccountId,
      prototypeScenario,
      reason,
      returnPath: "/",
    });
    router.push(PROTOTYPE_LINKEDIN_SIGN_IN_PATH);
  };

  useEffect(() => {
    if (!shouldAutoOpenAfterPrototypeAuth) {
      return;
    }

    const authReturnTimer = window.setTimeout(() => {
      setIsChatMounted(true);
      setIsChatOpen(true);
      router.replace("/");
    }, 0);

    return () => {
      window.clearTimeout(authReturnTimer);
    };
  }, [router, shouldAutoOpenAfterPrototypeAuth]);

  useEffect(() => {
    if (
      initialPrototypeLinkedInAuthReturn !== "success" ||
      completedPrototypeLinkedInAuth?.accountId
    ) {
      return;
    }

    router.replace("/");
  }, [
    completedPrototypeLinkedInAuth?.accountId,
    initialPrototypeLinkedInAuthReturn,
    router,
  ]);

  return (
    <>
      <InternalPrototypeNav
        hidden={isChatExpanded}
        onPrototypeScenarioChange={handlePrototypeScenarioChange}
        onRestartPrototypeScenario={handlePrototypeScenarioRestart}
        prototypeScenario={prototypeScenario}
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border-subtle">
          <div className="mx-auto flex h-16 w-full max-w-[1030px] items-center justify-between gap-6 px-6 sm:px-10 lg:px-0">
            <Image
              src="/figma/linkedin-hire-lockup.svg"
              alt="LinkedIn Hire"
              width={150}
              height={24}
              priority
              className="h-[24px] w-auto shrink-0"
            />
            <div className="flex items-center gap-4 lg:gap-6">
              <nav className="font-panel-text hidden items-center gap-6 text-base font-semibold text-linkedin-blue lg:flex">
                {navItems.map((item) => (
                  <span key={item} className="whitespace-nowrap">
                    {item}
                  </span>
                ))}
              </nav>
              <div className="flex min-h-12 items-center">
                <ContactSalesButton
                  className="text-[16px]"
                  label="Contact sales"
                  size="sm"
                  variant="outline"
                  onClick={openChat}
                  ariaControls="ai-concierge-panel"
                  ariaExpanded={isChatOpen}
                />
              </div>
            </div>
          </div>
        </header>

        <main>
          <section className="mx-auto grid w-full max-w-[1030px] gap-10 px-6 pb-0 pt-12 sm:px-10 md:pt-14 lg:grid-cols-[447px_minmax(0,496px)] lg:items-center lg:gap-[87px] lg:px-0 lg:pt-[54px]">
            <div className="mx-auto w-full max-w-[447px] overflow-hidden rounded-[14px]">
              <Image
                src={recruiterHero}
                alt="A candidate portrait from the LinkedIn Hire campaign"
                priority
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="max-w-[496px] text-center lg:text-left">
              <p className="mb-3 text-base font-bold tracking-[-0.01em] text-foreground uppercase">
                Hire with LinkedIn
              </p>
              <h1 className="font-community-pro text-[48px] leading-[60px] font-medium tracking-[-0.48px] text-black sm:text-[64px] sm:leading-[80px] sm:tracking-[-0.64px]">
                Hire the people you need
              </h1>
              <ContactSalesButton
                className="mt-8"
                label="Contact sales"
                onClick={openChat}
                ariaControls="ai-concierge-panel"
                ariaExpanded={isChatOpen}
              />
            </div>
          </section>

          <section
            id="products"
            className="px-6 pb-20 pt-20 text-center sm:px-10 md:pb-28 md:pt-24 lg:pt-[126px]"
          >
            <h2 className="text-[2.375rem] leading-tight tracking-[-0.03em] text-black md:text-[2.625rem] md:tracking-[-0.04em]">
              Discover our top hiring products
            </h2>
          </section>
        </main>

        {isChatMounted ? (
          <AiConciergePanel
            authReturnNonce={authReturnNonce}
            // Remount the panel for each open so close/reopen returns to the
            // welcome step, while still letting prototype controls force a reset.
            key={scenarioResetVersion}
            disablePhoneCall
            isOpen={isChatOpen}
            onClose={closeChat}
            onAuthReturnHandled={() => setAuthReturnNonce(undefined)}
            onClosed={() => setIsChatMounted(false)}
            onExpandedChange={setIsChatExpanded}
            onPrototypeLinkedInAuthRequest={handlePrototypeLinkedInAuthRequest}
            onPrototypeScenarioChange={handlePrototypeScenarioSync}
            prototypeScenario={prototypeScenario}
            signedInContactDetails={activeAccount.contactDetails}
            signedInLinkedInIdentity={activeAccount.linkedInIdentity}
          />
        ) : null}
      </div>
    </>
  );
}
