import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { DEFAULT_LEARNING_RECORD, loadLearningRecord, type LearningRecord } from "@/lib/learning-storage";
import { STAGES } from "@/lib/word-practice";

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export default function ProgressScreen() {
  const colors = useColors();
  const [record, setRecord] = useState<LearningRecord>(DEFAULT_LEARNING_RECORD);
  useEffect(() => { loadLearningRecord().then(setRecord); }, []);
  const max = Math.max(...record.weekly, 1);
  const weekTotal = record.weekly.reduce((total, value) => total + value, 0);
  const familiarity = record.totalWords === 0 ? 0 : Math.min(100, Math.round((record.totalWords / 50) * 100));
  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const colorForSession = (label: string) => STAGES.find((stage) => label.startsWith(stage.name))?.color ?? colors.primary;

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={record.sessions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR PROGRESS</Text><Text style={[styles.title, { color: colors.foreground }]}>學習記錄</Text></View>
              <Pressable onPress={() => { tap(); router.push("/(tabs)/practice"); }} style={({ pressed }) => [styles.studyButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="bolt.fill" size={17} color="#FFFFFF" /><Text style={styles.studyText}>繼續學習</Text></Pressable>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.foreground }]}><IconSymbol name="bolt.fill" size={17} color="#F4B942" /><Text style={styles.statNumber}>{record.streak}</Text><Text style={styles.statLabel}>連續天數</Text></View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="book.fill" size={17} color={colors.primary} /><Text style={[styles.statNumber, { color: colors.foreground }]}>{record.totalWords}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>已學單字</Text></View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="chart.bar.fill" size={17} color={colors.success} /><Text style={[styles.statNumber, { color: colors.foreground }]}>{familiarity}%</Text><Text style={[styles.statLabel, { color: colors.muted }]}>熟悉度</Text></View>
            </View>
            <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}><View><Text style={[styles.cardTitle, { color: colors.foreground }]}>本週學習量</Text><Text style={[styles.cardHint, { color: colors.muted }]}>每天目標 10 個單字</Text></View><Text style={[styles.weekTotal, { color: colors.primary }]}>{weekTotal} words</Text></View>
              <View style={styles.chart}><View style={styles.gridLine} /><View style={[styles.gridLine, { top: 34 }]} /><View style={[styles.gridLine, { top: 68 }]} /><View style={styles.bars}>{record.weekly.map((count, index) => <View key={DAY_LABELS[index]} style={styles.barColumn}><View style={[styles.bar, { height: Math.max(5, (count / max) * 68), backgroundColor: count > 0 ? STAGES[index % STAGES.length].color : colors.border }]} /><Text style={[styles.day, { color: colors.muted }]}>{DAY_LABELS[index]}</Text></View>)}</View></View>
            </View>
            <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>最近活動</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>共 {record.sessions.length} 次</Text></View>
          </View>
        }
        renderItem={({ item }) => { const itemColor = colorForSession(item.label); return <View style={[styles.session, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.sessionDot, { backgroundColor: itemColor }]} /><View style={styles.sessionInfo}><Text style={[styles.sessionLabel, { color: colors.foreground }]}>{item.label}</Text><Text style={[styles.sessionDate, { color: colors.muted }]}>{item.date} · {item.minutes} 分鐘</Text></View><Text style={[styles.sessionWords, { color: itemColor }]}>{item.words} 字</Text></View>; }}
        ListEmptyComponent={<View style={styles.empty}><IconSymbol name="book.fill" size={28} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>還沒有學習記錄</Text><Text style={[styles.emptyText, { color: colors.muted }]}>完成一輪練習後，紀錄會自動保存在本機。</Text></View>}
        ListFooterComponent={<View style={[styles.footerTip, { backgroundColor: `${colors.warning}18` }]}><IconSymbol name="star.fill" size={18} color={colors.warning} /><Text style={[styles.footerText, { color: colors.foreground }]}>完成每日 10 字目標，持續 7 天就能建立穩定習慣。</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 18, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  title: { fontSize: 29, lineHeight: 35, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 },
  studyButton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 15, paddingHorizontal: 13, paddingVertical: 11 },
  studyText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 9, marginBottom: 14 },
  statCard: { flex: 1, minHeight: 111, borderRadius: 18, borderWidth: 1, padding: 13 },
  statNumber: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginTop: 9 },
  statLabel: { color: "#FFFFFF90", fontSize: 11, fontWeight: "700", marginTop: 2 },
  chartCard: { borderRadius: 21, borderWidth: 1, padding: 17 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontSize: 17, fontWeight: "800" },
  cardHint: { fontSize: 11, marginTop: 3 },
  weekTotal: { fontSize: 13, fontWeight: "900" },
  chart: { height: 119, marginTop: 14, position: "relative" },
  gridLine: { position: "absolute", left: 0, right: 0, top: 0, height: 1, backgroundColor: "#E6E1D860" },
  bars: { position: "absolute", left: 0, right: 0, bottom: 0, height: 92, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around" },
  barColumn: { alignItems: "center", justifyContent: "flex-end", height: 92, gap: 7 },
  bar: { width: 23, borderRadius: 7 },
  day: { fontSize: 10, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 25, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  sectionHint: { fontSize: 12, fontWeight: "700" },
  session: { minHeight: 70, borderRadius: 17, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 9 },
  sessionDot: { width: 9, height: 9, borderRadius: 5 },
  sessionInfo: { flex: 1, marginLeft: 11 },
  sessionLabel: { fontSize: 14, fontWeight: "800" },
  sessionDate: { fontSize: 11, marginTop: 4 },
  sessionWords: { fontSize: 14, fontWeight: "900" },
  empty: { alignItems: "center", paddingTop: 42, paddingBottom: 22 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 12 },
  emptyText: { fontSize: 12, marginTop: 5, textAlign: "center" },
  footerTip: { borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "center", gap: 9, marginTop: 16 },
  footerText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
