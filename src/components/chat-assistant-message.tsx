import { Fragment, useEffect, useState, type ReactNode } from "react";

// Matches markdown-style inline links: `[label](url)`. We intentionally keep
// this minimal (no full markdown parser) — the only formatting an assistant
// bubble can currently render is a clickable link. Used by Route 5 to embed
// the "LinkedIn hiring products →" redirect inline in the terminal bubble
// without needing a dedicated artifact component.
const INLINE_LINK_PATTERN = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

function renderBodyWithLinks(body: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = 0;

  for (const match of body.matchAll(INLINE_LINK_PATTERN)) {
    const [fullMatch, label, href] = match;
    const start = match.index ?? 0;

    if (start > cursor) {
      nodes.push(
        <Fragment key={`text-${matchIndex}`}>
          {body.slice(cursor, start)}
        </Fragment>,
      );
    }

    nodes.push(
      <a
        key={`link-${matchIndex}`}
        className="font-medium text-ai-text-primary underline underline-offset-[3px] decoration-ai-text-tertiary transition-[text-decoration-color] hover:decoration-ai-text-primary focus-visible:decoration-ai-text-primary"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
      </a>,
    );

    cursor = start + fullMatch.length;
    matchIndex += 1;
  }

  if (cursor < body.length) {
    nodes.push(
      <Fragment key={`text-${matchIndex}`}>{body.slice(cursor)}</Fragment>,
    );
  }

  // When there are no matches, return the original string so React renders it
  // exactly as it did before the parser existed (avoids changing the DOM shape
  // for every other bubble).
  return nodes.length === 0 ? body : nodes;
}

type ChatAssistantMessageProps = {
  body: string;
  className?: string;
  isActiveVoiceTurn?: boolean;
  isPanelExpanded?: boolean;
  status?: "complete" | "streaming" | "thinking";
  streamedChunks?: string[];
};

function StreamedMessageChunk({ chunk }: { chunk: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <span
      className={[
        "inline transition-[opacity,color] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        isVisible
          ? "opacity-100 text-ai-text-primary"
          : "opacity-0 text-ai-text-meta motion-reduce:opacity-100 motion-reduce:text-ai-text-primary",
      ].join(" ")}
    >
      {chunk}
    </span>
  );
}

function ThinkingIndicator() {
  return (
    <div
      aria-label="Assistant is thinking"
      aria-atomic="true"
      className="py-1"
      role="status"
    >
      <span className="ai-type-body-xs relative inline-block whitespace-nowrap text-ai-text-secondary">
        <span>Thinking</span>
        <span
          aria-hidden="true"
          className="ai-concierge-thinking-sweep pointer-events-none absolute inset-0 text-ai-background-strong motion-reduce:hidden"
        >
          Thinking
        </span>
      </span>
    </div>
  );
}

export function ChatAssistantMessage({
  body,
  className = "",
  isActiveVoiceTurn = false,
  isPanelExpanded = false,
  status = "complete",
  streamedChunks,
}: ChatAssistantMessageProps) {
  const widthClassName = isPanelExpanded
    ? "max-w-[33rem]"
    : "max-w-[21.5rem]";

  if (status === "thinking") {
    return (
      <div className={["w-full", className].join(" ")}>
        <div className={widthClassName}>
          <ThinkingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div
      className={["w-full", className].join(" ")}
      data-voice-speaking={isActiveVoiceTurn || undefined}
    >
      <div className={widthClassName}>
        <p className="ai-type-body-sm-open whitespace-pre-wrap break-words text-ai-text-primary">
          {streamedChunks?.length
            ? streamedChunks.map((chunk, index) => (
                <StreamedMessageChunk key={`${index}-${chunk}`} chunk={chunk} />
              ))
            : renderBodyWithLinks(body)}
        </p>
      </div>
    </div>
  );
}
