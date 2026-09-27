import { describe, expect, it } from "vitest";

import { LESSONS, getDailyLesson } from "../lib/lesson-data";

describe("daily lesson rotation", () => {
  it("contains a complete 30-day lesson bank with four levels", () => {
    expect(LESSONS).toHaveLength(30);
    expect(new Set(LESSONS.map((lesson) => lesson.id)).size).toBe(30);
    expect(new Set(LESSONS.map((lesson) => lesson.day)).size).toBe(30);
    expect(new Set(LESSONS.map((lesson) => lesson.difficulty))).toEqual(new Set(["simple", "medium", "advanced", "professional"]));
  });

  it("selects the correct lesson by local calendar date", () => {
    expect(getDailyLesson(new Date(2026, 8, 25)).id).toBe("morning-routine-day-1");
    expect(getDailyLesson(new Date(2026, 8, 26)).id).toBe("coffee-shop-order-day-2");
    expect(getDailyLesson(new Date(2026, 8, 27)).id).toBe("weekend-hike-day-3");
    expect(getDailyLesson(new Date(2026, 8, 27), "professional").difficulty).toBe("professional");
  });

  it("continues cycling through the selected difficulty pool", () => {
    expect(getDailyLesson(new Date(2026, 9, 24)).id).toBe("movie-night-day-6");
  });
});
