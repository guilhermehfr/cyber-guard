import type { AuthenticatedUser } from "@cyber/contracts";
import { describe, expect, it, vi } from "vitest";

import { MissionsController } from "./missions.controller.js";
import type { MissionsService } from "./missions.service.js";

function createController() {
  const getCompletedMissionIds = vi.fn();
  const getMissionQuestions = vi.fn();
  const completeMission = vi.fn();
  const service = {
    getCompletedMissionIds,
    getMissionQuestions,
    completeMission,
  } as unknown as MissionsService;
  const controller = new MissionsController(service);
  return { controller, getCompletedMissionIds, getMissionQuestions, completeMission };
}

describe("MissionsController", () => {
  describe("completed", () => {
    it("passes the authenticated player id to the service", async () => {
      const { controller, getCompletedMissionIds } = createController();
      getCompletedMissionIds.mockResolvedValue({ missionIds: ["mission-1"] });
      const request = { user: { id: "player-1" } as AuthenticatedUser };

      const result = await controller.completed(request);

      expect(getCompletedMissionIds).toHaveBeenCalledWith("player-1");
      expect(result).toEqual({ missionIds: ["mission-1"] });
    });
  });

  describe("questions", () => {
    it("passes the mission id from the route to the service", async () => {
      const { controller, getMissionQuestions } = createController();
      getMissionQuestions.mockResolvedValue({ missionId: "mission-1", questions: [] });
      const request = { user: { id: "player-1" } as AuthenticatedUser };

      const result = await controller.questions("mission-1", request);

      expect(getMissionQuestions).toHaveBeenCalledWith("mission-1");
      expect(result).toEqual({ missionId: "mission-1", questions: [] });
    });
  });

  describe("complete", () => {
    it("passes the player id, mission id and submitted answers to the service", async () => {
      const { controller, completeMission } = createController();
      completeMission.mockResolvedValue({
        completion: {
          id: "attempt-1",
          missionId: "mission-1",
          completedAt: "2026-08-14T12:05:00.000Z",
        },
        correctCount: 1,
        totalQuestions: 2,
        pointsAwarded: 50,
        playerPoints: 100,
      });
      const request = { user: { id: "player-1" } as AuthenticatedUser };
      const dto = {
        answers: [
          { questionId: "question-1", answerId: "answer-1" },
          { questionId: "question-2", answerId: "answer-2" },
        ],
      };

      const result = await controller.complete("mission-1", dto, request);

      expect(completeMission).toHaveBeenCalledWith("player-1", "mission-1", dto.answers);
      expect(result).toEqual({
        completion: {
          id: "attempt-1",
          missionId: "mission-1",
          completedAt: "2026-08-14T12:05:00.000Z",
        },
        correctCount: 1,
        totalQuestions: 2,
        pointsAwarded: 50,
        playerPoints: 100,
      });
    });
  });
});
