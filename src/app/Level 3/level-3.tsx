import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ReflectionModal, {
  ReflectionFormData,
} from "../../components/learning/ReflectionModal";

import { ambilProgress } from "../../services/auth/learningProgress";

import {
  apakahReflectionSelesai,
  simpanReflection,
} from "../../services/auth/levelReflection";

// =====================================================
// KONFIGURASI LEVEL
// =====================================================

const LEVEL = 3;

const TOTAL_STARS = 3;

// Minimal bintang setiap skill untuk membuka Reflection.
const MINIMUM_STARS = 2;

// =====================================================
// TYPE
// =====================================================

type SkillId = "listening" | "speaking" | "reading" | "writing";

type Skill = {
  id: SkillId;
  nama: string;
  ikon: keyof typeof MaterialCommunityIcons.glyphMap;
  warna: string;
};

// =====================================================
// DAFTAR SKILL
// =====================================================

const DAFTAR_SKILL: Skill[] = [
  {
    id: "listening",
    nama: "Listening",
    ikon: "headphones",
    warna: "#333333",
  },
  {
    id: "speaking",
    nama: "Speaking",
    ikon: "account-voice",
    warna: "#2783D7",
  },
  {
    id: "reading",
    nama: "Reading",
    ikon: "book-open-page-variant",
    warna: "#E95C42",
  },
  {
    id: "writing",
    nama: "Writing",
    ikon: "pencil",
    warna: "#F1A72A",
  },
];

// =====================================================
// HALAMAN LEVEL 3
// =====================================================

