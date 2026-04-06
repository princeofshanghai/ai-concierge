"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const AVATAR_FALLBACK_SOURCES = [
  "/figma/avatar/entity-initials-01.svg",
  "/figma/avatar/entity-initials-02.svg",
  "/figma/avatar/entity-initials-03.svg",
  "/figma/avatar/entity-initials-04.svg",
  "/figma/avatar/entity-initials-05.svg",
] as const;

type AvatarProps = {
  alt?: string;
  className?: string;
  decorative?: boolean;
  fallbackSrc?: string;
  name?: string;
  seed?: string;
  size?: number;
  src?: string | null;
};

type AvatarImageState = "primary" | "fallback" | "text";

function normalizeImageSrc(src?: string | null) {
  const trimmedSrc = src?.trim();
  return trimmedSrc && trimmedSrc.length > 0 ? trimmedSrc : null;
}

function getInitialAvatarState(
  primarySrc: string | null,
  fallbackSrc: string | null,
): AvatarImageState {
  if (primarySrc) {
    return "primary";
  }

  if (fallbackSrc) {
    return "fallback";
  }

  return "text";
}

function getSeedHash(seed: string) {
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function getInitials(name?: string) {
  const parts =
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2) ?? [];

  if (parts.length === 0) {
    return "?";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function resolveAvatarLabel({ alt, name }: { alt?: string; name?: string }) {
  if (alt) {
    return alt;
  }

  if (name) {
    return `${name} avatar`;
  }

  return "Avatar";
}

export function getAvatarFallbackSrc(seed?: string) {
  const resolvedSeed = seed?.trim() || "default-avatar";
  const index = getSeedHash(resolvedSeed) % AVATAR_FALLBACK_SOURCES.length;
  return AVATAR_FALLBACK_SOURCES[index];
}

export function Avatar({
  alt,
  className = "",
  decorative = false,
  fallbackSrc,
  name,
  seed,
  size = 32,
  src,
}: AvatarProps) {
  const primarySrc = normalizeImageSrc(src);
  const resolvedFallbackSrc =
    normalizeImageSrc(fallbackSrc) ?? getAvatarFallbackSrc(seed ?? name);
  const [imageState, setImageState] = useState<AvatarImageState>(() =>
    getInitialAvatarState(primarySrc, resolvedFallbackSrc),
  );

  useEffect(() => {
    setImageState(getInitialAvatarState(primarySrc, resolvedFallbackSrc));
  }, [primarySrc, resolvedFallbackSrc]);

  const displaySrc =
    imageState === "primary"
      ? primarySrc
      : imageState === "fallback"
        ? resolvedFallbackSrc
        : null;
  const avatarLabel = resolveAvatarLabel({ alt, name });
  const initials = getInitials(name);
  const sizeStyles = { height: `${size}px`, width: `${size}px` };
  const initialsStyle = {
    fontSize: `${Math.max(10, Math.round(size * 0.375))}px`,
  };

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ai-surface-overlay-soft",
        className,
      ].join(" ")}
      style={sizeStyles}
      aria-hidden={decorative && displaySrc === null ? true : undefined}
      aria-label={!decorative && displaySrc === null ? avatarLabel : undefined}
      role={!decorative && displaySrc === null ? "img" : undefined}
    >
      {displaySrc ? (
        <Image
          src={displaySrc}
          alt={decorative ? "" : avatarLabel}
          width={size}
          height={size}
          aria-hidden={decorative ? true : undefined}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => {
            if (
              imageState === "primary" &&
              resolvedFallbackSrc &&
              resolvedFallbackSrc !== primarySrc
            ) {
              setImageState("fallback");
              return;
            }

            setImageState("text");
          }}
        />
      ) : (
        <span
          className="inline-flex h-full w-full items-center justify-center bg-ai-blue-fill-hover font-semibold text-ai-blue-primary"
          style={initialsStyle}
        >
          {initials}
        </span>
      )}
    </span>
  );
}

export { AVATAR_FALLBACK_SOURCES };
