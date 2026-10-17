import { router } from "expo-router";

import {
    ActivityIndicator,
    Alert,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import { useState } from "react";

import { saveLevelResult } from "../services/auth/authService";

type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

const QUESTIONS: Question[] = [
  // LISTENING
  {
    id: "q1",
    question: "Which animal is the tallest?",
    options: ["🦒 Giraffe", "🦌 Deer", "🐇 Rabbit", "🐁 Mouse"],
    answer: "🦒 Giraffe",
  },
  {
    id: "q2",
    question: "An airplane is ___ transportation.",
    options: ["Faster than", "The biggest", "The fastest", "Fast"],
    answer: "The fastest",
  },

  // SPEAKING
  {
    id: "q3",
    question:
      "Look at these animals: 🦒 🦌 🐇.\n\nChoose the correct sentence!",
    options: [
      "The giraffe is taller than the deer.",
      "The giraffe is the tallest.",
      "The giraffe is as tall as the rabbit.",
      "The giraffe is tall than the deer.",
    ],
    answer: "The giraffe is the tallest.",
  },
  {
    id: "q4",
    question: "Choose the correct sentence!",
    options: [
      "Satay is the most delicious food.",
      "Satay is more delicious food.",
      "Satay is the deliciousest food.",
      "Satay is most delicious than food.",
    ],
    answer: "Satay is the most delicious food.",
  },

  // READING
  {
    id: "q5",
    question: "Among the three animals, the giraffe is ___.",
    options: ["Taller than", "Tall", "The tallest", "As tall as"],
    answer: "The tallest",
  },
  {
    id: "q6",
    question:
      "Read the text below!\n\nRani got 85.\nSinta got 95.\nDoni got 98.\n\nWho got the highest score?",
    options: ["Rani", "Sinta", "Doni", "They got the same score."],
    answer: "Doni",
  },

  // WRITING
  {
    id: "q7",
    question: 'Complete the sentence!\n"The mouse is the ___." (small)',
    options: ["Smaller", "Smallest", "Small", "More small"],
    answer: "Smallest",
  },
  {
    id: "q8",
    question:
      'Complete the sentence!\n"His score is the ___ in the class." (bad)',
    options: ["Bad", "Worse", "More bad", "Worst"],
    answer: "Worst",
  },
];

const PASSING_SCORE = 70;

type Phase = "material" | "quiz" | "result";

export default function LevelTwoScreen() {
  const { width } = useWindowDimensions();

  const isPhone = width < 600;

  const backgroundImage = require("../../assets/images/lessons/positive-degree-background.png");

  const backButtonSize = isPhone ? 42 : 52;

  const [phase, setPhase] = useState<Phase>("material");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);

  const [result, setResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    pointsEarned: number;
    passed: boolean;
  } | null>(null);

  /**
   * =====================================================
   * BACK
   * =====================================================
   */

  function handleBack() {
    if (saving) return;

    router.replace("/levels");
  }

  /**
   * =====================================================
   * SELECT ANSWER
   * =====================================================
   */

  function handleSelectAnswer(answer: string) {
    if (saving) return;

    const question = QUESTIONS[currentQuestion];

    setSelectedAnswer(answer);

    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  }

  /**
   * =====================================================
   * NEXT QUESTION
   * =====================================================
   */

  async function handleNextQuestion() {
    if (!selectedAnswer) {
      Alert.alert("Choose an Answer", "Please select an answer first.");

      return;
    }

    const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

    if (!isLastQuestion) {
      setCurrentQuestion((previous) => previous + 1);

      setSelectedAnswer(null);

      return;
    }

    await finishLevel();
  }

  /**
   * =====================================================
   * FINISH LEVEL
   * =====================================================
   */

  async function finishLevel() {
    if (saving) return;

    setSaving(true);

    try {
      const finalAnswers: Record<string, string> = {
        ...answers,
      };

      if (selectedAnswer !== null) {
        finalAnswers[QUESTIONS[currentQuestion].id] = selectedAnswer;
      }

      let correctAnswers = 0;

      QUESTIONS.forEach((question) => {
        if (finalAnswers[question.id] === question.answer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / QUESTIONS.length) * 100);

      const pointsEarned = score;

      const passed = score >= PASSING_SCORE;

      await saveLevelResult({
        levelNumber: 3,
        score,
        totalQuestions: QUESTIONS.length,
        correctAnswers,
        pointsEarned,
      });

      setResult({
        score,
        correctAnswers,
        totalQuestions: QUESTIONS.length,
        pointsEarned,
        passed,
      });

      setPhase("result");
    } catch (error) {
      console.error("Save Level 3 result error:", error);

      Alert.alert(
        "Gagal Menyimpan",
        error instanceof Error ? error.message : "Hasil belum dapat disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * =====================================================
   * RETRY
   * =====================================================
   */

  function handleRetry() {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setResult(null);
    setPhase("quiz");
  }

  /**
   * =====================================================
   * MATERIAL
   * =====================================================
   */

  if (phase === "material") {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        {/* BACK BUTTON */}
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            {
              width: backButtonSize,
              height: backButtonSize,
              transform: [{ scale: pressed ? 0.9 : 1 }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/buttons/back.png")}
            style={styles.backImage}
            resizeMode="contain"
          />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.levelLabel}>LEVEL 3</Text>
            <Text style={styles.title}>Superlative Degree</Text>
            <Text style={styles.subtitle}>Let's Find the Most!</Text>
          </View>

          {/* CARD 1: DEFINITION */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What Is Superlative Degree?</Text>

            <Text style={styles.description}>
              <Text style={styles.bold}>Superlative Degree</Text> digunakan
              untuk menunjukkan sesuatu yang paling dibandingkan dengan tiga hal
              atau lebih.
            </Text>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                "The elephant is the biggest."
              </Text>
              <Text style={styles.translation}>
                Gajah adalah yang paling besar.
              </Text>
            </View>
          </View>

          {/* CARD 2: SHORT ADJECTIVES */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Short Adjectives</Text>

            <Text style={styles.description}>
              Kata sifat pendek dengan 1–2 suku kata biasanya menggunakan
              akhiran -est dan kata the di depannya.
            </Text>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaGreen}>The + adjective + -est</Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                Tall → <Text style={styles.orangeText}>The tallest</Text>
              </Text>
              <Text style={styles.translation}>Paling tinggi</Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                Fast → <Text style={styles.orangeText}>The fastest</Text>
              </Text>
              <Text style={styles.translation}>Paling cepat</Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                Big → <Text style={styles.orangeText}>The biggest</Text>
              </Text>
              <Text style={styles.translation}>Paling besar</Text>
            </View>
          </View>

          {/* CARD 3: LONG ADJECTIVES */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Long Adjectives</Text>

            <Text style={styles.description}>
              Kata sifat panjang dengan 3 suku kata atau lebih menggunakan the
              most sebelum kata sifat.
            </Text>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaBlue}>The most + adjective</Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                Delicious →{" "}
                <Text style={styles.orangeText}>The most delicious</Text>
              </Text>
              <Text style={styles.translation}>Paling lezat</Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                Beautiful →{" "}
                <Text style={styles.orangeText}>The most beautiful</Text>
              </Text>
              <Text style={styles.translation}>Paling cantik/indah</Text>
            </View>
          </View>

          {/* CARD 4: EXAMPLE SENTENCES */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Example Sentences</Text>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                "The elephant is{" "}
                <Text style={styles.orangeText}>the biggest</Text>."
              </Text>
              <Text style={styles.translation}>
                Gajah adalah yang paling besar.
              </Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                "The airplane is{" "}
                <Text style={styles.orangeText}>the fastest</Text>{" "}
                transportation."
              </Text>
              <Text style={styles.translation}>
                Pesawat adalah transportasi yang paling cepat.
              </Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>
                "Satay is{" "}
                <Text style={styles.orangeText}>the most delicious</Text> food."
              </Text>
              <Text style={styles.translation}>
                Sate adalah makanan yang paling lezat.
              </Text>
            </View>
          </View>

          {/* CARD 5: IRREGULAR ADJECTIVES */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>4. Special Adjectives</Text>

            <Text style={styles.description}>
              Beberapa kata sifat memiliki bentuk superlative khusus yang
              berbeda dari rumus biasa.
            </Text>

            {[
              { base: "Good", result: "The best", meaning: "Paling baik" },
              { base: "Bad", result: "The worst", meaning: "Paling buruk" },
              {
                base: "Little",
                result: "The least",
                meaning: "Paling sedikit",
              },
              {
                base: "Much/Many",
                result: "The most",
                meaning: "Paling banyak",
              },
              {
                base: "Far",
                result: "The furthest/farthest",
                meaning: "Paling jauh",
              },
            ].map((item) => (
              <View key={item.base} style={styles.exampleBox}>
                <Text style={styles.exampleText}>
                  {item.base} →{" "}
                  <Text style={styles.orangeText}>{item.result}</Text>
                </Text>
                <Text style={styles.translation}>{item.meaning}</Text>
              </View>
            ))}
          </View>

          {/* CARD 6: REMEMBER */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>5. Remember This!</Text>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                ⭐ Kata sifat pendek biasanya ditambah -est.
              </Text>
            </View>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                ⭐ Kata sifat panjang menggunakan the most.
              </Text>
            </View>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                ⭐ Gunakan the sebelum kata sifat superlative.
              </Text>
            </View>

            <View style={styles.rememberBox}>
              <Text style={styles.rememberTitle}>Quick Reminder!</Text>

              <Text style={styles.rememberText}>
                Tall → The tallest = paling tinggi{"\n"}
                Fast → The fastest = paling cepat{"\n"}
                Big → The biggest = paling besar{"\n"}
                Delicious → The most delicious = paling lezat{"\n"}
                Beautiful → The most beautiful = paling cantik/indah
              </Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>❌ The most fastest</Text>
              <Text style={styles.exampleText}>✅ The fastest</Text>
              <Text style={styles.exampleText}>✅ The most delicious</Text>
            </View>
          </View>

          {/* START PRACTICE */}
          <Pressable
            onPress={() => setPhase("quiz")}
            style={({ pressed }) => [
              styles.startButton,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Text style={styles.startButtonText}>Start Practice</Text>
          </Pressable>

          {/* BOTTOM SPACE */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </ImageBackground>
    );
  }

  /**
   * =====================================================
   * QUIZ
   * =====================================================
   */

  if (phase === "quiz") {
    const question = QUESTIONS[currentQuestion];

    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

    // Warna latar untuk setiap pilihan jawaban
    const optionColors = [
      styles.optionPeach,
      styles.optionMint,
      styles.optionLavender,
      styles.optionBlue,
    ];

    // Huruf untuk setiap pilihan jawaban
    const optionLetters = ["A", "B", "C", "D"];

    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        {/* BACK BUTTON */}
        <Pressable
          onPress={handleBack}
          disabled={saving}
          style={({ pressed }) => [
            styles.backButton,
            {
              width: backButtonSize,
              height: backButtonSize,
              transform: [
                {
                  scale: pressed ? 0.9 : 1,
                },
              ],
              opacity: saving ? 0.5 : 1,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/buttons/back.png")}
            style={styles.backImage}
            resizeMode="contain"
          />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* QUIZ HEADER */}
          <View style={styles.header}>
            <Text style={styles.levelLabel}>LEVEL 3</Text>

            <Text style={styles.quizTitle}>Let's Practice!</Text>

            <Text style={styles.questionNumber}>
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* QUESTION */}

          {/* QUESTION CARD */}
          <View style={styles.quizCard}>
            {/* CARD LABEL */}
            <View style={styles.questionTopRow}>
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>✦ QUEST CHALLENGE</Text>
              </View>

              <Text style={styles.questionCount}>
                {String(currentQuestion + 1).padStart(2, "0")}
                <Text style={styles.questionCountTotal}>
                  {" "}
                  / {String(QUESTIONS.length).padStart(2, "0")}
                </Text>
              </Text>
            </View>

            {/* QUESTION */}
            <Text style={styles.questionHint}>CHOOSE THE CORRECT ANSWER</Text>

            <Text style={styles.questionText}>{question.question}</Text>

            <View style={styles.questionDivider} />

            {/* OPTIONS */}
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => {
                const selected = selectedAnswer === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => handleSelectAnswer(option)}
                    disabled={saving}
                    style={({ pressed }) => [
                      styles.optionButton,
                      optionColors[index % optionColors.length],
                      selected && styles.optionSelected,
                      pressed && !saving && styles.optionPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionCircle,
                        selected && styles.optionCircleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionCircleText,
                          selected && styles.optionCircleTextSelected,
                        ]}
                      >
                        {optionLetters[index] ?? "•"}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    <Text
                      style={[
                        styles.optionArrow,
                        selected && styles.optionArrowSelected,
                      ]}
                    >
                      {selected ? "✓" : "›"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* SELECTION HINT */}
            <View style={styles.selectionHint}>
              <Text style={styles.selectionHintText}>
                ✦ Tap an answer to select it
              </Text>
            </View>
          </View>

          {/* NEXT */}
          <Pressable
            onPress={handleNextQuestion}
            disabled={saving}
            style={[styles.nextButton, saving && styles.buttonDisabled]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentQuestion === QUESTIONS.length - 1 ? "Finish" : "Next"}
              </Text>
            )}
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </ImageBackground>
    );
  }

  /**
   * =====================================================
   * RESULT
   * =====================================================
   */

  const passed = result?.passed ?? false;

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.resultContainer}>
        <View
          style={[
            styles.resultCard,
            passed ? styles.resultSuccess : styles.resultRetry,
          ]}
        >
          <Text style={styles.resultEmoji}>{passed ? "🎉" : "📚"}</Text>

          <Text style={styles.resultTitle}>
            {passed ? "Great Job!" : "Keep Practicing!"}
          </Text>

          <Text style={styles.resultSubtitle}>
            {passed ? "You completed 3!" : "You need a little more practice."}
          </Text>

          {/* SCORE */}
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{result?.score ?? 0}</Text>

            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>

          {/* DETAILS */}
          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct Answers</Text>

              <Text style={styles.resultValue}>
                {result?.correctAnswers ?? 0}/
                {result?.totalQuestions ?? QUESTIONS.length}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Points Earned</Text>

              <Text style={styles.resultValue}>
                +{result?.pointsEarned ?? 0}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Passing Score</Text>

              <Text style={styles.resultValue}>{PASSING_SCORE}</Text>
            </View>
          </View>

          {/* STATUS */}
          {passed ? (
            <View style={styles.unlockBox}>
              <Text style={styles.unlockTitle}>🎉 Level 3 Completed!</Text>

              <Text style={styles.unlockText}>
                Congratulations! You have mastered Level 3 and can continue your
                adventure.
              </Text>
            </View>
          ) : (
            <View style={styles.retryBox}>
              <Text style={styles.retryTitle}>Almost there!</Text>

              <Text style={styles.retryText}>
                Get a score of 70 or higher to unlock the next level.
              </Text>
            </View>
          )}

          {/* ACTION */}
          {passed ? (
            <>
              <Pressable
                onPress={() => router.replace("/levels")}
                style={styles.primaryResultButton}
              >
                <Text style={styles.primaryResultButtonText}>Choose Level</Text>
              </Pressable>

              <Pressable
                onPress={() => router.replace("/student")}
                style={styles.secondaryResultButton}
              >
                <Text style={styles.secondaryResultButtonText}>
                  Back to Home
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={handleRetry}
                style={styles.primaryResultButton}
              >
                <Text style={styles.primaryResultButtonText}>Try Again</Text>
              </Pressable>

              <Pressable
                onPress={() => router.replace("/levels")}
                style={styles.secondaryResultButton}
              >
                <Text style={styles.secondaryResultButtonText}>
                  Back to Levels
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 30,
  },

  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  backImage: {
    width: "100%",
    height: "100%",
  },

  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 18,
  },

  levelLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#8A6A32",
    marginBottom: 2,
  },

  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#07121C",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#07121C",
    textAlign: "center",
  },

  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#151515",
    marginBottom: 7,
  },

  description: {
    fontSize: 11.5,
    lineHeight: 16,
    color: "#242424",
  },

  bold: {
    fontWeight: "900",
  },

  formulaBox: {
    width: "100%",
    minHeight: 25,
    marginTop: 9,
    marginBottom: 9,
    borderRadius: 5,
    backgroundColor: "#F4F1EF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },

  formulaBlue: {
    color: "#38A9F5",
    fontSize: 12,
    fontWeight: "900",
  },

  formulaGreen: {
    color: "#79BD35",
    fontSize: 12,
    fontWeight: "900",
  },

  exampleBox: {
    position: "relative",
    width: "100%",
    backgroundColor: "#F4F1EF",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 7,
    paddingRight: 34,
  },

  exampleText: {
    fontSize: 10.5,
    lineHeight: 15,
    color: "#151515",
    fontWeight: "800",
  },

  orangeText: {
    color: "#F06A24",
    fontWeight: "900",
  },

  translation: {
    marginTop: 2,
    fontSize: 9,
    color: "#555555",
    fontStyle: "italic",
  },

  exampleBadge: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#FFB52E",
    borderWidth: 1,
    borderColor: "#F58B16",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    color: "#A34C0B",
  },

  exampleBadgeRow: {
    position: "absolute",
    top: 5,
    right: 5,
    flexDirection: "row",
    gap: 3,
  },

  explanationBox: {
    borderWidth: 1,
    borderColor: "#62B9FF",
    borderRadius: 5,
    padding: 5,
    marginBottom: 7,
  },

  explanationText: {
    fontSize: 8.5,
    lineHeight: 12,
    color: "#222222",
  },

  rememberBox: {
    backgroundColor: "#FF1010",
    borderRadius: 5,
    padding: 10,
    marginTop: 1,
  },

  rememberTitle: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 3,
  },

  rememberText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: "600",
  },

  startButton: {
    width: "100%",
    maxWidth: 520,
    minHeight: 48,
    marginTop: 2,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#172B4D",
    alignItems: "center",
    justifyContent: "center",
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  quizTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#07121C",
    textAlign: "center",
  },

  questionNumber: {
    marginTop: 5,
    fontSize: 11,
    color: "#555555",
    fontWeight: "700",
  },

  progressBackground: {
    width: "100%",
    maxWidth: 520,
    height: 10,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: "#E6DFD1",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#79BD35",
  },

  questionText: {
    fontSize: 18,
    lineHeight: 25,
    color: "#151515",
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
  },

  optionsContainer: {
    gap: 9,
  },

  optionButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D9D3CC",
    backgroundColor: "#F8F6F4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  optionSelected: {
    borderColor: "#38A9F5",
    backgroundColor: "#EAF6FF",
  },

  optionCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E6E1DC",
    alignItems: "center",
    justifyContent: "center",
  },

  optionCircleSelected: {
    backgroundColor: "#38A9F5",
  },

  optionCircleText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#555555",
  },

  optionCircleTextSelected: {
    color: "#FFFFFF",
  },

  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#151515",
  },

  optionTextSelected: {
    fontWeight: "900",
    color: "#172B4D",
  },

  nextButton: {
    width: "100%",
    maxWidth: 520,
    minHeight: 48,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "#172B4D",
    alignItems: "center",
    justifyContent: "center",
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  bottomSpace: {
    height: 10,
  },

  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },

  resultCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 22,
    alignItems: "center",
  },

  resultSuccess: {
    borderWidth: 2,
    borderColor: "#A9D18E",
  },

  resultRetry: {
    borderWidth: 2,
    borderColor: "#E8CC67",
  },

  resultEmoji: {
    fontSize: 38,
  },

  resultTitle: {
    marginTop: 5,
    fontSize: 26,
    fontWeight: "900",
    color: "#07121C",
    textAlign: "center",
  },

  resultSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#555555",
    textAlign: "center",
  },

  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 18,
    backgroundColor: "#F4F1EF",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreNumber: {
    fontSize: 40,
    fontWeight: "900",
    color: "#172B4D",
  },

  scoreLabel: {
    marginTop: -2,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#8A6A32",
  },

  resultDetails: {
    width: "100%",
    marginTop: 16,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ECE7E2",
  },

  resultLabel: {
    fontSize: 11,
    color: "#555555",
  },

  resultValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#172B4D",
  },

  unlockBox: {
    width: "100%",
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EEF7E7",
    borderWidth: 1,
    borderColor: "#A9D18E",
  },

  unlockTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#47722D",
    textAlign: "center",
  },

  unlockText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#5C6F4D",
    textAlign: "center",
  },

  retryBox: {
    width: "100%",
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF8D9",
    borderWidth: 1,
    borderColor: "#E8CC67",
  },

  retryTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#6B541D",
    textAlign: "center",
  },

  retryText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#7A6840",
    textAlign: "center",
  },

  primaryResultButton: {
    width: "100%",
    minHeight: 46,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#172B4D",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryResultButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  secondaryResultButton: {
    width: "100%",
    minHeight: 44,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9CCAD",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryResultButtonText: {
    color: "#6E5A35",
    fontSize: 13,
    fontWeight: "800",
  },

  quizCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFDF8",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9E1D2",
    shadowColor: "#172B4D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  questionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  challengeBadge: {
    backgroundColor: "#E8F2D9",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  challengeBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#486B2A",
    letterSpacing: 0.7,
  },

  questionCount: {
    fontSize: 15,
    fontWeight: "900",
    color: "#172B4D",
  },

  questionCountTotal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A39A8B",
  },

  questionHint: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#B17A34",
    marginBottom: 10,
  },

  questionDivider: {
    height: 1,
    backgroundColor: "#EEE7DA",
    marginBottom: 18,
  },

  optionPeach: {
    backgroundColor: "#FFF0E5",
  },

  optionMint: {
    backgroundColor: "#EAF5E8",
  },

  optionLavender: {
    backgroundColor: "#F0ECFF",
  },

  optionBlue: {
    backgroundColor: "#E8F3FF",
  },

  optionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  optionArrow: {
    fontSize: 23,
    fontWeight: "700",
    color: "#A49B8E",
  },

  optionArrowSelected: {
    color: "#287CC1",
    fontWeight: "900",
  },

  selectionHint: {
    alignSelf: "center",
    marginTop: 17,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F5F0E7",
  },

  selectionHintText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#817563",
  },
});
