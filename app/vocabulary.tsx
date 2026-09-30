import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { recordMastery } from "@/lib/mastery-storage";
import { getQuestionsForStage, STAGES, type StageId } from "@/lib/word-practice";

export default function VocabularyScreen() {
  const colors = useColors();
  const [stageId, setStageId] = useState<StageId>("beginner");
  const [current, setCurrent] = useState(0);
  const stage = STAGES.find((item) => item.id === stageId) ?? STAGES[0];
  const words = useMemo(() => getQuestionsForStage(stage.id), [stage.id]);
  const question = words[current] ?? words[0];

  useEffect(() => {
    if (question) {
      Speech.stop();
      Speech.speak(question.word, { language: "en-US", rate: 0.92 });
    }
    return () => { Speech.stop(); };
  }, [question]);

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const changeStage = (next: StageId) => {
    tap();
    setStageId(next);
    setCurrent(0);
  };

  const review = async (isCorrect: boolean) => {
    tap();
    await recordMastery(question.word, "recognition", isCorrect);
    setCurrent((value) => (value + 1) % words.length);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerTitle}><Text style={[styles.eyebrow, { color: colors.primary }]}>VOCABULARY MODE</Text><Text style={[styles.title, { color: colors.foreground }]}>單字模式</Text></View>
          <Text style={[styles.counter, { color: colors.muted }]}>{current + 1}/{words.length}</Text>
        </View>

        <View style={styles.levels}>
          {STAGES.map((item) => <Pressable key={item.id} onPress={() => changeStage(item.id)} style={({ pressed }) => [styles.levelChip, { borderColor: item.id === stageId ? item.color : colors.border, backgroundColor: item.id === stageId ? `${item.color}18` : colors.surface }, pressed && styles.pressed]}><Text style={[styles.levelText, { color: item.id === stageId ? item.color : colors.muted }]}>{item.name}</Text></Pressable>)}
        </View>

        <View style={styles.content}>
          <Text style={[styles.instruction, { color: colors.muted }]}>點選卡片即可自動播放英文發音</Text>
          <Pressable onPress={() => { tap(); Speech.stop(); Speech.speak(question.word, { language: "en-US", rate: 0.92 }); }} style={({ pressed }) => [styles.card, { backgroundColor: colors.foreground }, pressed && styles.cardPressed]}>
            <View style={styles.orb} />
            <Text style={styles.word}>{question.word}</Text>
            <Text style={styles.pronunciation}>{question.pronunciation}</Text>
            <Text style={styles.cardTranslation}>中文對照：{question.translation}</Text>
            <View style={styles.audio}><IconSymbol name="speaker.wave.2.fill" size={18} color="#FFFFFF" /><Text style={styles.audioText}>自動播放 · 點擊重播</Text></View>
          </Pressable>
          <View style={[styles.definitionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.partOfSpeech, { color: colors.primary }]}>{question.partOfSpeech.toUpperCase()}</Text>
            <Text style={[styles.definition, { color: colors.foreground }]}>{question.definition}</Text>
            <Text style={[styles.translation, { color: colors.muted }]}>{question.translation}</Text>
            <View style={[styles.exampleBox, { borderTopColor: colors.border }]}><Text style={[styles.exampleLabel, { color: colors.muted }]}>EXAMPLE</Text><Text style={[styles.example, { color: colors.foreground }]}>{question.example}</Text></View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => review(false)} style={({ pressed }) => [styles.reviewButton, { borderColor: colors.error }, pressed && styles.pressed]}><Text style={[styles.reviewText, { color: colors.error }]}>需要複習</Text></Pressable>
          <Pressable onPress={() => review(true)} style={({ pressed }) => [styles.knowButton, { backgroundColor: colors.success }, pressed && styles.pressed]}><Text style={styles.knowText}>我會了</Text><IconSymbol name="arrow.right" size={18} color="#FFFFFF" /></Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 14, paddingBottom: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { alignItems: "center" },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  title: { fontSize: 22, fontWeight: "900", marginTop: 2 },
  counter: { fontSize: 13, fontWeight: "800", width: 42, textAlign: "right" },
  levels: { flexDirection: "row", gap: 7, marginTop: 16 },
  levelChip: { flex: 1, alignItems: "center", borderWidth: 1, borderRadius: 12, paddingVertical: 9 },
  levelText: { fontSize: 11, fontWeight: "800" },
  content: { flex: 1, justifyContent: "center", gap: 14 },
  instruction: { textAlign: "center", fontSize: 12, fontWeight: "700" },
  card: { minHeight: 214, borderRadius: 27, alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 22 },
  orb: { position: "absolute", width: 210, height: 210, borderRadius: 105, right: -56, top: -82, backgroundColor: "#FFFFFF12" },
  word: { color: "#FFFFFF", fontSize: 47, lineHeight: 55, fontWeight: "900", letterSpacing: -1.4 },
  pronunciation: { color: "#FFFFFFB8", fontSize: 16, marginTop: 5 },
  cardTranslation: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 8 },
  audio: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#FFFFFF1A", borderRadius: 15, paddingHorizontal: 13, paddingVertical: 9, marginTop: 20 },
  audioText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  definitionCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  partOfSpeech: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  definition: { fontSize: 19, lineHeight: 27, fontWeight: "800", marginTop: 8 },
  translation: { fontSize: 14, marginTop: 5 },
  exampleBox: { borderTopWidth: 1, marginTop: 15, paddingTop: 13 },
  exampleLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  example: { fontSize: 14, lineHeight: 21, fontWeight: "600", marginTop: 5 },
  actions: { flexDirection: "row", gap: 10 },
  reviewButton: { flex: 1, minHeight: 53, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  reviewText: { fontSize: 14, fontWeight: "800" },
  knowButton: { flex: 1.4, minHeight: 53, borderRadius: 17, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  knowText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
