import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { CATEGORIES, PHRASES, PhraseItem } from "./src/data/phrases";

type TabMode = "Hoy" | "Explorar" | "Repasar";

interface LeitnerCard {
  box: 1 | 2 | 3;
  lastReviewed: string;
  correctStreak: number;
}

type LeitnerState = Record<number, LeitnerCard>;

const STORAGE_FAVORITES = "@learn-japanese:favorites";
const STORAGE_LEITNER = "@learn-japanese:leitner";

const BOX_INTERVALS_MS: Record<1 | 2 | 3, number> = {
  1: 0,
  2: 2 * 24 * 60 * 60 * 1000,
  3: 7 * 24 * 60 * 60 * 1000,
};

const palette = {
  background: "#F7F5F2",
  card: "#FFFFFF",
  accent: "#B33A3A",
  accentSoft: "#FCE8E6",
  textPrimary: "#1A1A2E",
  textSecondary: "#64748B",
  border: "#E8E4DF",
  success: "#2F6B4F",
  danger: "#C2185B",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const getPhraseOfDay = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return PHRASES[dayOfYear % PHRASES.length];
};

const isDue = (card: LeitnerCard): boolean => {
  const elapsed = Date.now() - new Date(card.lastReviewed).getTime();
  return elapsed >= BOX_INTERVALS_MS[card.box];
};

const buildReviewQueue = (leitner: LeitnerState): number[] => {
  const box1: number[] = [];
  const box2: number[] = [];
  const box3: number[] = [];

  for (const phrase of PHRASES) {
    const card = leitner[phrase.id];
    if (!card) {
      box1.push(phrase.id);
    } else if (card.box === 1 || isDue(card)) {
      if (card.box === 1) box1.push(phrase.id);
      else if (card.box === 2) box2.push(phrase.id);
      else box3.push(phrase.id);
    }
  }

  const shuffle = (arr: number[]) => arr.sort(() => Math.random() - 0.5);
  return [...shuffle(box1), ...shuffle(box2), ...shuffle(box3)];
};

