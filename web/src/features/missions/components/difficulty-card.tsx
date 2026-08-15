import { ArrowRight } from "lucide-react";
import type { Ref } from "react";

import type { Difficulty } from "@/features/missions/types";
import { DIFFICULTY_META } from "../lib/difficulty";

interface DifficultyCardProps {
  difficulty: Difficulty;
  missionCount: number | null;
  selected: boolean;
  leaving: boolean;
  entering: boolean;
  enterDelay?: number;
  onSelect: () => void;
  ref?: Ref<HTMLButtonElement>;
}

export function DifficultyCard({
  difficulty,
  missionCount,
  selected,
  leaving,
  entering,
  enterDelay = 0,
  onSelect,
  ref,
}: DifficultyCardProps) {
  const meta = DIFFICULTY_META[difficulty];
  const Icon = meta.icon;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-expanded={selected}
      className={`group relative flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all duration-200 ${meta.border} ${meta.hover} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        selected ? "ring-2 ring-primary/50" : ""
      } ${leaving ? "pointer-events-none scale-[0.98] opacity-0" : ""} ${
        entering ? "animate-card-enter" : ""
      }`}
      style={entering ? { animationDelay: `${enterDelay}ms` } : undefined}
    >
      <span className="flex w-full items-center gap-3">
        <span className={`inline-flex rounded-lg p-2.5 ${meta.badge}`} aria-hidden="true">
          <Icon className="h-6 w-6" />
        </span>
        {missionCount !== null && (
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {missionCount} {missionCount === 1 ? "missão" : "missões"}
          </span>
        )}
      </span>
      <span className="font-display text-xl font-bold tracking-wide text-foreground">
        {meta.label}
      </span>
      <span className="text-sm text-muted-foreground">{meta.description}</span>
      <span
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden="true"
      >
        Explorar
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}
