"use client";

import { ArrowLeft, Hourglass, Trophy } from "lucide-react";
import { useEffect, useRef } from "react";

export type MissionResultStatus = "finished" | "timeout";

interface MissionFinishProps {
  status: MissionResultStatus;
  correctCount: number;
  totalQuestions: number;
  points: number;
  onExit: () => void;
}

export function MissionFinish({
  status,
  correctCount,
  totalQuestions,
  points,
  onExit,
}: MissionFinishProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const completed = status === "finished";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl animate-card-enter flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm sm:py-20">
      <span
        className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl ${
          completed ? "bg-warning/10" : "bg-destructive/10"
        }`}
        aria-hidden="true"
      >
        {completed ? (
          <Trophy className="h-10 w-10 text-warning" />
        ) : (
          <Hourglass className="h-10 w-10 text-destructive" />
        )}
      </span>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 font-display text-3xl font-bold tracking-wide text-foreground outline-none sm:text-4xl"
      >
        {completed ? "MISSÃO CONCLUÍDA" : "TEMPO ESGOTADO"}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {completed
          ? "Você finalizou todos os desafios desta missão."
          : "O tempo da missão terminou antes da conclusão."}
      </p>

      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acertos
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {correctCount} / {totalQuestions}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pontuação
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{points} pts</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Resultado desta sessão de treino. A pontuação oficial é registrada pelo servidor.
      </p>

      <button
        type="button"
        onClick={onExit}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para missões
      </button>
    </div>
  );
}
