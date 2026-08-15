"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { FloatingBubbles } from "@/components/landing/floating-bubbles";
import { Navbar } from "@/components/layout/navbar";
import { ProgressSection } from "@/components/play/progress-section";
import { RankingPreview } from "@/components/play/ranking-preview";
import { isAuthenticated } from "@/features/auth/lib/session";
import { DifficultyExplorer } from "@/features/missions/components/difficulty-explorer";
import { isDifficulty } from "@/features/missions/lib/difficulty";
import type { Difficulty, Mission } from "@/features/missions/types";

export default function Play() {
  return (
    <Suspense fallback={null}>
      <PlayScreen />
    </Suspense>
  );
}

function PlayScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checked, setChecked] = useState(false);
  const [secondaryHidden, setSecondaryHidden] = useState(false);

  const difficultyParam = searchParams.get("difficulty");
  const selected = isDifficulty(difficultyParam) ? difficultyParam : null;
  const expanded = selected !== null;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    setChecked(true);
  }, [router]);

  useEffect(() => {
    if (expanded) {
      const id = window.setTimeout(() => setSecondaryHidden(true), 220);
      return () => window.clearTimeout(id);
    }

    setSecondaryHidden(false);
  }, [expanded]);

  if (!checked) {
    return null;
  }

  const handleSelect = (difficulty: Difficulty) => {
    router.push(`/play?difficulty=${difficulty}`);
  };

  const handleSelectMission = (mission: Mission) => {
    if (selected) {
      router.push(`/play/mission?missionId=${mission.id}&difficulty=${selected}`);
    }
  };

  const handleBack = () => {
    router.push("/play");
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <FloatingBubbles subtle />
      <Navbar onAuthAction={() => router.push("/play")} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-center font-display text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
          MISSÕES
        </h1>
        <div className="mx-auto mt-4 h-px w-full max-w-3xl bg-border" />

        <div
          className={`mt-10 grid gap-6 transition-all duration-200 ${
            expanded ? "lg:grid-cols-1" : "lg:grid-cols-[2fr_1fr] lg:gap-8"
          }`}
        >
          <DifficultyExplorer
            selected={selected}
            onSelect={handleSelect}
            onBack={handleBack}
            onSelectMission={handleSelectMission}
          />
          <div
            className={`transition-opacity duration-200 ${
              expanded ? "opacity-0" : "opacity-100"
            } ${secondaryHidden ? "hidden" : ""}`}
          >
            <RankingPreview />
          </div>
        </div>

        <div
          className={`transition-opacity duration-200 ${
            expanded ? "opacity-0" : "opacity-100"
          } ${secondaryHidden ? "hidden" : ""}`}
        >
          <ProgressSection />
        </div>
      </main>
    </div>
  );
}
