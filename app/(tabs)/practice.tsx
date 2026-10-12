import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { loadLearningRecord, recordLearningSession } from "@/lib/learning-storage";
import { recordMastery } from "@/lib/mastery-storage";
import { getDailyPlanConfig, getDailyWordPlan, getSpeechFallbackDuration, STAGES, type StageId } from "@/lib/word-practice";

type Phase = "preview" | "spell" | "example";
const PHASES: Phase[] = ["preview", "spell", "example"];

export default function PracticeScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ stage?: string; mode?: string }>();
  const stageId = (typeof params.stage === "string" ? params.stage : "beginner") as StageId;
  const autoMode = true;
  const stage = STAGES.find((item) => item.id === stageId) ?? STAGES[0];
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const dailyConfig = getDailyPlanConfig(learnedWords.length);
  const dailyPlan = useMemo(() => getDailyWordPlan(stage.id, new Date(), learnedWords), [stage.id, learnedWords]);
  const words = useMemo(() => [...dailyPlan.newWords, ...dailyPlan.reviewWords], [dailyPlan]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("preview");
  const question = words[current];
  const finished = !question;
  const phaseIndex = PHASES.indexOf(phase);
  const isReviewWord = current >= dailyPlan.newWords.length;


  useEffect(() => {
    loadLearningRecord().then((record) => setLearnedWords(record.learnedWords));
  }, []);

  const tap = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") Haptics.impactAsync(style);
  };

  const advanceToNextWord = async () => {
    if (!question) return;
    await recordMastery(question.word, "context", true);
    if (current === words.length - 1) void recordLearningSession(stage.name, words.length, undefined, words.map((item) => item.word));
    setCurrent((value) => value + 1);
    setPhase("preview");
  };

  useEffect(() => {
    if (!question) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    Speech.stop();

    const speakWithFallback = (text: string, options: Speech.SpeechOptions, onDone: () => void) => {
      let completed = false;
      const finish = () => {
        if (completed || cancelled) return;
        completed = true;
        if (timer) clearTimeout(timer);
        onDone();
      };
      Speech.speak(text, { ...options, onDone: finish, onError: finish });
      if (autoMode) {
        const estimatedMs = getSpeechFallbackDuration(text, options.language, options.rate);
        timer = setTimeout(finish, estimatedMs);
      }
    };

    const speakSpellingWithFallback = (word: string, rate: number, onDone: () => void) => {
      const letters = Array.from(word);
      let index = 0;

      const playNextLetter = () => {
        if (cancelled) return;
        if (index >= letters.length) {
          // Give the final utterance a short quiet gap before saying the whole word.
          timer = setTimeout(onDone, 180);
          return;
        }

        const letter = letters[index++];
        let completed = false;
        const finishLetter = () => {
          if (completed || cancelled) return;
          completed = true;
          if (timer) clearTimeout(timer);
          Speech.stop();
          // A brief gap prevents browser speechSynthesis from merging or dropping
          // the final letters when individual utterances are queued too quickly.
          timer = setTimeout(playNextLetter, 120);
        };

        Speech.speak(letter, {
          language: "en-US",
          rate,
          volume: 1,
          onDone: finishLetter,
          onError: finishLetter,
        });
        // Keep progressing even when a browser does not emit onDone/onError.
        timer = setTimeout(finishLetter, Math.max(1400, Math.round(1900 / rate)));
      };

      playNextLetter();
    };

    if (phase === "preview") {
      // 自動播放模式會依序朗讀英文、中文，再進入拼讀，不等待使用者回應。
      speakWithFallback(question.word, {
        language: "en-US",
        rate: 0.98,
        volume: 1,
      }, () => {
          if (cancelled) return;
          speakWithFallback(question.translation, { language: "zh-TW", rate: 1, volume: 1 }, () => { if (!cancelled) setPhase("spell"); });
      });
    } else if (phase === "spell") {
      // 自動逐字母拼讀，完成後再播放完整單字；自動播放模式直接進入例句。
      speakSpellingWithFallback(question.word, autoMode ? 0.98 : 0.88, () => {
          if (cancelled) return;
          speakWithFallback(question.word, {
            language: "en-US",
            rate: 0.98,
            volume: 1,
          }, () => {
              if (!cancelled) setPhase("example");
          });
      });
    } else if (phase === "example") {
      speakWithFallback(question.example, {
        language: "en-US",
        rate: 0.9,
        volume: 1,
      }, () => {
          if (cancelled) return;
          timer = setTimeout(() => { void advanceToNextWord(); }, 850);
      });
    }

    return () => {
      cancelled = true;
      Speech.stop();
      if (timer) clearTimeout(timer);
    };
  }, [current, phase, autoMode]);

  useEffect(() => () => { Speech.stop(); }, []);

  if (finished) {
    return (
      <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
        <View style={styles.finished}>
          <View style={[styles.finishIcon, { backgroundColor: `${colors.success}20` }]}><IconSymbol name="checkmark.circle.fill" size={46} color={colors.success} /></View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>LEVEL COMPLETE</Text>
          <Text style={[styles.finishTitle, { color: colors.foreground }]}>{stage.name}學習完成</Text>
          <Text style={[styles.finishBody, { color: colors.muted }]}>你已完成自動導讀、拼讀與例句三個步驟。</Text>
          <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryNumber, { color: colors.foreground }]}>{words.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>{stage.english} · 目標常用字 {stage.wordCount.toLocaleString()}</Text>
          </View>
          <Pressable onPress={() => { tap(); setCurrent(0); setPhase("preview"); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="arrow.clockwise" size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>再練習一次</Text></Pressable>
          <Pressable onPress={() => router.replace("/")} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>回到今日首頁</Text></Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const phaseTitle = phase === "preview" ? "自動導讀" : phase === "spell" ? "自動拼讀" : "自動例句";
  const buttonLabel = "自動播放中 · 進行中";

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={24} color={colors.foreground} /></Pressable>
          <View style={styles.headerCenter}><Text style={[styles.headerEyebrow, { color: stage.color }]}>{stage.name} · {stage.english.toUpperCase()}</Text><Text style={[styles.headerCount, { color: colors.foreground }]}>{current + 1} <Text style={{ color: colors.muted }}>/ {words.length}</Text></Text></View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressTrackFill, { backgroundColor: stage.color, width: `${((current + phaseIndex / PHASES.length) / words.length) * 100}%` }]} /></View>
        <View style={styles.phaseRow}>{PHASES.map((item, index) => <View key={item} style={styles.phaseItem}><View style={[styles.phaseDot, { backgroundColor: index <= phaseIndex ? stage.color : colors.border }]} /><Text style={[styles.phaseText, { color: index === phaseIndex ? colors.foreground : colors.muted }]}>{index + 1}. {item === "preview" ? "導讀" : item === "spell" ? "拼讀" : "例句"}</Text></View>)}</View>
        {autoMode && <View style={[styles.autoBadge, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}45` }]}><IconSymbol name="play.circle.fill" size={15} color={colors.primary} /><Text style={[styles.autoBadgeText, { color: colors.primary }]}>自動播放中 · 不等待回應</Text></View>}

        <View style={styles.learningArea}>
          <Text style={[styles.phaseEyebrow, { color: colors.muted }]}>{isReviewWord ? `複習單字 ${current - dailyPlan.newWords.length + 1}/${dailyConfig.reviewWords}` : `新單字 ${current + 1}/${dailyConfig.newWords}`} · {phaseTitle.toUpperCase()}</Text>
          <View style={[styles.wordCard, { backgroundColor: "#203247", borderColor: stage.color }]}>
            <View style={styles.cardOrb} />
            <Text style={styles.word}>{question.word}</Text>
            <Text style={styles.pronunciation}>{question.pronunciation}</Text>
            <Text style={styles.cardTranslation}>中文對照：{question.translation}</Text>
            <Text style={styles.partOfSpeech}>{question.partOfSpeech.toUpperCase()} · DICTIONARY REFERENCE</Text>
          </View>

          {phase === "preview" && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.definition, { color: colors.foreground }]}>{question.definition}</Text><Text style={[styles.translation, { color: colors.muted }]}>{question.translation}</Text><Text style={[styles.source, { color: colors.primary }]}>詞義參照：ECDICT 英漢資料庫＋精選 Longman 內容</Text></View>}
          {phase === "spell" && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.spellLabel, { color: colors.muted }]}>自動拼讀示範</Text><Text style={[styles.spelling, { color: colors.foreground }]}>{question.word.split("").join(" · ")}</Text><Text style={[styles.spellHint, { color: colors.muted }]}>請聽逐字母拼讀，接著會再播放一次完整單字。</Text></View>}
          {phase === "example" && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.exampleLabel, { color: colors.primary }]}>IN CONTEXT</Text><Text style={[styles.example, { color: colors.foreground }]}>{question.example}</Text><Text style={[styles.translation, { color: colors.muted }]}>把這個單字放進真實語境裡記住它。</Text></View>}
        </View>

        <Pressable disabled style={({ pressed }) => [styles.nextButton, { backgroundColor: stage.color, opacity: 0.55 }, pressed && styles.pressed]}><Text style={styles.nextButtonText}>{buttonLabel}</Text><IconSymbol name="play.circle.fill" size={18} color="#FFFFFF" /></Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 14, paddingBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center" },
  headerEyebrow: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" },
  headerCount: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  headerSpacer: { width: 42 },
  progressTrack: { height: 6, borderRadius: 3, marginTop: 14, overflow: "hidden" },
  progressTrackFill: { height: "100%", borderRadius: 3 },
  phaseRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  phaseItem: { alignItems: "center", gap: 5 },
  phaseDot: { width: 8, height: 8, borderRadius: 4 },
  phaseText: { fontSize: 10, fontWeight: "700" },
  autoBadge: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 14, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 6, marginTop: 10 },
  autoBadgeText: { fontSize: 11, fontWeight: "900" },
  learningArea: { flex: 1, justifyContent: "center", gap: 14 },
  phaseEyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.3 },
  wordCard: { minHeight: 162, borderRadius: 24, borderWidth: 2, padding: 23, justifyContent: "center", overflow: "hidden" },
  cardOrb: { position: "absolute", width: 170, height: 170, borderRadius: 85, right: -50, top: -70, backgroundColor: "#6E9ABF22" },
  word: { color: "#FFFFFF", fontSize: 39, lineHeight: 46, fontWeight: "900", letterSpacing: -1.1 },
  pronunciation: { color: "#D9E7F2", fontSize: 15, marginTop: 4 },
  cardTranslation: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", marginTop: 8 },
  partOfSpeech: { color: "#BBD0DF", fontSize: 9, letterSpacing: 1, fontWeight: "800", marginTop: 17 },
  infoCard: { borderRadius: 18, borderWidth: 1, padding: 18 },
  definition: { fontSize: 17, fontWeight: "800", lineHeight: 24 },
  translation: { fontSize: 13, marginTop: 7, lineHeight: 19 },
  source: { fontSize: 10, fontWeight: "800", marginTop: 15 },
  spellLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  spelling: { fontSize: 25, fontWeight: "900", letterSpacing: 1.2, marginTop: 12 },
  spellHint: { fontSize: 12, marginTop: 10 },
  exampleLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  example: { fontSize: 20, lineHeight: 29, fontWeight: "800", marginTop: 10 },
  nextButton: { minHeight: 54, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  nextButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  finished: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 20 },
  finishIcon: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 22 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: "900" },
  finishTitle: { fontSize: 31, fontWeight: "900", letterSpacing: -0.8, marginTop: 8 },
  finishBody: { fontSize: 14, lineHeight: 21, textAlign: "center", maxWidth: 290, marginTop: 10 },
  summary: { width: "100%", borderRadius: 20, borderWidth: 1, alignItems: "center", padding: 18, marginTop: 26, marginBottom: 16 },
  summaryNumber: { fontSize: 38, fontWeight: "900" },
  summaryLabel: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  primaryButton: { width: "100%", minHeight: 54, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  secondaryButton: { width: "100%", minHeight: 48, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 9 },
  secondaryButtonText: { fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
