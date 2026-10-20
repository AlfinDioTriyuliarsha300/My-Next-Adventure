
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import FeedbackSheet from '../../components/learning/FeedbackSheet';
import QuestionCard from '../../components/learning/QuestionCard';
import SkillHeader from '../../components/learning/SkillHeader';
import StarProgress from '../../components/learning/StarProgress';

import {
  ambilProgress,
  hitungBintang,
  tandaiSoalSelesai,
} from '../../services/auth/learningProgress';

const LEVEL = 3;
const SKILL = 'reading';

const questions = [
  {
    id: '22',
    type: 'Reading',
    difficulty: 'Easy',

    question:
      'Rani got 85, Sinta got 95, and Doni got 98. Who got the highest score?',

    prompt:
      'Rani got 85, Sinta got 95, and Doni got 98. Who got the highest score?',

    instruction:
      'Read the text and choose the correct answer.',

    options: [
      {
        id: 'A',
        text: 'Rani',
      },
      {
        id: 'B',
        text: 'Sinta',
      },
      {
        id: 'C',
        text: 'Doni',
      },
      {
        id: 'D',
        text: 'Not mentioned',
      },
    ],

    correctAnswer: ['C'],

    explanation:
      'Correct! Doni got the highest score with 98 points.',

    image: null,

    multipleAnswer: false,
  },

  {
    id: '23',
    type: 'Reading',
    difficulty: 'Medium',

    question:
      'Which sentence is correct?',

    prompt:
      'Which sentence is correct?',

    instruction:
      'Choose the grammatically correct sentence.',

    readingText: null,

    options: [
      {
        id: 'A',
        text: 'This is the most cheapest bag.',
      },
      {
        id: 'B',
        text: 'This is the cheapest bag.',
      },
      {
        id: 'C',
        text: 'This is most cheap bag.',
      },
      {
        id: 'D',
        text: 'This is the more cheap bag.',
      },
    ],

    correctAnswer: ['B'],

    explanation:
      'Correct! "The cheapest bag" is the correct superlative form. We do not use "most" with "cheapest".',

    image: null,

    multipleAnswer: false,
  },

  {
    id: '24',
    type: 'Reading',
    difficulty: 'Hard',

    question:
      'Mountain A is 2,000 meters high. Mountain B is 3,000 meters high. Mountain C is 2,500 meters high. Which mountain is the highest?',

    prompt:
      'Mountain A is 2,000 meters high. Mountain B is 3,000 meters high. Mountain C is 2,500 meters high. Which mountain is the highest?',

    instruction:
      'Read the text and choose the correct answer.',

    options: [
      {
        id: 'A',
        text: 'Mountain A',
      },
      {
        id: 'B',
        text: 'Mountain B',
      },
      {
        id: 'C',
        text: 'Mountain C',
      },
      {
        id: 'D',
        text: 'They are the same',
      },
    ],

    correctAnswer: ['B'],

    explanation:
      'Correct! Mountain B is the highest because it is 3,000 meters high, taller than Mountain A and Mountain C.',

    image: null,

    multipleAnswer: false,
  },
];

const questionIds = questions.map(
  (question) => question.id,
);

