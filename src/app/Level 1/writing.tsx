import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const LEVEL = 1;
const SKILL = 'writing';

type WritingQuestion = {
  id: string;
  type: 'type' | 'arrange' | 'rewrite';
  difficulty: string;
  prompt: string;
  instruction: string;
  correctAnswer: string;
  words?: string[];
};

const questions: WritingQuestion[] = [
  {
    id: '10',
    type: 'type',
    difficulty: 'Easy',
    prompt: 'Type the answer and complete the sentence:',
    instruction:
      'She speaks English ___ a native speaker. (fluently)',
    correctAnswer: 'fluently',
  },

  {
    id: '11',
    type: 'arrange',
    difficulty: 'Medium',
    prompt: 'Arrange the words into a correct sentence:',
    instruction:
      'Indonesian - is - English - as - as - easy',
    words: [
      'Indonesian',
      'is',
      'English',
      'as',
      'as',
      'easy',
    ],
    correctAnswer:
      'English is as easy as Indonesian.',
  },

  {
    id: '12',
    type: 'rewrite',
    difficulty: 'Medium',
    prompt: 'Rewrite the sentence correctly.',
    instruction:
      'This textbook is as thick than that novel.',
    correctAnswer:
      'This textbook is as thick as that novel.',
  },
];

function normalizeText(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.!?,]+$/g, '')
    .replace(/\s+/g, ' ');
}

