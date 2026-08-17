"use client";

import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { missionsApi } from "@/features/missions/api/missions.api";
import { useMissionTimer } from "@/features/missions/hooks/use-mission-timer";
import { useSound } from "@/features/missions/hooks/use-sound";
import type {
  CompleteMissionResponse,
  Difficulty,
  Mission,
  StartMissionResponse,
} from "@/features/missions/types";
import { AnswerOption, type AnswerState } from "./answer-option";
import { MissionFinish } from "./mission-finish";
import { MissionHud } from "./mission-hud";
import { QuestionCard } from "./question-card";

const ADVANCE_DELAY_MS = 1000;
const LETTERS = ["A", "B", "C", "D"];

type GameStatus =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "playing" }
  | { kind: "finished"; result: CompleteMissionResponse }
  | { kind: "timeout" };

interface MissionGameProps {
  mission: Mission;
  difficulty: Difficulty;
  onExit: () => void;
  timeLimitSeconds?: number | null;
}

interface SubmittedAnswer {
  questionId: string;
  answerId: string;
}

interface CurrentAnswer {
  optionId: string;
  isCorrect: boolean;
}

export function MissionGame({
  mission,
  difficulty,
  onExit,
  timeLimitSeconds = null,
}: MissionGameProps) {
  const [status, setStatus] = useState<GameStatus>({ kind: "loading" });
  const [session, setSession] = useState<StartMissionResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<CurrentAnswer | null>(null);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);

  const { play, muted, toggleMute } = useSound();
  const { elapsedSeconds, remainingSeconds } = useMissionTimer({
    running: status.kind === "playing",
    timeLimitSeconds,
  });

  const questions = session?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const startMission = useCallback(async () => {
    setStatus({ kind: "loading" });
    setSession(null);
    setCurrentIndex(0);
    setSelectedId(null);
    setCurrentAnswer(null);
    setAnswers([]);

    try {
      const started = await missionsApi.start(mission.id);
      setSession(started);
      setStatus({ kind: "playing" });
    } catch {
      setStatus({ kind: "error", message: "Não foi possível iniciar a missão." });
    }
  }, [mission.id]);

  useEffect(() => {
    void startMission();
  }, [startMission]);

  const completeMission = useCallback(
    async (sessionId: string, submittedAnswers: SubmittedAnswer[]) => {
      try {
        const result = await missionsApi.complete(mission.id, {
          sessionId,
          answers: submittedAnswers,
        });
        setStatus({ kind: "finished", result });
      } catch {
        setStatus({ kind: "error", message: "Não foi possível registrar sua pontuação." });
      }
    },
    [mission.id],
  );

  useEffect(() => {
    if (status.kind === "playing" && remainingSeconds !== null && remainingSeconds === 0) {
      setStatus({ kind: "timeout" });
    }
  }, [status, remainingSeconds]);

  useEffect(() => {
    if (status.kind === "finished") {
      play("complete");
    }
  }, [status, play]);

  useEffect(() => {
    if (status.kind === "timeout") {
      play("wrong");
    }
  }, [status, play]);

  useEffect(() => {
    if (currentAnswer === null || status.kind !== "playing" || !session) {
      return;
    }

    const id = window.setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) {
        void completeMission(session.sessionId, answers);
      } else {
        setCurrentIndex((index) => index + 1);
        setSelectedId(null);
        setCurrentAnswer(null);
      }
    }, ADVANCE_DELAY_MS);

    return () => window.clearTimeout(id);
  }, [currentAnswer, status, currentIndex, totalQuestions, session, answers, completeMission]);

  const handleSelect = useCallback(
    async (optionId: string) => {
      if (selectedId !== null || status.kind !== "playing" || !currentQuestion || !session) {
        return;
      }

      setSelectedId(optionId);
      try {
        const { isCorrect } = await missionsApi.answer(mission.id, {
          sessionId: session.sessionId,
          questionId: currentQuestion.id,
          answerId: optionId,
        });

        setAnswers((prev) => [...prev, { questionId: currentQuestion.id, answerId: optionId }]);
        setCurrentAnswer({ optionId, isCorrect });
        play(isCorrect ? "correct" : "wrong");
      } catch {
        setStatus({ kind: "error", message: "Não foi possível registrar sua resposta." });
      }
    },
    [selectedId, status, currentQuestion, session, mission.id, play],
  );

  const answerState = (optionId: string): AnswerState => {
    if (!currentQuestion || currentAnswer === null) {
      return "idle";
    }
    if (optionId === currentAnswer.optionId) {
      return currentAnswer.isCorrect ? "correct" : "incorrect";
    }
    return "dimmed";
  };

  const isCorrect = currentAnswer?.isCorrect === true;

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

      {status.kind === "finished" ? (
        <MissionFinish status="finished" result={status.result} onExit={onExit} />
      ) : status.kind === "timeout" ? (
        <MissionFinish status="timeout" onExit={onExit} />
      ) : status.kind === "error" ? (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center shadow-sm">
          <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{status.message}</p>
          <button
            type="button"
            onClick={() => void startMission()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Tentar novamente
          </button>
        </div>
      ) : status.kind === "loading" ? (
        <div
          className="flex flex-col items-center justify-center gap-4 py-24"
          role="status"
          aria-label="Carregando missão"
        >
          <div className="h-40 w-full max-w-2xl animate-pulse rounded-xl bg-secondary" />
          <div className="h-56 w-full max-w-2xl animate-pulse rounded-xl bg-secondary" />
          <span className="sr-only">Carregando missão...</span>
        </div>
      ) : currentQuestion ? (
        <div key={currentQuestion.id} className="mx-auto w-full max-w-3xl animate-card-enter">
          <div className={selectedId !== null ? "animate-question-out" : undefined}>
            <QuestionCard question={currentQuestion} questionNumber={currentIndex + 1} />
          </div>

          <div aria-live="polite" className="mt-5">
            {currentAnswer !== null && (
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
                  onSelect={() => void handleSelect(option.id)}
                />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
