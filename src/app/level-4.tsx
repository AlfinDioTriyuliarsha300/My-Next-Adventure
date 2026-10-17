import { router } from "expo-router";

import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import { useEffect, useRef, useState } from "react";

import { saveLevelResult } from "../services/auth/authService";

type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

const QUESTIONS: Question[] = [
  // A. LISTENING
  {
    id: "q1",
    question:
      "The giraffe is taller than the deer, but the rabbit is the shortest.\n\nWhich animal is the shortest?",
    options: ["Giraffe", "Deer", "Rabbit", "Elephant"],
    answer: "Rabbit",
  },
  {
    id: "q2",
    question:
      'Listen to the story!\n\n"There are three bags. The red bag is expensive. The blue bag is more expensive than the red bag. The green bag is the most expensive of all."\n\nWhich bag is the most expensive?',
    options: [
      "The red bag",
      "The blue bag",
      "The green bag",
      "All bags have the same price.",
    ],
    answer: "The green bag",
  },

  // B. SPEAKING
  {
    id: "q3",
    question:
      "Look at these animals: 🐘 and 🐁.\n\nChoose the sentence that correctly describes both animals.",
    options: [
      "The elephant is big, but the mouse is small.",
      "The elephant is biggerest than the mouse.",
      "The elephant is the small.",
      "The mouse is more big than the elephant.",
    ],
    answer: "The elephant is big, but the mouse is small.",
  },
  {
    id: "q4",
    question: "Choose the correct sentence!",
    options: [
      "My sister is young than me.",
      "My sister is the younger than me.",
      "My sister is more younger than me.",
      "My sister is younger than me, but I am not the youngest in my family.",
    ],
    answer:
      "My sister is younger than me, but I am not the youngest in my family.",
  },

  // C. READING
  {
    id: "q5",
    question:
      'Read the text below!\n\n"Danny is as tall as Jack. Sultan is taller than Jack. Fatih is the tallest of all."\n\nWhich sentence uses the Superlative Degree?',
    options: [
      "Danny is as tall as Jack.",
      "Sultan is taller than Jack.",
      "Fatih is the tallest of all.",
      "Danny is taller than Fatih.",
    ],
    answer: "Fatih is the tallest of all.",
  },
  {
    id: "q6",
    question:
      "Read the text below!\n\nRani got 85.\nSinta got 90, which is better than Rani's score.\nDoni got 95, the best score of all three.\n\nWho got the best score?",
    options: ["Rani", "Sinta", "Doni", "They got the same score."],
    answer: "Doni",
  },

  // D. WRITING
  {
    id: "q7",
    question:
      "Arrange these words into a correct sentence!\n\nThe – giraffe – is – taller – than – the – deer",
    options: [
      "The giraffe taller is than the deer.",
      "The giraffe is taller than the deer.",
      "The giraffe is the taller than deer.",
      "The giraffe is more taller than the deer.",
    ],
    answer: "The giraffe is taller than the deer.",
  },
  {
    id: "q8",
    question:
      'Complete the sentence!\n\n"Among all my friends, Doni\'s score is the ___." (good)',
    options: ["Good", "Better", "Best", "More good"],
    answer: "Best",
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

  const headerAnimation = useRef(new Animated.Value(0)).current;

  const cardAnimations = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.stagger(
        150,
        cardAnimations.map((animation) =>
          Animated.timing(animation, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();
  }, [headerAnimation, cardAnimations]);

  const getEntranceStyle = (animation: Animated.Value) => ({
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 0],
        }),
      },
    ],
  });

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
        levelNumber: 4,
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
      console.error("Save Level 4 result error:", error);

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
    const sections = [
      {
        title: "1. Positive Degree 🌱",
        description:
          "Digunakan untuk menjelaskan sifat sesuatu atau membandingkan dua hal yang sama.",
        formula: "As + adjective + as",
        examples: [
          {
            sentence: "Danny is as tall as Jack.",
            meaning: "Danny sama tinggi dengan Jack.",
          },
        ],
      },
      {
        title: "2. Comparative Degree ⚖️",
        description:
          "Digunakan untuk membandingkan dua orang, benda, atau hewan.",
        formula:
          "Kata sifat pendek: Adjective + -er + than\nKata sifat panjang: More + adjective + than",
        examples: [
          {
            sentence: "Sultan is taller than Jack.",
            meaning: "Sultan lebih tinggi daripada Jack.",
          },
          {
            sentence: "Satay is more delicious than burger.",
            meaning: "Sate lebih lezat daripada burger.",
          },
        ],
      },
      {
        title: "3. Superlative Degree 🏆",
        description:
          "Digunakan untuk menunjukkan sesuatu yang paling dibandingkan dengan tiga hal atau lebih.",
        formula:
          "Kata sifat pendek: The + adjective + -est\nKata sifat panjang: The most + adjective",
        examples: [
          {
            sentence: "Fatih is the tallest boy.",
            meaning: "Fatih adalah anak laki-laki yang paling tinggi.",
          },
          {
            sentence: "Satay is the most delicious food.",
            meaning: "Sate adalah makanan yang paling lezat.",
          },
        ],
      },
    ];

    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
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
          {/* ANIMATED HEADER */}
          <Animated.View
            style={[styles.header, getEntranceStyle(headerAnimation)]}
          >
            <Text style={styles.levelLabel}>LEVEL 4</Text>
            <Text style={styles.title}>Mix It Up! 🎲</Text>
            <Text style={styles.subtitle}>
              Positive, Comparative, and Superlative Degree
            </Text>
          </Animated.View>

          {/* INTRODUCTION */}
          <Animated.View
            style={[styles.card, getEntranceStyle(cardAnimations[0])]}
          >
            <Text style={styles.cardTitle}>Let's Learn Together! ✨</Text>
            <Text style={styles.description}>
              Pada level ini, kita akan belajar menggunakan tiga jenis kata
              sifat untuk menjelaskan dan membandingkan sesuatu.
            </Text>
          </Animated.View>

          {/* POSITIVE, COMPARATIVE, SUPERLATIVE */}
          {sections.map((section, index) => (
            <Animated.View
              key={section.title}
              style={[styles.card, getEntranceStyle(cardAnimations[index + 1])]}
            >
              <Text style={styles.cardTitle}>{section.title}</Text>

              <Text style={styles.description}>{section.description}</Text>

              <View style={styles.formulaBox}>
                <Text style={styles.formulaGreen}>{section.formula}</Text>
              </View>

              {section.examples.map((example) => (
                <View key={example.sentence} style={styles.exampleBox}>
                  <Text style={styles.exampleText}>{example.sentence}</Text>
                  <Text style={styles.translation}>{example.meaning}</Text>
                </View>
              ))}
            </Animated.View>
          ))}

          {/* REMEMBER THE DIFFERENCE */}
          <Animated.View
            style={[styles.card, getEntranceStyle(cardAnimations[4])]}
          >
            <Text style={styles.cardTitle}>4. Ingat Perbedaannya! 💡</Text>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>🌱 Positive = Sama</Text>
              <Text style={styles.translation}>Danny is as tall as Jack.</Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>⚖️ Comparative = Lebih</Text>
              <Text style={styles.translation}>
                Sultan is taller than Jack.
              </Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>🏆 Superlative = Paling</Text>
              <Text style={styles.translation}>Fatih is the tallest boy.</Text>
            </View>

            <View style={styles.rememberBox}>
              <Text style={styles.rememberTitle}>Yuk, Ingat! ⭐</Text>
              <Text style={styles.rememberText}>
                As ... as = sama{"\n"}
                -er than / more ... than = lebih{"\n"}
                The ... -est / the most ... = paling
              </Text>
            </View>

            <Text style={[styles.description, { marginTop: 10 }]}>
              Ketiganya membantu kita menjelaskan sifat dan membandingkan orang,
              hewan, atau benda dalam bahasa Inggris.
            </Text>
          </Animated.View>

          {/* START PRACTICE */}
          <Pressable
            onPress={() => {
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setAnswers({});
              setPhase("quiz");
            }}
            style={({ pressed }) => [
              styles.startButton,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Text style={styles.startButtonText}>Start Practice 🚀</Text>
          </Pressable>

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
            <Text style={styles.levelLabel}>LEVEL 4</Text>

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
              <Text style={styles.unlockTitle}>🎉 Level 4 Completed!</Text>

              <Text style={styles.unlockText}>
                Congratulations! You have mastered Level 4 and can continue your
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
