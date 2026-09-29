import { beforeEach, describe, expect, it, vi } from "vitest";

import { averageMastery, loadMastery, masteryLabel, MASTERY_STORAGE_KEY, recordMastery } from "../lib/mastery-storage";

const storage = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => storage.get(key) ?? null,
    setItem: async (key: string, value: string) => { storage.set(key, value); },
  },
}));

beforeEach(() => storage.clear());

describe("mastery storage", () => {
  it("records correct and incorrect answers with a running score", async () => {
    await recordMastery("curious", "recognition", true);
    const second = await recordMastery("curious", "recognition", false);
    expect(second.attempts).toBe(2);
    expect(second.correct).toBe(1);
    expect(second.score).toBe(50);
    expect(storage.has(MASTERY_STORAGE_KEY)).toBe(true);
  });

  it("keeps skill scores separate", async () => {
    await recordMastery("journey", "listening", true);
    const result = await recordMastery("journey", "spelling", false);
    expect(result.listening).toBe(100);
    expect(result.spelling).toBe(0);
  });

  it("labels and averages mastery", async () => {
    await recordMastery("curious", "recognition", true);
    await recordMastery("journey", "recognition", false);
    const record = await loadMastery();
    expect(averageMastery(record)).toBe(50);
    expect(masteryLabel(90)).toBe("熟練");
    expect(masteryLabel(70)).toBe("需要複習");
  });
});
