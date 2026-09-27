import { describe, expect, it } from "vitest";

import { DAILY_GOAL, QUESTIONS, STAGES, getQuestionsForStage, scoreAnswers } from "../lib/word-practice";

describe("Wordly learning stages", () => {
  it("sets a ten-word daily goal", () => {
    expect(DAILY_GOAL).toBe(10);
  });

  it("defines the four requested learning stages", () => {
    expect(STAGES.map((stage) => stage.id)).toEqual(["beginner", "intermediate", "advanced", "expert"]);
    expect(STAGES.map((stage) => stage.wordCount)).toEqual([2000, 5000, 9000, 15000]);
    expect(STAGES.map((stage) => stage.description)).toEqual(["國中會考 · 常用字 2,000", "高中學測 · 常用字 5,000", "全民英檢中高階 · 常用字 9,000", "全民英檢高階 · 常用字 15,000"]);
  });

  it("keeps words grouped by stage", () => {
    expect(getQuestionsForStage("beginner")).toHaveLength(2);
    expect(getQuestionsForStage("expert")).toHaveLength(2);
    expect(QUESTIONS.every((question) => question.example && question.pronunciation)).toBe(true);
  });

  it("scores matching answers by position", () => {
    expect(scoreAnswers(["curious", "wrong", "ambiguous"])).toBe(1);
    expect(scoreAnswers([])).toBe(0);
  });
});
