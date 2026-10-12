import { describe, expect, it } from "vitest";

import { splitSyllables } from "../lib/syllables";

describe("splitSyllables", () => {
  it.each([
    ["breathtaking", "breath·tak·ing"],
    ["achieve", "a·chieve"],
    ["about", "a·bout"],
    ["table", "ta·ble"],
    ["little", "lit·tle"],
    ["pollution", "pol·lu·tion"],
    ["beautiful", "beau·ti·ful"],
    ["prepare", "pre·pare"],
    ["juxtapose", "jux·ta·pose"],
    ["wanted", "want·ed"],
  ])("splits %s", (word, expected) => {
    expect(splitSyllables(word).join("·")).toBe(expected);
  });

  it("keeps one-syllable words whole, including silent endings", () => {
    expect(splitSyllables("the")).toEqual(["the"]);
    expect(splitSyllables("smile")).toEqual(["smile"]);
    expect(splitSyllables("topped")).toEqual(["topped"]);
    expect(splitSyllables("makes")).toEqual(["makes"]);
  });

  it("always reassembles to the original word", () => {
    for (const word of ["resilient", "ubiquitous", "Ephemeral", "circumstantial", "rhythm", "queen"]) {
      expect(splitSyllables(word).join("")).toBe(word);
    }
  });
});
