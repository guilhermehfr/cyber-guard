import { AlertTriangle } from "lucide-react";

import type { Mission } from "@/features/missions/types";
import type { MissionsStatus } from "../hooks/use-missions";
import { MissionCard } from "./mission-card";

interface MissionGridProps {
  missions: Mission[];
  status: MissionsStatus;
  retry: () => void;
  completedMissionIds: ReadonlySet<string>;
  onSelectMission: (mission: Mission) => void;
}

export function MissionGrid({
  missions,
  status,
  retry,
  completedMissionIds,
  onSelectMission,
}: MissionGridProps) {
  if (status === "loading") {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Carregando missões"
        role="status"
      >
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-xl bg-secondary" />
        ))}
        <span className="sr-only">Carregando missões...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 px-6 py-8 text-center">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Não foi possível carregar as missões.</p>
        <button
          type="button"
          onClick={retry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-muted/30 px-6 py-8 text-center text-sm text-muted-foreground">
        Sem missões nessa dificuldade ainda.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {missions.map((mission, index) => (
        <li
          key={mission.id}
          className="animate-mission-enter"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <MissionCard
            mission={mission}
            isComplete={completedMissionIds.has(mission.id)}
            onSelect={() => onSelectMission(mission)}
          />
        </li>
      ))}
    </ul>
  );
}
