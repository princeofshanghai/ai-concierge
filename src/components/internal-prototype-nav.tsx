"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon } from "@/components/close-icon";
import {
  PrototypeShellActionButton,
  PrototypeShellChip,
  PrototypeShellHelperText,
  PrototypeShellLabel,
  PrototypeShellLinkChip,
} from "@/components/prototype-shell";
import {
  getPrototypePlaybackRouteHelperText,
  getPrototypePlaybackRouteLabel,
  getPrototypeScenarioAuthGroupLabel,
  getPrototypeScenarioAuthHelperText,
  getPrototypeScenarioAuthLabel,
  getPrototypeScenarioOpeningPromptLabel,
  type PrototypePlaybackRoute,
  type PrototypeScenario,
} from "@/lib/prototype-scenario";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

type InternalPrototypeNavProps = {
  drawerSections?: ReactNode;
  hidden?: boolean;
  onPrototypeScenarioChange?: (scenario: PrototypeScenario) => void;
  onRestartPrototypeScenario?: () => void;
  pageLinks?: Array<{
    href: string;
    label: string;
  }>;
  prototypeScenario?: PrototypeScenario;
};

const INTERNAL_PROTOTYPE_LINKS = [
  { href: "/", label: "Prototype" },
  { href: "/internal/ai-concierge-components", label: "Components" },
  { href: "/internal/presentation", label: "Presentation" },
];

const AUTH_OPTIONS: PrototypeScenario["authState"][] = [
  "signed-out",
  "linkedin-connected",
];

const OPENING_PROMPT_OPTIONS: PrototypeScenario["openingPromptVariant"][] = [
  "inline-prompts",
  "helper-examples",
  "topic-picker",
];

// The playback picker is a three-tier tree. Parent chips may be leaves
// (Live, High value) or expand into child chips (Medium, Low). The child
// values are the actual routes we render; picking a parent that has children
// auto-selects the first child so the demo never lands in a half-selected
// state.
type PlaybackPickerNode = {
  id: "live" | "high" | "medium" | "low";
  label: string;
  route?: PrototypePlaybackRoute;
  children?: Array<{
    route: PrototypePlaybackRoute;
    label: string;
  }>;
};

const PLAYBACK_PICKER_NODES: PlaybackPickerNode[] = [
  { id: "live", label: "Live", route: "live" },
  { id: "high", label: "High value", route: "high-ae-booking" },
  {
    id: "medium",
    label: "Medium value",
    children: [
      { route: "medium-sdr-live", label: "Live chat with SDR" },
      { route: "medium-sdr-booking", label: "Book meeting with SDR" },
    ],
  },
  {
    id: "low",
    label: "Low value",
    children: [
      { route: "low-product-card", label: "Product card" },
      { route: "low-redirect-link", label: "Redirect link" },
    ],
  },
];

function getPlaybackParentForRoute(route: PrototypePlaybackRoute) {
  for (const node of PLAYBACK_PICKER_NODES) {
    if (node.route === route) {
      return node.id;
    }
    if (node.children?.some((child) => child.route === route)) {
      return node.id;
    }
  }
  return "live";
}

