import { router } from 'expo-router';

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
} from 'react-native';

import { useState } from 'react';

import { saveLevelResult } from '../services/auth/authService';

type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'The giraffe is ___ .',
    options: [
      'tall',
      'taller',
      'tallest',
    ],
    answer: 'tall',
  },

  {
    id: 'q2',
    question:
      'My house is ___ big as your house.',
    options: [
      'as',
      'more',
      'most',
    ],
    answer: 'as',
  },

  {
    id: 'q3',
    question:
      'Pizza is as ___ as burger.',
    options: [
      'delicious',
      'more delicious',
      'most delicious',
    ],
    answer: 'delicious',
  },

  {
    id: 'q4',
    question:
      'The elephant is ___ animal.',
    options: [
      'big',
      'bigger',
      'biggest',
    ],
    answer: 'big',
  },

  {
    id: 'q5',
    question:
      'My bag is as ___ as your bag.',
    options: [
      'heavy',
      'heavier',
      'heaviest',
    ],
    answer: 'heavy',
  },
];

const POINT_PER_QUESTION = 20;
const PASSING_SCORE = 70;

type Phase =
  | 'material'
  | 'quiz'
  | 'result';

export default function LevelOneScreen() {
  const { width } =
    useWindowDimensions();

  const isPhone = width < 600;

  const backgroundImage =
    require('../../assets/images/lessons/positive-degree-background.png');

  const backButtonSize =
    isPhone ? 42 : 52;

  const [phase, setPhase] =
    useState<Phase>('material');

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [saving, setSaving] =
    useState(false);

  const [result, setResult] =
    useState<{
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

    router.replace('/levels');
  }

  /**
   * =====================================================
   * SELECT ANSWER
   * =====================================================
   */

  function handleSelectAnswer(
    answer: string
  ) {
    if (saving) return;

    const question =
      QUESTIONS[currentQuestion];

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
      Alert.alert(
        'Choose an Answer',
        'Please select an answer first.'
      );

      return;
    }

    const isLastQuestion =
      currentQuestion ===
      QUESTIONS.length - 1;

    if (!isLastQuestion) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

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
      const finalAnswers = {
        ...answers,

        [QUESTIONS[currentQuestion].id]:
          selectedAnswer,
      };

      let correctAnswers = 0;

      QUESTIONS.forEach(
        (question) => {
          if (
            finalAnswers[question.id] ===
            question.answer
          ) {
            correctAnswers++;
          }
        }
      );

      const score =
        correctAnswers *
        POINT_PER_QUESTION;

      const pointsEarned = score;

      const passed =
        score >= PASSING_SCORE;

      await saveLevelResult({
        levelNumber: 1,
        score,
        totalQuestions:
          QUESTIONS.length,
        correctAnswers,
        pointsEarned,
      });

      setResult({
        score,
        correctAnswers,
        totalQuestions:
          QUESTIONS.length,
        pointsEarned,
        passed,
      });

      setPhase('result');
    } catch (error) {
      console.error(
        'Save Level 1 result error:',
        error
      );

      Alert.alert(
        'Gagal Menyimpan',
        error instanceof Error
          ? error.message
          : 'Hasil belum dapat disimpan.'
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
    setPhase('quiz');
  }

  /**
   * =====================================================
   * MATERIAL
   * =====================================================
   */

  if (phase === 'material') {
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
              transform: [
                {
                  scale: pressed
                    ? 0.9
                    : 1,
                },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/buttons/back.png')}
            style={styles.backImage}
            resizeMode="contain"
          />
        </Pressable>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          bounces={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.levelLabel}>
              LEVEL 1
            </Text>

            <Text style={styles.title}>
              Positive Degree
            </Text>

            <Text style={styles.subtitle}>
              Let's Learn to Describe Things!
            </Text>
          </View>

          {/* CARD 1 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Describing Things
            </Text>

            <Text
              style={styles.description}
            >
              <Text style={styles.bold}>
                Positive Degree
              </Text>{' '}
              digunakan untuk menjelaskan
              sifat suatu benda, hewan, atau
              orang tanpa menyatakan bahwa
              sesuatu lebih atau kurang dari
              yang lain.
            </Text>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaBlue}>
                Subject + adjective
              </Text>
            </View>

            <View
              style={styles.exampleBox}
            >
              <Text
                style={styles.exampleText}
              >
                "The giraffe is{' '}
                <Text
                  style={styles.orangeText}
                >
                  tall
                </Text>
                ."
              </Text>

              <Text
                style={styles.translation}
              >
                Jerapah itu tinggi.
              </Text>

              <View
                style={styles.exampleBadge}
              >
                <Text
                  style={styles.badgeText}
                >
                  !
                </Text>
              </View>
            </View>
          </View>

          {/* CARD 2 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Comparing Two Things Equally
            </Text>

            <Text
              style={styles.description}
            >
              Gunakan ini jika dua hal
              memiliki tingkat sifat yang sama.
            </Text>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaGreen}>
                as + adjective + as
              </Text>
            </View>

            {/* EXAMPLE 1 */}
            <View
              style={styles.exampleBox}
            >
              <Text
                style={styles.exampleText}
              >
                "My house is{' '}
                <Text
                  style={styles.orangeText}
                >
                  as big as
                </Text>{' '}
                your house."
              </Text>

              <Text
                style={styles.translation}
              >
                Rumahku sebesar rumahmu.
              </Text>

              <View
                style={
                  styles.exampleBadgeRow
                }
              >
                <View
                  style={styles.exampleBadge}
                >
                  <Text
                    style={styles.badgeText}
                  >
                    !
                  </Text>
                </View>

                <View
                  style={styles.exampleBadge}
                >
                  <Text
                    style={styles.badgeText}
                  >
                    !
                  </Text>
                </View>
              </View>
            </View>

            {/* EXPLANATION */}
            <View
              style={styles.explanationBox}
            >
              <Text
                style={
                  styles.explanationText
                }
              >
                Kita menggunakan as big as
                karena kedua rumah memiliki
                ukuran yang sama besar.
              </Text>
            </View>

            {/* EXAMPLE 2 */}
            <View
              style={styles.exampleBox}
            >
              <Text
                style={styles.exampleText}
              >
                "Pizza is{' '}
                <Text
                  style={styles.orangeText}
                >
                  as delicious as
                </Text>{' '}
                burger."
              </Text>

              <Text
                style={styles.translation}
              >
                Pizza selezat burger.
              </Text>

              <View
                style={
                  styles.exampleBadgeRow
                }
              >
                <View
                  style={styles.exampleBadge}
                >
                  <Text
                    style={styles.badgeText}
                  >
                    !
                  </Text>
                </View>

                <View
                  style={styles.exampleBadge}
                >
                  <Text
                    style={styles.badgeText}
                  >
                    !
                  </Text>
                </View>
              </View>
            </View>

            {/* REMEMBER */}
            <View
              style={styles.rememberBox}
            >
              <Text
                style={styles.rememberTitle}
              >
                Remember This!
              </Text>

              <Text
                style={styles.rememberText}
              >
                "As ... as" shows that two
                things have the SAME degree
                of quality — it is always
                wrapped by two "as"!
              </Text>
            </View>
          </View>

          {/* START PRACTICE */}
          <Pressable
            onPress={() =>
              setPhase('quiz')
            }
            style={({ pressed }) => [
              styles.startButton,
              {
                transform: [
                  {
                    scale: pressed
                      ? 0.96
                      : 1,
                  },
                ],
              },
            ]}
          >
            <Text
              style={
                styles.startButtonText
              }
            >
              Start Practice
            </Text>
          </Pressable>

          {/* BOTTOM SPACE */}
          <View
            style={styles.bottomSpace}
          />
        </ScrollView>
      </ImageBackground>
    );
  }

  /**
   * =====================================================
   * QUIZ
   * =====================================================
   */

  if (phase === 'quiz') {
    const question =
      QUESTIONS[currentQuestion];

    const progress =
      ((currentQuestion + 1) /
        QUESTIONS.length) *
      100;

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
                  scale: pressed
                    ? 0.9
                    : 1,
                },
              ],
              opacity: saving ? 0.5 : 1,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/buttons/back.png')}
            style={styles.backImage}
            resizeMode="contain"
          />
        </Pressable>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          bounces={false}
        >
          {/* QUIZ HEADER */}
          <View style={styles.header}>
            <Text style={styles.levelLabel}>
              LEVEL 1
            </Text>

            <Text style={styles.quizTitle}>
              Let's Practice!
            </Text>

            <Text
              style={styles.questionNumber}
            >
              Question {currentQuestion + 1}{' '}
              of {QUESTIONS.length}
            </Text>

            <View
              style={
                styles.progressBackground
              }
            >
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
          <View style={styles.card}>
            <Text
              style={styles.questionText}
            >
              {question.question}
            </Text>

            <View
              style={
                styles.optionsContainer
              }
            >
              {question.options.map(
                (option) => {
                  const selected =
                    selectedAnswer ===
                    option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() =>
                        handleSelectAnswer(
                          option
                        )
                      }
                      disabled={saving}
                      style={[
                        styles.optionButton,
                        selected &&
                          styles.optionSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionCircle,
                          selected &&
                            styles.optionCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionCircleText,
                            selected &&
                              styles.optionCircleTextSelected,
                          ]}
                        >
                          {option
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>

          {/* NEXT */}
          <Pressable
            onPress={
              handleNextQuestion
            }
            disabled={saving}
            style={[
              styles.nextButton,
              saving &&
                styles.buttonDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.nextButtonText
                }
              >
                {currentQuestion ===
                QUESTIONS.length - 1
                  ? 'Finish'
                  : 'Next'}
              </Text>
            )}
          </Pressable>

          <View
            style={styles.bottomSpace}
          />
        </ScrollView>
      </ImageBackground>
    );
  }

  /**
   * =====================================================
   * RESULT
   * =====================================================
   */

  const passed =
    result?.passed ?? false;

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View
        style={styles.resultContainer}
      >
        <View
          style={[
            styles.resultCard,
            passed
              ? styles.resultSuccess
              : styles.resultRetry,
          ]}
        >
          <Text style={styles.resultEmoji}>
            {passed ? '🎉' : '📚'}
          </Text>

          <Text style={styles.resultTitle}>
            {passed
              ? 'Great Job!'
              : 'Keep Practicing!'}
          </Text>

          <Text
            style={styles.resultSubtitle}
          >
            {passed
              ? 'You completed Level 1!'
              : 'You need a little more practice.'}
          </Text>

          {/* SCORE */}
          <View style={styles.scoreCircle}>
            <Text
              style={styles.scoreNumber}
            >
              {result?.score ?? 0}
            </Text>

            <Text style={styles.scoreLabel}>
              SCORE
            </Text>
          </View>

          {/* DETAILS */}
          <View
            style={styles.resultDetails}
          >
            <View
              style={styles.resultRow}
            >
              <Text
                style={styles.resultLabel}
              >
                Correct Answers
              </Text>

              <Text
                style={styles.resultValue}
              >
                {result?.correctAnswers ??
                  0}
                /
                {result?.totalQuestions ??
                  QUESTIONS.length}
              </Text>
            </View>

            <View
              style={styles.resultRow}
            >
              <Text
                style={styles.resultLabel}
              >
                Points Earned
              </Text>

              <Text
                style={styles.resultValue}
              >
                +{result?.pointsEarned ??
                  0}
              </Text>
            </View>

            <View
              style={styles.resultRow}
            >
              <Text
                style={styles.resultLabel}
              >
                Passing Score
              </Text>

              <Text
                style={styles.resultValue}
              >
                {PASSING_SCORE}
              </Text>
            </View>
          </View>

          {/* STATUS */}
          {passed ? (
            <View
              style={styles.unlockBox}
            >
              <Text
                style={styles.unlockTitle}
              >
                🔓 Level 2 Unlocked!
              </Text>

              <Text
                style={styles.unlockText}
              >
                Congratulations! You have
                mastered Level 1 and can
                continue your adventure.
              </Text>
            </View>
          ) : (
            <View
              style={styles.retryBox}
            >
              <Text
                style={styles.retryTitle}
              >
                Almost there!
              </Text>

              <Text
                style={styles.retryText}
              >
                Get a score of 70 or higher
                to unlock the next level.
              </Text>
            </View>
          )}

          {/* ACTION */}
          {passed ? (
            <>
              <Pressable
                onPress={() =>
                  router.replace(
                    '/levels'
                  )
                }
                style={
                  styles.primaryResultButton
                }
              >
                <Text
                  style={
                    styles.primaryResultButtonText
                  }
                >
                  Choose Level
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.replace(
                    '/student'
                  )
                }
                style={
                  styles.secondaryResultButton
                }
              >
                <Text
                  style={
                    styles.secondaryResultButtonText
                  }
                >
                  Back to Home
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={handleRetry}
                style={
                  styles.primaryResultButton
                }
              >
                <Text
                  style={
                    styles.primaryResultButtonText
                  }
                >
                  Try Again
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.replace(
                    '/levels'
                  )
                }
                style={
                  styles.secondaryResultButton
                }
              >
                <Text
                  style={
                    styles.secondaryResultButtonText
                  }
                >
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
    width: '100%',
    height: '100%',
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 30,
  },

  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backImage: {
    width: '100%',
    height: '100%',
  },

  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },

  levelLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#8A6A32',
    marginBottom: 2,
  },

  title: {
    fontSize: 21,
    fontWeight: '900',
    color: '#07121C',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#07121C',
    textAlign: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#151515',
    marginBottom: 7,
  },

  description: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#242424',
  },

  bold: {
    fontWeight: '900',
  },

  formulaBox: {
    width: '100%',
    minHeight: 25,
    marginTop: 9,
    marginBottom: 9,
    borderRadius: 5,
    backgroundColor: '#F4F1EF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },

  formulaBlue: {
    color: '#38A9F5',
    fontSize: 12,
    fontWeight: '900',
  },

  formulaGreen: {
    color: '#79BD35',
    fontSize: 12,
    fontWeight: '900',
  },

  exampleBox: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#F4F1EF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 7,
    paddingRight: 34,
  },

  exampleText: {
    fontSize: 10.5,
    lineHeight: 15,
    color: '#151515',
    fontWeight: '800',
  },

  orangeText: {
    color: '#F06A24',
    fontWeight: '900',
  },

  translation: {
    marginTop: 2,
    fontSize: 9,
    color: '#555555',
    fontStyle: 'italic',
  },

  exampleBadge: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#FFB52E',
    borderWidth: 1,
    borderColor: '#F58B16',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '900',
    color: '#A34C0B',
  },

  exampleBadgeRow: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    gap: 3,
  },

  explanationBox: {
    borderWidth: 1,
    borderColor: '#62B9FF',
    borderRadius: 5,
    padding: 5,
    marginBottom: 7,
  },

  explanationText: {
    fontSize: 8.5,
    lineHeight: 12,
    color: '#222222',
  },

  rememberBox: {
    backgroundColor: '#FF1010',
    borderRadius: 5,
    padding: 10,
    marginTop: 1,
  },

  rememberTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 3,
  },

  rememberText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: '600',
  },

  startButton: {
    width: '100%',
    maxWidth: 520,
    minHeight: 48,
    marginTop: 2,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  quizTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#07121C',
    textAlign: 'center',
  },

  questionNumber: {
    marginTop: 5,
    fontSize: 11,
    color: '#555555',
    fontWeight: '700',
  },

  progressBackground: {
    width: '100%',
    maxWidth: 520,
    height: 7,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#DAD5CF',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#79BD35',
  },

  questionText: {
    fontSize: 18,
    lineHeight: 25,
    color: '#151515',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
  },

  optionsContainer: {
    gap: 9,
  },

  optionButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D9D3CC',
    backgroundColor: '#F8F6F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  optionSelected: {
    borderColor: '#38A9F5',
    backgroundColor: '#EAF6FF',
  },

  optionCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6E1DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionCircleSelected: {
    backgroundColor: '#38A9F5',
  },

  optionCircleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#555555',
  },

  optionCircleTextSelected: {
    color: '#FFFFFF',
  },

  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#151515',
  },

  optionTextSelected: {
    fontWeight: '900',
    color: '#172B4D',
  },

  nextButton: {
    width: '100%',
    maxWidth: 520,
    minHeight: 48,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  bottomSpace: {
    height: 10,
  },

  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
  },

  resultCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 22,
    alignItems: 'center',
  },

  resultSuccess: {
    borderWidth: 2,
    borderColor: '#A9D18E',
  },

  resultRetry: {
    borderWidth: 2,
    borderColor: '#E8CC67',
  },

  resultEmoji: {
    fontSize: 38,
  },

  resultTitle: {
    marginTop: 5,
    fontSize: 26,
    fontWeight: '900',
    color: '#07121C',
    textAlign: 'center',
  },

  resultSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
  },

  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 18,
    backgroundColor: '#F4F1EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: '#172B4D',
  },

  scoreLabel: {
    marginTop: -2,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#8A6A32',
  },

  resultDetails: {
    width: '100%',
    marginTop: 16,
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7E2',
  },

  resultLabel: {
    fontSize: 11,
    color: '#555555',
  },

  resultValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#172B4D',
  },

  unlockBox: {
    width: '100%',
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EEF7E7',
    borderWidth: 1,
    borderColor: '#A9D18E',
  },

  unlockTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#47722D',
    textAlign: 'center',
  },

  unlockText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: '#5C6F4D',
    textAlign: 'center',
  },

  retryBox: {
    width: '100%',
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF8D9',
    borderWidth: 1,
    borderColor: '#E8CC67',
  },

  retryTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6B541D',
    textAlign: 'center',
  },

  retryText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: '#7A6840',
    textAlign: 'center',
  },

  primaryResultButton: {
    width: '100%',
    minHeight: 46,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryResultButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  secondaryResultButton: {
    width: '100%',
    minHeight: 44,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9CCAD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryResultButtonText: {
    color: '#6E5A35',
    fontSize: 13,
    fontWeight: '800',
  },
});