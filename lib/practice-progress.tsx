import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "listenloop.practice-progress.v1";

export type PracticeRecord = {
  date: string;
  lessonId: string;
  score: number;
  completedAt: string;
  answers?: { reason: string; result: string };
};

type StoredProgress = {
  streak: number;
  lastCompletedDate: string | null;
  records: Record<string, PracticeRecord>;
};

type PracticeProgressContextValue = StoredProgress & {
  hydrated: boolean;
  completedToday: boolean;
  todayRecord: PracticeRecord | null;
  markComplete: (lessonId: string, score: number, answers: { reason: string; result: string }) => Promise<void>;
};

const emptyProgress: StoredProgress = {
  streak: 0,
  lastCompletedDate: null,
  records: {},
};

const ProgressContext = createContext<PracticeProgressContextValue | null>(null);

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

export function PracticeProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<StoredProgress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!active) return;
        if (value) {
          try {
            const parsed = JSON.parse(value) as Partial<StoredProgress>;
            setProgress({
              streak: typeof parsed.streak === "number" ? parsed.streak : 0,
              lastCompletedDate: parsed.lastCompletedDate ?? null,
              records: parsed.records ?? {},
            });
          } catch {
            setProgress(emptyProgress);
          }
        }
      })
      .catch(() => setProgress(emptyProgress))
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch(() => {
      // Local persistence is best-effort; the in-memory state remains usable.
    });
  }, [hydrated, progress]);

  const value = useMemo<PracticeProgressContextValue>(() => {
    const today = localDateKey();
    return {
      ...progress,
      hydrated,
      completedToday: Boolean(progress.records[today]),
      todayRecord: progress.records[today] ?? null,
      markComplete: async (lessonId, score, answers) => {
        const date = localDateKey();
        setProgress((current) => {
          const existing = current.records[date];
          if (existing?.answers) return current;
          if (existing) {
            return {
              ...current,
              records: {
                ...current.records,
                [date]: { ...existing, score, answers },
              },
            };
          }
          const nextStreak = current.lastCompletedDate === previousDateKey(date)
            ? current.streak + 1
            : 1;
          return {
            streak: nextStreak,
            lastCompletedDate: date,
            records: {
              ...current.records,
              [date]: { date, lessonId, score, answers, completedAt: new Date().toISOString() },
            },
          };
        });
      },
    };
  }, [hydrated, progress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function usePracticeProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("usePracticeProgress must be used inside PracticeProgressProvider");
  return context;
}
