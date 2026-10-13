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
    question: "Which one is bigger, the elephant or the mouse?",
    options: [
      "The elephant",
      "The mouse",
      "Both are the same size.",
      "Neither of them",
    ],
    answer: "The elephant",
  },
  {
    id: "q2",
    question: "Satay is ___ burger.",
    options: [
      "The most delicious",
      "More delicious than",
      "As delicious",
      "Deliciousest than",
    ],
    answer: "More delicious than",
  },

  // SPEAKING
  {
    id: "q3",
    question:
      'Look at these animals: 🐘 and 🐁. Complete the sentence: "The elephant is ___ than the mouse."',
    options: ["Small", "Smallest", "Bigger", "Biggest"],
    answer: "Bigger",
  },
  {
    id: "q4",
    question: "Choose the correct sentence!",
    options: [
      "Bill runs fast than Bob.",
      "Bill runs more faster than Bob.",
      "Bill runs fastest than Bob.",
      "Bill runs faster than Bob.",
    ],
    answer: "Bill runs faster than Bob.",
  },

  // READING
  {
    id: "q5",
    question: "The giraffe is ___ the deer.",
    options: ["Taller than", "Tallest than", "More tall than", "The tallest"],
    answer: "Taller than",
  },
  {
    id: "q6",
    question:
      "Read the text below:\n\nPizza is delicious. Satay is more delicious than pizza.\n\nWhich food is more delicious?",
    options: [
      "Pizza",
      "Satay",
      "Both equally delicious",
      "The text does not mention",
    ],
    answer: "Satay",
  },

  // WRITING
  {
    id: "q7",
    question: 'Complete the sentence! "The elephant is ___ the mouse." (big)',
    options: ["Big", "Biggest", "Bigger than", "More big than"],
    answer: "Bigger than",
  },
  {
    id: "q8",
    question: 'Complete the sentence! "My house is ___ than yours." (good)',
    options: ["Good", "Best", "More good", "Better"],
    answer: "Better",
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
        levelNumber: 2,
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
      console.error("Save Level 2 result error:", error);

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
          <Text style={styles.levelLabel}>LEVEL 2</Text>

          <Text style={styles.title}>Comparative Degree</Text>

          <Text style={styles.subtitle}>
            Let's Learn to Compare Things!
          </Text>
        </View>

        {/* CARD 1: DEFINITION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comparing Two Things</Text>

          <Text style={styles.description}>
            <Text style={styles.bold}>Comparative Degree</Text> digunakan
            untuk membandingkan dua orang, benda, hewan, atau hal.
          </Text>

          <View style={styles.formulaBox}>
            <Text style={styles.formulaBlue}>
              Comparative Degree
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              "The giraffe is{" "}
              <Text style={styles.orangeText}>taller than</Text> the deer."
            </Text>

            <Text style={styles.translation}>
              Jerapah lebih tinggi daripada rusa.
            </Text>

            <View style={styles.exampleBadge}>
              <Text style={styles.badgeText}>!</Text>
            </View>
          </View>
        </View>

        {/* CARD 2: SHORT ADJECTIVES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            1. Short Adjectives
          </Text>

          <Text style={styles.description}>
            Untuk kata sifat pendek yang umumnya memiliki 1–2 suku kata,
            tambahkan akhiran -er dan gunakan than untuk membandingkan
            dua hal.
          </Text>

          <View style={styles.formulaBox}>
            <Text style={styles.formulaGreen}>
              Adjective + -er + than
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              "The giraffe is{" "}
              <Text style={styles.orangeText}>taller than</Text> the deer."
            </Text>

            <Text style={styles.translation}>
              Jerapah lebih tinggi daripada rusa.
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              "The elephant is{" "}
              <Text style={styles.orangeText}>bigger than</Text> the mouse."
            </Text>

            <Text style={styles.translation}>
              Gajah lebih besar daripada tikus.
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              "Bill runs{" "}
              <Text style={styles.orangeText}>faster than</Text> Bob."
            </Text>

            <Text style={styles.translation}>
              Bill berlari lebih cepat daripada Bob.
            </Text>
          </View>
        </View>

        {/* CARD 3: LONG ADJECTIVES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            2. Long Adjectives
          </Text>

          <Text style={styles.description}>
            Untuk kata sifat panjang yang umumnya memiliki 3 suku kata
            atau lebih, gunakan more sebelum kata sifat dan than setelahnya.
          </Text>

          <View style={styles.formulaBox}>
            <Text style={styles.formulaBlue}>
              More + adjective + than
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              "Satay is{" "}
              <Text style={styles.orangeText}>more delicious than</Text>{" "}
              burger."
            </Text>

            <Text style={styles.translation}>
              Sate lebih lezat daripada burger.
            </Text>

            <View style={styles.exampleBadge}>
              <Text style={styles.badgeText}>!</Text>
            </View>
          </View>

          {/* REMEMBER */}
          <View style={styles.rememberBox}>
            <Text style={styles.rememberTitle}>Remember This!</Text>

            <Text style={styles.rememberText}>
              Gunakan -er untuk kata sifat pendek dan more untuk kata
              sifat panjang. Jangan lupa gunakan than untuk membandingkan
              dua hal!
            </Text>
          </View>
        </View>

        {/* CARD 4: ADJECTIVE CHANGES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            3. Adjective Changes
          </Text>

          <Text style={styles.description}>
            Pelajari perubahan kata sifat berikut untuk menggunakan
            Comparative Degree dengan benar.
          </Text>

          {[
            { base: "Tall", comparative: "Taller", meaning: "Lebih tinggi" },
            { base: "Fast", comparative: "Faster", meaning: "Lebih cepat" },
            { base: "Big", comparative: "Bigger", meaning: "Lebih besar" },
            {
              base: "Delicious",
              comparative: "More delicious",
              meaning: "Lebih lezat",
            },
            { base: "Good", comparative: "Better", meaning: "Lebih baik" },
            { base: "Bad", comparative: "Worse", meaning: "Lebih buruk" },
            { base: "Little", comparative: "Less", meaning: "Lebih sedikit" },
            { base: "Much/Many", comparative: "More", meaning: "Lebih banyak" },
            {
              base: "Far",
              comparative: "Further/Farther",
              meaning: "Lebih jauh",
            },
          ].map((item, index) => (
            <View
              key={item.base}
              style={[
                styles.exampleBox,
                { marginBottom: index === 8 ? 0 : 10 },
              ]}
            >
              <Text style={styles.exampleText}>
                {item.base} →{" "}
                <Text style={styles.orangeText}>
                  {item.comparative}
                </Text>
              </Text>

              <Text style={styles.translation}>{item.meaning}</Text>
            </View>
          ))}
        </View>

        {/* CARD 5: IMPORTANT NOTES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            4. Important Notes
          </Text>

          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              • Gunakan than untuk membandingkan dua hal.
            </Text>
          </View>

          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              • Kata sifat pendek umumnya ditambah -er.
            </Text>
          </View>

          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              • Kata sifat panjang menggunakan more.
            </Text>
          </View>

          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              • Jangan menggabungkan more dengan kata sifat yang sudah
              berakhiran -er.
            </Text>
          </View>

          {/* CORRECT AND INCORRECT EXAMPLES */}
          <View style={styles.exampleBox}>
            <Text style={styles.exampleText}>
              ❌ More taller than
            </Text>

            <Text style={styles.exampleText}>
              ✅ <Text style={styles.orangeText}>Taller than</Text>
            </Text>

            <Text style={styles.exampleText}>
              ✅ <Text style={styles.orangeText}>More delicious than</Text>
            </Text>
          </View>

          <View style={styles.rememberBox}>
            <Text style={styles.rememberTitle}>Quick Reminder!</Text>

            <Text style={styles.rememberText}>
              Taller than = lebih tinggi daripada
              {"\n"}
              Bigger than = lebih besar daripada
              {"\n"}
              More delicious than = lebih lezat daripada
              {"\n\n"}
              Comparative Degree membandingkan DUA hal.
            </Text>
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
            <Text style={styles.levelLabel}>LEVEL 2</Text>

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
                {" "}/ {String(QUESTIONS.length).padStart(2, "0")}
            </Text>
            </Text>
        </View>

        {/* QUESTION */}
        <Text style={styles.questionHint}>CHOOSE THE CORRECT ANSWER</Text>

        <Text style={styles.questionText}>
            {question.question}
        </Text>

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
            {passed
              ? "You completed Level 2!"
              : "You need a little more practice."}
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
              <Text style={styles.unlockTitle}>🎉 Level 2 Completed!</Text>

              <Text style={styles.unlockText}>
                Congratulations! You have mastered Level 1 and can continue your
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
