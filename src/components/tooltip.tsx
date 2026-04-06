"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  children: ReactNode;
  content: string;
  placement?: "top" | "bottom";
};

export function Tooltip({
  children,
  content,
  placement = "top",
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const canUseDOM = typeof document !== "undefined";

  useLayoutEffect(() => {
    if (!isVisible) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) {
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportPadding = 8;
      const centeredLeft = triggerRect.left + triggerRect.width / 2;
      const clampedLeft = Math.min(
        Math.max(centeredLeft, viewportPadding + tooltipRect.width / 2),
        window.innerWidth - viewportPadding - tooltipRect.width / 2,
      );

      setPosition({
        left: clampedLeft,
        top:
          placement === "bottom"
            ? triggerRect.bottom + 8
            : triggerRect.top - 8,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isVisible, placement]);

  return (
    <span
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {canUseDOM
        ? createPortal(
            <span
              ref={tooltipRef}
              role="tooltip"
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
              }}
              className={[
                "pointer-events-none fixed z-[70] -translate-x-1/2 rounded-[8px] bg-ai-surface-base px-4 py-[14px] shadow-[0px_0px_1px_rgba(140,140,140,0.2),0px_4px_12px_rgba(0,0,0,0.3)] transition-opacity duration-150",
                placement === "bottom" ? "translate-y-0" : "-translate-y-full",
                isVisible ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <span className="ai-type-body-sm whitespace-nowrap text-ai-text-primary">
                {content}
              </span>
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
