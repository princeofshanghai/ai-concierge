"use client";

import { usePathname } from "next/navigation";
import {
  PrototypeShellLinkChip,
} from "@/components/prototype-shell";

type InternalPrototypeNavProps = {
  hidden?: boolean;
};

const INTERNAL_PROTOTYPE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/internal/ai-concierge-components", label: "Components" },
  { href: "/internal/presentation", label: "Presentation" },
];

export function InternalPrototypeNav({
  hidden = false,
}: InternalPrototypeNavProps) {
  const pathname = usePathname();

  if (hidden) {
    return null;
  }

  return (
    <header className="z-[70] w-full border-b border-white/12 bg-[linear-gradient(180deg,rgba(20,28,41,0.98)_0%,rgba(8,13,23,0.94)_100%)] text-white shadow-[0_16px_40px_rgba(2,6,23,0.2)] backdrop-blur-md">
      <div className="relative flex w-full flex-col gap-3 px-3 py-4 sm:min-h-[82px] sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-5 lg:px-5">
        <p className="font-panel-text text-[12px] leading-none font-semibold text-white/70 sm:absolute sm:left-4 sm:top-1/2 sm:-translate-y-1/2 sm:text-[13px] lg:left-5">
          Internal only
        </p>
        <nav
          aria-label="Internal navigation"
          className="flex flex-wrap items-center justify-center gap-1.5 self-center"
        >
          {INTERNAL_PROTOTYPE_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <PrototypeShellLinkChip
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                selected={isActive}
              >
                {link.label}
              </PrototypeShellLinkChip>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
