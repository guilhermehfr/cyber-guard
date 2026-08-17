"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";

import { FloatingBubbles } from "@/components/landing/floating-bubbles";
import { Navbar } from "@/components/layout/navbar";
import { isAuthenticated } from "@/features/auth/lib/session";
import { MissionGame } from "@/features/missions/components/mission-game";
import { useMissions } from "@/features/missions/hooks/use-missions";
import { isDifficulty } from "@/features/missions/lib/difficulty";
import type { Mission } from "@/features/missions/types";

export default function MissionPage() {
  return (
    <Suspense fallback={null}>
      <MissionScreen />
    </Suspense>
  );
}

function MissionShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <FloatingBubbles subtle />
      <Navbar onAuthAction={() => router.push("/play")} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function MissionScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checked, setChecked] = useState(false);

  const missionId = searchParams.get("missionId");
  const difficultyParam = searchParams.get("difficulty");
  const difficulty = isDifficulty(difficultyParam) ? difficultyParam : null;

  const { status, byDifficulty, retry } = useMissions();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) {
    return null;
  }

  const allMissions: Mission[] = [
    ...byDifficulty.EASY,
    ...byDifficulty.MEDIUM,
    ...byDifficulty.HARD,
  ];
  const mission = missionId ? (allMissions.find((item) => item.id === missionId) ?? null) : null;

  const backDifficulty = difficulty ?? mission?.difficulty ?? null;
  const backHref = backDifficulty ? `/play?difficulty=${backDifficulty}` : "/play";
  const handleBack = () => router.push(backHref);

  if (status === "loading") {
    return (
      <MissionShell>
        <div
          className="flex flex-col items-center justify-center gap-4 py-24"
          role="status"
          aria-label="Carregando missão"
        >
          <div className="h-40 w-full max-w-2xl animate-pulse rounded-xl bg-secondary" />
          <div className="h-56 w-full max-w-2xl animate-pulse rounded-xl bg-secondary" />
          <span className="sr-only">Carregando missão...</span>
        </div>
      </MissionShell>
    );
  }

  if (status === "error") {
    return (
      <MissionShell>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center shadow-sm">
          <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Não foi possível carregar as missões.</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Tentar novamente
          </button>
        </div>
      </MissionShell>
    );
  }

  if (!mission) {
    return (
      <MissionShell>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <AlertTriangle className="h-10 w-10 text-warning" aria-hidden="true" />
          <h1 className="font-display text-2xl font-bold tracking-wide text-foreground">
            Missão não encontrada
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            A missão que você tentou abrir não existe ou não está mais disponível.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para missões
          </button>
        </div>
      </MissionShell>
    );
  }

  return (
    <MissionShell>
      <MissionGame
        key={mission.id}
        mission={mission}
        difficulty={backDifficulty ?? mission.difficulty}
        onExit={handleBack}
      />
    </MissionShell>
  );
}
