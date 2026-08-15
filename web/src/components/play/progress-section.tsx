"use client";

import { CheckCircle2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { authApi } from "@/features/auth/api/auth.api";
import { getAccessToken } from "@/features/auth/lib/session";
import { missionsApi } from "@/features/missions/api/missions.api";

type Status = "loading" | "error" | "success";

export function ProgressSection() {
  const [status, setStatus] = useState<Status>("loading");
  const [points, setPoints] = useState(0);
  const [completedMissions, setCompletedMissions] = useState(0);
  const [totalMissions, setTotalMissions] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      const token = getAccessToken();
      if (!token) {
        if (active) {
          setStatus("error");
        }
        return;
      }

      try {
        const [profile, missions] = await Promise.all([authApi.me(token), missionsApi.list()]);

        if (active) {
          setPoints(profile.points);
          setCompletedMissions(profile.completedMissions);
          setTotalMissions(missions.length);
          setStatus("success");
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    }

    void loadProgress();

    return () => {
      active = false;
    };
  }, []);

  const progressPercent =
    totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  return (
    <section
      aria-labelledby="progress-heading"
      className="mt-10 flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <h2
        id="progress-heading"
        className="font-display text-lg font-bold tracking-wide text-foreground"
      >
        Seu progresso
      </h2>

      {status === "loading" && (
        <div className="flex flex-col gap-4" aria-label="Carregando progresso" role="status">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-12 animate-pulse rounded-lg bg-secondary" />
            <div className="h-12 animate-pulse rounded-lg bg-secondary" />
          </div>
          <div className="h-10 animate-pulse rounded-lg bg-secondary" />
          <span className="sr-only">Carregando progresso...</span>
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-muted-foreground">Não foi possível carregar seu progresso.</p>
      )}

      {status === "success" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-warning" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Pontos</p>
                <p className="text-xl font-bold text-foreground">{points}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Missões concluídas</p>
                <p className="text-xl font-bold text-foreground">{completedMissions}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progresso geral</span>
              <span className="text-sm font-semibold text-foreground">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
