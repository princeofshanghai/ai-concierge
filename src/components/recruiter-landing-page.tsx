"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import recruiterHero from "../../public/figma/recruiter-hero.png";
import { AiConciergePanel } from "@/components/ai-concierge-panel";
import { ContactSalesButton } from "@/components/contact-sales-button";

const navItems = ["Products", "Compare Products", "Resources & Support"];

type RecruiterLandingPageVariant = "ai-concierge" | "baseline";

type RecruiterLandingPageProps = {
  variant?: RecruiterLandingPageVariant;
};

const variantContent: Record<
  RecruiterLandingPageVariant,
  {
    heroHelper?: string;
    heroLabel: string;
    heroUsesIcon: boolean;
    navLabel: string;
    navUsesIcon: boolean;
  }
> = {
  baseline: {
    navLabel: "Contact sales",
    navUsesIcon: false,
    heroLabel: "Contact sales",
    heroUsesIcon: false,
  },
  "ai-concierge": {
    navLabel: "Contact sales",
    navUsesIcon: true,
    heroLabel: "Ask AI Concierge",
    heroUsesIcon: true,
    heroHelper:
      "Get tailored guidance, then connect with a specialist when it helps.",
  },
};

function ChatBubbleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M8 2.25C4.825 2.25 2.25 4.482 2.25 7.234C2.25 8.668 2.948 9.962 4.067 10.872L3.519 13.25L6.037 11.889C6.658 12.089 7.316 12.219 8 12.219C11.175 12.219 13.75 9.987 13.75 7.234C13.75 4.482 11.175 2.25 8 2.25Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="5.625" cy="7.234" r="0.75" fill="currentColor" />
      <circle cx="8" cy="7.234" r="0.75" fill="currentColor" />
      <circle cx="10.375" cy="7.234" r="0.75" fill="currentColor" />
    </svg>
  );
}

function LandingPageVariantSwitcher({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname();

  if (hidden) {
    return null;
  }

  const links = [
    { href: "/", label: "V1" },
    { href: "/internal/ai-concierge-cta", label: "V2" },
  ];

  return (
    <div className="fixed left-3 top-3 z-[70] sm:left-5 sm:top-5">
      <div className="rounded-2xl border border-black/15 bg-white/95 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur">
        <p className="font-panel-text px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
          CTA
        </p>
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "font-panel-text rounded-full px-3 py-2 text-[13px] font-semibold transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "bg-black/[0.05] text-black/70 hover:bg-black/[0.08]",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RecruiterLandingPage({
  variant = "baseline",
}: RecruiterLandingPageProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const ctaContent = variantContent[variant];
  const sharedIcon = <ChatBubbleIcon />;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isChatOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isChatOpen]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatExpanded(false);
    setIsChatOpen(false);
  };

  return (
    <>
      <LandingPageVariantSwitcher hidden={isChatExpanded} />
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
                  label={ctaContent.navLabel}
                  leadingIcon={ctaContent.navUsesIcon ? sharedIcon : undefined}
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
                label={ctaContent.heroLabel}
                leadingIcon={ctaContent.heroUsesIcon ? sharedIcon : undefined}
                onClick={openChat}
                ariaControls="ai-concierge-panel"
                ariaExpanded={isChatOpen}
              />
              {ctaContent.heroHelper ? (
                <p className="font-panel-text mx-auto mt-3 max-w-[360px] text-[15px] leading-[1.5] text-black/65 lg:mx-0 lg:max-w-[420px]">
                  {ctaContent.heroHelper}
                </p>
              ) : null}
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

        {isChatOpen ? (
          <AiConciergePanel
            onClose={closeChat}
            onExpandedChange={setIsChatExpanded}
          />
        ) : null}
      </div>
    </>
  );
}