const getLeitnerStats = (leitner: LeitnerState) => {
  let nueva = 0;
  let repasando = 0;
  let dominada = 0;

  const knownIds = new Set(Object.keys(leitner).map(Number));

  for (const phrase of PHRASES) {
    const card = leitner[phrase.id];
    if (!card || !knownIds.has(phrase.id)) {
      nueva++;
    } else if (card.box === 1) {
      nueva++;
    } else if (card.box === 2) {
      repasando++;
    } else {
      dominada++;
    }
  }

  return { nueva, repasando, dominada, total: PHRASES.length };
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabMode>("Hoy");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>("Todo");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [slowAudio, setSlowAudio] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [leitner, setLeitner] = useState<LeitnerState>({});
  const [reviewQueue, setReviewQueue] = useState<number[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewReveal, setReviewReveal] = useState(false);
  const [reviewActive, setReviewActive] = useState(false);
  const [sessionResults, setSessionResults] = useState({ correct: 0, wrong: 0, newDominated: 0 });

  const phraseOfDay = useMemo(() => getPhraseOfDay(), []);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const stats = useMemo(() => getLeitnerStats(leitner), [leitner]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [favRaw, leitnerRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_FAVORITES),
          AsyncStorage.getItem(STORAGE_LEITNER),
        ]);
        if (favRaw) {
          const parsed = JSON.parse(favRaw) as number[];
          if (Array.isArray(parsed)) setFavoriteIds(parsed.filter((id) => Number.isInteger(id)));
        }
        if (leitnerRaw) {
          const parsed = JSON.parse(leitnerRaw) as LeitnerState;
          if (typeof parsed === "object" && parsed !== null) setLeitner(parsed);
        }
      } catch {
        /* defaults */
      } finally {
        setIsHydrated(true);
      }
    };
    void hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favoriteIds));
  }, [favoriteIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    void AsyncStorage.setItem(STORAGE_LEITNER, JSON.stringify(leitner));
  }, [leitner, isHydrated]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PHRASES.filter((item) => {
      const matchesCat = selectedCategory === "Todo" || item.category === selectedCategory;
      if (!normalized) return matchesCat;
      const text = `${item.japanese} ${item.romaji} ${item.spanish}`.toLowerCase();
      return matchesCat && text.includes(normalized);
    });
  }, [query, selectedCategory]);

  const dueCount = useMemo(() => buildReviewQueue(leitner).length, [leitner]);

  const handleSpeak = useCallback(
    (item: PhraseItem) => {
      Speech.stop();
      setCurrentlyPlayingId(item.id);
      Speech.speak(item.japanese, {
        language: "ja-JP",
        pitch: 1.0,
        rate: slowAudio ? 0.6 : 0.95,
        onDone: () => setCurrentlyPlayingId((c) => (c === item.id ? null : c)),
        onStopped: () => setCurrentlyPlayingId((c) => (c === item.id ? null : c)),
        onError: () => setCurrentlyPlayingId((c) => (c === item.id ? null : c)),
      });
    },
    [slowAudio],
  );

  const toggleFavorite = (itemId: number) => {
    setFavoriteIds((cur) =>
      cur.includes(itemId) ? cur.filter((id) => id !== itemId) : [...cur, itemId].sort((a, b) => a - b),
    );
  };

  const startReview = () => {
    const queue = buildReviewQueue(leitner);
    if (queue.length === 0) return;
    setReviewQueue(queue.slice(0, 20));
    setReviewIndex(0);
    setReviewReveal(false);
    setReviewActive(true);
    setSessionResults({ correct: 0, wrong: 0, newDominated: 0 });
  };

  const scoreReview = (correct: boolean) => {
    const phraseId = reviewQueue[reviewIndex];
    if (phraseId == null) return;

    setLeitner((prev) => {
      const card = prev[phraseId] ?? { box: 1 as const, lastReviewed: new Date().toISOString(), correctStreak: 0 };
      const now = new Date().toISOString();

      if (correct) {
        const nextBox = card.box < 3 ? ((card.box + 1) as 1 | 2 | 3) : 3;
        const wasDominated = card.box === 3;
        if (!wasDominated && nextBox === 3) {
          setSessionResults((r) => ({ ...r, correct: r.correct + 1, newDominated: r.newDominated + 1 }));
        } else {
          setSessionResults((r) => ({ ...r, correct: r.correct + 1 }));
        }
        return { ...prev, [phraseId]: { box: nextBox, lastReviewed: now, correctStreak: card.correctStreak + 1 } };
      } else {
        setSessionResults((r) => ({ ...r, wrong: r.wrong + 1 }));
        return { ...prev, [phraseId]: { box: 1, lastReviewed: now, correctStreak: 0 } };
      }
    });

    setReviewReveal(false);
    setReviewIndex((i) => i + 1);
  };

  const reviewCompleted = reviewActive && reviewIndex >= reviewQueue.length;
  const currentReviewItem = reviewActive && !reviewCompleted ? PHRASES.find((p) => p.id === reviewQueue[reviewIndex]) ?? null : null;

  const favoriteItems = useMemo(() => PHRASES.filter((p) => favoriteSet.has(p.id)), [favoriteSet]);

  const TabButton = ({ label }: { label: TabMode }) => {
    const active = activeTab === label;
    const badge = label === "Repasar" && dueCount > 0 ? dueCount : null;
    return (
      <Pressable onPress={() => setActiveTab(label)} style={[s.tabBtn, active && s.tabBtnActive]}>
        <Text style={[s.tabBtnText, active && s.tabBtnTextActive]}>{label}</Text>
        {badge != null && <View style={s.badge}><Text style={s.badgeText}>{badge > 99 ? "99+" : badge}</Text></View>}
      </Pressable>
    );
  };

  const AudioButton = ({ item, label }: { item: PhraseItem; label?: string }) => {
    const playing = currentlyPlayingId === item.id;
    return (
      <View style={s.audioRow}>
        <Pressable style={s.listenBtn} onPress={() => handleSpeak(item)}>
          <Text style={s.listenBtnText}>{playing ? "..." : label ?? "Escuchar"}</Text>
        </Pressable>
        <Pressable style={[s.speedBtn, slowAudio && s.speedBtnActive]} onPress={() => setSlowAudio((c) => !c)}>
          <Text style={[s.speedBtnText, slowAudio && s.speedBtnTextActive]}>{slowAudio ? "Lento" : "Normal"}</Text>
        </Pressable>
      </View>
    );
  };

  // ─── Render ───

  return (
    <View style={[s.screen, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar style="dark" translucent={false} />

      <View style={s.header}>
        <Text style={s.title}>LearnJapanese</Text>
      </View>

      <View style={s.tabRow}>
        <TabButton label="Hoy" />
        <TabButton label="Explorar" />
        <TabButton label="Repasar" />
      </View>

      {/* ═══ TAB HOY ═══ */}
      {activeTab === "Hoy" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <View style={s.card}>
            <Text style={s.sectionLabel}>Frase del día</Text>
            <Text style={s.dailyJP}>{phraseOfDay.japanese}</Text>
            <Text style={s.dailyRomaji}>{phraseOfDay.romaji}</Text>
            <Text style={s.dailyES}>{phraseOfDay.spanish}</Text>
            <View style={s.dailyActions}>
              <AudioButton item={phraseOfDay} label="Escuchar" />
              <Pressable onPress={() => toggleFavorite(phraseOfDay.id)} style={s.favMiniBtn}>
                <Text style={s.favMiniBtnText}>{favoriteSet.has(phraseOfDay.id) ? "Quitar favorito" : "Guardar"}</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.sectionLabel}>Tu progreso</Text>
            <View style={s.progressBarContainer}>
              <View style={[s.progressBarFill, { width: `${Math.round((stats.dominada / stats.total) * 100)}%` as `${number}%` }]} />
            </View>
            <Text style={s.progressText}>
              {stats.dominada} de {stats.total} dominadas
            </Text>
            <View style={s.statsRow}>
              <View style={s.statBlock}>
                <Text style={s.statNum}>{stats.nueva}</Text>
                <Text style={s.statLabel}>Nuevas</Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.statNum}>{stats.repasando}</Text>
                <Text style={s.statLabel}>Repasando</Text>
              </View>
              <View style={s.statBlock}>
                <Text style={[s.statNum, { color: palette.success }]}>{stats.dominada}</Text>
                <Text style={s.statLabel}>Dominadas</Text>
              </View>
            </View>
          </View>

          {dueCount > 0 && (
            <Pressable style={s.reviewCTA} onPress={() => { setActiveTab("Repasar"); startReview(); }}>
              <Text style={s.reviewCTAText}>Tienes {dueCount} frases para repasar</Text>
            </Pressable>
          )}

          {favoriteItems.length > 0 && (
            <View style={s.card}>
              <Text style={s.sectionLabel}>Favoritos ({favoriteItems.length})</Text>
              {favoriteItems.map((item) => (
                <View key={item.id} style={s.favRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.favJP}>{item.japanese}</Text>
                    <Text style={s.favES}>{item.spanish}</Text>
                  </View>
                  <Pressable style={s.listenBtnSmall} onPress={() => handleSpeak(item)}>
                    <Text style={s.listenBtnSmallText}>{currentlyPlayingId === item.id ? "..." : "Oír"}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ═══ TAB EXPLORAR ═══ */}
      {activeTab === "Explorar" && (
        <View style={{ flex: 1 }}>
          <View style={s.searchWrap}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por japonés, romaji o español"
              placeholderTextColor={palette.textSecondary}
              style={s.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={s.catWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <Pressable key={cat} onPress={() => setSelectedCategory(cat)} style={[s.chip, active && s.chipActive]}>
                    <Text style={[s.chipText, active && s.chipTextActive]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Text style={s.resultCount}>{filteredItems.length} resultados</Text>

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => {
              const isFav = favoriteSet.has(item.id);
              return (
                <View style={s.exploreCard}>
                  <View style={s.exploreTop}>
                    <Text style={s.exploreCat}>{item.category}</Text>
                    <Pressable onPress={() => toggleFavorite(item.id)} style={[s.favMiniBtn, isFav && s.favMiniBtnActive]}>
                      <Text style={[s.favMiniBtnText, isFav && s.favMiniBtnTextActive]}>{isFav ? "Guardado" : "Guardar"}</Text>
                    </Pressable>
                  </View>
                  <Text style={s.exploreJP}>{item.japanese}</Text>
                  <Text style={s.exploreRomaji}>{item.romaji}</Text>
                  <Text style={s.exploreES}>{item.spanish}</Text>
                  <AudioButton item={item} />
                </View>
              );
            }}
          />
        </View>
      )}

      {/* ═══ TAB REPASAR ═══ */}
      {activeTab === "Repasar" && (
        <View style={{ flex: 1 }}>
          {!reviewActive ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
              <View style={s.card}>
                <Text style={s.sectionLabel}>Estado de aprendizaje</Text>
                <View style={s.statsRow}>
                  <View style={s.statBlock}>
                    <Text style={s.statNum}>{stats.nueva}</Text>
                    <Text style={s.statLabel}>Nuevas</Text>
                  </View>
                  <View style={s.statBlock}>
                    <Text style={s.statNum}>{stats.repasando}</Text>
                    <Text style={s.statLabel}>Repasando</Text>
                  </View>
                  <View style={s.statBlock}>
                    <Text style={[s.statNum, { color: palette.success }]}>{stats.dominada}</Text>
                    <Text style={s.statLabel}>Dominadas</Text>
                  </View>
                </View>
                <View style={s.progressBarContainer}>
                  <View style={[s.progressBarFill, { width: `${Math.round((stats.dominada / stats.total) * 100)}%` as `${number}%` }]} />
                </View>
                <Text style={s.progressText}>{stats.dominada} de {stats.total} dominadas</Text>
              </View>

              {dueCount > 0 ? (
                <Pressable style={s.startBtn} onPress={startReview}>
                  <Text style={s.startBtnText}>Empezar repaso ({dueCount} pendientes)</Text>
                </Pressable>
              ) : (
                <View style={s.card}>
                  <Text style={s.emptyTitle}>Todo al día</Text>
                  <Text style={s.emptyText}>No tienes frases pendientes de repaso. Vuelve más tarde o explora frases nuevas.</Text>
                </View>
              )}
            </ScrollView>
          ) : reviewCompleted ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
              <View style={s.card}>
                <Text style={s.reviewDoneTitle}>Sesión completa</Text>
                <Text style={s.reviewDoneSub}>
                  Repasaste {sessionResults.correct + sessionResults.wrong} frases
                </Text>
                <View style={s.statsRow}>
                  <View style={s.statBlock}>
                    <Text style={[s.statNum, { color: palette.success }]}>{sessionResults.correct}</Text>
                    <Text style={s.statLabel}>La sabía</Text>
                  </View>
                  <View style={s.statBlock}>
                    <Text style={[s.statNum, { color: palette.danger }]}>{sessionResults.wrong}</Text>
                    <Text style={s.statLabel}>No me salía</Text>
                  </View>
                  {sessionResults.newDominated > 0 && (
                    <View style={s.statBlock}>
                      <Text style={[s.statNum, { color: palette.accent }]}>{sessionResults.newDominated}</Text>
                      <Text style={s.statLabel}>Nuevas dominadas</Text>
                    </View>
                  )}
                </View>
              </View>
              <Pressable style={s.startBtn} onPress={() => setReviewActive(false)}>
                <Text style={s.startBtnText}>Volver</Text>
              </Pressable>
            </ScrollView>
          ) : currentReviewItem ? (
            <View style={s.reviewScreen}>
              <Text style={s.reviewStep}>
                {reviewIndex + 1} de {reviewQueue.length}
              </Text>
              <View style={s.reviewCard}>
                <Text style={s.reviewContext}>{currentReviewItem.category}</Text>
                <Text style={s.reviewPrompt}>¿Cómo se dice en japonés?</Text>
                <Text style={s.reviewES}>{currentReviewItem.spanish}</Text>

                {reviewReveal ? (
                  <>
                    <View style={s.divider} />
                    <Text style={s.reviewJP}>{currentReviewItem.japanese}</Text>
                    <Text style={s.reviewRomaji}>{currentReviewItem.romaji}</Text>
                    <AudioButton item={currentReviewItem} label="Escuchar" />
                    <View style={s.reviewBtns}>
                      <Pressable style={s.btnFail} onPress={() => scoreReview(false)}>
                        <Text style={s.btnResultText}>No me salía</Text>
                      </Pressable>
                      <Pressable style={s.btnOk} onPress={() => scoreReview(true)}>
                        <Text style={s.btnResultText}>La sabía</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <Pressable style={s.revealBtn} onPress={() => setReviewReveal(true)}>
                    <Text style={s.revealBtnText}>Ver respuesta</Text>
                  </Pressable>
                )}
              </View>

              <Pressable style={s.cancelReview} onPress={() => setReviewActive(false)}>
                <Text style={s.cancelReviewText}>Salir del repaso</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background, paddingHorizontal: 16 },
  header: { marginBottom: 10 },
  title: { color: palette.textPrimary, fontSize: 28, fontWeight: "800", letterSpacing: -0.4 },

  // Tabs
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tabBtn: {
    flex: 1, borderWidth: 1, borderColor: palette.border, borderRadius: 14,
    backgroundColor: palette.card, paddingVertical: 11, alignItems: "center", position: "relative",
  },
  tabBtnActive: { borderColor: palette.accent, backgroundColor: palette.accent },
  tabBtnText: { color: palette.textSecondary, fontSize: 14, fontWeight: "700" },
  tabBtnTextActive: { color: "#FFFFFF" },
  badge: {
    position: "absolute", top: -6, right: -4, backgroundColor: palette.danger,
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: "center",
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },

  // Shared card
  card: {
    backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: 18,
    padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  sectionLabel: {
    color: palette.textSecondary, fontSize: 12, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10,
  },

  // Audio
  audioRow: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 },
  listenBtn: {
    borderRadius: 12, backgroundColor: palette.accent, paddingVertical: 9, paddingHorizontal: 13,
  },
  listenBtnText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  speedBtn: {
    borderRadius: 10, borderWidth: 1, borderColor: palette.border,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.card,
  },
  speedBtnActive: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  speedBtnText: { color: palette.textSecondary, fontSize: 12, fontWeight: "600" },
  speedBtnTextActive: { color: palette.accent },

  // ─── Hoy ───
  dailyJP: { color: palette.textPrimary, fontSize: 26, fontWeight: "800", marginBottom: 4 },
  dailyRomaji: { color: palette.textSecondary, fontSize: 14, marginBottom: 4 },
  dailyES: { color: palette.textPrimary, fontSize: 16, marginBottom: 10 },
  dailyActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  progressBarContainer: {
    height: 8, backgroundColor: palette.border, borderRadius: 4, overflow: "hidden", marginBottom: 8,
  },
  progressBarFill: { height: 8, backgroundColor: palette.success, borderRadius: 4 },
  progressText: { color: palette.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 12 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statBlock: {
    flex: 1, backgroundColor: palette.background, borderRadius: 12, padding: 10, alignItems: "center",
  },
  statNum: { color: palette.textPrimary, fontSize: 22, fontWeight: "800" },
  statLabel: { color: palette.textSecondary, fontSize: 11, fontWeight: "600", marginTop: 2 },

  reviewCTA: {
    backgroundColor: palette.accent, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 12,
  },
  reviewCTAText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  favRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: palette.border,
  },
  favJP: { color: palette.textPrimary, fontSize: 17, fontWeight: "700" },
  favES: { color: palette.textSecondary, fontSize: 13, marginTop: 2 },
  listenBtnSmall: {
    borderRadius: 10, backgroundColor: palette.accent, paddingVertical: 7, paddingHorizontal: 12, marginLeft: 10,
  },
  listenBtnSmallText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  favMiniBtn: {
    borderRadius: 10, borderWidth: 1, borderColor: palette.border,
    paddingHorizontal: 10, paddingVertical: 6, backgroundColor: palette.card,
  },
  favMiniBtnActive: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  favMiniBtnText: { color: palette.textPrimary, fontSize: 12, fontWeight: "600" },
  favMiniBtnTextActive: { color: palette.accent },

  // ─── Explorar ───
  searchWrap: { marginBottom: 10 },
  searchInput: {
    backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: 14,
    paddingHorizontal: 15, paddingVertical: 12, color: palette.textPrimary, fontSize: 15,
  },
  catWrap: { marginBottom: 8 },
  catRow: { gap: 8, paddingRight: 8 },
  chip: {
    borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card,
    paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999,
  },
  chipActive: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FFF" },
  resultCount: { color: palette.textSecondary, fontSize: 12, fontWeight: "500", marginBottom: 8, marginLeft: 2 },

  exploreCard: {
    backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: 16,
    padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1,
  },
  exploreTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  exploreCat: { color: palette.textSecondary, fontSize: 11, fontWeight: "600" },
  exploreJP: { color: palette.textPrimary, fontSize: 24, fontWeight: "800", marginBottom: 3 },
  exploreRomaji: { color: palette.textSecondary, fontSize: 14, marginBottom: 3 },
  exploreES: { color: palette.textPrimary, fontSize: 15, lineHeight: 22, marginBottom: 8 },

  // ─── Repasar ───
  startBtn: {
    backgroundColor: palette.accent, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 12,
  },
  startBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  emptyTitle: { color: palette.textPrimary, fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: palette.textSecondary, fontSize: 14, lineHeight: 20 },

  reviewScreen: { flex: 1, justifyContent: "center" },
  reviewStep: { color: palette.textSecondary, fontSize: 13, fontWeight: "600", textAlign: "center", marginBottom: 12 },
  reviewCard: {
    backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: 20,
    padding: 20, marginHorizontal: 4, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  reviewContext: {
    color: palette.accent, fontSize: 12, fontWeight: "700", textTransform: "uppercase",
    letterSpacing: 0.4, marginBottom: 14,
  },
  reviewPrompt: { color: palette.textSecondary, fontSize: 14, marginBottom: 6 },
  reviewES: { color: palette.textPrimary, fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  divider: { width: "60%", height: 1, backgroundColor: palette.border, marginBottom: 16 },
  reviewJP: { color: palette.textPrimary, fontSize: 30, fontWeight: "800", marginBottom: 4, textAlign: "center" },
  reviewRomaji: { color: palette.textSecondary, fontSize: 16, marginBottom: 12 },
  revealBtn: {
    backgroundColor: palette.accent, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 32, alignItems: "center",
  },
  revealBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  reviewBtns: { flexDirection: "row", gap: 12, marginTop: 14, width: "100%" },
  btnFail: {
    flex: 1, backgroundColor: palette.danger, borderRadius: 14, paddingVertical: 14, alignItems: "center",
  },
  btnOk: {
    flex: 1, backgroundColor: palette.success, borderRadius: 14, paddingVertical: 14, alignItems: "center",
  },
  btnResultText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  cancelReview: { alignItems: "center", marginTop: 16, paddingVertical: 10 },
  cancelReviewText: { color: palette.textSecondary, fontSize: 14, fontWeight: "600" },

  reviewDoneTitle: { color: palette.textPrimary, fontSize: 24, fontWeight: "800", marginBottom: 6 },
  reviewDoneSub: { color: palette.textSecondary, fontSize: 15, marginBottom: 16 },
});
