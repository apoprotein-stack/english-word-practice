import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { localDateKey, localDayNumber, previousDateKey, weekStartKey } from "../lib/date-keys";
import { incrementTodayWord, loadLearningRecord, recordLearningSession } from "../lib/learning-storage";
import { getDailyWordPlan } from "../lib/word-practice";

const storage = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => storage.get(key) ?? null,
    setItem: async (key: string, value: string) => { storage.set(key, value); },
  },
}));

beforeEach(() => {
  storage.clear();
  vi.useFakeTimers();
});

afterEach(() => vi.useRealTimers());

// Local-time constructor: month is zero-based.
const at = (year: number, month: number, day: number, hour = 12) => vi.setSystemTime(new Date(year, month - 1, day, hour));

describe("date keys", () => {
  it("uses the local calendar date, not UTC", () => {
    expect(localDateKey(new Date(2026, 9, 12, 0, 30))).toBe("2026-10-12");
    expect(localDateKey(new Date(2026, 9, 12, 23, 30))).toBe("2026-10-12");
  });

  it("steps back across month and year boundaries", () => {
    expect(previousDateKey("2026-03-01")).toBe("2026-02-28");
    expect(previousDateKey("2027-01-01")).toBe("2026-12-31");
  });

  it("finds the Monday of the week", () => {
    expect(weekStartKey("2026-10-12")).toBe("2026-10-12");
    expect(weekStartKey("2026-10-18")).toBe("2026-10-12");
    expect(weekStartKey("2026-10-19")).toBe("2026-10-19");
  });

  it("gives every day a distinct number", () => {
    expect(localDayNumber(new Date(2026, 0, 12))).not.toBe(localDayNumber(new Date(2026, 10, 2)));
    expect(localDayNumber(new Date(2026, 9, 13)) - localDayNumber(new Date(2026, 9, 12))).toBe(1);
  });
});

describe("daily word plan seed", () => {
  it("does not repeat the same order on dates whose digits concatenate identically", () => {
    const jan12 = getDailyWordPlan("expert", new Date(2026, 0, 12)).newWords.map((word) => word.word);
    const nov2 = getDailyWordPlan("expert", new Date(2026, 10, 2)).newWords.map((word) => word.word);
    expect(jan12).not.toEqual(nov2);
  });
});

describe("learning record streak", () => {
  it("increases on consecutive days and stays put within a day", async () => {
    at(2026, 10, 12);
    expect((await incrementTodayWord()).streak).toBe(1);
    expect((await incrementTodayWord()).streak).toBe(1);
    at(2026, 10, 13);
    expect((await recordLearningSession("初階", 5)).streak).toBe(2);
    at(2026, 10, 14);
    expect((await incrementTodayWord()).streak).toBe(3);
  });

  it("shows zero after a missed day and restarts at one", async () => {
    at(2026, 10, 12);
    await incrementTodayWord();
    at(2026, 10, 14);
    expect((await loadLearningRecord()).streak).toBe(0);
    expect((await incrementTodayWord()).streak).toBe(1);
  });

  it("rolls the day over at local midnight", async () => {
    at(2026, 10, 12, 23);
    await incrementTodayWord();
    expect((await loadLearningRecord()).todayWords).toBe(1);
    at(2026, 10, 13, 0);
    expect((await loadLearningRecord()).todayWords).toBe(0);
  });
});

describe("learning record weekly counts", () => {
  it("keeps counts within the week and clears them in a new week", async () => {
    at(2026, 10, 12);
    await recordLearningSession("初階", 4);
    at(2026, 10, 18);
    await recordLearningSession("初階", 3);
    const sameWeek = await loadLearningRecord();
    expect(sameWeek.weekly).toEqual([4, 0, 0, 0, 0, 0, 3]);
    at(2026, 10, 19);
    expect((await loadLearningRecord()).weekly).toEqual([0, 0, 0, 0, 0, 0, 0]);
    await recordLearningSession("初階", 2);
    expect((await loadLearningRecord()).weekly).toEqual([2, 0, 0, 0, 0, 0, 0]);
  });

  it("clears legacy weekly counts from an earlier week", async () => {
    storage.set("@wordly/learning-record-v1", JSON.stringify({ weekly: [5, 5, 5, 5, 5, 5, 5], lastDate: "2026-10-01", streak: 4 }));
    at(2026, 10, 12);
    const record = await loadLearningRecord();
    expect(record.weekly).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(record.streak).toBe(0);
  });
});
