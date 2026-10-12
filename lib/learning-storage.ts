import AsyncStorage from "@react-native-async-storage/async-storage";

import { localDateKey, previousDateKey, weekStartKey } from "./date-keys";
import { getDailyPlanConfig, MAX_DAILY_GOAL } from "./word-practice";

export const LEARNING_STORAGE_KEY = "@wordly/learning-record-v1";

export type LearningSession = {
  id: string;
  date: string;
  label: string;
  words: number;
  minutes: number;
};

export type LearningRecord = {
  todayWords: number;
  totalWords: number;
  streak: number;
  /** Local date (YYYY-MM-DD) of the last study activity. */
  lastDate: string | null;
  /** Monday (YYYY-MM-DD) of the week that `weekly` counts belong to. */
  weekStart: string | null;
  weekly: number[];
  sessions: LearningSession[];
  learnedWords: string[];
};

export const DEFAULT_LEARNING_RECORD: LearningRecord = {
  todayWords: 0,
  totalWords: 0,
  streak: 0,
  lastDate: null,
  weekStart: null,
  weekly: [0, 0, 0, 0, 0, 0, 0],
  sessions: [],
  learnedWords: [],
};

const dayIndex = () => (new Date().getDay() + 6) % 7;

function normalizeRecord(value: Partial<LearningRecord>): LearningRecord {
  return {
    ...DEFAULT_LEARNING_RECORD,
    ...value,
    todayWords: Math.max(0, Math.min(Number(value.todayWords) || 0, MAX_DAILY_GOAL)),
    totalWords: Math.max(0, Number(value.totalWords) || 0),
    streak: Math.max(0, Number(value.streak) || 0),
    lastDate: typeof value.lastDate === "string" ? value.lastDate : null,
    weekStart: typeof value.weekStart === "string" ? value.weekStart : null,
    weekly: Array.isArray(value.weekly) && value.weekly.length === 7 ? value.weekly.map((item) => Math.max(0, Number(item) || 0)) : [...DEFAULT_LEARNING_RECORD.weekly],
    sessions: Array.isArray(value.sessions) ? value.sessions.slice(0, 20) : [],
    learnedWords: Array.isArray(value.learnedWords) ? [...new Set(value.learnedWords.filter((word): word is string => typeof word === "string"))] : [],
  };
}

/** Resets per-day and per-week counters when the stored record belongs to an earlier day or week. */
function rollOver(record: LearningRecord, today: string): LearningRecord {
  const currentWeek = weekStartKey(today);
  const recordWeek = record.weekStart ?? (record.lastDate ? weekStartKey(record.lastDate) : null);
  const activeRecently = record.lastDate === today || record.lastDate === previousDateKey(today);
  return {
    ...record,
    todayWords: record.lastDate === today ? record.todayWords : 0,
    streak: activeRecently ? record.streak : 0,
    weekStart: currentWeek,
    weekly: recordWeek === currentWeek ? record.weekly : [...DEFAULT_LEARNING_RECORD.weekly],
  };
}

function nextStreak(record: LearningRecord, today: string): number {
  if (record.lastDate === today) return Math.max(record.streak, 1);
  if (record.lastDate === previousDateKey(today)) return record.streak + 1;
  return 1;
}

export async function loadLearningRecord(): Promise<LearningRecord> {
  try {
    const raw = await AsyncStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) return rollOver(DEFAULT_LEARNING_RECORD, localDateKey());
    const parsed = JSON.parse(raw) as Partial<LearningRecord>;
    const record = normalizeRecord(parsed);
    return rollOver(record, localDateKey());
  } catch {
    return DEFAULT_LEARNING_RECORD;
  }
}

export async function saveLearningRecord(record: LearningRecord): Promise<void> {
  await AsyncStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(normalizeRecord(record)));
}

export async function incrementTodayWord(): Promise<LearningRecord> {
  const current = await loadLearningRecord();
  const today = localDateKey();
  const dailyGoal = getDailyPlanConfig(current.learnedWords.length).goal;
  const next = {
    ...current,
    todayWords: Math.min(current.todayWords + 1, dailyGoal),
    totalWords: current.totalWords + 1,
    lastDate: today,
    streak: nextStreak(current, today),
  };
  await saveLearningRecord(next);
  return next;
}

export async function recordLearningSession(stageName: string, words: number, minutes = Math.max(1, words * 2), learnedWords: string[] = []): Promise<LearningRecord> {
  const current = await loadLearningRecord();
  const date = localDateKey();
  const dailyGoal = getDailyPlanConfig(current.learnedWords.length).goal;
  const next = {
    ...current,
    todayWords: Math.min(current.todayWords + words, dailyGoal),
    totalWords: current.totalWords + words,
    streak: nextStreak(current, date),
    lastDate: date,
    weekly: current.weekly.map((count, index) => index === dayIndex() ? count + words : count),
    sessions: [{ id: `${Date.now()}-${stageName}`, date: "今天", label: `${stageName} · 導讀練習`, words, minutes }, ...current.sessions].slice(0, 20),
    learnedWords: [...new Set([...current.learnedWords, ...learnedWords])],
  };
  await saveLearningRecord(next);
  return next;
}
