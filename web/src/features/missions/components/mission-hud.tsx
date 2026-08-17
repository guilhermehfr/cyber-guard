"use client";

import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

import type { Difficulty, Mission } from "@/features/missions/types";
import { DIFFICULTY_META } from "../lib/difficulty";
import { MissionProgress } from "./mission-progress";
import { MissionTimer } from "./mission-timer";

interface MissionHudProps {
  mission: Mission;
  difficulty: Difficulty;
  muted: boolean;
  onToggleMute: () => void;
  onBack: () => void;
  elapsedSeconds: number;
  remainingSeconds?: number | null;
  totalSeconds?: number | null;
  current: number;
  total: number;
}

export function MissionHud({
  mission,
  difficulty,
  muted,
  onToggleMute,
  onBack,
  elapsedSeconds,
  remainingSeconds,
  totalSeconds,
  current,
  total,
}: MissionHudProps) {
  const meta = DIFFICULTY_META[difficulty];

  return (
    <header className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Sair da missão"
          className="inline-flex items-center gap-1.5 justify-self-start rounded-md px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Sair
        </button>

        <div className="justify-self-center">
          <MissionTimer
            elapsedSeconds={elapsedSeconds}
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            difficulty={difficulty}
          />
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Ativar som" : "Silenciar som"}
          aria-pressed={muted}
          className="inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {muted ? (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="mt-3 text-center">
        <div className="inline-flex max-w-full items-center gap-2">
          <span
            className={`inline-flex flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.badge}`}
          >
            {meta.label}
          </span>
          <h2 className="truncate font-display text-base font-bold tracking-wide text-foreground sm:text-lg">
            {mission.title}
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{mission.points} pts por acerto</p>
      </div>

      <div className="mt-4">
        <MissionProgress current={current} total={total} />
      </div>
    </header>
  );
}
