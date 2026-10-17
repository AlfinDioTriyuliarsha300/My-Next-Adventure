import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

type Phase = "intro" | "reflection" | "quiz" | "result";

type Question = {
  question: string;
  hint: string;
  options: string[];
  answer: string;
  explanation: string;
};

const LEARNING_TOPICS = [
  {
    id: "confidence",
    title: "Building Confidence",
    description: "Belajar lebih percaya diri",
    emoji: "🌟",
    color: "#FFF0C9",
  },
  {
    id: "communication",
    title: "Communication",
    description: "Belajar berkomunikasi",
    emoji: "💬",
    color: "#DDF3FF",
  },
  {
    id: "teamwork",
    title: "Teamwork",
    description: "Belajar bekerja sama",
    emoji: "🤝",
    color: "#E4F7E9",
  },
  {
    id: "problem-solving",
    title: "Problem Solving",
    description: "Belajar menyelesaikan masalah",
    emoji: "🧩",
    color: "#F0E5FF",
  },
  {
    id: "self-awareness",
    title: "Knowing Myself",
    description: "Mengenal diri sendiri",
    emoji: "🪞",
    color: "#FFE5E9",
  },
  {
    id: "positive-thinking",
    title: "Positive Thinking",
    description: "Berpikir lebih positif",
    emoji: "🌈",
    color: "#E3F5F1",
  },
];

const FEELINGS = [
  { id: "happy", label: "Happy", emoji: "😄" },
  { id: "excited", label: "Excited", emoji: "🤩" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "challenged", label: "Challenged", emoji: "🤔" },
  { id: "confused", label: "Confused", emoji: "😵‍💫" },
  { id: "proud", label: "Proud", emoji: "🥳" },
];

const LEARNING_GOALS = [
  {
    id: "practice",
    title: "Practice More",
    description: "Aku ingin lebih banyak berlatih.",
    emoji: "🎯",
  },
  {
    id: "confidence",
    title: "Be More Confident",
    description: "Aku ingin lebih percaya diri.",
    emoji: "💪",
  },
  {
    id: "collaborate",
    title: "Work With Others",
    description: "Aku ingin belajar bersama teman.",
    emoji: "🫶",
  },
  {
    id: "explore",
    title: "Explore Something New",
    description: "Aku ingin mencoba hal baru.",
    emoji: "🚀",
  },
];

const QUESTIONS: Question[] = [
  {
    question: "Why is reflection important after learning?",
    hint: "Think about how reflection helps us grow.",
    options: [
      "To understand what we learned",
      "To forget the lesson",
      "To avoid trying again",
      "To compare ourselves with everyone",
    ],
    answer: "To understand what we learned",
    explanation:
      "Reflection helps us understand our experience, recognize progress, and discover what we can improve.",
  },
  {
    question: "What should you do when something feels difficult?",
    hint: "Remember that learning takes time.",
    options: [
      "Give up immediately",
      "Keep trying and learn from mistakes",
      "Blame other people",
      "Never ask for help",
    ],
    answer: "Keep trying and learn from mistakes",
    explanation:
      "Mistakes are part of learning. We can improve by practising, asking for help, and trying different approaches.",
  },
  {
    question: "Which action shows a positive learning attitude?",
    hint: "Choose the action that helps you grow.",
    options: [
      "Refusing to learn anything new",
      "Being afraid of every mistake",
      "Being open to feedback",
      "Giving up when challenged",
    ],
    answer: "Being open to feedback",
    explanation:
      "Feedback can help us discover our strengths and understand what we can do better next time.",
  },
];

