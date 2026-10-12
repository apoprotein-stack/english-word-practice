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
};

export const GENERATED_VOCABULARY = vocabularyData as ReadonlyArray<GeneratedVocabularyEntry>;
