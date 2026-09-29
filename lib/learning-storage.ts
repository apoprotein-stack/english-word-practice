import AsyncStorage from "@react-native-async-storage/async-storage";

import { DAILY_GOAL } from "./word-practice";

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
  lastDate: string | null;
  weekly: number[];
  sessions: LearningSession[];
  learnedWords: string[];
};

export const DEFAULT_LEARNING_RECORD: LearningRecord = {
  todayWords: 0,
  totalWords: 0,
  streak: 0,
  lastDate: null,
  weekly: [0, 0, 0, 0, 0, 0, 0],
  sessions: [],
  learnedWords: [],
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const dayIndex = () => (new Date().getDay() + 6) % 7;

function normalizeRecord(value: Partial<LearningRecord>): LearningRecord {
  return {
    ...DEFAULT_LEARNING_RECORD,
    ...value,
    todayWords: Math.max(0, Math.min(Number(value.todayWords) || 0, DAILY_GOAL)),
    totalWords: Math.max(0, Number(value.totalWords) || 0),
    streak: Math.max(0, Number(value.streak) || 0),
    weekly: Array.isArray(value.weekly) && value.weekly.length === 7 ? value.weekly.map((item) => Math.max(0, Number(item) || 0)) : [...DEFAULT_LEARNING_RECORD.weekly],
    sessions: Array.isArray(value.sessions) ? value.sessions.slice(0, 20) : [],
    learnedWords: Array.isArray(value.learnedWords) ? [...new Set(value.learnedWords.filter((word): word is string => typeof word === "string"))] : [],
  };
}

export async function loadLearningRecord(): Promise<LearningRecord> {
  try {
    const raw = await AsyncStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) return DEFAULT_LEARNING_RECORD;
    const parsed = JSON.parse(raw) as Partial<LearningRecord>;
    const record = normalizeRecord(parsed);
    if (record.lastDate !== todayKey()) {
      return { ...record, todayWords: 0, lastDate: todayKey() };
    }
    return record;
  } catch {
    return DEFAULT_LEARNING_RECORD;
  }
}

export async function saveLearningRecord(record: LearningRecord): Promise<void> {
  await AsyncStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(normalizeRecord(record)));
}

export async function incrementTodayWord(): Promise<LearningRecord> {
  const current = await loadLearningRecord();
  const next = {
    ...current,
    todayWords: Math.min(current.todayWords + 1, DAILY_GOAL),
    totalWords: current.totalWords + 1,
    lastDate: todayKey(),
    streak: current.streak || 1,
  };
  await saveLearningRecord(next);
  return next;
}

export async function recordLearningSession(stageName: string, words: number, minutes = Math.max(1, words * 2), learnedWords: string[] = []): Promise<LearningRecord> {
  const current = await loadLearningRecord();
  const date = todayKey();
  const next = {
    ...current,
    todayWords: Math.min(current.todayWords + words, DAILY_GOAL),
    totalWords: current.totalWords + words,
    streak: current.streak || 1,
    lastDate: date,
    weekly: current.weekly.map((count, index) => index === dayIndex() ? count + words : count),
    sessions: [{ id: `${Date.now()}-${stageName}`, date: "今天", label: `${stageName} · 導讀練習`, words, minutes }, ...current.sessions].slice(0, 20),
    learnedWords: [...new Set([...current.learnedWords, ...learnedWords])],
  };
  await saveLearningRecord(next);
  return next;
}
