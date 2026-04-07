"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type AiConciergeConfettiOverlayProps = {
  trigger: number;
};

const CONFETTI_COLORS = [
  "#a786ff",
  "#fd8bbc",
  "#eca184",
  "#f8deb1",
  "#378FE9",
  "#54d2a0",
];

const BOOKING_CONFETTI_OPTIONS = {
  angle: 90,
  colors: CONFETTI_COLORS,
  decay: 0.94,
  disableForReducedMotion: true,
  gravity: 0.62,
  origin: { x: 0.5, y: 0.18 },
  particleCount: 200,
  scalar: 1.05,
  spread: 128,
  startVelocity: 24,
  ticks: 320,
} as const;

export function AiConciergeConfettiOverlay({
  trigger,
}: AiConciergeConfettiOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });
    fire(BOOKING_CONFETTI_OPTIONS);

    return () => {
      fire.reset();
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
}
