"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Detects tab/window switching during quiz attempts.
 * Returns { switchCount, isViolated } and shows a warning.
 */
export function useTabGuard(enabled: boolean = true) {
  const [switchCount, setSwitchCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSwitchCount((c) => c + 1);
      }
    };

    const handleBlur = () => {
      // Only count blur if the document is also hidden (actual tab switch)
      // to avoid counting normal interactions like clicking an input
      setTimeout(() => {
        if (document.hidden) {
          // already counted by visibilitychange
          return;
        }
        setSwitchCount((c) => c + 1);
      }, 200);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    startedRef.current = true;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled]);

  return {
    switchCount,
    isViolated: switchCount > 0,
  };
}
