import { beforeEach, describe, expect, it, vi } from "vitest";

import { DAILY_GOAL, DAILY_NEW_WORDS, DAILY_REVIEW_WORDS, QUESTIONS, STAGES, getDailyWordPlan, getQuestionsForStage, scoreAnswers } from "../lib/word-practice";
import { DEFAULT_LEARNING_RECORD, LEARNING_STORAGE_KEY, loadLearningRecord, saveLearningRecord } from "../lib/learning-storage";

const storage = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => storage.get(key) ?? null,
    setItem: async (key: string, value: string) => { storage.set(key, value); },
  },
}));

beforeEach(() => storage.clear());

describe("Wordly learning stages", () => {
  it("sets a twenty-word daily goal with an even new-review split", () => {
    expect(DAILY_GOAL).toBe(20);
    expect(DAILY_NEW_WORDS).toBe(10);
    expect(DAILY_REVIEW_WORDS).toBe(10);
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

  it("creates a date-based new and review word plan", () => {
    const plan = getDailyWordPlan("beginner", new Date(2026, 8, 29));
    expect(plan.newWords.every((word) => word.stage === "beginner")).toBe(true);
    expect(plan.reviewWords.every((word) => word.stage === "beginner")).toBe(true);
    expect(plan.newWords.length).toBeLessThanOrEqual(DAILY_NEW_WORDS);
    expect(plan.reviewWords.length).toBeLessThanOrEqual(DAILY_REVIEW_WORDS);
  });

  it("persists a learning record through the storage adapter", async () => {
    const record = { ...DEFAULT_LEARNING_RECORD, todayWords: 3, totalWords: 3, lastDate: new Date().toISOString().slice(0, 10) };
    await saveLearningRecord(record);
    expect(storage.has(LEARNING_STORAGE_KEY)).toBe(true);
    await expect(loadLearningRecord()).resolves.toMatchObject({ todayWords: 3, totalWords: 3 });
  });
});
