export type StageId = "beginner" | "intermediate" | "advanced" | "expert";
export const DAILY_NEW_WORDS = 10;
export const DAILY_REVIEW_WORDS = 10;
export const DAILY_GOAL = DAILY_NEW_WORDS + DAILY_REVIEW_WORDS;

export type Stage = { id: StageId; name: string; english: string; description: string; wordCount: number; color: string };

export const STAGES: Stage[] = [
  { id: "beginner", name: "初階", english: "Beginner", description: "國中會考 · 常用字 2,000", wordCount: 2000, color: "#2A9D8F" },
  { id: "intermediate", name: "中階", english: "Intermediate", description: "高中學測 · 常用字 5,000", wordCount: 5000, color: "#E9A23B" },
  { id: "advanced", name: "高階", english: "Advanced", description: "全民英檢中高階 · 常用字 9,000", wordCount: 9000, color: "#E86A54" },
  { id: "expert", name: "專家", english: "Expert", description: "全民英檢高階 · 常用字 15,000", wordCount: 15000, color: "#7D5CBE" },
];

export type Question = {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  translation: string;
  example: string;
  stage: StageId;
};

export const QUESTIONS: Question[] = [
  { word: "curious", pronunciation: "/ˈkjʊəriəs/", partOfSpeech: "adjective", definition: "wanting to know or learn something", translation: "好奇的", example: "Curious learners ask better questions.", stage: "beginner" },
  { word: "journey", pronunciation: "/ˈdʒɜːni/", partOfSpeech: "noun", definition: "an act of travelling from one place to another", translation: "旅程；旅途", example: "Learning English is a rewarding journey.", stage: "beginner" },
  { word: "resilient", pronunciation: "/rɪˈzɪliənt/", partOfSpeech: "adjective", definition: "able to recover quickly from difficulties", translation: "有韌性的", example: "She stayed resilient after missing her flight.", stage: "intermediate" },
  { word: "breathtaking", pronunciation: "/ˈbreθteɪkɪŋ/", partOfSpeech: "adjective", definition: "extremely beautiful or impressive", translation: "令人屏息的", example: "The view from the mountain was breathtaking.", stage: "intermediate" },
  { word: "ambiguous", pronunciation: "/æmˈbɪɡjuəs/", partOfSpeech: "adjective", definition: "having more than one possible meaning", translation: "模稜兩可的", example: "The contract used ambiguous language.", stage: "advanced" },
  { word: "contemplate", pronunciation: "/ˈkɒntəmpleɪt/", partOfSpeech: "verb", definition: "to think carefully about something", translation: "仔細思考", example: "Take time to contemplate your next step.", stage: "advanced" },
  { word: "ephemeral", pronunciation: "/ɪˈfemərəl/", partOfSpeech: "adjective", definition: "lasting for a very short time", translation: "短暫的；瞬息的", example: "Fame can be beautiful but ephemeral.", stage: "expert" },
  { word: "juxtapose", pronunciation: "/ˌdʒʌkstəˈpəʊz/", partOfSpeech: "verb", definition: "to place different things together to compare them", translation: "並置；對照", example: "The exhibit juxtaposes old and new ideas.", stage: "expert" },
];

export function getQuestionsForStage(stage: StageId): Question[] {
  return QUESTIONS.filter((question) => question.stage === stage);
}

export function getDailyWordPlan(stage: StageId, date = new Date(), learnedWords: string[] = []): { newWords: Question[]; reviewWords: Question[] } {
  const pool = getQuestionsForStage(stage);
  if (pool.length === 0) return { newWords: [], reviewWords: [] };
  const dateSeed = Number(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`);
  const offset = dateSeed % pool.length;
  const ordered = pool.slice(offset).concat(pool.slice(0, offset));
  const learned = new Set(learnedWords);
  const newPool = ordered.filter((question) => !learned.has(question.word));
  const reviewPool = ordered.filter((question) => learned.has(question.word));
  return {
    newWords: newPool.slice(0, DAILY_NEW_WORDS),
    reviewWords: reviewPool.slice(0, DAILY_REVIEW_WORDS),
  };
}

export function scoreAnswers(answers: Array<string | null>): number {
  return answers.reduce((score, answer, index) => score + (answer === QUESTIONS[index]?.word ? 1 : 0), 0);
}