export default function ReadingScreen() {
  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState<string[]>([]);

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const [completedQuestions, setCompletedQuestions] =
    useState<string[]>([]);

  const [feedbackVisible, setFeedbackVisible] =
    useState(false);

  const [lastAnswerCorrect, setLastAnswerCorrect] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const currentQuestion =
    questions[questionIndex];

  const earnedStars = hitungBintang(
    { completedQuestions },
    questionIds,
  );

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        setErrorMessage(null);

        const progress = await ambilProgress(
          LEVEL,
          SKILL,
        );

        if (active) {
          setCompletedQuestions(
            progress.completedQuestions,
          );
        }
      } catch (error) {
        console.error(
          'Failed to load Reading progress:',
          error,
        );

        if (active) {
          setErrorMessage(
            'Could not load your progress. Please check your sign-in and connection.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, []);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Ganti '/' jika halaman tujuanmu bukan halaman utama.
      router.replace('/');
    }
  }

  function handleSelectAnswer(
    answerId: string,
  ) {
    if (isSubmitted || saving) {
      return;
    }

    if (currentQuestion.multipleAnswer) {
      setSelectedAnswers((previous) => {
        if (previous.includes(answerId)) {
          return previous.filter(
            (answer) => answer !== answerId,
          );
        }

        return [...previous, answerId];
      });

      return;
    }

    setSelectedAnswers([answerId]);
  }

  function checkAnswer(): boolean {
    const selected = [...selectedAnswers].sort();

    const correct = [
      ...currentQuestion.correctAnswer,
    ].sort();

    if (selected.length !== correct.length) {
      return false;
    }

    return selected.every(
      (answer, index) =>
        answer === correct[index],
    );
  }

  async function handleSubmit() {
    if (
      selectedAnswers.length === 0 ||
      isSubmitted ||
      saving
    ) {
      return;
    }

    const isCorrect = checkAnswer();

    setIsSubmitted(true);
    setLastAnswerCorrect(isCorrect);
    setFeedbackVisible(true);

    // Jawaban salah:
    // tidak menyimpan progress dan tidak mendapatkan bintang.
    if (!isCorrect) {
      return;
    }

    // Jika soal sudah pernah dijawab benar,
    // jangan simpan ulang.
    if (
      completedQuestions.includes(
        currentQuestion.id,
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      await tandaiSoalSelesai(
        LEVEL,
        SKILL,
        currentQuestion.id,
      );

      setCompletedQuestions((previous) =>
        previous.includes(currentQuestion.id)
          ? previous
          : [
              ...previous,
              currentQuestion.id,
            ],
      );
    } catch (error) {
      console.error(
        'Failed to save Reading progress:',
        error,
      );

      setErrorMessage(
        'Your answer is correct, but progress could not be saved. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleNextQuestion() {
    setFeedbackVisible(false);

    if (
      questionIndex <
      questions.length - 1
    ) {
      setQuestionIndex(
        (previous) => previous + 1,
      );

      setSelectedAnswers([]);
      setIsSubmitted(false);
      setLastAnswerCorrect(false);

      return;
    }

    handleBack();
  }

  function getOptionStyle(
    optionId: string,
  ) {
    const selected =
      selectedAnswers.includes(optionId);

    if (!isSubmitted) {
      return selected
        ? styles.optionSelected
        : styles.optionDefault;
    }

    const correct =
      currentQuestion.correctAnswer.includes(
        optionId,
      );

    if (correct) {
      return styles.optionCorrect;
    }

    if (selected && !correct) {
      return styles.optionWrong;
    }

    return styles.optionDefault;
  }

  function getOptionTextStyle(
    optionId: string,
  ) {
    const selected =
      selectedAnswers.includes(optionId);

    if (!isSubmitted) {
      return selected
        ? styles.optionTextSelected
        : styles.optionTextDefault;
    }

    const correct =
      currentQuestion.correctAnswer.includes(
        optionId,
      );

    if (correct) {
      return styles.optionTextCorrect;
    }

    if (selected && !correct) {
      return styles.optionTextWrong;
    }

    return styles.optionTextDefault;
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading your progress...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/lessons/positive-degree-background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <SkillHeader
          title="Reading - Level 3"
          onBack={handleBack}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={styles.progressContainer}
          >
            <Text
              style={styles.progressText}
            >
              Question {questionIndex + 1} of{' '}
              {questions.length}
            </Text>

            <StarProgress
              totalStars={questions.length}
              earnedStars={earnedStars}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <View style={styles.content}>
            <QuestionCard
              question={
                currentQuestion as any
              }
              questionNumber={
                questionIndex + 1
              }
              totalQuestions={
                questions.length
              }
            />

            {currentQuestion.readingText ? (
              <View
                style={styles.readingBox}
              >
                <View
                  style={
                    styles.readingHeader
                  }
                >
                  <Text
                    style={
                      styles.readingLabel
                    }
                  >
                    Read
                  </Text>
                </View>

                <Text
                  style={
                    styles.readingText
                  }
                >
                </Text>
              </View>
            ) : null}

            <View
              style={styles.optionsContainer}
            >
              <Text
                style={
                  styles.instructionText
                }
              >
                {currentQuestion.multipleAnswer
                  ? 'Choose all correct answers.'
                  : 'Choose the correct answer.'}
              </Text>

              {currentQuestion.options.map(
                (option) => {
                  const selected =
                    selectedAnswers.includes(
                      option.id,
                    );

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() =>
                        handleSelectAnswer(
                          option.id,
                        )
                      }
                      disabled={
                        isSubmitted ||
                        saving
                      }
                      style={[
                        styles.option,
                        getOptionStyle(
                          option.id,
                        ),
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIndicator,
                          selected &&
                            !isSubmitted &&
                            styles.optionIndicatorSelected,
                          isSubmitted &&
                            currentQuestion.correctAnswer.includes(
                              option.id,
                            ) &&
                            styles.optionIndicatorCorrect,
                          isSubmitted &&
                            selected &&
                            !currentQuestion.correctAnswer.includes(
                              option.id,
                            ) &&
                            styles.optionIndicatorWrong,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionLetter,
                            selected &&
                              !isSubmitted &&
                              styles.optionLetterSelected,
                            isSubmitted &&
                              currentQuestion.correctAnswer.includes(
                                option.id,
                              ) &&
                              styles.optionLetterCorrect,
                            isSubmitted &&
                              selected &&
                              !currentQuestion.correctAnswer.includes(
                                option.id,
                              ) &&
                              styles.optionLetterWrong,
                          ]}
                        >
                          {option.id}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          getOptionTextStyle(
                            option.id,
                          ),
                        ]}
                      >
                        {option.text}
                      </Text>

                      {isSubmitted &&
                      currentQuestion.correctAnswer.includes(
                        option.id,
                      ) ? (
                        <Text
                          style={
                            styles.correctMark
                          }
                        >
                          ✓
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                },
              )}
            </View>

            {saving ? (
              <View
                style={styles.savingRow}
              >
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

                <Text
                  style={styles.savingText}
                >
                  Saving progress...
                </Text>
              </View>
            ) : null}

            {!isSubmitted ? (
              <Pressable
                onPress={handleSubmit}
                disabled={
                  selectedAnswers.length ===
                    0 || saving
                }
                style={[
                  styles.actionButton,
                  (selectedAnswers.length ===
                    0 ||
                    saving) &&
                    styles.disabledButton,
                ]}
              >
                <Text
                  style={
                    styles.actionButtonText
                  }
                >
                  Check Answer
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNextQuestion}
                style={styles.actionButton}
              >
                <Text
                  style={
                    styles.actionButtonText
                  }
                >
                  {questionIndex ===
                  questions.length - 1
                    ? 'Finish Reading'
                    : 'Next Question'}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        <FeedbackSheet
          visible={feedbackVisible}
          isCorrect={lastAnswerCorrect}
          message={
            lastAnswerCorrect
              ? currentQuestion.explanation ??
                'Nice work practicing! Correct!'
              : 'Not quite. Read the question again and try your answer.'
          }
          onClose={() =>
            setFeedbackVisible(false)
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    backgroundColor:
      'rgba(240, 249, 255, 0.18)',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 18,
    paddingBottom: 44,
    gap: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    marginTop: 12,
    color: '#475569',
  },

  progressContainer: {
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 4,
    gap: 12,
  },

  progressText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },

  content: {
    gap: 20,
    paddingTop: 0,
  },

  errorBox: {
    padding: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
  },

  errorText: {
    color: '#991B1B',
    fontSize: 13,
  },

  imageContainer: {
    width: '100%',
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },

  questionImage: {
    width: '100%',
    height: '100%',
  },

  readingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },

  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  readingLabel: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },

  readingText: {
    color: '#334155',
    fontSize: 17,
    lineHeight: 27,
    fontWeight: '600',
  },

  optionsContainer: {
    gap: 12,
  },

  instructionText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },

  optionDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },

  optionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#60A5FA',
  },

  optionCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },

  optionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },

  optionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },

  optionIndicatorSelected: {
    backgroundColor: '#2563EB',
  },

  optionIndicatorCorrect: {
    backgroundColor: '#16A34A',
  },

  optionIndicatorWrong: {
    backgroundColor: '#DC2626',
  },

  optionLetter: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '800',
  },

  optionLetterSelected: {
    color: '#FFFFFF',
  },

  optionLetterCorrect: {
    color: '#FFFFFF',
  },

  optionLetterWrong: {
    color: '#FFFFFF',
  },

  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
  },

  optionTextDefault: {
    color: '#334155',
  },

  optionTextSelected: {
    color: '#1D4ED8',
  },

  optionTextCorrect: {
    color: '#15803D',
  },

  optionTextWrong: {
    color: '#B91C1C',
  },

  correctMark: {
    color: '#16A34A',
    fontSize: 22,
    fontWeight: '800',
  },

  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },

  savingText: {
    color: '#475569',
    fontSize: 13,
  },

  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 24,
    backgroundColor: '#2563EB',
    borderRadius: 18,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#1D4ED8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  disabledButton: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0,
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
