import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CATEGORIES, PHRASES, PhraseItem } from "./src/data/phrases";

type TabMode = "Explorar" | "Quiz";

interface QuizProgress {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

const STORAGE_FAVORITES = "@nihongo-pocket-100:favorites";
const STORAGE_PROGRESS = "@nihongo-pocket-100:quiz-progress";
const QUIZ_SIZE = 10;

const defaultQuizProgress: QuizProgress = {
  correct: 0,
  total: 0,
  streak: 0,
  bestStreak: 0,
};

const palette = {
  background: "#F5F5F5",
  card: "#FFFFFF",
  accent: "#111827",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#065F46",
  danger: "#9F1239",
};

const getPhraseOfDay = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return PHRASES[dayOfYear % PHRASES.length];
};

const buildQuizQueue = () => {
  const ids = PHRASES.map((item) => item.id);
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUIZ_SIZE);
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabMode>("Explorar");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>("Todo");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [quizQueue, setQuizQueue] = useState<number[]>(() => buildQuizQueue());
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizReveal, setQuizReveal] = useState(false);
  const [quizProgress, setQuizProgress] = useState<QuizProgress>(defaultQuizProgress);
  const [isHydrated, setIsHydrated] = useState(false);

  const phraseOfDay = useMemo(() => getPhraseOfDay(), []);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [favoritesRaw, progressRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_FAVORITES),
          AsyncStorage.getItem(STORAGE_PROGRESS),
        ]);

        if (favoritesRaw) {
          const parsedFavorites = JSON.parse(favoritesRaw) as number[];
          if (Array.isArray(parsedFavorites)) {
            setFavoriteIds(parsedFavorites.filter((id) => Number.isInteger(id)));
          }
        }

        if (progressRaw) {
          const parsedProgress = JSON.parse(progressRaw) as QuizProgress;
          if (
            typeof parsedProgress?.correct === "number" &&
            typeof parsedProgress?.total === "number" &&
            typeof parsedProgress?.streak === "number" &&
            typeof parsedProgress?.bestStreak === "number"
          ) {
            setQuizProgress(parsedProgress);
          }
        }
      } catch {
        setFavoriteIds([]);
        setQuizProgress(defaultQuizProgress);
      } finally {
        setIsHydrated(true);
      }
    };

    void hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favoriteIds));
  }, [favoriteIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_PROGRESS, JSON.stringify(quizProgress));
  }, [quizProgress, isHydrated]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return PHRASES.filter((item) => {
      const matchesCategory = selectedCategory === "Todo" || item.category === selectedCategory;
      const matchesFavorite = !onlyFavorites || favoriteSet.has(item.id);

      if (!normalized) {
        return matchesCategory && matchesFavorite;
      }

      const text = `${item.japanese} ${item.romaji} ${item.spanish}`.toLowerCase();
      return matchesCategory && matchesFavorite && text.includes(normalized);
    });
  }, [query, selectedCategory, onlyFavorites, favoriteSet]);

  const currentQuizItem = useMemo(() => {
    const id = quizQueue[quizIndex];
    return PHRASES.find((item) => item.id === id) ?? null;
  }, [quizIndex, quizQueue]);

  const quizCompleted = quizIndex >= quizQueue.length;
  const accuracy = quizProgress.total > 0 ? Math.round((quizProgress.correct / quizProgress.total) * 100) : 0;

  const handleSpeak = (item: PhraseItem) => {
    Speech.stop();
    setCurrentlyPlayingId(item.id);
    Speech.speak(item.japanese, {
      language: "ja-JP",
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setCurrentlyPlayingId((current) => (current === item.id ? null : current)),
      onStopped: () => setCurrentlyPlayingId((current) => (current === item.id ? null : current)),
      onError: () => setCurrentlyPlayingId((current) => (current === item.id ? null : current)),
    });
  };

  const stopAudio = () => {
    Speech.stop();
    setCurrentlyPlayingId(null);
  };

  const toggleFavorite = (itemId: number) => {
    setFavoriteIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId].sort((a, b) => a - b)
    );
  };

  const resetQuiz = () => {
    setQuizQueue(buildQuizQueue());
    setQuizIndex(0);
    setQuizReveal(false);
  };

  const scoreAnswer = (isCorrect: boolean) => {
    setQuizProgress((current) => {
      const nextStreak = isCorrect ? current.streak + 1 : 0;
      return {
        correct: current.correct + (isCorrect ? 1 : 0),
        total: current.total + 1,
        streak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
      };
    });

    setQuizReveal(false);
    setQuizIndex((current) => current + 1);
  };

  const TabButton = ({ label }: { label: TabMode }) => {
    const active = activeTab === label;
    return (
      <Pressable onPress={() => setActiveTab(label)} style={[styles.tabButton, active && styles.tabButtonActive]}>
        <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
      </Pressable>
    );
  };

  const isPhraseOfDayFavorite = favoriteSet.has(phraseOfDay.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Nihongo Pocket 100</Text>
        <Text style={styles.subtitle}>Frases actuales para comunicarte hoy mismo en Japón.</Text>
      </View>

      <View style={styles.tabRow}>
        <TabButton label="Explorar" />
        <TabButton label="Quiz" />
      </View>

      <View style={styles.dailyCard}>
        <View style={styles.dailyTop}>
          <Text style={styles.dailyLabel}>Frase del día</Text>
          <Pressable onPress={() => toggleFavorite(phraseOfDay.id)} style={styles.favoriteMiniButton}>
            <Text style={styles.favoriteMiniButtonText}>
              {isPhraseOfDayFavorite ? "Quitar favorito" : "Guardar favorito"}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.dailyJapanese}>{phraseOfDay.japanese}</Text>
        <Text style={styles.dailyRomaji}>{phraseOfDay.romaji}</Text>
        <Text style={styles.dailySpanish}>{phraseOfDay.spanish}</Text>
        <Pressable style={styles.listenButton} onPress={() => handleSpeak(phraseOfDay)}>
          <Text style={styles.listenButtonText}>
            {currentlyPlayingId === phraseOfDay.id ? "Reproduciendo..." : "Escuchar frase del día"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Favoritos: {favoriteIds.length}</Text>
        <Pressable onPress={stopAudio} style={styles.stopButton}>
          <Text style={styles.stopButtonText}>Detener audio</Text>
        </Pressable>
      </View>

      {activeTab === "Explorar" ? (
        <>
          <View style={styles.searchWrapper}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por japonés, romaji o español"
              placeholderTextColor={palette.textSecondary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.categoryWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                  >
                    <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{category}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setOnlyFavorites((current) => !current)}
              style={[styles.favoriteFilterButton, onlyFavorites && styles.favoriteFilterButtonActive]}
            >
              <Text style={[styles.favoriteFilterButtonText, onlyFavorites && styles.favoriteFilterButtonTextActive]}>
                {onlyFavorites ? "Mostrando solo favoritos" : "Mostrar solo favoritos"}
              </Text>
            </Pressable>
            <Text style={styles.metaText}>{filteredItems.length} resultados</Text>
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isPlaying = currentlyPlayingId === item.id;
              const isFavorite = favoriteSet.has(item.id);
              return (
                <View style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.categoryTag}>{item.category}</Text>
                    <View style={styles.rightTagRow}>
                      <Text style={styles.kindTag}>{item.kind}</Text>
                      <Pressable onPress={() => toggleFavorite(item.id)} style={styles.favoriteButton}>
                        <Text style={styles.favoriteButtonText}>{isFavorite ? "Favorito" : "Guardar"}</Text>
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.japaneseText}>{item.japanese}</Text>
                  <Text style={styles.romajiText}>{item.romaji}</Text>
                  <Text style={styles.spanishText}>{item.spanish}</Text>

                  <Pressable style={styles.listenButton} onPress={() => handleSpeak(item)}>
                    <Text style={styles.listenButtonText}>{isPlaying ? "Reproduciendo..." : "Escuchar japonés"}</Text>
                  </Pressable>
                </View>
              );
            }}
          />
        </>
      ) : (
        <View style={styles.quizContainer}>
          <View style={styles.quizStatsRow}>
            <View style={styles.quizStatCard}>
              <Text style={styles.quizStatLabel}>Precisión</Text>
              <Text style={styles.quizStatValue}>{accuracy}%</Text>
            </View>
            <View style={styles.quizStatCard}>
              <Text style={styles.quizStatLabel}>Racha</Text>
              <Text style={styles.quizStatValue}>{quizProgress.streak}</Text>
            </View>
            <View style={styles.quizStatCard}>
              <Text style={styles.quizStatLabel}>Mejor racha</Text>
              <Text style={styles.quizStatValue}>{quizProgress.bestStreak}</Text>
            </View>
          </View>

          {quizCompleted ? (
            <View style={styles.quizCard}>
              <Text style={styles.quizTitle}>Sesión completada</Text>
              <Text style={styles.quizSubtitle}>Has repasado {quizQueue.length} tarjetas.</Text>
              <Pressable style={styles.primaryActionButton} onPress={resetQuiz}>
                <Text style={styles.primaryActionButtonText}>Empezar otra sesión</Text>
              </Pressable>
            </View>
          ) : currentQuizItem ? (
            <View style={styles.quizCard}>
              <Text style={styles.quizStep}>
                Tarjeta {quizIndex + 1} de {quizQueue.length}
              </Text>
              <Text style={styles.quizJapanese}>{currentQuizItem.japanese}</Text>
              <Text style={styles.quizRomaji}>{currentQuizItem.romaji}</Text>
              {quizReveal ? (
                <Text style={styles.quizSpanish}>{currentQuizItem.spanish}</Text>
              ) : (
                <Text style={styles.quizHint}>Piensa el significado y pulsa “Mostrar respuesta”.</Text>
              )}

              <View style={styles.quizActionRow}>
                <Pressable style={styles.secondaryActionButton} onPress={() => handleSpeak(currentQuizItem)}>
                  <Text style={styles.secondaryActionButtonText}>
                    {currentlyPlayingId === currentQuizItem.id ? "Reproduciendo..." : "Escuchar"}
                  </Text>
                </Pressable>
                {!quizReveal ? (
                  <Pressable style={styles.primaryActionButton} onPress={() => setQuizReveal(true)}>
                    <Text style={styles.primaryActionButtonText}>Mostrar respuesta</Text>
                  </Pressable>
                ) : (
                  <View style={styles.quizResultButtons}>
                    <Pressable
                      style={[styles.resultButton, styles.resultButtonFail]}
                      onPress={() => scoreAnswer(false)}
                    >
                      <Text style={styles.resultButtonText}>Me costó</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.resultButton, styles.resultButtonOk]}
                      onPress={() => scoreAnswer(true)}
                    >
                      <Text style={styles.resultButtonText}>La sabía</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    backgroundColor: palette.card,
    paddingVertical: 9,
    alignItems: "center",
  },
  tabButtonActive: {
    borderColor: palette.accent,
    backgroundColor: palette.accent,
  },
  tabButtonText: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  dailyCard: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  dailyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dailyLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  favoriteMiniButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#F9FAFB",
  },
  favoriteMiniButtonText: {
    color: palette.textPrimary,
    fontSize: 11,
    fontWeight: "600",
  },
  dailyJapanese: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 3,
  },
  dailyRomaji: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  dailySpanish: {
    color: palette.textPrimary,
    fontSize: 15,
    marginBottom: 10,
  },
  metaRow: {
    marginBottom: 8,
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaText: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  stopButton: {
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stopButtonText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  searchWrapper: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.textPrimary,
    fontSize: 15,
  },
  categoryWrapper: {
    marginBottom: 8,
  },
  categoryRow: {
    gap: 8,
    paddingRight: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  categoryChipActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  categoryChipText: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 2,
  },
  favoriteFilterButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: "70%",
  },
  favoriteFilterButtonActive: {
    borderColor: palette.accent,
    backgroundColor: "#E5E7EB",
  },
  favoriteFilterButtonText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteFilterButtonTextActive: {
    color: palette.textPrimary,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  rightTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryTag: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    maxWidth: "45%",
  },
  kindTag: {
    color: palette.accent,
    backgroundColor: "#F3F4F6",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  favoriteButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#F9FAFB",
  },
  favoriteButtonText: {
    color: palette.textPrimary,
    fontSize: 11,
    fontWeight: "600",
  },
  japaneseText: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  romajiText: {
    color: palette.textSecondary,
    fontSize: 15,
    marginBottom: 6,
  },
  spanishText: {
    color: palette.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  listenButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: palette.accent,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  listenButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  quizContainer: {
    flex: 1,
  },
  quizStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  quizStatCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  quizStatLabel: {
    color: palette.textSecondary,
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "600",
  },
  quizStatValue: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  quizCard: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 14,
  },
  quizStep: {
    color: palette.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "600",
  },
  quizTitle: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  quizSubtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: 14,
  },
  quizJapanese: {
    color: palette.textPrimary,
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 8,
  },
  quizRomaji: {
    color: palette.textSecondary,
    fontSize: 16,
    marginBottom: 14,
  },
  quizSpanish: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },
  quizHint: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: 14,
  },
  quizActionRow: {
    gap: 8,
  },
  primaryActionButton: {
    borderRadius: 10,
    backgroundColor: palette.accent,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryActionButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  secondaryActionButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  quizResultButtons: {
    flexDirection: "row",
    gap: 8,
  },
  resultButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  resultButtonFail: {
    backgroundColor: palette.danger,
  },
  resultButtonOk: {
    backgroundColor: palette.success,
  },
  resultButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
