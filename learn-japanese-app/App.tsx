import { StatusBar } from "expo-status-bar";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CATEGORIES, PHRASES, PhraseItem } from "./src/data/phrases";

const palette = {
  background: "#F5F5F5",
  card: "#FFFFFF",
  accent: "#111827",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>("Todo");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return PHRASES.filter((item) => {
      const matchesCategory = selectedCategory === "Todo" || item.category === selectedCategory;

      if (!normalized) {
        return matchesCategory;
      }

      const text = `${item.japanese} ${item.romaji} ${item.spanish}`.toLowerCase();
      return matchesCategory && text.includes(normalized);
    });
  }, [query, selectedCategory]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Japanese Pocket 100</Text>
        <Text style={styles.subtitle}>Frases y palabras reales para usar hoy en Japón.</Text>
      </View>

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

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{filteredItems.length} resultados</Text>
        <Pressable onPress={stopAudio} style={styles.stopButton}>
          <Text style={styles.stopButtonText}>Detener audio</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isPlaying = currentlyPlayingId === item.id;
          return (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.categoryTag}>{item.category}</Text>
                <Text style={styles.kindTag}>{item.kind}</Text>
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
    marginBottom: 14,
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
  metaRow: {
    marginBottom: 8,
    marginTop: 4,
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
  listContent: {
    paddingBottom: 32,
    gap: 10,
  },
  card: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryTag: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: "600",
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
});
