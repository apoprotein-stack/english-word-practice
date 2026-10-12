import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CEFR_LEVELS, QUESTIONS, VOCABULARY_TOPIC_LABELS, VOCABULARY_TOPICS, type CEFRLevel, type Question, type VocabularyTopic } from "@/lib/word-practice";

type FilterValue<T extends string> = T | "all";
const POS_LABELS: Record<string, string> = {
  noun: "名詞", verb: "動詞", adjective: "形容詞", adverb: "副詞", preposition: "介系詞",
  pronoun: "代名詞", conjunction: "連接詞", word: "其他",
};

export default function LibraryScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [cefr, setCefr] = useState<FilterValue<CEFRLevel>>("all");
  const [partOfSpeech, setPartOfSpeech] = useState("all");
  const [topic, setTopic] = useState<FilterValue<VocabularyTopic>>("all");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set(["resilient", "breathtaking", "grateful"]));
  const [savedOnly, setSavedOnly] = useState(false);

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const availableParts = useMemo(() => Array.from(new Set(QUESTIONS.map((item) => item.partOfSpeech))).sort(), []);
  const filteredWords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return QUESTIONS.filter((item) => {
      const matchesCefr = cefr === "all" || item.cefr === cefr;
      const matchesPart = partOfSpeech === "all" || item.partOfSpeech === partOfSpeech;
      const matchesTopic = topic === "all" || item.topic === topic;
      const matchesSaved = !savedOnly || savedWords.has(item.word);
      const matchesQuery = !normalized || `${item.word} ${item.definition} ${item.translation} ${item.example}`.toLowerCase().includes(normalized);
      return matchesCefr && matchesPart && matchesTopic && matchesSaved && matchesQuery;
    });
  }, [cefr, partOfSpeech, query, savedOnly, savedWords, topic]);

  const toggleSaved = (word: string) => {
    tap();
    setSavedWords((current) => {
      const next = new Set(current);
      if (next.has(word)) next.delete(word); else next.add(word);
      return next;
    });
  };

  const renderChip = (label: string, active: boolean, onPress: () => void) => (
    <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => [styles.filter, { backgroundColor: active ? colors.foreground : colors.surface, borderColor: active ? colors.foreground : colors.border }, pressed && styles.pressed]}>
      <Text style={[styles.filterText, { color: active ? "#FFFFFF" : colors.muted }]}>{label}</Text>
    </Pressable>
  );

  const renderWord = ({ item }: { item: Question }) => {
    const isSaved = savedWords.has(item.word);
    return (
      <Pressable onPress={() => { tap(); router.push({ pathname: "/(tabs)/practice", params: { stage: item.stage, mode: "auto" } } as never); }} style={({ pressed }) => [styles.wordRow, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.rowPressed]}>
        <View style={[styles.wordBadge, { backgroundColor: `${colors.primary}18` }]}><Text style={[styles.wordBadgeText, { color: colors.primary }]}>{item.word.slice(0, 2).toUpperCase()}</Text></View>
        <View style={styles.wordInfo}>
          <View style={styles.wordTitleRow}>
            <Text style={[styles.wordText, { color: colors.foreground }]}>{item.word}</Text>
            <View style={[styles.levelPill, { backgroundColor: `${colors.primary}18` }]}><Text style={[styles.levelPillText, { color: colors.primary }]}>{item.cefr}</Text></View>
          </View>
          <Text style={[styles.meaning, { color: colors.muted }]} numberOfLines={1}>{item.definition} · {item.translation}</Text>
          <Text style={[styles.metadata, { color: colors.primary }]}>{POS_LABELS[item.partOfSpeech] ?? item.partOfSpeech} · {VOCABULARY_TOPIC_LABELS[item.topic]}</Text>
        </View>
        <Pressable accessibilityLabel={isSaved ? `取消收藏 ${item.word}` : `收藏 ${item.word}`} onPress={() => toggleSaved(item.word)} hitSlop={10} style={styles.starButton}>
          <IconSymbol name={isSaved ? "star.fill" : "star"} size={20} color={isSaved ? colors.warning : colors.muted} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <View style={styles.container}>
        <View style={styles.header}>
          <View><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR VOCABULARY</Text><Text style={[styles.title, { color: colors.foreground }]}>單字庫</Text></View>
          <Pressable onPress={() => { tap(); router.push("/(tabs)/practice"); }} style={({ pressed }) => [styles.studyButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="bolt.fill" size={17} color="#FFFFFF" /><Text style={styles.studyButtonText}>開始學習</Text></Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="搜尋單字、中文或釋義" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="done" />
          {query.length > 0 && <Pressable onPress={() => setQuery("")} hitSlop={10}><IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} /></Pressable>}
        </View>

        <Text style={[styles.filterLabel, { color: colors.foreground }]}>CEFR 等級</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {renderChip("全部", cefr === "all", () => setCefr("all"))}
          {CEFR_LEVELS.filter((level) => QUESTIONS.some((item) => item.cefr === level)).map((level) => renderChip(level, cefr === level, () => setCefr(level)))}
        </ScrollView>

        <Text style={[styles.filterLabel, { color: colors.foreground }]}>詞性</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {renderChip("全部", partOfSpeech === "all", () => setPartOfSpeech("all"))}
          {availableParts.map((part) => renderChip(POS_LABELS[part] ?? part, partOfSpeech === part, () => setPartOfSpeech(part)))}
        </ScrollView>

        <Text style={[styles.filterLabel, { color: colors.foreground }]}>主題分類</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {renderChip("全部", topic === "all", () => setTopic("all"))}
          {VOCABULARY_TOPICS.map((item) => renderChip(VOCABULARY_TOPIC_LABELS[item], topic === item, () => setTopic(item)))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={[styles.count, { color: colors.muted }]}>{filteredWords.length.toLocaleString()} 個單字</Text>
          <Pressable onPress={() => { tap(); setSavedOnly((current) => !current); }} style={({ pressed }) => [styles.savedToggle, { borderColor: savedOnly ? colors.warning : colors.border, backgroundColor: savedOnly ? `${colors.warning}18` : colors.surface }, pressed && styles.pressed]}><IconSymbol name="star.fill" size={14} color={savedOnly ? colors.warning : colors.muted} /><Text style={[styles.savedToggleText, { color: savedOnly ? colors.warning : colors.muted }]}>只看收藏</Text></Pressable>
        </View>

        <FlatList data={filteredWords} keyExtractor={(item) => item.word} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} renderItem={renderWord} initialNumToRender={24} maxToRenderPerBatch={30} windowSize={8} ListEmptyComponent={<View style={styles.empty}><IconSymbol name="magnifyingglass" size={26} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>找不到符合的單字</Text><Text style={[styles.emptyBody, { color: colors.muted }]}>請調整搜尋文字或篩選條件。</Text></View>} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  title: { fontSize: 29, lineHeight: 35, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 },
  studyButton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 11 },
  studyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  searchBox: { height: 52, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 9, paddingVertical: 0 },
  filterLabel: { fontSize: 12, fontWeight: "900", marginTop: 16, marginBottom: 7 },
  filterRow: { flexDirection: "row", gap: 8, paddingRight: 12 },
  filter: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 8 },
  filterText: { fontSize: 12, fontWeight: "800" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 17, marginBottom: 9 },
  count: { fontSize: 12, fontWeight: "700" },
  savedToggle: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  savedToggleText: { fontSize: 11, fontWeight: "800" },
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
  metadata: { fontSize: 10, fontWeight: "800", marginTop: 5 },
  starButton: { paddingLeft: 8 },
  empty: { alignItems: "center", paddingTop: 70 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 12 },
  emptyBody: { fontSize: 13, marginTop: 5 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  rowPressed: { opacity: 0.78 },
});
