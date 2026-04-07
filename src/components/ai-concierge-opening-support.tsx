"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  AiConciergeOpeningPromptTopic,
  AiConciergeOpeningSupport,
} from "@/lib/ai-concierge-opening-presentation";

type AiConciergeOpeningSupportProps = {
  onInsertPrompt: (prompt: string) => void;
  support: AiConciergeOpeningSupport;
};

export function AiConciergeOpeningSupportView({
  onInsertPrompt,
  support,
}: AiConciergeOpeningSupportProps) {
  if (support.type === "helper-examples") {
    return (
      <div className="mt-1 flex flex-col gap-2">
        <p className="ai-type-body-xs text-ai-text-meta">{support.helperText}</p>
        <ul className="list-disc space-y-1.5 pl-5 text-ai-text-secondary marker:text-ai-text-tertiary">
          {support.examples.map((example) => (
            <li key={example} className="ai-type-body-sm-open">
              {example}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <OpeningTopicPicker
      helperText={support.helperText}
      onInsertPrompt={onInsertPrompt}
      topics={support.topics}
    />
  );
}

function OpeningTopicPicker({
  helperText,
  onInsertPrompt,
  topics,
}: {
  helperText: string;
  onInsertPrompt: (prompt: string) => void;
  topics: AiConciergeOpeningPromptTopic[];
}) {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const topicButtonRefs = useRef<
    Record<string, HTMLButtonElement | null>
  >({});
  const activeTopic =
    topics.find((topic) => topic.id === activeTopicId) ?? null;
  const canUseDOM = typeof document !== "undefined";

  useEffect(() => {
    if (!activeTopicId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setActiveTopicId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveTopicId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTopicId]);

  useLayoutEffect(() => {
    if (!activeTopicId) {
      return;
    }

    const updateDropdownPosition = () => {
      const activeButton = topicButtonRefs.current[activeTopicId];
      const menu = menuRef.current;

      if (!activeButton || !menu) {
        setDropdownPosition(null);
        return;
      }

      const buttonRect = activeButton.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewportPadding = 16;
      const left = Math.min(
        Math.max(buttonRect.left, viewportPadding),
        window.innerWidth - viewportPadding - menuRect.width,
      );
      const fitsBelow =
        buttonRect.bottom + 8 + menuRect.height <=
        window.innerHeight - viewportPadding;
      const top = fitsBelow
        ? buttonRect.bottom + 8
        : Math.max(
            viewportPadding,
            buttonRect.top - 8 - menuRect.height,
          );

      setDropdownPosition({ left, top });
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [activeTopicId]);

  return (
    <div ref={containerRef} className="relative mt-1 flex flex-col gap-3">
      {helperText ? (
        <p className="ai-type-body-xs text-ai-text-meta">{helperText}</p>
      ) : null}
      <div className="flex flex-wrap gap-x-1.5 gap-y-2">
        {topics.map((topic) => {
          const isActive = topic.id === activeTopicId;

          return (
            <button
              key={topic.id}
              ref={(node) => {
                topicButtonRefs.current[topic.id] = node;
              }}
              type="button"
              aria-expanded={isActive}
              aria-haspopup="menu"
              onClick={() =>
                setActiveTopicId((currentValue) =>
                  currentValue === topic.id ? null : topic.id,
                )
              }
              className={[
                "ai-type-label-xs inline-flex min-h-8 items-center rounded-full border px-2.5 py-1 text-left transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-blue-primary",
                isActive
                  ? "border-ai-blue-border-soft bg-ai-surface-tint text-ai-text-primary"
                  : "border-ai-border-subtle bg-ai-surface-base text-ai-text-secondary hover:border-ai-border-subtle-hover hover:bg-ai-surface-overlay-soft hover:text-ai-text-primary",
              ].join(" ")}
            >
              <span>{topic.label}</span>
            </button>
          );
        })}
      </div>
      {activeTopic && canUseDOM
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label={`${activeTopic.label} sample prompts`}
              className={[
                "fixed z-[90] w-[min(320px,calc(100vw-32px))] rounded-[8px] border border-ai-border-faint bg-ai-surface-base py-2 shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(0,0,0,0.3)]",
                dropdownPosition ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                left: `${dropdownPosition?.left ?? -9999}px`,
                top: `${dropdownPosition?.top ?? -9999}px`,
              }}
            >
              <div className="flex flex-col">
                {activeTopic.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onInsertPrompt(prompt);
                      setActiveTopicId(null);
                    }}
                    className="ai-type-body-sm-bold flex min-h-12 items-center px-4 py-2 text-left text-ai-text-secondary transition-[background-color,color] duration-150 hover:bg-ai-surface-overlay-soft hover:text-ai-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ai-blue-primary"
                  >
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
