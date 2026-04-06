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

    const duration = 1200;
    const animationEnd = Date.now() + duration;
    const sharedOptions = {
      colors: CONFETTI_COLORS,
      gravity: 0.9,
      scalar: 1,
      startVelocity: 34,
      ticks: 220,
    } as const;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        window.clearInterval(interval);
        return;
      }

      const particleCount = Math.max(
        14,
        Math.round(34 * (timeLeft / duration)),
      );

      fire({
        ...sharedOptions,
        angle: 60,
        origin: { x: 0.04, y: 0.24 },
        particleCount,
        spread: 78,
      });
      fire({
        ...sharedOptions,
        angle: 120,
        origin: { x: 0.96, y: 0.24 },
        particleCount,
        spread: 78,
      });
      fire({
        ...sharedOptions,
        origin: { x: 0.5, y: 0.12 },
        particleCount: Math.max(12, Math.round(particleCount * 0.7)),
        spread: 100,
        startVelocity: 28,
      });
    }, 180);

    return () => {
      window.clearInterval(interval);
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
