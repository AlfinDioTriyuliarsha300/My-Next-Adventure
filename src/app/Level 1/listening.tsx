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

import AnswerOptions from '../../components/learning/AnswerOptions';
import FeedbackSheet from '../../components/learning/FeedbackSheet';
import QuestionCard from '../../components/learning/QuestionCard';
import StarProgress from '../../components/learning/StarProgress';
import { listeningLevel1 } from '../../data/levels/level-1';

import {
  ambilProgress,
  hitungBintang,
  tandaiSoalSelesai,
} from '../../services/auth/learningProgress';
import SkillHeader from '@/components/learning/SkillHeader';

const LEVEL = 1;
const questions = listeningLevel1.questions;

export default function ListeningScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuestion = questions[questionIndex];

  const earnedStars = hitungBintang(
    { completedQuestions },
    questions.map((question) => question.id),
  );

  // Memuat progres belajar ketika halaman dibuka.
  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        setErrorMessage(null);

        const progress = await ambilProgress(LEVEL, 'listening');

        if (active) {
          setCompletedQuestions(progress.completedQuestions);
        }
      } catch (error) {
        console.error('Failed to load Listening progress:', error);

        if (active) {
          setErrorMessage(
            'Could not load your progress. Please check your sign-in and connection.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, []);

  // Memeriksa jawaban dan menyimpan progres jika benar.
  async function handleSubmit() {
    if (!selectedAnswer || isSubmitted || saving) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setIsSubmitted(true);
    setLastAnswerCorrect(isCorrect);
    setFeedbackVisible(true);

    if (!isCorrect || completedQuestions.includes(currentQuestion.id)) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      await tandaiSoalSelesai(
        LEVEL,
        'listening',
        currentQuestion.id,
      );

      setCompletedQuestions((previous) =>
        previous.includes(currentQuestion.id)
          ? previous
          : [...previous, currentQuestion.id],
      );
    } catch (error) {
      console.error('Failed to save Listening progress:', error);

      setErrorMessage(
        'Your answer is correct, but progress could not be saved. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  // Kembali dengan aman tanpa memanggil router.back() jika tidak tersedia.
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/levels');
    }
  }

  // Berpindah ke soal berikutnya atau menyelesaikan latihan.
  function handleNextQuestion() {
    setFeedbackVisible(false);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((previous) => previous + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      handleBack();
    }
  }

  // Menampilkan indikator ketika progres sedang dimuat.
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
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
          title="Listening"
          onBack={handleBack}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {questionIndex + 1} of {questions.length}
            </Text>

            <StarProgress
              totalStars={questions.length}
              earnedStars={earnedStars}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.content}>
            <QuestionCard
              question={currentQuestion}
              questionNumber={questionIndex + 1}
              totalQuestions={questions.length}
            />

            <AnswerOptions
              options={currentQuestion.options}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQuestion.correctAnswer}
              isSubmitted={isSubmitted}
              onSelect={setSelectedAnswer}
            />

            {saving ? (
              <View style={styles.savingRow}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.savingText}>
                  Saving progress...
                </Text>
              </View>
            ) : null}

            {!isSubmitted ? (
              <Pressable
                onPress={handleSubmit}
                disabled={!selectedAnswer || saving}
                style={[
                  styles.actionButton,
                  (!selectedAnswer || saving) && styles.disabledButton,
                ]}
              >
                <Text style={styles.actionButtonText}>
                  Check Answer
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNextQuestion}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>
                  {questionIndex === questions.length - 1
                    ? 'Finish Listening'
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
              ? currentQuestion.explanation ?? 'Great job!'
              : 'Not quite. Listen again and try to remember the details.'
          }
          onClose={() => setFeedbackVisible(false)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

// Styling halaman Listening Level 1.
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(240, 249, 255, 0.18)',
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
    shadowOffset: { width: 0, height: 4 },
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
