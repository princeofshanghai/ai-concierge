"use client";

import { useEffect } from "react";

let activeBodyScrollLocks = 0;
let previousBodyOverflow: string | null = null;

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    if (activeBodyScrollLocks === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    activeBodyScrollLocks += 1;

    return () => {
      activeBodyScrollLocks = Math.max(0, activeBodyScrollLocks - 1);

      if (activeBodyScrollLocks === 0) {
        document.body.style.overflow = previousBodyOverflow ?? "";
        previousBodyOverflow = null;
      }
    };
  }, [isLocked]);
}