export default function LevelThreeScreen() {
  const [skillSelesai, setSkillSelesai] = useState<Record<SkillId, number>>({
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  });

  const [loadingProgress, setLoadingProgress] = useState(true);

  const [reflectionVisible, setReflectionVisible] = useState(false);

  const [reflectionCompleted, setReflectionCompleted] = useState(false);

  // =====================================================
  // AUDIO MATERI
  // =====================================================

  const audioPlayer = useAudioPlayer(
    require("../../../assets/audio/level-3/listening/Superlative Degree.wav"),
  );

  const audioStatus = useAudioPlayerStatus(audioPlayer);

  function toggleAudio() {
    if (audioStatus.playing) {
      audioPlayer.pause();
      return;
    }

    audioPlayer.seekTo(0);
    audioPlayer.play();
  }

  // =====================================================
  // CEK APAKAH SEMUA SKILL SUDAH MINIMAL 2 BINTANG
  // =====================================================

  const semuaSkillMemenuhiSyarat =
    skillSelesai.listening >= MINIMUM_STARS &&
    skillSelesai.speaking >= MINIMUM_STARS &&
    skillSelesai.reading >= MINIMUM_STARS &&
    skillSelesai.writing >= MINIMUM_STARS;

  // =====================================================
  // LOAD PROGRESS
  //
  // useFocusEffect dipakai supaya progress diperbarui
  // setiap kali siswa kembali dari halaman skill.
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadAllProgress() {
        setLoadingProgress(true);

        try {
          const [
            listeningProgress,
            speakingProgress,
            readingProgress,
            writingProgress,
          ] = await Promise.all([
            ambilProgress(LEVEL, "listening"),
            ambilProgress(LEVEL, "speaking"),
            ambilProgress(LEVEL, "reading"),
            ambilProgress(LEVEL, "writing"),
          ]);

          if (!active) return;

          // =================================================
          // HITUNG BINTANG BERDASARKAN JUMLAH SOAL SELESAI
          // =================================================

          const listeningStars = Math.min(
            listeningProgress.completedQuestions.length,
            TOTAL_STARS,
          );

          const speakingStars = Math.min(
            speakingProgress.completedQuestions.length,
            TOTAL_STARS,
          );

          const readingStars = Math.min(
            readingProgress.completedQuestions.length,
            TOTAL_STARS,
          );

          const writingStars = Math.min(
            writingProgress.completedQuestions.length,
            TOTAL_STARS,
          );

          const progressBaru = {
            listening: listeningStars,
            speaking: speakingStars,
            reading: readingStars,
            writing: writingStars,
          };

          setSkillSelesai(progressBaru);

          // =================================================
          // CEK REFLECTION
          // =================================================

          const sudahReflection = await apakahReflectionSelesai(LEVEL);

          if (!active) return;

          setReflectionCompleted(sudahReflection);

          // =================================================
          // JIKA SEMUA SKILL >= 2 BINTANG
          // DAN REFLECTION BELUM DIISI
          // MAKA TAMPILKAN POPUP
          // =================================================

          const semuaSkillSelesai =
            progressBaru.listening >= MINIMUM_STARS &&
            progressBaru.speaking >= MINIMUM_STARS &&
            progressBaru.reading >= MINIMUM_STARS &&
            progressBaru.writing >= MINIMUM_STARS;

          if (semuaSkillSelesai && !sudahReflection) {
            setReflectionVisible(true);
          } else {
            setReflectionVisible(false);
          }
        } catch (error) {
          console.error(
            "Failed to load Level 3 skill progress:",
            error,
          );
        } finally {
          if (active) {
            setLoadingProgress(false);
          }
        }
      }

      loadAllProgress();

      return () => {
        active = false;
      };
    }, []),
  );

  // =====================================================
  // KEMBALI KE DAFTAR LEVEL
  // =====================================================

  function kembaliKeLevel() {
    router.replace("/levels");
  }

  // =====================================================
  // BUKA SKILL
  // =====================================================

  function bukaSkill(namaSkill: SkillId) {
    if (namaSkill === "listening") {
      router.push("/Level 3/listening");
      return;
    }

    if (namaSkill === "speaking") {
      router.push("/Level 3/speaking");
      return;
    }

    if (namaSkill === "reading") {
      router.push("/Level 3/reading");
      return;
    }

    if (namaSkill === "writing") {
      router.push("/Level 3/writing");
      return;
    }

    Alert.alert(
      DAFTAR_SKILL.find((skill) => skill.id === namaSkill)?.nama ??
        namaSkill,
      "Materi dan soal skill ini akan ditambahkan pada pengembangan berikutnya.",
    );
  }

  // =====================================================
  // REFLECTION SELESAI
  // =====================================================

  async function handleReflectionSubmit(data: ReflectionFormData) {
    try {
      await simpanReflection({
        level_number: LEVEL,
        mood: data.mood,
        hardest_part: data.hardestPart,
        proud_of: data.proudOf,
        important_learning: data.importantLearning,
        lesson_note: data.lessonNote,
        completed: true,
      });

      setReflectionCompleted(true);
      setReflectionVisible(false);

      Alert.alert(
        "Reflection Complete!",
        "Great job! You have completed Level 3.",
      );
    } catch (error) {
      console.error(
        "Failed to save Level 3 reflection:",
        error,
      );

      Alert.alert(
        "Failed to Save",
        "We could not save your reflection. Please try again.",
      );

      throw error;
    }
  }

  // =====================================================
  // NEXT LEVEL
  // =====================================================

  function lanjutKeLevelBerikutnya() {
    if (!semuaSkillMemenuhiSyarat) {
      Alert.alert(
        "Level Belum Selesai",
        "Dapatkan minimal 2 bintang pada Listening, Speaking, Reading, dan Writing terlebih dahulu.",
      );
      return;
    }

    if (!reflectionCompleted) {
      setReflectionVisible(true);

      Alert.alert(
        "Complete Your Reflection",
        "Please complete your reflection before continuing to the next level.",
      );

      return;
    }

    router.push("/Level 4/level-4");
  }

  // =====================================================
  // STATUS LEVEL
  // =====================================================

  const levelSelesai =
    semuaSkillMemenuhiSyarat && reflectionCompleted;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ImageBackground
      source={require("../../../assets/images/lessons/positive-degree-background.png")}
      style={styles.halaman}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF5E6"
      />

      <ScrollView
        contentContainerStyle={styles.konten}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            HEADER DAN PROGRES
        ================================================== */}

        <View style={styles.headerAtas}>
          <Pressable
            onPress={kembaliKeLevel}
            style={styles.tombolKembali}
            accessibilityLabel="Kembali ke daftar level"
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color="#493D30"
            />
          </Pressable>

          <View style={styles.bilahProgres}>
            <View
              style={[
                styles.progresTerisi,
                levelSelesai &&
                  styles.progresTerisiSelesai,
              ]}
            />
          </View>

          <View style={styles.poin}>
            <Ionicons
              name="star"
              size={17}
              color="#F3B51B"
            />

            <Text style={styles.teksPoin}>120</Text>
          </View>
        </View>

        {/* =================================================
            JUDUL LEVEL
        ================================================== */}

        <View style={styles.headerMateri}>
          <View style={styles.labelLevel}>
            <Text style={styles.teksLabelLevel}>
              LEVEL {LEVEL}
            </Text>
          </View>

          <Text style={styles.judulLevel}>
            Level 3: Superlative Degree
          </Text>

          <Text style={styles.deskripsiLevel}>
            Compare three or more things
          </Text>
        </View>

        {/* =================================================
            MATERI
        ================================================== */}

        <View style={styles.kartuMateri}>
          {/* JUDUL + AUDIO */}

          <View style={styles.judulKartuMateri}>
            <Text style={styles.teksJudulMateri}>
              What is Superlative Degree?
            </Text>

            <Pressable
              onPress={toggleAudio}
              style={({ pressed }) => [
                styles.tombolAudio,
                pressed && styles.tombolAudioDitekan,
              ]}
              accessibilityLabel={
                audioStatus.playing
                  ? "Stop audio"
                  : "Play audio"
              }
            >
              <Ionicons
                name={
                  audioStatus.playing
                    ? "volume-high"
                    : "volume-medium-outline"
                }
                size={20}
                color="#367C4A"
              />
            </Pressable>
          </View>

          {/* WHAT IS IT? */}

          <View style={styles.barisMateri}>
            <Text style={styles.teksMateri}>
              Superlative Degree is used to compare
              three or more people, things, or actions.
              It shows that one has the most or least
              of a quality.

              {"\n\n"}

              Superlative Degree digunakan untuk
              membandingkan tiga atau lebih orang,
              benda, atau tindakan. Bentuk ini
              menunjukkan sesuatu yang paling atau
              paling sedikit dalam suatu kelompok.
            </Text>
          </View>

          {/* SHORT ADJECTIVES */}

          <View style={styles.barisMateri}>
            <Text style={styles.teksMateri}>
              <Text style={{ fontWeight: "bold" }}>
                1. Short Adjectives{"\n"}
              </Text>

              For short adjectives, usually with one
              or two syllables, add the suffix{" "}
              <Text style={{ fontWeight: "bold" }}>
                -est
              </Text>
              .

              {"\n\n"}

              Untuk kata sifat pendek, biasanya satu
              atau dua suku kata, tambahkan akhiran{" "}
              <Text style={{ fontWeight: "bold" }}>
                -est
              </Text>
              .
            </Text>
          </View>

          {/* SHORT ADJECTIVE EXAMPLES */}

          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              <Text style={{ fontWeight: "900" }}>
                Adjective → Superlative
              </Text>

              {"\n\n"}

              tall → tallest{"\n"}
              fast → fastest{"\n"}
              small → smallest{"\n"}
              happy → happiest{"\n"}
              big → biggest

              {"\n\n"}

              The giraffe is the tallest animal
              in the group.

              {"\n"}

              Giraffe adalah hewan paling tinggi
              dalam kelompok.
            </Text>
          </View>

          {/* LONG ADJECTIVES */}

          <View style={styles.barisMateri}>
            <Text style={styles.teksMateri}>
              <Text style={{ fontWeight: "bold" }}>
                2. Long Adjectives{"\n"}
              </Text>

              For long adjectives, usually with three
              or more syllables, use{" "}
              <Text style={{ fontWeight: "bold" }}>
                the most
              </Text>{" "}
              before the adjective.

              {"\n\n"}

              Untuk kata sifat panjang, biasanya tiga
              suku kata atau lebih, gunakan{" "}
              <Text style={{ fontWeight: "bold" }}>
                the most
              </Text>{" "}
              sebelum kata sifat.
            </Text>
          </View>

          {/* LONG ADJECTIVE EXAMPLES */}

          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              <Text style={{ fontWeight: "900" }}>
                The most + adjective
              </Text>

              {"\n\n"}

              beautiful → the most beautiful{"\n"}
              comfortable → the most comfortable{"\n"}
              interesting → the most interesting{"\n"}
              delicious → the most delicious

              {"\n\n"}

              This is the most beautiful place
              in the park.

              {"\n"}

              Ini adalah tempat paling indah
              di taman.
            </Text>
          </View>

          {/* REMEMBER THIS */}

          <View style={styles.catatanMateri}>
            <View style={styles.kontenCatatan}>
              <Text style={styles.judulCatatan}>
                Remember This!
              </Text>

              <Text style={styles.teksCatatan}>
                Use -est for short adjectives and
                the most for long adjectives.

                {"\n\n"}

                Gunakan -est untuk kata sifat pendek
                dan the most untuk kata sifat panjang.

                {"\n\n"}

                Superlative usually talks about
                three or more things.
              </Text>
            </View>
          </View>

          {/* ADJECTIVE CHANGES */}

          <View style={styles.barisMateri}>
            <Text style={styles.teksMateri}>
              <Text style={{ fontWeight: "bold" }}>
                3. Adjective Changes{"\n"}
              </Text>

              Some adjectives change their form
              completely when used in the Superlative
              Degree.

              {"\n\n"}

              Beberapa kata sifat berubah bentuk
              ketika digunakan dalam Superlative
              Degree.

              {"\n\n"}

              Study these changes carefully.
            </Text>
          </View>

          {/* IRREGULAR ADJECTIVES */}

          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              <Text style={{ fontWeight: "900" }}>
                Adjective → Superlative
              </Text>

              {"\n\n"}

              good → best{"\n"}
              bad → worst{"\n"}
              little → least{"\n"}
              much → most{"\n"}
              many → most{"\n"}
              far → farthest / furthest
            </Text>
          </View>

          {/* IMPORTANT NOTES */}

          <View style={styles.catatanMateri}>
            <View style={styles.kontenCatatan}>
              <Text style={styles.judulCatatan}>
                Important Notes
              </Text>

              <Text style={styles.teksCatatan}>
                • Short adjectives generally use -est.
                {"\n"}
                Kata sifat pendek umumnya menggunakan
                -est.

                {"\n\n"}

                • Long adjectives use the most.
                {"\n"}
                Kata sifat panjang menggunakan
                the most.

                {"\n\n"}

                • Use "the" before the superlative.
                {"\n"}
                Gunakan "the" sebelum bentuk
                superlative.

                {"\n\n"}

                • Do not combine the most with an
                adjective that already uses -est.
              </Text>
            </View>
          </View>

          {/* CORRECT / INCORRECT */}

          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              ❌ Most tallest — Incorrect{"\n"}
              ✅ The tallest — Correct

              {"\n\n"}

              ❌ The most fastest — Incorrect{"\n"}
              ✅ The fastest — Correct

              {"\n\n"}

              ✅ The most beautiful — Correct
            </Text>
          </View>

          {/* QUICK GUIDE */}

          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              <Text style={{ fontWeight: "900" }}>
                Quick Guide
              </Text>

              {"\n\n"}

              Short adjective:
              {"\n"}
              tall → the tallest

              {"\n\n"}

              Long adjective:
              {"\n"}
              beautiful → the most beautiful

              {"\n\n"}

              Irregular:
              {"\n"}
              good → the best
            </Text>
          </View>
        </View>

        {/* =================================================
            DAFTAR SKILL
        ================================================== */}

        <View style={styles.bagianSkill}>
          <Text style={styles.judulSkill}>
            PRACTICE THE 4 SKILLS
          </Text>

          {loadingProgress ? (
            <View style={styles.loadingProgress}>
              <ActivityIndicator
                size="small"
                color="#65A879"
              />

              <Text style={styles.loadingProgressText}>
                Loading your progress...
              </Text>
            </View>
          ) : (
            <View style={styles.gridSkill}>
              {DAFTAR_SKILL.map((skill) => (
                <KartuSkill
                  key={skill.id}
                  skill={skill}
                  bintangEmas={skillSelesai[skill.id]}
                  saatDitekan={() =>
                    bukaSkill(skill.id)
                  }
                />
              ))}
            </View>
          )}
        </View>

        {/* =================================================
            STATUS REFLECTION
        ================================================== */}

        {!loadingProgress &&
          semuaSkillMemenuhiSyarat &&
          !reflectionCompleted && (
            <View style={styles.reflectionNotice}>
              <View style={styles.reflectionIcon}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color="#8A6414"
                />
              </View>

              <View style={styles.reflectionTextContainer}>
                <Text style={styles.reflectionTitle}>
                  Great job!
                </Text>

                <Text style={styles.reflectionDescription}>
                  You completed the 4 skills.
                  Complete your reflection before
                  moving to the next level.
                </Text>
              </View>
            </View>
          )}

        {/* =================================================
            BAGIAN BAWAH
        ================================================== */}

        <View style={styles.bagianBawah}>
          <Text style={styles.keteranganBawah}>
            {levelSelesai
              ? "Level completed! You are ready for the next adventure."
              : semuaSkillMemenuhiSyarat
                ? "Complete your reflection to unlock the next level."
                : "Get at least 2 stars in each skill to continue."}
          </Text>

          <Pressable
            onPress={lanjutKeLevelBerikutnya}
            disabled={!levelSelesai}
            style={[
              styles.tombolLanjut,
              levelSelesai
                ? styles.tombolLanjutAktif
                : styles.tombolLanjutNonaktif,
            ]}
          >
            <Text style={styles.teksTombolLanjut}>
              Next
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* =================================================
          REFLECTION MODAL
      ================================================== */}

      <ReflectionModal
        visible={reflectionVisible}
        onSubmit={handleReflectionSubmit}
      />
    </ImageBackground>
  );
}

