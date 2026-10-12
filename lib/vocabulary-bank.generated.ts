/** Generated from the public wordfreq and ECDICT sources. Do not edit manually. */

// Keep the large offline bank as JSON so the TypeScript compiler does not expand
// 15,000 object literals into an enormous union type during type checking.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vocabularyData: unknown = require("../data/vocabulary-bank.json");

export type GeneratedVocabularyEntry = {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  translation: string;
  example: string;
  stage: "beginner" | "intermediate" | "advanced" | "expert";
  cefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  topic: "everyday" | "academic" | "travel" | "work" | "education" | "technology" | "health" | "nature" | "society";
};

export const GENERATED_VOCABULARY = vocabularyData as ReadonlyArray<GeneratedVocabularyEntry>;
