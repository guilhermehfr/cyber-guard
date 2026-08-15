"use client";

import { Check, Circle, X } from "lucide-react";

import type { MockAnswer } from "../lib/mock-questions";

export type AnswerState = "idle" | "selected" | "correct" | "incorrect" | "dimmed";

interface AnswerOptionProps {
  letter: string;
  option: MockAnswer;
  state: AnswerState;
  disabled: boolean;
  onSelect: () => void;
}

const STATE_CLASSES: Record<AnswerState, string> = {
  idle: "border-border shadow-sm enabled:hover:-translate-x-1 enabled:hover:border-primary enabled:hover:bg-primary/5 motion-reduce:enabled:hover:translate-x-0",
  selected: "border-primary bg-primary/10 shadow-sm",
  correct: "border-success bg-success/10 shadow-sm",
  incorrect: "border-destructive bg-destructive/10 shadow-sm",
  dimmed: "border-border/60 opacity-60",
};

export function AnswerOption({ letter, option, state, disabled, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`group flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-4 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default ${STATE_CLASSES[state]}`}
    >
      <span
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
          state === "correct"
            ? "border-success text-success"
            : state === "incorrect"
              ? "border-destructive text-destructive"
              : "border-border text-muted-foreground"
        }`}
        aria-hidden="true"
      >
        {letter}
      </span>
      <span className="flex-1 text-sm font-medium text-foreground sm:text-base">{option.text}</span>
      {state === "correct" && (
        <Check className="h-5 w-5 flex-shrink-0 text-success" aria-hidden="true" />
      )}
      {state === "incorrect" && (
        <X className="h-5 w-5 flex-shrink-0 text-destructive" aria-hidden="true" />
      )}
      {state === "selected" && (
        <Circle className="h-5 w-5 flex-shrink-0 fill-primary/20 text-primary" aria-hidden="true" />
      )}
    </button>
  );
}
