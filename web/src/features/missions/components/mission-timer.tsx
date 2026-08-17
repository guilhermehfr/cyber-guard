"use client";

import type { Difficulty } from "@/features/missions/types";
import { DIFFICULTY_META } from "../lib/difficulty";

const SIZE = 64;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface MissionTimerProps {
  elapsedSeconds: number;
  remainingSeconds?: number | null;
  totalSeconds?: number | null;
  difficulty: Difficulty;
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function MissionTimer({
  elapsedSeconds,
  remainingSeconds = null,
  totalSeconds = null,
  difficulty,
}: MissionTimerProps) {
  const meta = DIFFICULTY_META[difficulty];

  const isCountdown = remainingSeconds !== null;
  const displaySeconds = isCountdown ? remainingSeconds : elapsedSeconds;
  const showSecondsCaption = isCountdown && totalSeconds !== null && totalSeconds < 60;

  const fraction =
    remainingSeconds !== null && totalSeconds !== null && totalSeconds > 0
      ? remainingSeconds / totalSeconds
      : 1;
  const offset = CIRCUMFERENCE * (1 - Math.max(fraction, 0));

  const urgent = remainingSeconds !== null && remainingSeconds <= 10;
  const near = remainingSeconds !== null && remainingSeconds <= 20 && !urgent;
  const ringClass = urgent ? "text-destructive" : near ? "text-warning" : meta.accent;

  const label = isCountdown
    ? `Tempo restante: ${displaySeconds} segundos`
    : `Tempo decorrido: ${formatClock(displaySeconds)}`;

  return (
    <div
      className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center"
      role="timer"
      aria-label={label}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={`h-16 w-16 -rotate-90 ${ringClass}`}
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          className="stroke-current text-muted"
          opacity={0.35}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          className="stroke-current"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-sm font-bold tabular-nums text-foreground">
          {isCountdown ? displaySeconds : formatClock(displaySeconds)}
        </span>
        {showSecondsCaption && (
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            SEC
          </span>
        )}
      </div>
    </div>
  );
}