export function InternalPrototypeNav({
  drawerSections,
  hidden = false,
  onPrototypeScenarioChange,
  onRestartPrototypeScenario,
  pageLinks = INTERNAL_PROTOTYPE_LINKS,
  prototypeScenario,
}: InternalPrototypeNavProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const shouldShowScenarioControls =
    prototypeScenario !== undefined &&
    onPrototypeScenarioChange !== undefined &&
    onRestartPrototypeScenario !== undefined;
  useBodyScrollLock(isDrawerOpen);

  useEffect(() => {
    if (isDrawerOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
        launcherRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  if (hidden) {
    return null;
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    launcherRef.current?.focus();
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  function updatePrototypeScenario<Key extends keyof PrototypeScenario>(
    key: Key,
    value: PrototypeScenario[Key],
  ) {
    if (
      !shouldShowScenarioControls ||
      prototypeScenario === undefined ||
      prototypeScenario[key] === value ||
      onPrototypeScenarioChange === undefined
    ) {
      return;
    }

    onPrototypeScenarioChange({
      ...prototypeScenario,
      [key]: value,
    });
  }

  const authGroupLabel = shouldShowScenarioControls
    ? getPrototypeScenarioAuthGroupLabel()
    : "Identity";
  const authHelperText = shouldShowScenarioControls
    ? getPrototypeScenarioAuthHelperText()
    : null;
  const shouldShowPageLinks = pageLinks.length > 0;

  return (
    <>
      <div
        className={[
          "fixed z-[80] transition-[opacity,transform] duration-200 ease-out",
          isDrawerOpen
            ? "pointer-events-none -translate-y-1 opacity-0"
            : "opacity-100",
        ].join(" ")}
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
          left: "calc(env(safe-area-inset-left, 0px) + 12px)",
        }}
      >
        <button
          ref={launcherRef}
          type="button"
          aria-controls="internal-prototype-drawer"
          aria-expanded={isDrawerOpen}
          aria-label="Open prototype menu"
          onClick={openDrawer}
          className="font-panel-text inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(20,28,41,0.98)_0%,rgba(8,13,23,0.94)_100%)] px-4 text-[13px] leading-none font-semibold text-white shadow-[0_16px_40px_rgba(2,6,23,0.28)] backdrop-blur-md transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(28,37,53,0.98)_0%,rgba(12,18,31,0.96)_100%)] hover:shadow-[0_20px_48px_rgba(2,6,23,0.34)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          <PrototypeMenuIcon />
          <span>Prototype menu</span>
        </button>
      </div>

      <div
        className={[
          "fixed inset-0 z-[79] transition-opacity duration-200 ease-out",
          isDrawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <button
          type="button"
          tabIndex={isDrawerOpen ? 0 : -1}
          aria-label="Close prototype menu"
          onClick={closeDrawer}
          className="absolute inset-0 bg-slate-950/28"
        />

        <div className="absolute inset-y-0 left-0 w-[min(360px,calc(100vw-12px))]">
          <aside
            id="internal-prototype-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="internal-prototype-drawer-title"
            className={[
              "flex h-full flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(20,28,41,0.98)_0%,rgba(8,13,23,0.96)_100%)] px-4 py-4 text-white backdrop-blur-md transition-transform duration-200 ease-out sm:px-5 sm:py-5",
              isDrawerOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4 pb-5">
              <div className="min-w-0">
                <PrototypeShellLabel className="px-0 pb-2 text-white/48">
                  Internal only
                </PrototypeShellLabel>
                <h2
                  id="internal-prototype-drawer-title"
                  className="font-panel-text text-[19px] leading-none font-semibold text-white"
                >
                  Prototype menu
                </h2>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close prototype menu"
                onClick={closeDrawer}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/82 transition-[background-color,border-color,color] duration-150 hover:border-white/18 hover:bg-white/[0.12] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              >
                <CloseIcon className="h-[14px] w-[14px]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-4">
              {shouldShowPageLinks ? (
                <section>
                  <h3 className="font-panel-text text-[15px] leading-none font-semibold text-white">
                    Pages
                  </h3>
                  <nav
                    aria-label="Internal navigation"
                    className="mt-3 flex flex-col gap-1.5"
                  >
                    {pageLinks.map((link) => {
                      const isActive = pathname === link.href;

                      return (
                        <PrototypeShellLinkChip
                          key={link.href}
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          selected={isActive}
                          onClick={closeDrawer}
                          className="min-h-9 w-full justify-start px-3.5 text-left text-[12px]"
                        >
                          {link.label}
                        </PrototypeShellLinkChip>
                      );
                    })}
                  </nav>
                </section>
              ) : null}

              {drawerSections}

              {shouldShowScenarioControls ? (
                <section className="mt-7 border-t border-white/8 pt-6">
                  <h3 className="font-panel-text text-[15px] leading-none font-semibold text-white">
                    Prototype state
                  </h3>

                  <div className="mt-4 space-y-5">
                    <PlaybackRoutePicker
                      activeRoute={prototypeScenario.playbackRoute}
                      onSelectRoute={(nextRoute) =>
                        updatePrototypeScenario("playbackRoute", nextRoute)
                      }
                    />

                    <div>
                      <PrototypeShellLabel className="px-0 pb-0 text-white/48">
                        {authGroupLabel}
                      </PrototypeShellLabel>
                      {authHelperText ? (
                        <PrototypeShellHelperText className="mt-2 max-w-[28ch] text-white/58">
                          {authHelperText}
                        </PrototypeShellHelperText>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {AUTH_OPTIONS.map((authState) => (
                          <PrototypeShellChip
                            key={authState}
                            selected={prototypeScenario.authState === authState}
                            onClick={() =>
                              updatePrototypeScenario("authState", authState)
                            }
                            className="min-h-9 px-3 text-[12px]"
                          >
                            {getPrototypeScenarioAuthLabel(authState)}
                          </PrototypeShellChip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <PrototypeShellLabel className="px-0 pb-0 text-white/48">
                        First message
                      </PrototypeShellLabel>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {OPENING_PROMPT_OPTIONS.map((openingPromptVariant) => (
                          <PrototypeShellChip
                            key={openingPromptVariant}
                            selected={
                              prototypeScenario.openingPromptVariant ===
                              openingPromptVariant
                            }
                            onClick={() =>
                              updatePrototypeScenario(
                                "openingPromptVariant",
                                openingPromptVariant,
                              )
                            }
                            className="min-h-9 px-3 text-[12px]"
                          >
                            {getPrototypeScenarioOpeningPromptLabel(
                              openingPromptVariant,
                            )}
                          </PrototypeShellChip>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            {shouldShowScenarioControls ? (
              <div className="border-t border-white/8 pt-4">
                <PrototypeShellActionButton
                  className="min-h-9 w-full justify-center rounded-full px-3 text-[12px]"
                  onClick={onRestartPrototypeScenario}
                >
                  Restart prototype
                </PrototypeShellActionButton>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}

type PlaybackRoutePickerProps = {
  activeRoute: PrototypePlaybackRoute;
  onSelectRoute: (route: PrototypePlaybackRoute) => void;
};

function PlaybackRoutePicker({
  activeRoute,
  onSelectRoute,
}: PlaybackRoutePickerProps) {
  const activeParent = getPlaybackParentForRoute(activeRoute);

  return (
    <div>
      <PrototypeShellLabel className="px-0 pb-0 text-white/48">
        Playback route
      </PrototypeShellLabel>
      <PrototypeShellHelperText className="mt-2 max-w-[28ch] text-white/58">
        {getPrototypePlaybackRouteHelperText()}
      </PrototypeShellHelperText>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PLAYBACK_PICKER_NODES.map((node) => {
          const isActiveParent = activeParent === node.id;

          if (node.route) {
            return (
              <PrototypeShellChip
                key={node.id}
                selected={activeRoute === node.route}
                onClick={() => onSelectRoute(node.route!)}
                className="min-h-9 px-3 text-[12px]"
              >
                {node.label}
              </PrototypeShellChip>
            );
          }

          return (
            <PrototypeShellChip
              key={node.id}
              selected={isActiveParent}
              onClick={() => {
                if (!isActiveParent && node.children?.[0]) {
                  onSelectRoute(node.children[0].route);
                }
              }}
              className="min-h-9 px-3 text-[12px]"
            >
              {node.label}
            </PrototypeShellChip>
          );
        })}
      </div>

      {PLAYBACK_PICKER_NODES.filter(
        (node) => node.children && node.id === activeParent,
      ).map((node) => (
        <div key={`${node.id}-children`} className="mt-2.5 pl-3">
          <PrototypeShellLabel className="px-0 pb-0 text-[10px] text-white/40">
            {node.label}
          </PrototypeShellLabel>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {node.children!.map((child) => (
              <PrototypeShellChip
                key={child.route}
                selected={activeRoute === child.route}
                onClick={() => onSelectRoute(child.route)}
                className="min-h-8 px-3 text-[11px]"
              >
                {child.label}
              </PrototypeShellChip>
            ))}
          </div>
        </div>
      ))}

      <p className="font-panel-text mt-2 text-[11px] leading-snug text-white/40">
        Currently showing:{" "}
        <span className="text-white/70">
          {getPrototypePlaybackRouteLabel(activeRoute)}
        </span>
      </p>
    </div>
  );
}

function PrototypeMenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M2.5 4H13.5M2.5 8H10.5M2.5 12H13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
