"use client";

import { useState } from "react";
import Image from "next/image";
import recruiterHero from "../../public/figma/recruiter-hero.png";
import { AiConciergePanel } from "@/components/ai-concierge-panel";
import { ContactSalesButton } from "@/components/contact-sales-button";
import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import {
  DEFAULT_PROTOTYPE_SCENARIO,
  type PrototypeScenario,
} from "@/lib/prototype-scenario";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const navItems = ["Products", "Compare Products", "Resources & Support"];

export function RecruiterLandingPage() {
  const [isChatMounted, setIsChatMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [scenarioResetVersion, setScenarioResetVersion] = useState(0);
  const [prototypeScenario, setPrototypeScenario] = useState<PrototypeScenario>(
    DEFAULT_PROTOTYPE_SCENARIO,
  );
  useBodyScrollLock(isChatMounted);

  const openChat = () => {
    setIsChatMounted(true);
    setIsChatOpen(true);
  };
  const closeChat = () => {
    setIsChatExpanded(false);
    setIsChatOpen(false);
  };
  const handlePrototypeScenarioChange = (nextScenario: PrototypeScenario) => {
    setPrototypeScenario(nextScenario);
    setScenarioResetVersion((currentValue) => currentValue + 1);
  };
  const handlePrototypeScenarioSync = (nextScenario: PrototypeScenario) => {
    setPrototypeScenario(nextScenario);
  };
  const handlePrototypeScenarioRestart = () => {
    setScenarioResetVersion((currentValue) => currentValue + 1);
  };

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
            // Preserve in-flow panel state (for example, LinkedIn prefill) unless
            // an explicit scenario reset was requested from the prototype controls.
            key={scenarioResetVersion}
            isOpen={isChatOpen}
            onClose={closeChat}
            onClosed={() => setIsChatMounted(false)}
            onExpandedChange={setIsChatExpanded}
            onPrototypeScenarioChange={handlePrototypeScenarioSync}
            prototypeScenario={prototypeScenario}
          />
        ) : null}
      </div>
    </>
  );
}
