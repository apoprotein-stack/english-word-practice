import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { DIFFICULTIES, getDailyLesson, type Difficulty } from "@/lib/lesson-data";
import { usePracticeProgress } from "@/lib/practice-progress";

function speak(text: string) {
  if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
    return;
  }
  Speech.stop();
  Speech.speak(text, { language: "en-US", rate: 0.88 });
}

export default function HomeScreen() {
  const colors = useColors();
  const [difficulty, setDifficulty] = useState<Difficulty>("simple");
  const [difficultyLoaded, setDifficultyLoaded] = useState(false);
  const lesson = getDailyLesson(new Date(), difficulty);
  const displayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const { streak, completedToday, todayRecord, markComplete } = usePracticeProgress();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const lessonCompletedToday = completedToday && todayRecord?.lessonId === lesson.id;

  useEffect(() => {
    AsyncStorage.getItem("listenloop.difficulty")
      .then((value) => {
        if (value === "simple" || value === "medium" || value === "advanced" || value === "professional") setDifficulty(value);
      })
      .finally(() => setDifficultyLoaded(true));
  }, []);

  useEffect(() => {
    if (difficultyLoaded) AsyncStorage.setItem("listenloop.difficulty", difficulty).catch(() => undefined);
  }, [difficulty, difficultyLoaded]);

  useEffect(() => {
    if (lessonCompletedToday && todayRecord) {
      setSubmitted(true);
      setReason(todayRecord.answers?.reason ?? "");
      setResult(todayRecord.answers?.result ?? "");
    } else {
      setSubmitted(false);
      setReason("");
      setResult("");
    }
  }, [lesson.id, lessonCompletedToday, todayRecord]);

  const answerScore = useMemo(() => {
    const combined = `${reason} ${result}`.toLowerCase();
    return lesson.keyPhrases.filter((phrase) => combined.includes(phrase.toLowerCase())).length;
  }, [reason, result]);

  const handlePlay = () => {
    setIsPlaying(true);
    speak(lesson.script);
    setTimeout(() => setIsPlaying(false), 43000);
  };

  const handleMic = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Voice practice", "Voice transcription is ready for the web preview. Native speech recognition can be connected next with the device Speech framework.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert("Microphone unavailable", "Try Chrome or Edge to use browser speech recognition.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setResult((current) => `${current}${current ? " " : ""}${event.results[0][0].transcript}`);
    };
    recognition.start();
  };

  const submitAnswers = async () => {
    if (!reason.trim() && !result.trim()) {
      Alert.alert("Add your answer", "Type or record a quick answer before checking your understanding.");
      return;
    }
    await markComplete(lesson.id, answerScore, { reason, result });
    setSubmitted(true);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>{displayDate}</Text>
              <Text style={[styles.greeting, { color: colors.foreground }]}>Ready to listen?</Text>
            </View>
            <View style={[styles.streakPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.fire}>✦</Text>
              <Text style={[styles.streakText, { color: colors.foreground }]}>{streak} day streak</Text>
            </View>
          </View>

          <View style={styles.difficultySection}>
            <Text style={[styles.difficultyLabel, { color: colors.muted }]}>CHOOSE YOUR LEVEL</Text>
            <View style={styles.difficultyRow}>
              {DIFFICULTIES.map((item) => {
                const active = difficulty === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setDifficulty(item.value)}
                    style={({ pressed }) => [
                      styles.difficultyChip,
                      { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.difficultyChipText, { color: active ? "#FFFFFF" : colors.foreground }]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.lessonCard, { backgroundColor: colors.primary }]}> 
            <View style={styles.lessonHeader}>
              <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>DAY {String(lesson.day).padStart(2, "0")}</Text></View>
              <Text style={styles.lessonMeta}>{lesson.duration} LISTEN</Text>
            </View>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonSub}>{lesson.level}</Text>
            <Pressable onPress={handlePlay} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
              <IconSymbol name="play.fill" size={20} color={colors.primary} />
              <Text style={[styles.playText, { color: colors.primary }]}>{isPlaying ? "Playing…" : "Play audio"}</Text>
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Listen first</Text>
            <Text style={[styles.sectionHint, { color: colors.muted }]}>Read along if needed</Text>
          </View>
          <View style={[styles.scriptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.script, { color: colors.foreground }]}>{lesson.script}</Text>
            <View style={styles.scriptFooter}>
              <View style={[styles.chip, { backgroundColor: `${colors.primary}16` }]}><Text style={[styles.chipText, { color: colors.primary }]}>AMERICAN ENGLISH</Text></View>
              <Text style={[styles.speedText, { color: colors.muted }]}>0.88× natural</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Check your understanding</Text>
            <Text style={[styles.progressText, { color: colors.primary }]}>2 questions</Text>
          </View>
          <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.questionNumber, { color: colors.primary }]}>01</Text>
            <Text style={[styles.question, { color: colors.foreground }]}>{lesson.questions[0]}</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Type your answer…"
              placeholderTextColor={colors.muted}
              multiline
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
            <View style={styles.answerActions}>
              <Pressable onPress={handleMic} style={({ pressed }) => [styles.micButton, { borderColor: isListening ? colors.error : colors.border }, pressed && styles.pressed]}>
                <IconSymbol name="mic.fill" size={18} color={isListening ? colors.error : colors.primary} />
                <Text style={[styles.micText, { color: isListening ? colors.error : colors.primary }]}>{isListening ? "Listening…" : "Answer by voice"}</Text>
              </Pressable>
              <Text style={[styles.voiceNote, { color: colors.muted }]}>EN-US</Text>
            </View>

            <Text style={[styles.questionNumber, { color: colors.primary, marginTop: 22 }]}>02</Text>
            <Text style={[styles.question, { color: colors.foreground }]}>{lesson.questions[1]}</Text>
            <TextInput
              value={result}
              onChangeText={setResult}
              placeholder="Type or use the mic above…"
              placeholderTextColor={colors.muted}
              multiline
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
          </View>

          <Pressable onPress={submitAnswers} style={({ pressed }) => [styles.checkButton, { backgroundColor: colors.foreground }, pressed && styles.pressed]}>
            <Text style={[styles.checkButtonText, { color: colors.background }]}>{submitted ? "Saved for today" : "Check my answers"}</Text>
            <IconSymbol name="chevron.right" size={19} color={colors.background} />
          </Pressable>

          {submitted && (
            <View style={[styles.feedbackCard, { backgroundColor: `${colors.success}18`, borderColor: `${colors.success}55` }]}>
              <View style={styles.feedbackTitleRow}>
                <IconSymbol name="checkmark.circle.fill" size={22} color={colors.success} />
                <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>Nice work — key ideas found</Text>
              </View>
              <Text style={[styles.feedbackBody, { color: colors.foreground }]}>You picked up {answerScore} of {lesson.keyPhrases.length} key details. The natural answer is: “{lesson.naturalAnswer}”</Text>
              <Text style={[styles.feedbackTip, { color: colors.success }]}>Try saying it once more in your own words.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 18, paddingBottom: 36, gap: 18 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  greeting: { fontSize: 29, fontWeight: "800", letterSpacing: -0.7, marginTop: 5 },
  streakPill: { flexDirection: "row", alignItems: "center", borderRadius: 18, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9, marginTop: 4 },
  fire: { color: "#E96845", fontSize: 17, marginRight: 5 },
  streakText: { fontSize: 12, fontWeight: "700" },
  difficultySection: { gap: 9, marginTop: -2 },
  difficultyLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  difficultyRow: { flexDirection: "row", gap: 7 },
  difficultyChip: { flex: 1, minHeight: 36, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  difficultyChipText: { fontSize: 12, fontWeight: "800" },
  lessonCard: { borderRadius: 26, padding: 22, minHeight: 191, shadowColor: "#E96845", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  lessonHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayBadge: { backgroundColor: "#FFFFFF33", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  dayBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  lessonMeta: { color: "#FFFFFFCC", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  lessonTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginTop: 19, letterSpacing: -0.5 },
  lessonSub: { color: "#FFFFFFCC", fontSize: 13, marginTop: 5 },
  playButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 15, paddingHorizontal: 15, paddingVertical: 11, marginTop: 18 },
  playText: { fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  sectionHint: { fontSize: 12 },
  progressText: { fontSize: 12, fontWeight: "700" },
  scriptCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  script: { fontSize: 16, lineHeight: 26, fontWeight: "500" },
  scriptFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
  chip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  chipText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  speedText: { fontSize: 11, fontWeight: "600" },
  questionCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  questionNumber: { fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  question: { fontSize: 16, lineHeight: 23, fontWeight: "700", marginTop: 6, marginBottom: 13 },
  input: { minHeight: 64, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, textAlignVertical: "top" },
  answerActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  micButton: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 },
  micText: { fontSize: 12, fontWeight: "800" },
  voiceNote: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  checkButton: { minHeight: 54, borderRadius: 17, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  checkButtonText: { fontSize: 15, fontWeight: "800" },
  feedbackCard: { borderWidth: 1, borderRadius: 20, padding: 17 },
  feedbackTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  feedbackTitle: { fontSize: 15, fontWeight: "800" },
  feedbackBody: { fontSize: 14, lineHeight: 22, marginTop: 11 },
  feedbackTip: { fontSize: 13, fontWeight: "800", marginTop: 12 },
});