export default function LevelFiveScreen() {
  const { width } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  const isWide = width >= 700;
  const currentQuestion = QUESTIONS[questionIndex];

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(18);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 14,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phase, questionIndex, fadeAnim, slideAnim]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((previous) =>
      previous.includes(id)
        ? previous.filter((topic) => topic !== id)
        : [...previous, id],
    );
  };

  const startQuiz = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnswers([]);
    setPhase("quiz");
  };

  const handleSelectAnswer = (option: string) => {
    if (showFeedback) return;

    setSelectedAnswer(option);
    setShowFeedback(true);

    const correct = option === currentQuestion.answer;

    if (correct) {
      setScore((previous) => previous + 1);
    }

    setAnswers((previous) => [...previous, correct]);
  };

  const handleNextQuestion = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((previous) => previous + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setPhase("result");
    }
  };

  const restartLevel = () => {
    setPhase("intro");
    setSelectedTopics([]);
    setSelectedFeeling(null);
    setSelectedGoal(null);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnswers([]);
  };

  const progress =
    phase === "quiz" ? ((questionIndex + 1) / QUESTIONS.length) * 100 : 0;

  const selectedFeelingData = FEELINGS.find(
    (feeling) => feeling.id === selectedFeeling,
  );

  const selectedGoalData = LEARNING_GOALS.find(
    (goal) => goal.id === selectedGoal,
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back to levels"
        onPress={() => router.replace("/levels")}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backButtonText}>‹</Text>
      </Pressable>

      <View style={styles.headerCenter}>
        <Text style={styles.headerEyebrow}>MY NEXT ADVENTURE</Text>
        <Text style={styles.headerTitle}>LEVEL 5</Text>
      </View>

      <View style={styles.levelBadge}>
        <Text style={styles.levelBadgeText}>5</Text>
      </View>
    </View>
  );

  const renderIntro = () => (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroIllustration}>
          <Text style={styles.heroEmoji}>🪞</Text>
          <View style={styles.heroSparkleOne}>
            <Text>✨</Text>
          </View>
          <View style={styles.heroSparkleTwo}>
            <Text>⭐</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>YOUR PERSONAL JOURNEY</Text>
        <Text style={styles.heroTitle}>My Reflection</Text>
        <Text style={styles.heroDescription}>
          Take a moment to look back, celebrate your progress, and discover what
          you want to learn next.
        </Text>

        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>🌱 Reflect • Learn • Grow</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>What will you do?</Text>
        <Text style={styles.sectionDescription}>
          In this level, you will reflect on your learning experience and
          complete a short quiz.
        </Text>

        <View style={styles.activityRow}>
          <View style={[styles.activityIcon, { backgroundColor: "#FFF0C9" }]}>
            <Text style={styles.activityEmoji}>📝</Text>
          </View>
          <View style={styles.activityText}>
            <Text style={styles.activityTitle}>Personal Reflection</Text>
            <Text style={styles.activityDescription}>
              Choose what you learned and how you feel.
            </Text>
          </View>
        </View>

        <View style={styles.activityRow}>
          <View style={[styles.activityIcon, { backgroundColor: "#E3F5F1" }]}>
            <Text style={styles.activityEmoji}>🧠</Text>
          </View>
          <View style={styles.activityText}>
            <Text style={styles.activityTitle}>Knowledge Check</Text>
            <Text style={styles.activityDescription}>
              Answer {QUESTIONS.length} questions about learning and growth.
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => setPhase("reflection")}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>Start Reflecting</Text>
        <Text style={styles.primaryButtonArrow}>→</Text>
      </Pressable>
    </Animated.View>
  );

  const renderReflection = () => (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.pageIntro}>
        <Text style={styles.eyebrow}>STEP 1 OF 2</Text>
        <Text style={styles.pageTitle}>Let's reflect! 💭</Text>
        <Text style={styles.pageDescription}>
          There are no wrong answers here. Choose what feels right for you.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.questionHeading}>
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>01</Text>
          </View>
          <View style={styles.questionHeadingText}>
            <Text style={styles.sectionTitle}>What did you learn about?</Text>
            <Text style={styles.sectionDescription}>
              Select all that apply.
            </Text>
          </View>
        </View>

        <View style={styles.topicGrid}>
          {LEARNING_TOPICS.map((topic) => {
            const selected = selectedTopics.includes(topic.id);

            return (
              <Pressable
                key={topic.id}
                onPress={() => toggleTopic(topic.id)}
                style={({ pressed }) => [
                  styles.topicOption,
                  { backgroundColor: topic.color },
                  selected && styles.topicOptionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.topicTopRow}>
                  <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                  <View
                    style={[
                      styles.checkCircle,
                      selected && styles.checkCircleSelected,
                    ]}
                  >
                    {selected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.selectionCount}>
          {selectedTopics.length} topic
          {selectedTopics.length === 1 ? "" : "s"} selected
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.questionHeading}>
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>02</Text>
          </View>
          <View style={styles.questionHeadingText}>
            <Text style={styles.sectionTitle}>
              How do you feel after learning?
            </Text>
            <Text style={styles.sectionDescription}>
              Choose the feeling that fits you best.
            </Text>
          </View>
        </View>

        <View style={styles.feelingsGrid}>
          {FEELINGS.map((feeling) => {
            const selected = selectedFeeling === feeling.id;

            return (
              <Pressable
                key={feeling.id}
                onPress={() => setSelectedFeeling(feeling.id)}
                style={({ pressed }) => [
                  styles.feelingOption,
                  selected && styles.feelingOptionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
                <Text
                  style={[styles.feelingLabel, selected && styles.selectedText]}
                >
                  {feeling.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.questionHeading}>
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>03</Text>
          </View>
          <View style={styles.questionHeadingText}>
            <Text style={styles.sectionTitle}>What's your next goal?</Text>
            <Text style={styles.sectionDescription}>
              Pick one thing you want to focus on.
            </Text>
          </View>
        </View>

        <View style={styles.goalList}>
          {LEARNING_GOALS.map((goal) => {
            const selected = selectedGoal === goal.id;

            return (
              <Pressable
                key={goal.id}
                onPress={() => setSelectedGoal(goal.id)}
                style={({ pressed }) => [
                  styles.goalOption,
                  selected && styles.goalOptionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <View style={styles.goalText}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    selected && styles.radioCircleSelected,
                  ]}
                >
                  {selected && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={startQuiz}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>Continue to Quiz</Text>
        <Text style={styles.primaryButtonArrow}>→</Text>
      </Pressable>

      <Text style={styles.footerHint}>
        Your reflection is about your own journey. Be honest with yourself. 💛
      </Text>
    </Animated.View>
  );

  const renderQuiz = () => (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.pageIntro}>
        <Text style={styles.eyebrow}>STEP 2 OF 2</Text>
        <Text style={styles.pageTitle}>Knowledge Check 🧠</Text>
        <Text style={styles.pageDescription}>
          Take your time and choose the best answer.
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>YOUR PROGRESS</Text>
          <Text style={styles.progressCount}>
            {questionIndex + 1} / {QUESTIONS.length}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.quizCard}>
        <View style={styles.quizCardTop}>
          <View style={styles.challengeBadge}>
            <Text style={styles.challengeBadgeText}>✨ QUICK CHALLENGE</Text>
          </View>
          <Text style={styles.questionCount}>Question {questionIndex + 1}</Text>
        </View>

        <Text style={styles.quizQuestion}>{currentQuestion.question}</Text>
        <Text style={styles.questionHint}>{currentQuestion.hint}</Text>

        <View style={styles.questionDivider} />

        {currentQuestion.options.map((option, index) => {
          const selected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.answer;

          return (
            <Pressable
              key={option}
              onPress={() => handleSelectAnswer(option)}
              disabled={showFeedback}
              style={({ pressed }) => [
                styles.quizOption,
                selected && !showFeedback && styles.selectedQuizOption,
                showFeedback && isCorrect && styles.correctOption,
                showFeedback && selected && !isCorrect && styles.wrongOption,
                pressed && !showFeedback && styles.pressed,
              ]}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              <Text
                style={[
                  styles.quizOptionText,
                  selected && !showFeedback && styles.selectedText,
                ]}
              >
                {option}
              </Text>

              {showFeedback && isCorrect && (
                <Text style={styles.answerStatus}>✓</Text>
              )}

              {showFeedback && selected && !isCorrect && (
                <Text style={styles.wrongStatus}>✕</Text>
              )}
            </Pressable>
          );
        })}

        {showFeedback && (
          <View
            style={[
              styles.feedbackBox,
              selectedAnswer === currentQuestion.answer
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {selectedAnswer === currentQuestion.answer
                ? "Great job! 🎉"
                : "Keep learning! 🌱"}
            </Text>
            <Text style={styles.feedbackText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </View>

      {showFeedback && (
        <Pressable
          onPress={handleNextQuestion}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {questionIndex < QUESTIONS.length - 1
              ? "Next Question"
              : "See My Results"}
          </Text>
          <Text style={styles.primaryButtonArrow}>→</Text>
        </Pressable>
      )}

      <Text style={styles.footerHint}>
        Remember: every mistake is an opportunity to grow. 🌱
      </Text>
    </Animated.View>
  );

  const renderResult = () => {
    const percentage = Math.round((score / QUESTIONS.length) * 100);

    return (
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.resultHero}>
          <Text style={styles.resultEmoji}>
            {score === QUESTIONS.length ? "🏆" : score >= 2 ? "🌟" : "🌱"}
          </Text>
          <Text style={styles.eyebrow}>LEVEL 5 COMPLETED</Text>
          <Text style={styles.resultTitle}>Look How Far You've Come!</Text>
          <Text style={styles.resultDescription}>
            Every step you take helps you grow. Celebrate your effort and keep
            exploring.
          </Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>
              {score}/{QUESTIONS.length}
            </Text>
            <Text style={styles.scoreCaption}>CORRECT</Text>
          </View>

          <Text style={styles.scorePercentage}>{percentage}% score</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your reflection recap 💭</Text>

          <Text style={styles.recapLabel}>WHAT YOU LEARNED</Text>
          {selectedTopics.length > 0 ? (
            <View style={styles.recapChips}>
              {LEARNING_TOPICS.filter((topic) =>
                selectedTopics.includes(topic.id),
              ).map((topic) => (
                <View
                  key={topic.id}
                  style={[styles.recapChip, { backgroundColor: topic.color }]}
                >
                  <Text style={styles.recapChipText}>
                    {topic.emoji} {topic.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.recapEmpty}>
              You didn't select any topics this time.
            </Text>
          )}

          <View style={styles.recapDivider} />

          <Text style={styles.recapLabel}>HOW YOU FEEL</Text>
          <Text style={styles.recapValue}>
            {selectedFeelingData
              ? `${selectedFeelingData.emoji} ${selectedFeelingData.label}`
              : "No feeling selected"}
          </Text>

          <View style={styles.recapDivider} />

          <Text style={styles.recapLabel}>YOUR NEXT GOAL</Text>
          <Text style={styles.recapValue}>
            {selectedGoalData
              ? `${selectedGoalData.emoji} ${selectedGoalData.title}`
              : "No goal selected"}
          </Text>
          {selectedGoalData && (
            <Text style={styles.goalDescription}>
              {selectedGoalData.description}
            </Text>
          )}
        </View>

        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementEmoji}>💛</Text>
          <View style={styles.encouragementText}>
            <Text style={styles.encouragementTitle}>A little reminder</Text>
            <Text style={styles.encouragementDescription}>
              Progress is not about being perfect. It is about being willing to
              learn, try again, and become a little better each day.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.replace("/levels")}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Back to Levels</Text>
          <Text style={styles.primaryButtonArrow}>→</Text>
        </Pressable>

        <Pressable
          onPress={restartLevel}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>↻ Try Again</Text>
        </Pressable>

        <Text style={styles.footerHint}>
          You did it! Keep your curiosity alive. 🚀
        </Text>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/images/lessons/positive-degree-background.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {renderHeader()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isWide && styles.scrollContentWide,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {phase === "intro" && renderIntro()}
          {phase === "reflection" && renderReflection()}
          {phase === "quiz" && renderQuiz()}
          {phase === "result" && renderResult()}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  backgroundImage: {
    opacity: 0.18,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(247, 248, 252, 0.90)",
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAF2",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F0F0F8",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 34,
    lineHeight: 36,
    color: "#46436D",
    marginTop: -4,
  },
  headerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerEyebrow: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "800",
    color: "#85829E",
  },
  headerTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#343254",
  },
  levelBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E8E2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#6753B5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 44,
  },
  scrollContentWide: {
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    gap: 18,
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: "#EEEAF8",
    overflow: "hidden",
  },
  heroIllustration: {
    width: 128,
    height: 128,
    borderRadius: 40,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    position: "relative",
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroSparkleOne: {
    position: "absolute",
    top: 8,
    right: 4,
  },
  heroSparkleTwo: {
    position: "absolute",
    bottom: 8,
    left: 5,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#8877C7",
    textAlign: "center",
  },
  heroTitle: {
    marginTop: 9,
    fontSize: 32,
    fontWeight: "900",
    color: "#343254",
    textAlign: "center",
  },
  heroDescription: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: "#77758E",
    textAlign: "center",
    maxWidth: 490,
  },
  infoPill: {
    marginTop: 20,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F4F0FF",
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6F5CB2",
  },
  sectionCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEBF3",
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "900",
    color: "#343254",
  },
  sectionDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: "#85839B",
  },
  activityRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  activityIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  activityEmoji: {
    fontSize: 25,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#41405F",
  },
  activityDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#85839B",
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 22,
    backgroundColor: "#7562C6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#7562C6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  primaryButtonArrow: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  pageIntro: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  pageTitle: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "900",
    color: "#343254",
  },
  pageDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#77758E",
  },
  questionHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  questionNumber: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#705BB8",
  },
  questionHeadingText: {
    flex: 1,
  },
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  topicOption: {
    width: "48%",
    flexGrow: 1,
    minWidth: 130,
    minHeight: 130,
    padding: 13,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  topicOptionSelected: {
    borderColor: "#7965C8",
  },
  topicTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topicEmoji: {
    fontSize: 25,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#C7C5D7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkCircleSelected: {
    backgroundColor: "#7562C6",
    borderColor: "#7562C6",
  },
  checkMark: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  topicTitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    color: "#45435F",
  },
  topicDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#77758E",
  },
  selectionCount: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: "700",
    color: "#817DA0",
    textAlign: "right",
  },
  feelingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  feelingOption: {
    flexGrow: 1,
    width: "30%",
    minWidth: 85,
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#EBEAF3",
    backgroundColor: "#FCFCFF",
  },
  feelingOptionSelected: {
    borderColor: "#7965C8",
    backgroundColor: "#F2EEFF",
  },
  feelingEmoji: {
    fontSize: 27,
  },
  feelingLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#77758E",
  },
  selectedText: {
    color: "#6C57B4",
  },
  goalList: {
    gap: 10,
  },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#EBEAF3",
    borderRadius: 17,
    backgroundColor: "#FCFCFF",
  },
  goalOptionSelected: {
    borderColor: "#7965C8",
    backgroundColor: "#F5F1FF",
  },
  goalEmoji: {
    width: 42,
    height: 42,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    borderRadius: 13,
    backgroundColor: "#EEE8FF",
    fontSize: 23,
    paddingTop: 7,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#41405F",
  },
  goalDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#85839B",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#C8C5D9",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#7562C6",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7562C6",
  },
  footerHint: {
    marginTop: 0,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    color: "#9290A6",
  },
  progressSection: {
    paddingHorizontal: 4,
  },
  progressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#85829E",
  },
  progressCount: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6F5CB2",
  },
  progressTrack: {
    height: 9,
    borderRadius: 10,
    backgroundColor: "#E7E3F3",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#8B78D6",
  },
  quizCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEBF3",
  },
  quizCardTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  challengeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFF0D6",
  },
  challengeBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#A66A20",
    letterSpacing: 0.4,
  },
  questionCount: {
    fontSize: 11,
    fontWeight: "800",
    color: "#85839B",
  },
  quizQuestion: {
    marginTop: 23,
    fontSize: 21,
    lineHeight: 29,
    fontWeight: "900",
    color: "#343254",
  },
  questionHint: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 19,
    color: "#85839B",
  },
  questionDivider: {
    height: 1,
    backgroundColor: "#EEEFF5",
    marginVertical: 20,
  },
  quizOption: {
    minHeight: 58,
    padding: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#EAE9F2",
    backgroundColor: "#FCFCFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedQuizOption: {
    borderColor: "#7965C8",
    backgroundColor: "#F4F0FF",
  },
  correctOption: {
    borderColor: "#55AE7B",
    backgroundColor: "#EAF8EF",
  },
  wrongOption: {
    borderColor: "#DF7777",
    backgroundColor: "#FFF0F0",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#F0EEF8",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6C668A",
  },
  quizOptionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "700",
    color: "#53516F",
  },
  answerStatus: {
    fontSize: 20,
    fontWeight: "900",
    color: "#29965A",
  },
  wrongStatus: {
    fontSize: 20,
    fontWeight: "900",
    color: "#D45656",
  },
  feedbackBox: {
    marginTop: 8,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: "#F0FAF3",
    borderColor: "#CDECD6",
  },
  feedbackIncorrect: {
    backgroundColor: "#FFF6EC",
    borderColor: "#F2DFC3",
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#41405F",
  },
  feedbackText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 20,
    color: "#686681",
  },
  resultHero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEAF8",
  },
  resultEmoji: {
    fontSize: 66,
    marginBottom: 15,
  },
  resultTitle: {
    marginTop: 10,
    fontSize: 27,
    lineHeight: 35,
    fontWeight: "900",
    textAlign: "center",
    color: "#343254",
  },
  resultDescription: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    color: "#77758E",
  },
  scoreCircle: {
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 9,
    borderColor: "#E8E0FF",
    backgroundColor: "#F6F2FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  scoreNumber: {
    fontSize: 31,
    fontWeight: "900",
    color: "#6F5CB2",
  },
  scoreCaption: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#8881AD",
  },
  scorePercentage: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "900",
    color: "#6F5CB2",
  },
  recapLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#8A87A2",
  },
  recapChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recapChip: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
  },
  recapChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B4968",
  },
  recapEmpty: {
    fontSize: 12,
    color: "#85839B",
  },
  recapDivider: {
    height: 1,
    backgroundColor: "#EEEFF5",
    marginTop: 16,
  },
  recapValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#494765",
  },
  encouragementCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#FFF5D9",
    borderWidth: 1,
    borderColor: "#F5E9BC",
  },
  encouragementEmoji: {
    fontSize: 29,
  },
  encouragementText: {
    flex: 1,
  },
  encouragementTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#755B29",
  },
  encouragementDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 20,
    color: "#856F43",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#DCD6F3",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#6F5CB2",
  },
  pressed: {
    opacity: 0.78,
  },
});
