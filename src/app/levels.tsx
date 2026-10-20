import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";

import {
  getStudentLevelProgress,
  getStudentTotalPoints,
} from "../services/auth/authService";

const levels = [
  {
    id: 1,
    color: require("../../assets/images/levels/level-1-color.png"),
    gray: require("../../assets/images/levels/level-1-gray.png"),
  },
  {
    id: 2,
    color: require("../../assets/images/levels/level-2-color.png"),
    gray: require("../../assets/images/levels/level-2-gray.png"),
  },
  {
    id: 3,
    color: require("../../assets/images/levels/level-3-color.png"),
    gray: require("../../assets/images/levels/level-3-gray.png"),
  },
  {
    id: 4,
    color: require("../../assets/images/levels/level-4-color.png"),
    gray: require("../../assets/images/levels/level-4-gray.png"),
  },
  {
    id: 5,
    color: require("../../assets/images/levels/level-5-color.png"),
    gray: require("../../assets/images/levels/level-5-gray.png"),
  },
];

export default function LevelsScreen() {
  const { width, height } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState(1);

  const [unlockedLevels, setUnlockedLevels] = useState(1);

  const [totalPoints, setTotalPoints] = useState(0);

  const [loading, setLoading] = useState(true);

  const backgroundImage = require("../../assets/images/levels/levels-background.png");

  /**
   * =====================================================
   * LOAD LEVEL PROGRESS + POINTS
   * =====================================================
   */

  const loadLevelProgress = useCallback(async () => {
    try {
      setLoading(true);

      /*
       * Ambil progress level dan total poin
       * secara bersamaan.
       */
      const [progress, points] = await Promise.all([
        getStudentLevelProgress(),
        getStudentTotalPoints(),
      ]);

      /*
       * Simpan total poin.
       */
      setTotalPoints(points);

      /*
       * Level 1 selalu terbuka.
       */
      let highestUnlocked = 1;

      progress.forEach((item) => {
        if (item.unlocked && item.level_number > highestUnlocked) {
          highestUnlocked = item.level_number;
        }
      });

      setUnlockedLevels(Math.min(highestUnlocked, 5));
    } catch (error) {
      console.error("Load level progress error:", error);

      /*
       * Jika progress belum ada,
       * Level 1 tetap bisa dimainkan.
       */
      setUnlockedLevels(1);

      /*
       * Jika gagal mengambil poin,
       * tampilkan 0.
       */
      setTotalPoints(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLevelProgress();
  }, [loadLevelProgress]);

  /**
   * =====================================================
   * CURRENT LEVEL STATUS
   * =====================================================
   */

  const isUnlocked = currentLevel <= unlockedLevels;

  const currentImage = isUnlocked
    ? levels[currentLevel - 1].color
    : levels[currentLevel - 1].gray;

  /**
   * =====================================================
   * RESPONSIVE
   * =====================================================
   */

  const isPhone = width < 600;

  const islandWidth = Math.min(width * (isPhone ? 0.86 : 0.72), 560);

  const islandHeight = Math.min(height * 0.72, 760);

  const arrowSize = isPhone ? 38 : 52;

  const topButtonSize = isPhone ? 38 : 48;

  const pointsWidth = isPhone ? 118 : 145;

  const pointsHeight = isPhone ? 42 : 50;

  /**
   * =====================================================
   * PREVIOUS
   * =====================================================
   */

  function handlePrevious() {
    setCurrentLevel((previous) => Math.max(1, previous - 1));
  }

  /**
   * =====================================================
   * NEXT
   * =====================================================
   */

  function handleNext() {
    setCurrentLevel((previous) => Math.min(5, previous + 1));
  }

  /**
   * =====================================================
   * SELECT LEVEL
   * =====================================================
   */

  function handleSelectLevel() {
    if (!isUnlocked) {
      Alert.alert(
        "Level Terkunci",
        "Selesaikan level sebelumnya untuk membuka petualangan ini.",
      );

      return;
    }

    if (currentLevel === 1) {
      router.push("/Level 1/level-1");
      return;
    }

    if (currentLevel === 2) {
      router.push("/Level 2/level-2");
      return;
    }

    if (currentLevel === 3) {
      router.push("/Level 3/level-3");
      return;
    }

    if (currentLevel === 4) {
      router.push("/Level 4/level-4");
      return;
    }

    if (currentLevel === 5) {
      router.push("/level-5");
      return;
    }

    Alert.alert(`Level ${currentLevel}`, "Materi level ini akan segera hadir.");
  }

  /**
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />

          <Text style={styles.loadingText}>Memuat level...</Text>
        </View>
      </ImageBackground>
    );
  }

  /**
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* =========================
            BACK BUTTON
        ========================= */}

        <Pressable
          onPress={() => router.replace("/student")}
          style={[
            styles.topButton,
            styles.backButton,
            {
              width: topButtonSize,
              height: topButtonSize,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/buttons/back.png")}
            style={styles.topButtonImage}
            resizeMode="contain"
          />
        </Pressable>

        {/* =========================
            POINTS
        ========================= */}

        <View
          style={[
            styles.pointsContainer,
            {
              width: pointsWidth,
              height: pointsHeight,
            },
          ]}
        >
          <Text
            style={[
              styles.pointsIcon,
              {
                fontSize: isPhone ? 17 : 21,
              },
            ]}
          >
            ⭐
          </Text>

          <View style={styles.pointsTextContainer}>
            <Text
              style={[
                styles.pointsValue,
                {
                  fontSize: isPhone ? 16 : 19,
                },
              ]}
            >
              {totalPoints}
            </Text>

            <Text
              style={[
                styles.pointsLabel,
                {
                  fontSize: isPhone ? 9 : 10,
                },
              ]}
            >
              XP
            </Text>
          </View>
        </View>

        {/* =========================
            SETTINGS BUTTON
        ========================= */}

        <Pressable
          onPress={() => router.push("/settings")}
          style={[
            styles.topButton,
            styles.settingsButton,
            {
              width: topButtonSize,
              height: topButtonSize,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/buttons/settings.png")}
            style={styles.topButtonImage}
            resizeMode="contain"
          />
        </Pressable>

        {/* =========================
            LEVEL IMAGE
        ========================= */}

        <Pressable
          onPress={handleSelectLevel}
          style={[
            styles.levelImageWrapper,
            {
              width: islandWidth,
              height: islandHeight,
            },
          ]}
        >
          <Image
            source={currentImage}
            style={styles.levelImage}
            resizeMode="contain"
          />
        </Pressable>

        {/* =========================
            PREVIOUS
        ========================= */}

        <Pressable
          onPress={handlePrevious}
          disabled={currentLevel === 1}
          style={[
            styles.arrowButton,
            styles.arrowLeft,
            {
              width: arrowSize,
              height: arrowSize,

              opacity: currentLevel === 1 ? 0.4 : 1,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/buttons/arrow-left.png")}
            style={styles.arrowImage}
            resizeMode="contain"
          />
        </Pressable>

        {/* =========================
            NEXT
        ========================= */}

        <Pressable
          onPress={handleNext}
          disabled={currentLevel === 5}
          style={[
            styles.arrowButton,
            styles.arrowRight,
            {
              width: arrowSize,
              height: arrowSize,

              opacity: currentLevel === 5 ? 0.4 : 1,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/buttons/arrow-right.png")}
            style={styles.arrowImage}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // =========================
  // MAIN
  // =========================

  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // =========================
  // LOADING
  // =========================

  loadingContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,

    color: "#FFFFFF",

    fontSize: 14,
    fontWeight: "700",
  },

  // =========================
  // TOP BUTTON
  // =========================

  topButton: {
    position: "absolute",

    top: 20,

    zIndex: 10,

    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    left: 20,
  },

  settingsButton: {
    right: 20,
  },

  topButtonImage: {
    width: "100%",
    height: "100%",
  },

  // =========================
  // POINTS
  // =========================

  pointsContainer: {
    position: "absolute",

    top: 20,

    zIndex: 15,

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",

    borderRadius: 28,

    backgroundColor: "rgba(255, 255, 255, 0.95)",

    paddingHorizontal: 10,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.18,

    shadowRadius: 5,

    elevation: 5,
  },

  pointsIcon: {
    marginRight: 6,
  },

  pointsTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  pointsValue: {
    color: "#5A3A1A",
    fontWeight: "900",
  },

  pointsLabel: {
    marginLeft: 3,

    color: "#8B6B45",

    fontWeight: "800",
  },

  // =========================
  // LEVEL IMAGE
  // =========================

  levelImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  levelImage: {
    width: "100%",
    height: "100%",
  },

  // =========================
  // ARROWS
  // =========================

  arrowButton: {
    position: "absolute",

    top: "39%",

    zIndex: 10,

    alignItems: "center",
    justifyContent: "center",
  },

  arrowLeft: {
    left: 12,
  },

  arrowRight: {
    right: 12,
  },

  arrowImage: {
    width: "100%",
    height: "100%",
  },
});