// =====================================================
// KOMPONEN KARTU SKILL
// =====================================================

type KartuSkillProps = {
  skill: Skill;
  bintangEmas: number;
  saatDitekan: () => void;
};

function KartuSkill({
  skill,
  bintangEmas,
  saatDitekan,
}: KartuSkillProps) {
  return (
    <Pressable
      onPress={saatDitekan}
      style={({ pressed }) => [
        styles.kartuSkill,
        pressed && styles.kartuSkillDitekan,
      ]}
    >
      {/* Ikon skill */}

      <View style={styles.areaIkonSkill}>
        <MaterialCommunityIcons
          name={skill.ikon}
          size={35}
          color={skill.warna}
        />
      </View>

      {/* Nama skill */}

      <Text style={styles.namaSkill}>
        {skill.nama}
      </Text>

      {/* Bintang progres */}

      <View style={styles.daftarBintang}>
        {Array.from({
          length: TOTAL_STARS,
        }).map((_, index) => {
          const sudahDiperoleh =
            index < bintangEmas;

          return (
            <Ionicons
              key={`${skill.id}-bintang-${index}`}
              name="star"
              size={18}
              color={
                sudahDiperoleh
                  ? "#F2B51B"
                  : "#CBD5E1"
              }
            />
          );
        })}
      </View>
    </Pressable>
  );
}

