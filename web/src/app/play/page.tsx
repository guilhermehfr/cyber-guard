"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FloatingBubbles } from "@/components/landing/floating-bubbles";
import { Navbar } from "@/components/layout/navbar";
import { MissionsSection } from "@/components/play/missions-section";
import { ProgressSection } from "@/components/play/progress-section";
import { RankingPreview } from "@/components/play/ranking-preview";
import { isAuthenticated } from "@/features/auth/lib/session";

export default function Play() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

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

  const handleAuthAction = () => {
    router.push("/play");
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <FloatingBubbles subtle />
      <Navbar onAuthAction={handleAuthAction} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-center font-display text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
          MISSÕES
        </h1>
        <div className="mx-auto mt-4 h-px w-full max-w-3xl bg-border" />

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-8">
          <MissionsSection />
          <RankingPreview />
        </div>

        <ProgressSection />
      </main>
    </div>
  );
}
