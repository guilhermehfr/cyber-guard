import { CheckCircle2 } from "lucide-react";

import type { Mission } from "@/features/missions/types";
import { DIFFICULTY_META } from "../lib/difficulty";

interface MissionCardProps {
  mission: Mission;
  isComplete: boolean;
  onSelect: () => void;
}

export function MissionCard({ mission, isComplete, onSelect }: MissionCardProps) {
  const meta = DIFFICULTY_META[mission.difficulty];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isComplete}
      className={`group flex h-full w-full flex-col gap-2 rounded-xl border bg-card p-5 text-left shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        isComplete
          ? "border-border/70 bg-muted/30 opacity-70 saturate-50"
          : `${meta.border} ${meta.hover} hover:-translate-y-0.5`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground">{mission.title}</h3>
        <span
          className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${isComplete ? "bg-muted-foreground/40" : meta.accent}`}
          aria-hidden="true"
        />
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{mission.description}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-sm">
        {isComplete ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            Missão concluída
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            <span className={`h-2 w-2 rounded-full ${meta.accent}`} aria-hidden="true" />
            Disponível
          </span>
        )}
        <span className="ml-auto text-sm font-semibold tabular-nums text-muted-foreground">
          +{mission.points} pts
        </span>
      </div>
    </button>
  );
}