// =====================================================
// STYLE
// =====================================================

const styles = StyleSheet.create({
  halaman: {
    flex: 1,
    width: "100%",
  },

  konten: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ===================================================
  // HEADER
  // ===================================================

  headerAtas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },

  tombolKembali: {
    width: 34,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  bilahProgres: {
    flex: 1,
    height: 9,
    borderRadius: 10,
    backgroundColor: "#E7D5B4",
    overflow: "hidden",
  },

  progresTerisi: {
    width: "0%",
    height: "100%",
    backgroundColor: "#66A66A",
  },

  progresTerisiSelesai: {
    width: "100%",
    backgroundColor: "#65A879",
  },

  poin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D7B8",
  },

  teksPoin: {
    color: "#493D30",
    fontSize: 13,
    fontWeight: "800",
  },

  // ===================================================
  // JUDUL LEVEL
  // ===================================================

  headerMateri: {
    marginBottom: 18,
  },

  labelLevel: {
    alignSelf: "flex-start",
    backgroundColor: "#65A879",
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 9,
  },

  teksLabelLevel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  judulLevel: {
    color: "#293744",
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
  },

  deskripsiLevel: {
    marginTop: 5,
    color: "#776B5E",
    fontSize: 13,
    lineHeight: 19,
  },

  // ===================================================
  // KARTU MATERI
  // ===================================================

  kartuMateri: {
    backgroundColor: "#E9F4E9",
    borderColor: "#5DA875",
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
  },

  judulKartuMateri: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  teksJudulMateri: {
    flex: 1,
    color: "#367C4A",
    fontSize: 15,
    fontWeight: "900",
  },

  // ===================================================
  // AUDIO
  // ===================================================

  tombolAudio: {
    marginLeft: "auto",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D8EEDB",
    borderWidth: 1,
    borderColor: "#A9D3AE",
  },

  tombolAudioDitekan: {
    backgroundColor: "#C1E3C7",
    transform: [{ scale: 0.94 }],
  },

  barisMateri: {
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 7,
  },

  teksMateri: {
    flex: 1,
    color: "#39434B",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  barisContoh: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 7,
  },

  catatanMateri: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "#FFF1BD",
    borderRadius: 11,
    padding: 11,
    marginTop: 3,
  },

  kontenCatatan: {
    flex: 1,
  },

  judulCatatan: {
    color: "#685321",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    marginBottom: 3,
  },

  teksCatatan: {
    color: "#685321",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },

  warningDalam: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E8D17D",
  },

  teksWarningDalam: {
    flex: 1,
    color: "#685321",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "900",
  },

  // ===================================================
  // SKILL
  // ===================================================

  bagianSkill: {
    marginBottom: 18,
  },

  judulSkill: {
    color: "#76695A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 11,
  },

  gridSkill: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  loadingProgress: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 252, 247, 0.85)",
    borderRadius: 16,
  },

  loadingProgressText: {
    marginTop: 9,
    color: "#776B5E",
    fontSize: 12,
    fontWeight: "600",
  },

  // ===================================================
  // KARTU SKILL
  // ===================================================

  kartuSkill: {
    width: "48.2%",
    minHeight: 125,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#E7D4B3",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
  },

  kartuSkillDitekan: {
    backgroundColor: "#F4E8D4",
    transform: [{ scale: 0.98 }],
  },

  areaIkonSkill: {
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  namaSkill: {
    color: "#36404A",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },

  daftarBintang: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // ===================================================
  // REFLECTION NOTICE
  // ===================================================

  reflectionNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFF3C7",
    borderWidth: 1,
    borderColor: "#E6C76A",
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
  },

  reflectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFE7A0",
    alignItems: "center",
    justifyContent: "center",
  },

  reflectionTextContainer: {
    flex: 1,
  },

  reflectionTitle: {
    color: "#765817",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 3,
  },

  reflectionDescription: {
    color: "#806A35",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },

  // ===================================================
  // BAGIAN BAWAH
  // ===================================================

  bagianBawah: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 2,
  },

  keteranganBawah: {
    flex: 1,
    color: "#827665",
    fontSize: 11,
    lineHeight: 17,
  },

  tombolLanjut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  tombolLanjutAktif: {
    backgroundColor: "#65A879",
  },

  tombolLanjutNonaktif: {
    backgroundColor: "#C9C9C9",
  },

  teksTombolLanjut: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});