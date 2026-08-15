"use client";

import { useEffect, useRef } from "react";

import type { MockQuestion } from "../lib/mock-questions";

interface QuestionCardProps {
  question: MockQuestion;
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
        {question.text}
      </h2>
      {question.context && (
        <p className="mx-auto mt-5 max-w-xl rounded-lg bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {question.context}
        </p>
      )}
    </section>
  );
}
