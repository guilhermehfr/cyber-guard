"use client";

import { useEffect, useRef } from "react";

import type { MissionQuestion } from "@/features/missions/types";

interface QuestionCardProps {
  question: MissionQuestion;
  questionNumber: number;
}

export function QuestionCard({ question, questionNumber }: QuestionCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="mission-question"
      className="rounded-2xl border border-border/60 bg-card px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Questão {questionNumber}
      </p>
      <h2
        ref={headingRef}
        id="mission-question"
        tabIndex={-1}
        className="mx-auto mt-4 max-w-2xl font-display text-2xl font-bold leading-snug text-foreground outline-none sm:text-3xl"
      >
        {question.prompt}
      </h2>
    </section>
  );
}
