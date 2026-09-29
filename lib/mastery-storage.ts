import AsyncStorage from "@react-native-async-storage/async-storage";

export const MASTERY_STORAGE_KEY = "@wordly/mastery-v1";

export type MasterySkill = "recognition" | "listening" | "spelling" | "context";

export type WordMastery = {
  word: string;
  attempts: number;
  correct: number;
  score: number;
  recognition: number;
  listening: number;
  spelling: number;
  context: number;
  lastReviewedAt: string;
};

export type MasteryRecord = Record<string, WordMastery>;

const EMPTY: MasteryRecord = {};

export async function loadMastery(): Promise<MasteryRecord> {
  try {
    const raw = await AsyncStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as MasteryRecord;
    return parsed && typeof parsed === "object" ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function saveMastery(record: MasteryRecord): Promise<void> {
  await AsyncStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(record));
}

export function masteryLabel(score: number): string {
  if (score >= 90) return "熟練";
  if (score >= 75) return "良好";
  if (score >= 60) return "需要複習";
  return "尚未熟悉";
}

export async function recordMastery(
  word: string,
  skill: MasterySkill,
  isCorrect: boolean,
): Promise<WordMastery> {
  const record = await loadMastery();
  const previous = record[word] ?? {
    word,
    attempts: 0,
    correct: 0,
    score: 0,
    recognition: 0,
    listening: 0,
    spelling: 0,
    context: 0,
    lastReviewedAt: "",
  };
  const attempts = previous.attempts + 1;
  const correct = previous.correct + (isCorrect ? 1 : 0);
  const nextSkillScore = Math.round(
    (previous[skill] * previous.attempts + (isCorrect ? 100 : 0)) / attempts,
  );
  const next: WordMastery = {
    ...previous,
    attempts,
    correct,
    score: Math.round((correct / attempts) * 100),
    [skill]: nextSkillScore,
    lastReviewedAt: new Date().toISOString(),
  };
  await saveMastery({ ...record, [word]: next });
  return next;
}

export function averageMastery(record: MasteryRecord): number {
  const values = Object.values(record);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, item) => total + item.score, 0) / values.length);
}
