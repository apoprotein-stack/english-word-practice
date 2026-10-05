export type StageId = "beginner" | "intermediate" | "advanced" | "expert";
export const DAILY_NEW_WORDS = 10;
export const DAILY_REVIEW_WORDS = 10;
export const DAILY_GOAL = DAILY_NEW_WORDS + DAILY_REVIEW_WORDS;
export const AUTO_PLAY_SEQUENCE = ["preview", "spell", "example"] as const;

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
  { word: "achieve", pronunciation: "/əˈtʃiːv/", partOfSpeech: "verb", definition: "to succeed in doing or getting something", translation: "達成；實現", example: "She worked hard to achieve her goal.", stage: "beginner" },
  { word: "benefit", pronunciation: "/ˈbenɪfɪt/", partOfSpeech: "noun", definition: "an advantage or helpful result", translation: "益處；好處", example: "Daily practice has a clear benefit.", stage: "beginner" },
  { word: "confident", pronunciation: "/ˈkɒnfɪdənt/", partOfSpeech: "adjective", definition: "feeling sure about your ability", translation: "有自信的", example: "He feels confident before the interview.", stage: "beginner" },
  { word: "discover", pronunciation: "/dɪˈskʌvə(r)/", partOfSpeech: "verb", definition: "to find something for the first time", translation: "發現；發掘", example: "We discovered a quiet park nearby.", stage: "beginner" },
  { word: "effort", pronunciation: "/ˈefət/", partOfSpeech: "noun", definition: "the energy used to do something", translation: "努力；心力", example: "Your effort will improve your English.", stage: "beginner" },
  { word: "familiar", pronunciation: "/fəˈmɪliə(r)/", partOfSpeech: "adjective", definition: "well known from experience", translation: "熟悉的", example: "The new word soon became familiar.", stage: "beginner" },
  { word: "improve", pronunciation: "/ɪmˈpruːv/", partOfSpeech: "verb", definition: "to become better or make something better", translation: "改善；進步", example: "Reading can improve your vocabulary.", stage: "beginner" },
  { word: "notice", pronunciation: "/ˈnəʊtɪs/", partOfSpeech: "verb", definition: "to see or become aware of something", translation: "注意到", example: "Did you notice the spelling pattern?", stage: "beginner" },
  { word: "prepare", pronunciation: "/prɪˈpeə(r)/", partOfSpeech: "verb", definition: "to make ready for something", translation: "準備", example: "She prepared for the English test.", stage: "beginner" },
  { word: "resilient", pronunciation: "/rɪˈzɪliənt/", partOfSpeech: "adjective", definition: "able to recover quickly from difficulties", translation: "有韌性的", example: "She stayed resilient after missing her flight.", stage: "intermediate" },
  { word: "breathtaking", pronunciation: "/ˈbreθteɪkɪŋ/", partOfSpeech: "adjective", definition: "extremely beautiful or impressive", translation: "令人屏息的", example: "The view from the mountain was breathtaking.", stage: "intermediate" },
  { word: "accurate", pronunciation: "/ˈækjərət/", partOfSpeech: "adjective", definition: "correct and without mistakes", translation: "準確的", example: "Accurate notes make review easier.", stage: "intermediate" },
  { word: "adapt", pronunciation: "/əˈdæpt/", partOfSpeech: "verb", definition: "to change to suit a new situation", translation: "適應；調整", example: "Good learners adapt their study plan.", stage: "intermediate" },
  { word: "attitude", pronunciation: "/ˈætɪtjuːd/", partOfSpeech: "noun", definition: "the way you think or feel about something", translation: "態度；看法", example: "A positive attitude helps during practice.", stage: "intermediate" },
  { word: "consume", pronunciation: "/kənˈsjuːm/", partOfSpeech: "verb", definition: "to use, eat, or drink something", translation: "消耗；消費", example: "The project consumed most of the budget.", stage: "intermediate" },
  { word: "efficient", pronunciation: "/ɪˈfɪʃənt/", partOfSpeech: "adjective", definition: "working well without wasting time or resources", translation: "有效率的", example: "This is an efficient way to review words.", stage: "intermediate" },
  { word: "estimate", pronunciation: "/ˈestɪmeɪt/", partOfSpeech: "verb", definition: "to make a careful guess about an amount", translation: "估計；估算", example: "Can you estimate the travel time?", stage: "intermediate" },
  { word: "maintain", pronunciation: "/meɪnˈteɪn/", partOfSpeech: "verb", definition: "to keep something at the same level or condition", translation: "維持；保養", example: "Short reviews maintain long-term memory.", stage: "intermediate" },
  { word: "obvious", pronunciation: "/ˈɒbviəs/", partOfSpeech: "adjective", definition: "easy to see or understand", translation: "明顯的", example: "The answer became obvious after the example.", stage: "intermediate" },
  { word: "respond", pronunciation: "/rɪˈspɒnd/", partOfSpeech: "verb", definition: "to answer or react to something", translation: "回應；反應", example: "Please respond in a complete sentence.", stage: "intermediate" },
  { word: "ambiguous", pronunciation: "/æmˈbɪɡjuəs/", partOfSpeech: "adjective", definition: "having more than one possible meaning", translation: "模稜兩可的", example: "The contract used ambiguous language.", stage: "advanced" },
  { word: "contemplate", pronunciation: "/ˈkɒntəmpleɪt/", partOfSpeech: "verb", definition: "to think carefully about something", translation: "仔細思考", example: "Take time to contemplate your next step.", stage: "advanced" },
  { word: "coherent", pronunciation: "/kəʊˈhɪərənt/", partOfSpeech: "adjective", definition: "clear and logically connected", translation: "連貫的；有條理的", example: "She gave a coherent explanation.", stage: "advanced" },
  { word: "derive", pronunciation: "/dɪˈraɪv/", partOfSpeech: "verb", definition: "to get something from a source", translation: "取得；源自", example: "Many words derive from older languages.", stage: "advanced" },
  { word: "diminish", pronunciation: "/dɪˈmɪnɪʃ/", partOfSpeech: "verb", definition: "to become or make something smaller or less", translation: "減少；削弱", example: "Regular practice can diminish test anxiety.", stage: "advanced" },
  { word: "evaluate", pronunciation: "/ɪˈvæljueɪt/", partOfSpeech: "verb", definition: "to judge the quality or value of something", translation: "評估；評價", example: "Teachers evaluate progress over time.", stage: "advanced" },
  { word: "implicit", pronunciation: "/ɪmˈplɪsɪt/", partOfSpeech: "adjective", definition: "suggested without being directly stated", translation: "含蓄的；暗示的", example: "The message contained an implicit warning.", stage: "advanced" },
  { word: "inevitable", pronunciation: "/ɪnˈevɪtəbl/", partOfSpeech: "adjective", definition: "certain to happen", translation: "不可避免的", example: "Mistakes are inevitable when learning.", stage: "advanced" },
  { word: "justify", pronunciation: "/ˈdʒʌstɪfaɪ/", partOfSpeech: "verb", definition: "to give a good reason for something", translation: "證明合理；辯護", example: "Can you justify your conclusion?", stage: "advanced" },
  { word: "subsequent", pronunciation: "/ˈsʌbsɪkwənt/", partOfSpeech: "adjective", definition: "happening after something else", translation: "隨後的；後來的", example: "Subsequent lessons build on this idea.", stage: "advanced" },
  { word: "ephemeral", pronunciation: "/ɪˈfemərəl/", partOfSpeech: "adjective", definition: "lasting for a very short time", translation: "短暫的；瞬息的", example: "Fame can be beautiful but ephemeral.", stage: "expert" },
  { word: "juxtapose", pronunciation: "/ˌdʒʌkstəˈpəʊz/", partOfSpeech: "verb", definition: "to place different things together to compare them", translation: "並置；對照", example: "The exhibit juxtaposes old and new ideas.", stage: "expert" },
  { word: "ameliorate", pronunciation: "/əˈmiːliəreɪt/", partOfSpeech: "verb", definition: "to make a difficult situation better", translation: "改善；緩和", example: "The policy aims to ameliorate inequality.", stage: "expert" },
  { word: "circumstantial", pronunciation: "/ˌsɜːkəmˈstænʃəl/", partOfSpeech: "adjective", definition: "related to the conditions of a situation", translation: "情況的；環境造成的", example: "The evidence was circumstantial rather than direct.", stage: "expert" },
  { word: "conundrum", pronunciation: "/kəˈnʌndrəm/", partOfSpeech: "noun", definition: "a confusing and difficult problem", translation: "難題；困境", example: "The team faced a complex ethical conundrum.", stage: "expert" },
  { word: "disseminate", pronunciation: "/dɪˈsemɪneɪt/", partOfSpeech: "verb", definition: "to spread information widely", translation: "傳播；散布", example: "The report helps disseminate reliable information.", stage: "expert" },
  { word: "exacerbate", pronunciation: "/ɪɡˈzæsəbeɪt/", partOfSpeech: "verb", definition: "to make a problem or situation worse", translation: "加劇；惡化", example: "Poor communication may exacerbate the conflict.", stage: "expert" },
  { word: "meticulous", pronunciation: "/məˈtɪkjələs/", partOfSpeech: "adjective", definition: "very careful about details", translation: "一絲不苟的；細心的", example: "Her meticulous research impressed the panel.", stage: "expert" },
  { word: "nuanced", pronunciation: "/ˈnjuːɑːnst/", partOfSpeech: "adjective", definition: "showing subtle differences or meanings", translation: "細膩的；有微妙差異的", example: "The article offers a nuanced analysis.", stage: "expert" },
  { word: "pragmatic", pronunciation: "/præɡˈmætɪk/", partOfSpeech: "adjective", definition: "dealing with problems in a practical way", translation: "務實的；實用的", example: "They reached a pragmatic compromise.", stage: "expert" },
  { word: "ubiquitous", pronunciation: "/juːˈbɪkwɪtəs/", partOfSpeech: "adjective", definition: "present or found everywhere", translation: "無所不在的", example: "Digital devices are ubiquitous in modern life.", stage: "expert" },
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
