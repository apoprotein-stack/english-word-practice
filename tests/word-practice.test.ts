import { beforeEach, describe, expect, it, vi } from "vitest";

import { ADVANCED_DAILY_GOAL, ADVANCED_DAILY_NEW_WORDS, ADVANCED_DAILY_REVIEW_WORDS, AUTO_PLAY_SEQUENCE, DAILY_GOAL, DAILY_NEW_WORDS, DAILY_REVIEW_WORDS, QUESTIONS, STAGES, VOCABULARY_MILESTONE, getDailyPlanConfig, getDailyWordPlan, getQuestionsForStage, getSpeechFallbackDuration, getVocabularyProgress, scoreAnswers } from "../lib/word-practice";
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

  it("upgrades the daily plan after one hundred learned words", () => {
    expect(getDailyPlanConfig(VOCABULARY_MILESTONE - 1)).toMatchObject({ newWords: DAILY_NEW_WORDS, reviewWords: DAILY_REVIEW_WORDS, goal: DAILY_GOAL, milestoneReached: false });
    expect(getDailyPlanConfig(VOCABULARY_MILESTONE)).toMatchObject({ newWords: ADVANCED_DAILY_NEW_WORDS, reviewWords: ADVANCED_DAILY_REVIEW_WORDS, goal: ADVANCED_DAILY_GOAL, milestoneReached: true });
    const plan = getDailyWordPlan("beginner", new Date(2026, 8, 29), Array.from({ length: VOCABULARY_MILESTONE }, (_, index) => `learned-${index}`));
    expect(plan.newWords.length).toBeLessThanOrEqual(ADVANCED_DAILY_NEW_WORDS);
    expect(plan.reviewWords.length).toBeLessThanOrEqual(ADVANCED_DAILY_REVIEW_WORDS);
  });

  it("reports learned and remaining vocabulary through the 100-word milestone", () => {
    expect(getVocabularyProgress(20)).toEqual({ learned: 20, remaining: 80, percent: 20, milestoneReached: false });
    expect(getVocabularyProgress(125)).toEqual({ learned: 100, remaining: 0, percent: 100, milestoneReached: true });
  });

  it("uses an automatic sequence without waiting for spoken responses", () => {
    expect(AUTO_PLAY_SEQUENCE).toEqual(["preview", "spell", "example"]);
    expect(AUTO_PLAY_SEQUENCE).not.toContain("speak");
  });

  it("allows Chinese translations with four or five characters to finish speaking", () => {
    expect(getSpeechFallbackDuration("好奇的", "zh-TW", 1)).toBeGreaterThanOrEqual(1800);
    expect(getSpeechFallbackDuration("令人屏息的", "zh-TW", 1)).toBeGreaterThan(getSpeechFallbackDuration("好奇的", "zh-TW", 1));
  });

  it("defines the four requested learning stages", () => {
    expect(STAGES.map((stage) => stage.id)).toEqual(["beginner", "intermediate", "advanced", "expert"]);
    expect(STAGES.map((stage) => stage.wordCount)).toEqual([2000, 5000, 9000, 15000]);
    expect(STAGES.map((stage) => stage.description)).toEqual(["國中會考 · 常用字 2,000", "高中學測 · 常用字 5,000", "全民英檢中高階 · 常用字 9,000", "全民英檢高階 · 常用字 15,000"]);
  });

  it("keeps words grouped by stage", () => {
    expect(getQuestionsForStage("beginner").length).toBeGreaterThanOrEqual(10);
    expect(getQuestionsForStage("intermediate").length).toBeGreaterThanOrEqual(10);
    expect(getQuestionsForStage("advanced").length).toBeGreaterThanOrEqual(10);
    expect(getQuestionsForStage("expert").length).toBeGreaterThanOrEqual(10);
    expect(QUESTIONS.every((question) => question.example && question.pronunciation)).toBe(true);
  });

  it("ships the full cumulative vocabulary tiers", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(15000);
    expect(getQuestionsForStage("beginner").length).toBeGreaterThanOrEqual(2000);
    expect(getQuestionsForStage("intermediate").length).toBeGreaterThanOrEqual(3000);
    expect(getQuestionsForStage("advanced").length).toBeGreaterThanOrEqual(4000);
    expect(getQuestionsForStage("expert").length).toBeGreaterThanOrEqual(6000);
  });

  it("can supply twenty new words in the 35-word plan", () => {
    const learnedExpertWords = getQuestionsForStage("expert").slice(0, 15).map((word) => word.word);
    const learnedWords = [...learnedExpertWords, ...Array.from({ length: 85 }, (_, index) => `learned-${index}`)];
    const plan = getDailyWordPlan("expert", new Date(2026, 8, 29), learnedWords);
    expect(plan.newWords).toHaveLength(20);
    expect(plan.reviewWords).toHaveLength(15);
    expect(new Set(plan.newWords.map((word) => word.word)).size).toBe(20);
    expect(new Set(plan.reviewWords.map((word) => word.word)).size).toBe(15);
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
    const afterLearning = getDailyWordPlan("beginner", new Date(2026, 8, 29), ["curious"]);
    expect(afterLearning.reviewWords.map((word) => word.word)).toContain("curious");
    expect(afterLearning.newWords.map((word) => word.word)).not.toContain("curious");
  });

  it("persists a learning record through the storage adapter", async () => {
    const record = { ...DEFAULT_LEARNING_RECORD, todayWords: 3, totalWords: 3, lastDate: new Date().toISOString().slice(0, 10) };
    await saveLearningRecord(record);
    expect(storage.has(LEARNING_STORAGE_KEY)).toBe(true);
    await expect(loadLearningRecord()).resolves.toMatchObject({ todayWords: 3, totalWords: 3 });
  });
});
