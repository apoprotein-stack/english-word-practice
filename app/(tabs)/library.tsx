import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type Word = { word: string; meaning: string; translation: string; category: string; level: string; saved: boolean };

const WORDS: Word[] = [
  { word: "resilient", meaning: "able to recover quickly", translation: "有韌性的", category: "Travel", level: "A2", saved: true },
  { word: "wander", meaning: "walk without a fixed destination", translation: "漫步；閒逛", category: "Travel", level: "A2", saved: false },
  { word: "breathtaking", meaning: "extremely beautiful or impressive", translation: "令人屏息的", category: "Travel", level: "B1", saved: true },
  { word: "essential", meaning: "completely necessary or important", translation: "必要的；重要的", category: "Everyday", level: "A2", saved: false },
  { word: "curious", meaning: "wanting to know or learn something", translation: "好奇的", category: "Everyday", level: "A2", saved: false },
  { word: "grateful", meaning: "feeling or showing thanks", translation: "感激的", category: "Everyday", level: "A2", saved: true },
];

export default function LibraryScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All words");
  const [saved, setSaved] = useState(WORDS);
  const filters = ["All words", "Saved", "Travel"];

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredWords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return saved.filter((item) => {
      const matchesFilter = filter === "All words" || (filter === "Saved" ? item.saved : item.category === filter);
      const matchesQuery = !normalized || `${item.word} ${item.meaning} ${item.translation}`.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, saved]);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR VOCABULARY</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Word library</Text>
          </View>
          <Pressable onPress={() => { tap(); router.push("/(tabs)/practice"); }} style={({ pressed }) => [styles.studyButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
            <IconSymbol name="bolt.fill" size={17} color="#FFFFFF" />
            <Text style={styles.studyButtonText}>Study</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search words or meanings"
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="done"
          />
          {query.length > 0 && <Pressable onPress={() => setQuery("")} hitSlop={10}><IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} /></Pressable>}
        </View>

        <View style={styles.filterRow}>
          {filters.map((item) => {
            const active = filter === item;
            return (
              <Pressable key={item} onPress={() => { tap(); setFilter(item); }} style={({ pressed }) => [styles.filter, { backgroundColor: active ? colors.foreground : colors.surface, borderColor: active ? colors.foreground : colors.border }, pressed && styles.pressed]}>
                <Text style={[styles.filterText, { color: active ? "#FFFFFF" : colors.muted }]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.count, { color: colors.muted }]}>{filteredWords.length} words</Text>
          <Text style={[styles.level, { color: colors.muted }]}>A2 · B1</Text>
        </View>

        <FlatList
          data={filteredWords}
          keyExtractor={(item) => item.word}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => { tap(); router.push("/(tabs)/practice"); }} style={({ pressed }) => [styles.wordRow, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.rowPressed]}>
              <View style={[styles.wordBadge, { backgroundColor: `${colors.primary}18` }]}><Text style={[styles.wordBadgeText, { color: colors.primary }]}>{item.word.slice(0, 2).toUpperCase()}</Text></View>
              <View style={styles.wordInfo}>
                <View style={styles.wordTitleRow}>
                  <Text style={[styles.wordText, { color: colors.foreground }]}>{item.word}</Text>
                  <View style={[styles.levelPill, { backgroundColor: colors.border }]}><Text style={[styles.levelPillText, { color: colors.muted }]}>{item.level}</Text></View>
                </View>
                <Text style={[styles.meaning, { color: colors.muted }]} numberOfLines={1}>{item.meaning} · {item.translation}</Text>
                <Text style={[styles.category, { color: colors.primary }]}>{item.category}</Text>
              </View>
              <Pressable accessibilityLabel={item.saved ? `Remove ${item.word} from saved` : `Save ${item.word}`} onPress={() => { tap(); setSaved((items) => items.map((entry) => entry.word === item.word ? { ...entry, saved: !entry.saved } : entry)); }} hitSlop={10}>
                <IconSymbol name={item.saved ? "star.fill" : "star"} size={20} color={item.saved ? colors.warning : colors.muted} />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={<View style={styles.empty}><IconSymbol name="magnifyingglass" size={26} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No words found</Text><Text style={[styles.emptyBody, { color: colors.muted }]}>Try another spelling or category.</Text></View>}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  title: { fontSize: 29, lineHeight: 35, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 },
  studyButton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 11 },
  studyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  searchBox: { height: 52, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 9, paddingVertical: 0 },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 15 },
  filter: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 8 },
  filterText: { fontSize: 12, fontWeight: "800" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 25, marginBottom: 9 },
  count: { fontSize: 12, fontWeight: "700" },
  level: { fontSize: 12, fontWeight: "700" },
  list: { paddingBottom: 30, gap: 10 },
  wordRow: { minHeight: 82, borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 13, flexDirection: "row", alignItems: "center" },
  wordBadge: { width: 45, height: 45, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  wordBadgeText: { fontSize: 15, fontWeight: "900" },
  wordInfo: { flex: 1, marginLeft: 12 },
  wordTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  wordText: { fontSize: 16, fontWeight: "800" },
  levelPill: { borderRadius: 7, paddingHorizontal: 5, paddingVertical: 2 },
  levelPillText: { fontSize: 9, fontWeight: "900" },
  meaning: { fontSize: 12, marginTop: 4 },
  category: { fontSize: 10, fontWeight: "800", marginTop: 5 },
  empty: { alignItems: "center", paddingTop: 70 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 12 },
  emptyBody: { fontSize: 13, marginTop: 5 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  rowPressed: { opacity: 0.78 },
});
