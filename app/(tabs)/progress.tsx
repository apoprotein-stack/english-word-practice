import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { STAGES } from "@/lib/word-practice";

const RECENT_SESSIONS = [
  { date: "今天", label: "初階 · 導讀練習", words: 4, minutes: 8, color: STAGES[0].color },
  { date: "昨天", label: "中階 · 例句練習", words: 7, minutes: 12, color: STAGES[1].color },
  { date: "週五", label: "初階 · 複習單字", words: 10, minutes: 15, color: STAGES[0].color },
];

export default function ProgressScreen() {
  const colors = useColors();
  const weekly = useMemo(() => [4, 7, 5, 9, 10, 0, 0], []);
  const max = Math.max(...weekly, 1);
  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={RECENT_SESSIONS}
        keyExtractor={(item) => `${item.date}-${item.label}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR PROGRESS</Text><Text style={[styles.title, { color: colors.foreground }]}>學習記錄</Text></View>
              <Pressable onPress={() => { tap(); router.push("/(tabs)/practice"); }} style={({ pressed }) => [styles.studyButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="bolt.fill" size={17} color="#FFFFFF" /><Text style={styles.studyText}>繼續學習</Text></Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.foreground }]}><IconSymbol name="bolt.fill" size={17} color="#F4B942" /><Text style={styles.statNumber}>4</Text><Text style={styles.statLabel}>連續天數</Text></View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="book.fill" size={17} color={colors.primary} /><Text style={[styles.statNumber, { color: colors.foreground }]}>36</Text><Text style={[styles.statLabel, { color: colors.muted }]}>已學單字</Text></View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="chart.bar.fill" size={17} color={colors.success} /><Text style={[styles.statNumber, { color: colors.foreground }]}>82%</Text><Text style={[styles.statLabel, { color: colors.muted }]}>熟悉度</Text></View>
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}><View><Text style={[styles.cardTitle, { color: colors.foreground }]}>本週學習量</Text><Text style={[styles.cardHint, { color: colors.muted }]}>每天目標 10 個單字</Text></View><Text style={[styles.weekTotal, { color: colors.primary }]}>35 words</Text></View>
              <View style={styles.chart}>
                <View style={styles.gridLine} /><View style={[styles.gridLine, { top: 34 }]} /><View style={[styles.gridLine, { top: 68 }]} />
                <View style={styles.bars}><View style={styles.barColumn}><View style={[styles.bar, { height: 28, backgroundColor: STAGES[0].color }]} /><Text style={[styles.day, { color: colors.muted }]}>一</Text></View><View style={styles.barColumn}><View style={[styles.bar, { height: 48, backgroundColor: STAGES[1].color }]} /><Text style={[styles.day, { color: colors.muted }]}>二</Text></View><View style={styles.barColumn}><View style={[styles.bar, { height: 36, backgroundColor: STAGES[0].color }]} /><Text style={[styles.day, { color: colors.muted }]}>三</Text></View><View style={styles.barColumn}><View style={[styles.bar, { height: 58, backgroundColor: STAGES[2].color }]} /><Text style={[styles.day, { color: colors.muted }]}>四</Text></View><View style={styles.barColumn}><View style={[styles.bar, { height: 68, backgroundColor: STAGES[0].color }]} /><Text style={[styles.day, { color: colors.muted }]}>五</Text></View><View style={styles.barColumn}><View style={[styles.bar, { height: 5, backgroundColor: colors.border }]} /><Text style={[styles.day, { color: colors.muted }]}>六</Text></View><View style={styles.barColumn}><View style={[styles.bar, { height: 5, backgroundColor: colors.border }]} /><Text style={[styles.day, { color: colors.muted }]}>日</Text></View></View>
              </View>
            </View>

            <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>最近活動</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>共 3 次</Text></View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.session, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.sessionDot, { backgroundColor: item.color }]} /><View style={styles.sessionInfo}><Text style={[styles.sessionLabel, { color: colors.foreground }]}>{item.label}</Text><Text style={[styles.sessionDate, { color: colors.muted }]}>{item.date} · {item.minutes} 分鐘</Text></View><Text style={[styles.sessionWords, { color: item.color }]}>{item.words} 字</Text></View>
        )}
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
  footerTip: { borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "center", gap: 9, marginTop: 16 },
  footerText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