export default function WritingLevel1Screen() {
  const router = useRouter();

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [textAnswer, setTextAnswer] =
    useState('');

  const [selectedWords, setSelectedWords] =
    useState<
      { word: string; index: number }[]
    >([]);

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const [lastAnswerCorrect, setLastAnswerCorrect] =
    useState(false);

  const [feedbackVisible, setFeedbackVisible] =
    useState(false);

  const [completedQuestions, setCompletedQuestions] =
    useState<string[]>([]);

  const [saving, setSaving] =
    useState(false);

  const currentQuestion =
    questions[questionIndex];

  const earnedStars = useMemo(() => {
    return hitungBintang(
      { completedQuestions },
      questions.map((question) => question.id),
    );
  }, [completedQuestions]);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
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
          'Gagal mengambil progress Writing:',
          error,
        );
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, []);

  function resetCurrentAnswer() {
    setTextAnswer('');
    setSelectedWords([]);
    setIsSubmitted(false);
    setLastAnswerCorrect(false);
    setFeedbackVisible(false);
  }

  function handleSelectWord(index: number) {
    if (isSubmitted || saving) {
      return;
    }

    const words = currentQuestion.words;

    if (!words) {
      return;
    }

    const alreadySelected =
      selectedWords.some(
        (item) => item.index === index,
      );

    if (alreadySelected) {
      return;
    }

    setSelectedWords((previous) => [
      ...previous,
      {
        word: words[index],
        index,
      },
    ]);
  }

  function handleRemoveWord(index: number) {
    if (isSubmitted || saving) {
      return;
    }

    setSelectedWords((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  }

  function getCurrentAnswer() {
    if (currentQuestion.type === 'arrange') {
      return selectedWords
        .map((item) => item.word)
        .join(' ');
    }

    return textAnswer;
  }

  async function checkAnswer() {
    if (saving || isSubmitted) {
      return;
    }

    const userAnswer =
      getCurrentAnswer();

    if (!userAnswer.trim()) {
      Alert.alert(
        'Answer Required',
        'Please write or arrange your answer first.',
      );
      return;
    }

    const correct =
      normalizeText(userAnswer) ===
      normalizeText(
        currentQuestion.correctAnswer,
      );

    setLastAnswerCorrect(correct);
    setIsSubmitted(true);
    setFeedbackVisible(true);

    // Jika jawaban salah:
    // tidak mendapatkan bintang
    // dan tidak disimpan sebagai progress selesai.
    if (!correct) {
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

    setSaving(true);

    try {
      await tandaiSoalSelesai(
        LEVEL,
        SKILL,
        currentQuestion.id,
      );

      setCompletedQuestions((previous) => {
        if (
          previous.includes(
            currentQuestion.id,
          )
        ) {
          return previous;
        }

        return [
          ...previous,
          currentQuestion.id,
        ];
      });
    } catch (error) {
      console.error(
        'Gagal menyimpan progress Writing:',
        error,
      );
    } finally {
      setSaving(false);
    }
  }

  function handleNextQuestion() {
    setFeedbackVisible(false);

    if (
      questionIndex ===
      questions.length - 1
    ) {
      router.back();
      return;
    }

    setQuestionIndex(
      (previous) => previous + 1,
    );

    resetCurrentAnswer();
  }

  const canSubmit =
    currentQuestion.type === 'arrange'
      ? selectedWords.length > 0
      : textAnswer.trim().length > 0;

  return (
    <ImageBackground
      source={require('../../../assets/images/lessons/positive-degree-background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <SkillHeader
          title="Writing"
          onBack={() => router.back()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress */}
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

          <View style={styles.content}>
            {/* Question */}
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

            {/* TYPE ANSWER */}
            {currentQuestion.type ===
              'type' && (
              <View
                style={styles.answerSection}
              >
                <Text
                  style={styles.answerLabel}
                >
                  Your answer
                </Text>

                <TextInput
                  value={textAnswer}
                  onChangeText={
                    setTextAnswer
                  }
                  editable={
                    !isSubmitted &&
                    !saving
                  }
                  placeholder="Type your answer..."
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.textInput,
                    isSubmitted &&
                      styles.disabledInput,
                  ]}
                />
              </View>
            )}

            {/* ARRANGE WORDS */}
            {currentQuestion.type ===
              'arrange' &&
              currentQuestion.words && (
                <View
                  style={
                    styles.answerSection
                  }
                >
                  <Text
                    style={
                      styles.answerLabel
                    }
                  >
                    Your sentence
                  </Text>

                  <View
                    style={
                      styles.selectedWordsContainer
                    }
                  >
                    {selectedWords.length ===
                    0 ? (
                      <Text
                        style={
                          styles.emptyAnswerText
                        }
                      >
                        Tap the words below to
                        build your sentence.
                      </Text>
                    ) : (
                      selectedWords.map(
                        (
                          item,
                          index,
                        ) => (
                          <Pressable
                            key={`${item.word}-${item.index}`}
                            onPress={() =>
                              handleRemoveWord(
                                index,
                              )
                            }
                            disabled={
                              isSubmitted ||
                              saving
                            }
                            style={
                              styles.selectedWord
                            }
                          >
                            <Text
                              style={
                                styles.selectedWordText
                              }
                            >
                              {item.word}
                            </Text>
                          </Pressable>
                        ),
                      )
                    )}
                  </View>

                  <Text
                    style={styles.answerLabel}
                  >
                    Choose the words
                  </Text>

                  <View
                    style={styles.wordBank}
                  >
                    {currentQuestion.words.map(
                      (
                        word,
                        index,
                      ) => {
                        const isUsed =
                          selectedWords.some(
                            (item) =>
                              item.index ===
                              index,
                          );

                        return (
                          <Pressable
                            key={`${word}-${index}`}
                            onPress={() =>
                              handleSelectWord(
                                index,
                              )
                            }
                            disabled={
                              isUsed ||
                              isSubmitted ||
                              saving
                            }
                            style={[
                              styles.wordButton,
                              isUsed &&
                                styles.usedWordButton,
                            ]}
                          >
                            <Text
                              style={[
                                styles.wordButtonText,
                                isUsed &&
                                  styles.usedWordButtonText,
                              ]}
                            >
                              {word}
                            </Text>
                          </Pressable>
                        );
                      },
                    )}
                  </View>

                  <Text
                    style={
                      styles.arrangeHint
                    }
                  >
                    Tap a word in your
                    sentence to remove it.
                  </Text>
                </View>
              )}

            {/* REWRITE */}
            {currentQuestion.type ===
              'rewrite' && (
              <View
                style={styles.answerSection}
              >
                <Text
                  style={styles.answerLabel}
                >
                  Rewrite the sentence
                </Text>

                <TextInput
                  value={textAnswer}
                  onChangeText={
                    setTextAnswer
                  }
                  editable={
                    !isSubmitted &&
                    !saving
                  }
                  placeholder="Write the correct sentence..."
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.textInput,
                    styles.rewriteInput,
                    isSubmitted &&
                      styles.disabledInput,
                  ]}
                />
              </View>
            )}

            {/* Saving */}
            {saving && (
              <View
                style={
                  styles.savingContainer
                }
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={18}
                  color="#64748B"
                />

                <Text
                  style={styles.savingText}
                >
                  Saving your progress...
                </Text>
              </View>
            )}

            {/* ACTION BUTTON */}
            {!isSubmitted ? (
              <Pressable
                onPress={checkAnswer}
                disabled={
                  !canSubmit || saving
                }
                style={[
                  styles.actionButton,
                  (!canSubmit ||
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

                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            ) : (
              <Pressable
                onPress={
                  handleNextQuestion
                }
                style={
                  styles.actionButton
                }
              >
                <Text
                  style={
                    styles.actionButtonText
                  }
                >
                  {questionIndex ===
                  questions.length - 1
                    ? 'Finish Writing'
                    : 'Next Question'}
                </Text>

                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            )}
          </View>
        </ScrollView>

        {/* FEEDBACK */}
        <FeedbackSheet
          visible={feedbackVisible}
          isCorrect={
            lastAnswerCorrect
          }
          message={
            lastAnswerCorrect
              ? 'Nice work practicing! Correct!'
              : 'Not quite. Check your answer and continue to the next question.'
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
      'rgba(240,249,255,0.18)',
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

  answerSection: {
    gap: 12,
  },

  answerLabel: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '800',
  },

  textInput: {
    minHeight: 58,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 18,
    backgroundColor:
      'rgba(255,255,255,0.96)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },

  rewriteInput: {
    minHeight: 120,
    paddingTop: 16,
  },

  disabledInput: {
    opacity: 0.7,
  },

  selectedWordsContainer: {
    minHeight: 82,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 18,
    backgroundColor:
      'rgba(255,255,255,0.96)',
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },

  emptyAnswerText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },

  selectedWord: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  selectedWordText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  wordButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  wordButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },

  usedWordButton: {
    backgroundColor: '#E2E8F0',
    borderColor: '#E2E8F0',
  },

  usedWordButtonText: {
    color: '#94A3B8',
  },

  arrangeHint: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },

  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  savingText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  actionButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 17,
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.45,
  },
});