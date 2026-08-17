import type {
  CompletedMissionIdsResponse,
  CompleteMissionResponse,
  Mission,
  MissionQuestionsResponse,
  PlayerProfile,
  StartMissionResponse,
  SubmitAnswerResponse,
} from "@cyber/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deletePlayers } from "../support/cleanup.js";
import { ApiClient } from "../support/client.js";

const api = new ApiClient();

const apiUp = await api.isHealthy();

if (!apiUp) {
  process.stderr.write(
    `[e2e] API not reachable at ${api.baseUrl}. Skipping the e2e suite. Start the stack with: pnpm docker:up\n`,
  );
}

const E2E_PASSWORD = "CyberGuard-E2E-Pass!";

function uniqueEmail(label: string): string {
  return `e2e.${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

describe.skipIf(!apiUp)("mission-complete flow (e2e)", () => {
  let playerA: ApiClient;
  let playerB: ApiClient;
  let playerAEmail: string;
  let playerBEmail: string;
  let mission: Mission;
  let questionCount: number;
  let sessionId: string;
  let baselinePoints: number;
  const emails: string[] = [];

  beforeAll(async () => {
    playerAEmail = uniqueEmail("a");
    playerBEmail = uniqueEmail("b");
    emails.push(playerAEmail, playerBEmail);

    playerA = new ApiClient();
    playerB = new ApiClient();

    const registerA = await playerA.register("E2E Player A", playerAEmail, E2E_PASSWORD);
    expect(registerA.status).toBe(201);

    const registerB = await playerB.register("E2E Player B", playerBEmail, E2E_PASSWORD);
    expect(registerB.status).toBe(201);

    const me = await playerA.get<PlayerProfile>("/auth/me");
    expect(me.status).toBe(200);
    baselinePoints = me.body.points;

    const missions = await playerA.get<Mission[]>("/missions");
    expect(missions.status).toBe(200);
    const easyMission = missions.body.find((item) => item.difficulty === "EASY");
    if (!easyMission) {
      throw new Error("No EASY mission found in the seeded database");
    }
    mission = easyMission;
  });

  afterAll(async () => {
    await deletePlayers(emails);
  });

  it("starts a mission and returns a session with public questions only", async () => {
    const response = await playerA.post<StartMissionResponse>(`/missions/${mission.id}/start`);

    expect(response.status).toBe(200);
    expect(response.body.sessionId).toBeTruthy();
    expect(response.body.missionId).toBe(mission.id);

    sessionId = response.body.sessionId;
    questionCount = response.body.questions.length;
    expect(questionCount).toBeGreaterThan(0);

    for (const question of response.body.questions) {
      expect(question.prompt).toBeTruthy();
      expect(question.answers.length).toBeGreaterThanOrEqual(2);
      for (const answer of question.answers) {
        expect(answer.id).toBeTruthy();
        expect(answer.text).toBeTruthy();
        expect(answer).not.toHaveProperty("isCorrect");
      }
    }
  });

  it("exposes the same questions without leaking correct answers", async () => {
    const response = await playerA.get<MissionQuestionsResponse>(
      `/missions/${mission.id}/questions`,
    );

    expect(response.status).toBe(200);
    expect(response.body.questions).toHaveLength(questionCount);
    for (const question of response.body.questions) {
      for (const answer of question.answers) {
        expect(answer).not.toHaveProperty("isCorrect");
      }
    }
  });

  it("accepts one answer per question and reports correctness", async () => {
    const start = await playerA.post<StartMissionResponse>(`/missions/${mission.id}/start`);
    expect(start.status).toBe(200);
    sessionId = start.body.sessionId;
    questionCount = start.body.questions.length;

    for (const question of start.body.questions) {
      const answerId = question.answers[0]?.id;
      if (!answerId) {
        throw new Error(`Question ${question.id} has no answers`);
      }

      const response = await playerA.post<SubmitAnswerResponse>(`/missions/${mission.id}/answer`, {
        sessionId,
        questionId: question.id,
        answerId,
      });

      expect(response.status).toBe(200);
      expect(typeof response.body.isCorrect).toBe("boolean");
    }
  });

  it("completes the mission and awards points from the server-computed score", async () => {
    const start = await playerA.post<StartMissionResponse>(`/missions/${mission.id}/start`);
    expect(start.status).toBe(200);
    sessionId = start.body.sessionId;
    questionCount = start.body.questions.length;

    const answers = start.body.questions.map((question) => ({
      questionId: question.id,
      answerId: question.answers[0]?.id as string,
    }));

    const response = await playerA.post<CompleteMissionResponse>(
      `/missions/${mission.id}/complete`,
      {
        sessionId,
        answers,
      },
    );

    expect(response.status).toBe(200);
    expect(response.body.completion.missionId).toBe(mission.id);
    expect(response.body.completion.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(response.body.totalQuestions).toBe(questionCount);
    expect(response.body.correctCount).toBeGreaterThanOrEqual(0);
    expect(response.body.correctCount).toBeLessThanOrEqual(questionCount);
    expect(response.body.pointsAwarded).toBe(response.body.correctCount * mission.points);
    expect(response.body.playerPoints).toBe(baselinePoints + response.body.pointsAwarded);
  });

  it("persists the mission in the completed list", async () => {
    const response = await playerA.get<CompletedMissionIdsResponse>("/missions/completed");

    expect(response.status).toBe(200);
    expect(response.body.missionIds).toContain(mission.id);
  });

  it("rejects completing the same mission twice", async () => {
    const start = await playerA.post<StartMissionResponse>(`/missions/${mission.id}/start`);
    expect(start.status).toBe(200);

    const answers = start.body.questions.map((question) => ({
      questionId: question.id,
      answerId: question.answers[0]?.id as string,
    }));

    const response = await playerA.post<{ message: string }>(`/missions/${mission.id}/complete`, {
      sessionId: start.body.sessionId,
      answers,
    });

    expect(response.status).toBe(409);
  });

  it("rejects reusing a session after its mission was completed", async () => {
    const response = await playerA.post<{ message: string }>(`/missions/${mission.id}/complete`, {
      sessionId,
      answers: [{ questionId: "unknown-question", answerId: "unknown-answer" }],
    });

    expect(response.status).toBe(404);
  });

  it("forbids a player from completing another player's session", async () => {
    const start = await playerA.post<StartMissionResponse>(`/missions/${mission.id}/start`);
    expect(start.status).toBe(200);

    const answers = start.body.questions.map((question) => ({
      questionId: question.id,
      answerId: question.answers[0]?.id as string,
    }));

    const response = await playerB.post<{ message: string }>(`/missions/${mission.id}/complete`, {
      sessionId: start.body.sessionId,
      answers,
    });

    expect(response.status).toBe(403);
  });

  it("returns 404 for a session id that does not exist", async () => {
    const response = await playerA.post<{ message: string }>(`/missions/${mission.id}/complete`, {
      sessionId: "00000000-0000-4000-8000-000000000000",
      answers: [{ questionId: "unknown-question", answerId: "unknown-answer" }],
    });

    expect(response.status).toBe(404);
  });

  it("requires authentication for session endpoints", async () => {
    const anonymous = new ApiClient();

    const start = await anonymous.post<{ message: string }>(`/missions/${mission.id}/start`);
    expect(start.status).toBe(401);

    const completed = await anonymous.get<{ message: string }>("/missions/completed");
    expect(completed.status).toBe(401);

    const complete = await anonymous.post<{ message: string }>(`/missions/${mission.id}/complete`, {
      sessionId: "00000000-0000-4000-8000-000000000000",
      answers: [{ questionId: "unknown-question", answerId: "unknown-answer" }],
    });
    expect(complete.status).toBe(401);
  });

  it("rejects an incomplete answer submission", async () => {
    const start = await playerA.post<StartMissionResponse>(`/missions/${mission.id}/start`);
    expect(start.status).toBe(200);

    const answers = start.body.questions.slice(0, -1).map((question) => ({
      questionId: question.id,
      answerId: question.answers[0]?.id as string,
    }));

    const response = await playerA.post<{ message: string }>(`/missions/${mission.id}/complete`, {
      sessionId: start.body.sessionId,
      answers,
    });

    expect(response.status).toBe(400);
  });

  it("rejects answers for questions outside the mission", async () => {
    const start = await playerA.post<StartMissionResponse>(`/missions/${mission.id}/start`);
    expect(start.status).toBe(200);

    const answers = start.body.questions.map((question, index) => ({
      questionId: index === 0 ? "unknown-question" : question.id,
      answerId: question.answers[0]?.id as string,
    }));

    const response = await playerA.post<{ message: string }>(`/missions/${mission.id}/complete`, {
      sessionId: start.body.sessionId,
      answers,
    });

    expect(response.status).toBe(400);
  });

  it("sets an HttpOnly session cookie and a readable marker cookie on register", async () => {
    const client = new ApiClient();
    const email = uniqueEmail("cookie");

    const response = await client.register("E2E Cookie Player", email, E2E_PASSWORD);

    expect(response.status).toBe(201);
    const cookies = response.headers.getSetCookie();
    const sessionCookie = cookies.find((cookie) => cookie.startsWith("cyberguard.session="));
    const markerCookie = cookies.find((cookie) => cookie.startsWith("cyberguard.auth="));
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie).toContain("HttpOnly");
    expect(markerCookie).toBeTruthy();

    emails.push(email);
  });
});
