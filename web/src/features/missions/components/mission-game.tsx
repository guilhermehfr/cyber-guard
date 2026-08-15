"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useMissionTimer } from "@/features/missions/hooks/use-mission-timer";
import { useSound } from "@/features/missions/hooks/use-sound";
import { getMockQuestions } from "@/features/missions/lib/mock-questions";
import type { Difficulty, Mission } from "@/features/missions/types";
import { AnswerOption, type AnswerState } from "./answer-option";
import { MissionFinish, type MissionResultStatus } from "./mission-finish";
import { MissionHud } from "./mission-hud";
import { QuestionCard } from "./question-card";

const ADVANCE_DELAY_MS = 1000;
const LETTERS = ["A", "B", "C", "D"];

type GameStatus = "playing" | MissionResultStatus;

interface MissionGameProps {
  mission: Mission;
  difficulty: Difficulty;
  onExit: () => void;
  timeLimitSeconds?: number | null;
}

export function MissionGame({
  mission,
  difficulty,
  onExit,
  timeLimitSeconds = null,
}: MissionGameProps) {
  const questions = useMemo(() => getMockQuestions(difficulty), [difficulty]);
  const totalQuestions = questions.length;

  const [status, setStatus] = useState<GameStatus>("playing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const { play, muted, toggleMute } = useSound();
  const { elapsedSeconds, remainingSeconds } = useMissionTimer({
    running: status === "playing",
    timeLimitSeconds,
  });

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (status === "playing" && remainingSeconds !== null && remainingSeconds === 0) {
      setStatus("timeout");
    }
  }, [status, remainingSeconds]);

  useEffect(() => {
    if (status === "finished") {
      play("complete");
    }
  }, [status, play]);

  useEffect(() => {
    if (status === "timeout") {
      play("wrong");
    }
  }, [status, play]);

  useEffect(() => {
    if (selectedId === null || status !== "playing") {
      return;
    }

    const id = window.setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) {
        setStatus("finished");
      } else {
        setCurrentIndex((index) => index + 1);
        setSelectedId(null);
      }
    }, ADVANCE_DELAY_MS);

    return () => window.clearTimeout(id);
  }, [selectedId, status, currentIndex, totalQuestions]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (selectedId !== null || status !== "playing" || !currentQuestion) {
        return;
      }

      setSelectedId(optionId);
      const isCorrect = optionId === currentQuestion.correctAnswerId;
      if (isCorrect) {
        setCorrectCount((count) => count + 1);
      }
      play(isCorrect ? "correct" : "wrong");
    },
    [selectedId, status, currentQuestion, play],
  );

  const answerState = (optionId: string): AnswerState => {
    if (!currentQuestion || selectedId === null) {
      return "idle";
    }
    if (optionId === currentQuestion.correctAnswerId) {
      return "correct";
    }
    if (optionId === selectedId) {
      return "incorrect";
    }
    return "dimmed";
  };

  const isCorrect =
    selectedId !== null &&
    currentQuestion !== undefined &&
    selectedId === currentQuestion.correctAnswerId;
  const points = correctCount * mission.points;

  return (
    <div className="flex flex-col gap-5">
      <MissionHud
        mission={mission}
        difficulty={difficulty}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={onExit}
        elapsedSeconds={elapsedSeconds}
        remainingSeconds={remainingSeconds}
        totalSeconds={timeLimitSeconds}
        current={currentIndex + 1}
        total={totalQuestions}
      />

      {status !== "playing" ? (
        <MissionFinish
          status={status}
          correctCount={correctCount}
          totalQuestions={totalQuestions}
          points={points}
          onExit={onExit}
        />
      ) : currentQuestion ? (
        <div key={currentQuestion.id} className="mx-auto w-full max-w-3xl animate-card-enter">
          <div className={selectedId !== null ? "animate-question-out" : undefined}>
            <QuestionCard question={currentQuestion} questionNumber={currentIndex + 1} />
          </div>

          <div aria-live="polite" className="mt-5">
            {selectedId !== null && (
              <p
                className={`text-center text-sm font-semibold ${
                  isCorrect ? "text-success" : "text-destructive"
                }`}
              >
                {isCorrect ? "Resposta correta!" : "Resposta incorreta!"}
              </p>
            )}
          </div>

          <ol className="mt-3 flex flex-col gap-3">
            {currentQuestion.answers.map((option, index) => (
              <li key={option.id}>
                <AnswerOption
                  letter={LETTERS[index] ?? String(index + 1)}
                  option={option}
                  state={answerState(option.id)}
                  disabled={selectedId !== null}
                  onSelect={() => handleSelect(option.id)}
                />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
