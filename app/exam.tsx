import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { averageMastery, loadMastery, masteryLabel, recordMastery } from "@/lib/mastery-storage";
import { QUESTIONS, type Question } from "@/lib/word-practice";
import { recordLearningSession } from "@/lib/learning-storage";

type ExamType = "recognition" | "listening" | "spelling" | "context";
const EXAM_TYPES: ExamType[] = ["recognition", "listening", "spelling", "context"];
const typeLabel: Record<ExamType, string> = { recognition: "英文辨識", listening: "聽音辨字", spelling: "拼字", context: "語境理解" };

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function ExamScreen() {
  const colors = useColors();
  const questions = useMemo(() => shuffle(QUESTIONS).slice(0, Math.min(8, QUESTIONS.length)), []);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finalMastery, setFinalMastery] = useState(0);
  const question = questions[current];
  const type = EXAM_TYPES[current % EXAM_TYPES.length];
  const options = useMemo(() => {
    if (!question) return [];
    if (type === "recognition") return shuffle([question.translation, ...QUESTIONS.filter((item) => item.word !== question.word).slice(0, 3).map((item) => item.translation)]);
    if (type === "listening") return shuffle([question.word, ...QUESTIONS.filter((item) => item.word !== question.word).slice(0, 3).map((item) => item.word)]);
    if (type === "context") return shuffle([question.word, ...QUESTIONS.filter((item) => item.word !== question.word).slice(0, 3).map((item) => item.word)]);
    return [];
  }, [question, type]);

  useEffect(() => {
    if (!question) return;
    setAnswer("");
    setSelected(null);
    setSubmitted(false);
    Speech.stop();
    Speech.speak(question.word, { language: "en-US", rate: type === "listening" ? 0.82 : 0.94 });
  }, [question, type]);

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const expected = type === "recognition" ? question.translation : question.word;
  const currentAnswer = type === "spelling" ? answer.trim().toLowerCase() : selected;
  const isCorrect = currentAnswer?.toLowerCase() === expected.toLowerCase();

  const submit = async () => {
    if (!currentAnswer || submitted) return;
    tap();
    setSubmitted(true);
    if (isCorrect) setScore((value) => value + 1);
    await recordMastery(question.word, type === "recognition" ? "recognition" : type === "listening" ? "listening" : type === "spelling" ? "spelling" : "context", isCorrect);
  };

  const next = async () => {
    tap();
    if (current === questions.length - 1) {
      const finalScore = score + (isCorrect ? 1 : 0);
      await recordLearningSession("考試模式", finalScore, Math.max(1, questions.length));
      const record = await loadMastery();
      setFinalMastery(averageMastery(record));
      setCurrent(questions.length);
      return;
    }
    setCurrent((value) => value + 1);
  };

  if (!question) {
    const shownScore = score;
    return (
      <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
        <View style={styles.result}>
          <View style={[styles.resultIcon, { backgroundColor: `${colors.success}20` }]}><IconSymbol name="checkmark.circle.fill" size={47} color={colors.success} /></View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>EXAM COMPLETE</Text>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>考試完成</Text>
          <Text style={[styles.resultScore, { color: colors.foreground }]}>{shownScore}<Text style={[styles.resultTotal, { color: colors.muted }]}> / {questions.length}</Text></Text>
          <Text style={[styles.resultLabel, { color: colors.primary }]}>{masteryLabel(finalMastery)} · 整體熟練度 {finalMastery}%</Text>
          <Text style={[styles.resultBody, { color: colors.muted }]}>考試會分別記錄英文辨識、聽音、拼字與語境理解能力，之後可用來安排複習。</Text>
          <Pressable onPress={() => { tap(); router.replace("/exam"); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>再考一次</Text></Pressable>
          <Pressable onPress={() => router.replace("/")} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.secondaryText, { color: colors.foreground }]}>回到首頁</Text></Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={24} color={colors.foreground} /></Pressable><View style={styles.headerCenter}><Text style={[styles.eyebrow, { color: colors.error }]}>EXAM MODE</Text><Text style={[styles.headerTitle, { color: colors.foreground }]}>熟練度考試</Text></View><Text style={[styles.counter, { color: colors.muted }]}>{current + 1}/{questions.length}</Text></View>
        <View style={[styles.progress, { backgroundColor: colors.border }]}><View style={[styles.progressFill, { backgroundColor: colors.error, width: `${((current + (submitted ? 1 : 0)) / questions.length) * 100}%` }]} /></View>
        <View style={styles.questionArea}>
          <Text style={[styles.typeBadge, { color: colors.error }]}>{typeLabel[type]}</Text>
          {type === "listening" && <Pressable onPress={() => { tap(); Speech.speak(question.word, { language: "en-US", rate: 0.82 }); }} style={({ pressed }) => [styles.listenButton, { backgroundColor: colors.foreground }, pressed && styles.pressed]}><IconSymbol name="speaker.wave.2.fill" size={24} color="#FFFFFF" /><Text style={styles.listenText}>再播放一次</Text></Pressable>}
          {type === "recognition" && <Text style={[styles.prompt, { color: colors.foreground }]}>這個英文單字的意思是？</Text>}
          {type === "spelling" && <><Text style={[styles.prompt, { color: colors.foreground }]}>請輸入你聽到的單字</Text><Text style={[styles.hint, { color: colors.muted }]}>點擊播放按鈕聽發音</Text><Pressable onPress={() => Speech.speak(question.word, { language: "en-US", rate: 0.82 })} style={({ pressed }) => [styles.replay, { borderColor: colors.border }, pressed && styles.pressed]}><IconSymbol name="speaker.wave.2.fill" size={18} color={colors.primary} /><Text style={[styles.replayText, { color: colors.primary }]}>播放發音</Text></Pressable><TextInput value={answer} onChangeText={setAnswer} autoCapitalize="none" autoCorrect={false} placeholder="輸入英文單字" placeholderTextColor={colors.muted} editable={!submitted} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]} returnKeyType="done" /></>}
          {type === "context" && <><Text style={[styles.prompt, { color: colors.foreground }]}>哪個單字最適合放入這個語境？</Text><View style={[styles.contextCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.contextText, { color: colors.foreground }]}>{question.example.replace(question.word, "_____ ")}</Text><Text style={[styles.hint, { color: colors.muted }]}>{question.definition}</Text></View></>}
          {type === "listening" && <Text style={[styles.prompt, { color: colors.foreground }]}>你聽到的是哪個單字？</Text>}
          {type === "recognition" && <Text style={[styles.wordPrompt, { color: colors.primary }]}>{question.word}</Text>}
          {(type === "recognition" || type === "listening" || type === "context") && <View style={styles.options}>{options.map((item) => { const active = selected === item; const correct = submitted && item.toLowerCase() === expected.toLowerCase(); const wrong = submitted && active && !correct; return <Pressable key={item} disabled={submitted} onPress={() => { tap(); setSelected(item); }} style={({ pressed }) => [styles.option, { backgroundColor: correct ? `${colors.success}18` : wrong ? `${colors.error}18` : active ? `${colors.primary}18` : colors.surface, borderColor: correct ? colors.success : wrong ? colors.error : active ? colors.primary : colors.border }, pressed && styles.pressed]}><Text style={[styles.optionText, { color: correct ? colors.success : wrong ? colors.error : colors.foreground }]}>{item}</Text>{correct && <IconSymbol name="checkmark.circle.fill" size={19} color={colors.success} />}</Pressable>; })}</View>}
          {submitted && <View style={[styles.feedback, { backgroundColor: isCorrect ? `${colors.success}18` : `${colors.error}18` }]}><Text style={[styles.feedbackTitle, { color: isCorrect ? colors.success : colors.error }]}>{isCorrect ? "答對了" : `正確答案：${expected}`}</Text><Text style={[styles.feedbackBody, { color: colors.foreground }]}>{isCorrect ? "這次表現會提升你的熟練度。" : "這個單字會加入後續複習紀錄。"}</Text></View>}
        </View>
        <Pressable disabled={!currentAnswer} onPress={submitted ? next : submit} style={({ pressed }) => [styles.nextButton, { backgroundColor: currentAnswer ? colors.error : colors.border }, pressed && styles.pressed]}><Text style={styles.nextText}>{submitted ? current === questions.length - 1 ? "查看結果" : "下一題" : "提交答案"}</Text><IconSymbol name="arrow.right" size={18} color="#FFFFFF" /></Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 14, paddingBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  headerCenter: { alignItems: "center" },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  headerTitle: { fontSize: 21, fontWeight: "900", marginTop: 2 },
  counter: { width: 42, textAlign: "right", fontSize: 13, fontWeight: "800" },
  progress: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 14 },
  progressFill: { height: "100%", borderRadius: 3 },
  questionArea: { flex: 1, justifyContent: "center", gap: 15 },
  typeBadge: { fontSize: 11, fontWeight: "900", letterSpacing: 1.3 },
  prompt: { fontSize: 24, lineHeight: 31, fontWeight: "900" },
  wordPrompt: { fontSize: 36, fontWeight: "900", marginTop: -3 },
  hint: { fontSize: 13, lineHeight: 19 },
  options: { gap: 10 },
  option: { minHeight: 55, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionText: { fontSize: 15, fontWeight: "700", flex: 1 },
  listenButton: { alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: 17, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  listenText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  replay: { alignSelf: "flex-start", minHeight: 42, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 7 },
  replayText: { fontSize: 13, fontWeight: "800" },
  input: { minHeight: 57, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 17, fontWeight: "700" },
  contextCard: { borderRadius: 17, borderWidth: 1, padding: 17 },
  contextText: { fontSize: 17, lineHeight: 25, fontWeight: "800" },
  feedback: { borderRadius: 16, padding: 14 },
  feedbackTitle: { fontSize: 15, fontWeight: "900" },
  feedbackBody: { fontSize: 12, marginTop: 4 },
  nextButton: { minHeight: 55, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  nextText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  result: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 20 },
  resultIcon: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  resultTitle: { fontSize: 31, fontWeight: "900", marginTop: 7 },
  resultScore: { fontSize: 52, fontWeight: "900", marginTop: 20 },
  resultTotal: { fontSize: 21, fontWeight: "700" },
  resultLabel: { fontSize: 15, fontWeight: "900", marginTop: 3 },
  resultBody: { maxWidth: 300, textAlign: "center", lineHeight: 21, fontSize: 13, marginTop: 15 },
  primaryButton: { width: "100%", minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", marginTop: 28 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  secondaryButton: { width: "100%", minHeight: 48, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 9 },
  secondaryText: { fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
