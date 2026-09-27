import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { recordLearningSession } from "@/lib/learning-storage";
import { getQuestionsForStage, STAGES, type StageId } from "@/lib/word-practice";

type Phase = "preview" | "spell" | "speak" | "example";
const PHASES: Phase[] = ["preview", "spell", "speak", "example"];

export default function PracticeScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ stage?: string }>();
  const stageId = (typeof params.stage === "string" ? params.stage : "beginner") as StageId;
  const stage = STAGES.find((item) => item.id === stageId) ?? STAGES[0];
  const words = useMemo(() => getQuestionsForStage(stage.id), [stage.id]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("preview");
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const question = words[current];
  const finished = !question;
  const phaseIndex = PHASES.indexOf(phase);

  useEffect(() => {
    requestRecordingPermissionsAsync().then((permission) => {
      if (permission.granted) setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    });
  }, []);

  const tap = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") Haptics.impactAsync(style);
  };

  const speak = (text: string, rate = 0.98) => {
    Speech.stop();
    Speech.speak(text, { language: "en-US", rate, volume: 1 });
  };

  useEffect(() => {
    if (!question) return;
    if (phase === "preview") speak(question.word, 0.98);
    if (phase === "example") speak(question.example, 0.9);
  }, [current, phase]);

  useEffect(() => () => { Speech.stop(); }, []);

  const nextPhase = () => {
    tap();
    if (phase === "spell") {
      speak(question.word, 0.98);
      setPhase("speak");
    } else if (phaseIndex < PHASES.length - 1) setPhase(PHASES[phaseIndex + 1]);
    else {
      if (current === words.length - 1) void recordLearningSession(stage.name, words.length);
      setCurrent((value) => value + 1);
      setPhase("preview");
    }
  };

  const toggleRecording = async () => {
    tap(Haptics.ImpactFeedbackStyle.Medium);
    if (recorderState.isRecording) {
      await recorder.stop();
      setPhase("example");
      return;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert("需要麥克風權限", "請允許麥克風權限，才能完成口語拼讀練習。");
    }
  };

  if (finished) {
    return (
      <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
        <View style={styles.finished}>
          <View style={[styles.finishIcon, { backgroundColor: `${colors.success}20` }]}><IconSymbol name="checkmark.circle.fill" size={46} color={colors.success} /></View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>LEVEL COMPLETE</Text>
          <Text style={[styles.finishTitle, { color: colors.foreground }]}>{stage.name}學習完成</Text>
          <Text style={[styles.finishBody, { color: colors.muted }]}>你已完成導讀、拼讀、口語練習與例句四個步驟。</Text>
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

  const phaseTitle = phase === "preview" ? "導讀一次" : phase === "spell" ? "拼讀一次" : phase === "speak" ? "換你說說看" : "應用例句";
  const buttonLabel = phase === "preview" ? "我讀懂了，開始拼讀" : phase === "spell" ? "播放單字後繼續" : phase === "speak" ? (recorderState.isRecording ? "完成口語拼讀" : "按下開始說拼法") : current === words.length - 1 ? "完成本次學習" : "下一個單字";

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={24} color={colors.foreground} /></Pressable>
          <View style={styles.headerCenter}><Text style={[styles.headerEyebrow, { color: stage.color }]}>{stage.name} · {stage.english.toUpperCase()}</Text><Text style={[styles.headerCount, { color: colors.foreground }]}>{current + 1} <Text style={{ color: colors.muted }}>/ {words.length}</Text></Text></View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressTrackFill, { backgroundColor: stage.color, width: `${((current + phaseIndex / PHASES.length) / words.length) * 100}%` }]} /></View>
        <View style={styles.phaseRow}>{PHASES.map((item, index) => <View key={item} style={styles.phaseItem}><View style={[styles.phaseDot, { backgroundColor: index <= phaseIndex ? stage.color : colors.border }]} /><Text style={[styles.phaseText, { color: index === phaseIndex ? colors.foreground : colors.muted }]}>{index + 1}. {item === "preview" ? "導讀" : item === "spell" ? "拼讀" : item === "speak" ? "口語" : "例句"}</Text></View>)}</View>

        <View style={styles.learningArea}>
          <Text style={[styles.phaseEyebrow, { color: colors.muted }]}>{phaseTitle.toUpperCase()}</Text>
          <View style={[styles.wordCard, { backgroundColor: colors.foreground }]}>
            <View style={styles.cardOrb} />
            <Text style={styles.word}>{question.word}</Text>
            <Text style={styles.pronunciation}>{question.pronunciation}</Text>
            <Text style={styles.partOfSpeech}>{question.partOfSpeech.toUpperCase()} · LONGMAN DICTIONARY 參照</Text>
            <Pressable onPress={() => speak(phase === "spell" ? question.word.split("").join(", ") : phase === "example" ? question.example : question.word, phase === "spell" ? 0.82 : phase === "example" ? 0.9 : 0.98)} style={({ pressed }) => [styles.audioButton, pressed && styles.pressed]}><IconSymbol name="speaker.wave.2.fill" size={17} color="#FFFFFF" /><Text style={styles.audioText}>{phase === "spell" ? "聽拼讀示範" : phase === "example" ? "聽例句" : "聽發音"}</Text></Pressable>
          </View>

          {phase === "preview" && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.definition, { color: colors.foreground }]}>{question.definition}</Text><Text style={[styles.translation, { color: colors.muted }]}>{question.translation}</Text><Text style={[styles.source, { color: colors.primary }]}>詞義參照：Longman Dictionary of Contemporary English</Text></View>}
          {phase === "spell" && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.spellLabel, { color: colors.muted }]}>請跟著拼一次</Text><Text style={[styles.spelling, { color: colors.foreground }]}>{question.word.split("").join(" · ")}</Text><Text style={[styles.spellHint, { color: colors.muted }]}>先看字母，再慢慢說出每一個音。</Text></View>}
          {phase === "speak" && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.speakTitle, { color: colors.foreground }]}>{recorderState.isRecording ? "正在聆聽你的拼讀…" : "請口語拼讀這個單字"}</Text><Text style={[styles.speakHint, { color: colors.muted }]}>例如：{question.word.split("").join(" · ")}</Text><Pressable onPress={toggleRecording} style={({ pressed }) => [styles.recordButton, { backgroundColor: recorderState.isRecording ? colors.error : stage.color }, pressed && styles.pressed]}><IconSymbol name={recorderState.isRecording ? "stop.circle.fill" : "mic.fill"} size={24} color="#FFFFFF" /><Text style={styles.recordText}>{recorderState.isRecording ? "停止錄音" : "開始錄音"}</Text></Pressable></View>}
          {phase === "example" && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.exampleLabel, { color: colors.primary }]}>IN CONTEXT</Text><Text style={[styles.example, { color: colors.foreground }]}>{question.example}</Text><Text style={[styles.translation, { color: colors.muted }]}>把這個單字放進真實語境裡記住它。</Text></View>}
        </View>

        <Pressable onPress={phase === "speak" ? (recorderState.isRecording ? toggleRecording : nextPhase) : nextPhase} style={({ pressed }) => [styles.nextButton, { backgroundColor: stage.color }, pressed && styles.pressed]}><Text style={styles.nextButtonText}>{buttonLabel}</Text><IconSymbol name="arrow.right" size={18} color="#FFFFFF" /></Pressable>
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
  learningArea: { flex: 1, justifyContent: "center", gap: 14 },
  phaseEyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.3 },
  wordCard: { minHeight: 162, borderRadius: 24, padding: 23, justifyContent: "center", overflow: "hidden" },
  cardOrb: { position: "absolute", width: 170, height: 170, borderRadius: 85, right: -50, top: -70, backgroundColor: "#FFFFFF10" },
  word: { color: "#FFFFFF", fontSize: 39, lineHeight: 46, fontWeight: "900", letterSpacing: -1.1 },
  pronunciation: { color: "#FFFFFFB8", fontSize: 15, marginTop: 4 },
  partOfSpeech: { color: "#FFFFFF80", fontSize: 9, letterSpacing: 1, fontWeight: "800", marginTop: 17 },
  audioButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 7, borderRadius: 14, backgroundColor: "#FFFFFF18", paddingHorizontal: 11, paddingVertical: 8, marginTop: 16 },
  audioText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  infoCard: { borderRadius: 18, borderWidth: 1, padding: 18 },
  definition: { fontSize: 17, fontWeight: "800", lineHeight: 24 },
  translation: { fontSize: 13, marginTop: 7, lineHeight: 19 },
  source: { fontSize: 10, fontWeight: "800", marginTop: 15 },
  spellLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  spelling: { fontSize: 25, fontWeight: "900", letterSpacing: 1.2, marginTop: 12 },
  spellHint: { fontSize: 12, marginTop: 10 },
  speakTitle: { fontSize: 17, fontWeight: "800" },
  speakHint: { fontSize: 13, marginTop: 7 },
  recordButton: { minHeight: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18 },
  recordText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
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
