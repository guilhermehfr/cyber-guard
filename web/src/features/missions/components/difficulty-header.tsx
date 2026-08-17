import { ArrowLeft, Lock } from "lucide-react";
import type { Ref } from "react";

import type { Difficulty } from "@/features/missions/types";
import { DIFFICULTY_META } from "../lib/difficulty";

interface DifficultyHeaderProps {
  difficulty: Difficulty;
  missionCount: number;
  points: number | null;
  completedCount: number;
  onBack: () => void;
  headerRef?: Ref<HTMLElement>;
  backRef?: Ref<HTMLButtonElement>;
}

export function DifficultyHeader({
  difficulty,
  missionCount,
  points,
  completedCount,
  onBack,
  headerRef,
  backRef,
}: DifficultyHeaderProps) {
  const meta = DIFFICULTY_META[difficulty];
  const Icon = meta.icon;
  const allCompleted = missionCount > 0 && completedCount === missionCount;

  return (
    <header
      ref={headerRef}
      className={`overflow-hidden rounded-xl border-2 bg-card shadow-sm ${meta.border}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border bg-gradient-to-b from-primary/5 to-transparent px-5 py-4 sm:px-6">
        <button
          ref={backRef}
          type="button"
          onClick={onBack}
          aria-label="Voltar para a seleção de dificuldades"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </button>
        {allCompleted && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Dificuldade concluída
          </span>
        )}
      </div>

      <div className="px-5 py-6 sm:px-6">
        <div className="flex items-center gap-4">
          <span className={`inline-flex rounded-xl p-3 ${meta.badge}`} aria-hidden="true">
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-widest text-foreground sm:text-3xl">
              {meta.label}
            </h2>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {points !== null && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="animate-reveal-up text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pontos
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{points}</p>
            </div>
          )}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p
              className="animate-reveal-up text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ animationDelay: points !== null ? "120ms" : "0ms" }}
            >
              Missões a concluir
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{missionCount}</p>
          </div>
        </div>

        {allCompleted && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-success/10 px-4 py-3">
            <Lock className="h-5 w-5 text-success" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-foreground">Dificuldade concluída</p>
              <p className="text-xs text-muted-foreground">
                {completedCount} / {missionCount} missões concluídas
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
