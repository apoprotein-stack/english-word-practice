import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { STAGES, type StageId } from "@/lib/word-practice";

export default function HomeScreen() {
  const colors = useColors();
  const [completed, setCompleted] = useState(12);
  const [selectedStage, setSelectedStage] = useState<StageId>("beginner");
  const progress = Math.min(completed / 20, 1);

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const markWordLearned = () => {
    tap();
    setCompleted((value) => Math.min(value + 1, 20));
  };

  const startSelectedStage = () => {
    tap();
    router.push({ pathname: "/(tabs)/practice", params: { stage: selectedStage } } as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background" className="px-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.muted }]}>SUNDAY · SEPT 27</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>Keep your streak alive.</Text>
          </View>
          <Pressable
            accessibilityLabel="Open profile"
            onPress={() => {
              tap();
            }}
            style={({ pressed }) => [styles.avatar, { backgroundColor: colors.primary }, pressed && styles.pressed]}
          >
            <Text style={styles.avatarText}>M</Text>
          </Pressable>
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.foreground }]}>
          <View style={styles.cardOrb} />
          <View style={styles.progressTopline}>
            <View>
              <Text style={styles.progressLabel}>TODAY&apos;S GOAL</Text>
              <Text style={styles.progressTitle}>A little every day.</Text>
            </View>
            <View style={styles.progressBadge}>
              <IconSymbol name="bolt.fill" size={15} color="#17202A" />
              <Text style={styles.progressBadgeText}>4 day streak</Text>
            </View>
          </View>
          <View style={styles.progressNumbers}>
            <Text style={styles.progressValue}>{completed}</Text>
            <Text style={styles.progressTotal}>/ 20 words</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>{20 - completed === 0 ? "Goal complete — lovely work." : `${20 - completed} words left to reach today's goal.`}</Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose your level</Text>
          <Text style={[styles.sectionMeta, { color: colors.muted }]}>4 stages</Text>
        </View>
        <View style={styles.stageGrid}>
          {STAGES.map((stage) => {
            const active = selectedStage === stage.id;
            return (
              <Pressable key={stage.id} onPress={() => { tap(); setSelectedStage(stage.id); }} style={({ pressed }) => [styles.stageCard, { backgroundColor: active ? `${stage.color}16` : colors.surface, borderColor: active ? stage.color : colors.border }, pressed && styles.pressed]}>
                <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
                <View style={styles.stageInfo}><Text style={[styles.stageName, { color: colors.foreground }]}>{stage.name} <Text style={{ color: colors.muted, fontSize: 11 }}>{stage.english}</Text></Text><Text style={[styles.stageDescription, { color: colors.muted }]}>{stage.description.split(" · ")[0]}</Text><Text style={[styles.stageCount, { color: stage.color }]}>{stage.wordCount.toLocaleString()} words</Text></View>
                {active && <IconSymbol name="checkmark.circle.fill" size={19} color={stage.color} />}
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={startSelectedStage} style={({ pressed }) => [styles.levelButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="bolt.fill" size={17} color="#FFFFFF" /><Text style={styles.primaryButtonText}>開始 {STAGES.find((stage) => stage.id === selectedStage)?.name}學習</Text></Pressable>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Word of the day</Text>
          <Pressable onPress={() => router.push("/(tabs)/practice")} hitSlop={10}>
            <Text style={[styles.link, { color: colors.primary }]}>View all</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => { tap(); router.push("/(tabs)/practice"); }}
          style={({ pressed }) => [styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.cardPressed]}
        >
          <View style={styles.wordCardTop}>
            <View style={[styles.wordIcon, { backgroundColor: `${colors.primary}18` }]}>
              <Text style={[styles.wordIconText, { color: colors.primary }]}>Aa</Text>
            </View>
            <View style={styles.wordMeta}>
              <Text style={[styles.wordCategory, { color: colors.muted }]}>ADJECTIVE · TRAVEL</Text>
              <Text style={[styles.word, { color: colors.foreground }]}>resilient</Text>
              <Text style={[styles.phonetic, { color: colors.muted }]}>/ rɪˈzɪliənt /</Text>
            </View>
            <IconSymbol name="chevron.right" size={22} color={colors.muted} />
          </View>
          <View style={[styles.definition, { borderTopColor: colors.border }]}>
            <Text style={[styles.definitionText, { color: colors.foreground }]}>able to recover quickly from difficulties</Text>
            <Text style={[styles.definitionTranslation, { color: colors.muted }]}>有韌性的；能迅速復原的</Text>
          </View>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable onPress={() => { tap(); router.push("/(tabs)/practice"); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
            <IconSymbol name="bolt.fill" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Start 5-question quiz</Text>
          </Pressable>
          <Pressable onPress={markWordLearned} style={({ pressed }) => [styles.smallButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
            <Text style={[styles.smallButtonText, { color: colors.foreground }]}>Mark learned</Text>
          </Pressable>
        </View>

        <View style={[styles.tip, { backgroundColor: `${colors.warning}18` }]}>
          <IconSymbol name="star.fill" size={18} color={colors.warning} />
          <Text style={[styles.tipText, { color: colors.foreground }]}>Tip: say each word out loud to make it stick.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 34, gap: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.4, lineHeight: 16 },
  greeting: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5, lineHeight: 31, marginTop: 3 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  progressCard: { minHeight: 205, borderRadius: 26, padding: 22, overflow: "hidden" },
  cardOrb: { position: "absolute", width: 180, height: 180, borderRadius: 90, right: -45, top: -75, backgroundColor: "#FFFFFF12" },
  progressTopline: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  progressLabel: { color: "#FFFFFF90", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  progressTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "700", marginTop: 4 },
  progressBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F4B942", borderRadius: 14, paddingHorizontal: 9, paddingVertical: 6 },
  progressBadgeText: { color: "#17202A", fontSize: 11, fontWeight: "800" },
  progressNumbers: { flexDirection: "row", alignItems: "baseline", marginTop: 22 },
  progressValue: { color: "#FFFFFF", fontSize: 42, fontWeight: "800", letterSpacing: -1 },
  progressTotal: { color: "#FFFFFF90", fontSize: 16, fontWeight: "600", marginLeft: 5 },
  track: { height: 7, borderRadius: 4, backgroundColor: "#FFFFFF25", overflow: "hidden", marginTop: 11 },
  trackFill: { height: "100%", borderRadius: 4, backgroundColor: "#F4B942" },
  progressHint: { color: "#FFFFFF90", fontSize: 12, marginTop: 9 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: -12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  sectionMeta: { fontSize: 13, fontWeight: "600" },
  topicRow: { flexDirection: "row", gap: 9 },
  stageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  stageCard: { width: "48.5%", minHeight: 79, borderRadius: 17, borderWidth: 1.5, padding: 11, flexDirection: "row", alignItems: "center" },
  stageDot: { width: 9, height: 9, borderRadius: 5 },
  stageInfo: { flex: 1, marginLeft: 9 },
  stageName: { fontSize: 14, fontWeight: "800" },
  stageDescription: { fontSize: 10, marginTop: 3 },
  stageCount: { fontSize: 10, fontWeight: "800", marginTop: 3 },
  levelButton: { minHeight: 50, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  topicChip: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  topicTextActive: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  topicText: { fontSize: 13, fontWeight: "700" },
  link: { fontSize: 13, fontWeight: "800" },
  wordCard: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  wordCardTop: { flexDirection: "row", alignItems: "center", padding: 19 },
  wordIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  wordIconText: { fontSize: 18, fontWeight: "900" },
  wordMeta: { flex: 1, marginLeft: 13 },
  wordCategory: { fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  word: { fontSize: 27, fontWeight: "800", letterSpacing: -0.7, marginTop: 1 },
  phonetic: { fontSize: 12, marginTop: 1 },
  definition: { borderTopWidth: 1, paddingHorizontal: 19, paddingVertical: 14 },
  definitionText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  definitionTranslation: { fontSize: 12, marginTop: 4 },
  actionRow: { gap: 10 },
  primaryButton: { minHeight: 54, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  smallButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  smallButtonText: { fontSize: 14, fontWeight: "700" },
  tip: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 15, padding: 14 },
  tipText: { flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  cardPressed: { opacity: 0.82 },
});
