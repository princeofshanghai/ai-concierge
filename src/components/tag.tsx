import type { ReactNode } from "react";

type TagSize = "small" | "medium";
type TagTone =
  | "default"
  | "positive"
  | "negative"
  | "neutral"
  | "caution"
  | "supportive1"
  | "supportive2"
  | "supportive3"
  | "supportive4"
  | "supportive5";

type TagProps = {
  children: ReactNode;
  className?: string;
  size?: TagSize;
  tone?: TagTone;
};

export function Tag({
  children,
  className = "",
  size = "small",
  tone = "default",
}: TagProps) {
  const sizeClassName =
    size === "medium"
      ? "px-2 py-[3px]"
      : "px-1 py-px";

  const toneClassName =
    tone === "positive"
      ? "bg-ai-tag-positive text-ai-text-inverse"
      : tone === "negative"
        ? "bg-ai-tag-negative text-ai-text-inverse"
        : tone === "neutral"
          ? "bg-ai-tag-neutral text-ai-text-inverse"
          : tone === "caution"
            ? "bg-ai-tag-caution text-ai-text-inverse"
            : tone === "supportive1"
              ? "bg-ai-tag-supportive-01 text-ai-text-secondary"
              : tone === "supportive2"
                ? "bg-ai-tag-supportive-02 text-ai-text-secondary"
                : tone === "supportive3"
                  ? "bg-ai-tag-supportive-03 text-ai-text-secondary"
                  : tone === "supportive4"
                    ? "bg-ai-tag-supportive-04 text-ai-text-secondary"
                    : tone === "supportive5"
                      ? "bg-ai-tag-supportive-05 text-ai-text-secondary"
                      : "bg-ai-surface-disabled text-ai-text-secondary";

  return (
    <span
      className={[
        "ai-type-body-sm inline-flex items-center overflow-clip rounded-[4px] text-center whitespace-nowrap",
        sizeClassName,
        toneClassName,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
