"use client";

import { useEffect, useState } from "react";

export interface UseMissionTimerOptions {
  running: boolean;
  timeLimitSeconds?: number | null;
}

export interface UseMissionTimerResult {
  elapsedSeconds: number;
  remainingSeconds: number | null;
}

export function useMissionTimer({
  running,
  timeLimitSeconds = null,
}: UseMissionTimerOptions): UseMissionTimerResult {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!running) {
      return;
    }

    const id = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [running]);

  const remainingSeconds =
    timeLimitSeconds === null ? null : Math.max(timeLimitSeconds - elapsedSeconds, 0);

  return { elapsedSeconds, remainingSeconds };
}
