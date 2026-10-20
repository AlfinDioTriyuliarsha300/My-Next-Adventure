import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import StarProgress from '../../components/learning/StarProgress';
import SkillHeader from '../../components/learning/SkillHeader';

import {
  ambilProgress,
  hitungBintang,
  tandaiSoalSelesai,
} from '../../services/auth/learningProgress';

const LEVEL = 2;
const SKILL = 'speaking';


const questions = [
  {
    id: '16',
    type: 'Speaking',
    difficulty: 'Easy',
    question:'Say the sentence out loud',
    prompt:'',
    instruction: '',
    sentence: 'Bill runs faster than Bob.',
    correctAnswer: 'Bill runs faster than Bob.',
    explanation:
      'Great! You correctly used the comparative form "faster than" to compare Bill and Bob.',
    options: [],
    image: null,
  },
  {
    id: '17',
    type: 'Speaking',
    difficulty: 'Medium',
    question:'Say the sentence out loud: My score is better than his.',
    prompt:'',
    instruction: '',
    sentence: 'My score is better than his.',
    correctAnswer: 'My score is better than his.',
    explanation:
      'Excellent! You correctly used "better than" to compare two scores.',
    options: [],
    image: null,
  },
  {
    id: '18',
    type: 'Speaking',
    difficulty: 'Hard',
    question:'Say the long sentence out loud',
    prompt:'',
    instruction: '',
    sentence:'Satay is more delicious than burger, and a train is faster than a bus.',
    correctAnswer:
      'Satay is more delicious than burger, and a train is faster than a bus.',
    explanation:
      'Excellent! You successfully practiced a long sentence using "more delicious than" and "faster than" to make comparisons.',
    options: [],
    image: null,
  },
];


const TOTAL_QUESTIONS = questions.length;

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function SpeakingScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);

  const [transcript, setTranscript] = useState('');

  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    null,
  );

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [checking, setChecking] = useState(false);

  const [feedbackVisible, setFeedbackVisible] =
    useState(false);

  const [completedQuestions, setCompletedQuestions] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const currentQuestion = questions[questionIndex];

  // =====================================================
  // HITUNG BINTANG DARI PROGRESS SUPABASE
  // =====================================================

  const earnedStars = useMemo(() => {
    return hitungBintang(
      { completedQuestions },
      questions.map((question) => question.id),
    );
  }, [completedQuestions]);

  // =====================================================
  // LOAD PROGRESS SPEAKING
  // =====================================================

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
          'Failed to load Speaking progress:',
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

  // =====================================================
  // SPEECH RECOGNITION
  // =====================================================

  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
    setTranscript('');
    setIsCorrect(null);
    setIsSubmitted(false);
    setChecking(false);
    setFeedbackVisible(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);

    /*
     * Jangan langsung memeriksa jawaban di sini.
     * Transcript ditampilkan terlebih dahulu sehingga
     * siswa dapat menekan Check Answer seperti Listening.
     */
  });

  useSpeechRecognitionEvent('result', (event) => {
    const result =
      event.results?.[0]?.transcript ?? '';

    if (result) {
      setTranscript(result);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsRecording(false);
    setChecking(false);

    console.log(
      'Speech recognition error:',
      event.error,
      event.message,
    );

    if (event.error === 'not-allowed') {
      Alert.alert(
        'Microphone Permission',
        'Please allow microphone and speech recognition permission to use Speaking.',
      );
      return;
    }

    if (event.error === 'no-speech') {
      Alert.alert(
        'No Speech Detected',
        'We could not hear your answer. Please try again.',
      );
      return;
    }

    Alert.alert(
      'Speaking Error',
      'We could not recognize your voice. Please try again.',
    );
  });

  // =====================================================
  // MULAI / STOP REKAMAN
  // =====================================================

  async function mulaiRekam() {
    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    if (isSubmitted || checking) {
      return;
    }

    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Microphone and speech recognition permission are required for this activity.',
        );

        return;
      }

      setTranscript('');
      setIsCorrect(null);
      setIsSubmitted(false);
      setChecking(false);
      setFeedbackVisible(false);

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });
    } catch (error) {
      console.error(
        'Failed to start speech recognition:',
        error,
      );

      setIsRecording(false);

      Alert.alert(
        'Speaking Error',
        'Unable to start the microphone. Please try again.',
      );
    }
  }

  // =====================================================
  // PERIKSA JAWABAN
  // =====================================================

  async function periksaJawaban(
    spokenText: string,
  ) {
    if (
      !spokenText.trim() ||
      checking ||
      isSubmitted
    ) {
      return;
    }

    setChecking(true);
    setErrorMessage(null);

    const spoken = normalizeText(spokenText);

    const expected = normalizeText(
      currentQuestion.correctAnswer,
    );

    const correct = spoken === expected;

    setIsCorrect(correct);
    setIsSubmitted(true);

    // ===================================================
    // JAWABAN SALAH
    // Tidak mendapatkan bintang.
    // Feedback tetap ditampilkan.
    // ===================================================

    if (!correct) {
      setChecking(false);
      setFeedbackVisible(true);
      return;
    }

    // ===================================================
    // JAWABAN BENAR
    // Simpan progress jika belum pernah selesai.
    // ===================================================

    if (
      completedQuestions.includes(
        currentQuestion.id,
      )
    ) {
      setChecking(false);
      setFeedbackVisible(true);
      return;
    }

    try {
      setSaving(true);

      await tandaiSoalSelesai(
        LEVEL,
        SKILL,
        currentQuestion.id,
      );

      setCompletedQuestions((previous) =>
        previous.includes(currentQuestion.id)
          ? previous
          : [...previous, currentQuestion.id],
      );
    } catch (error) {
      console.error(
        'Failed to save Speaking progress:',
        error,
      );

      setErrorMessage(
        'Your answer is correct, but progress could not be saved. Please try again.',
      );
    } finally {
      setSaving(false);
      setChecking(false);
      setFeedbackVisible(true);
    }
  }

  // =====================================================
  // TOMBOL CHECK ANSWER
  // =====================================================

  function handleCheckAnswer() {
    if (
      !transcript.trim() ||
      checking ||
      isSubmitted
    ) {
      return;
    }

    periksaJawaban(transcript);
  }

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  function handleNextQuestion() {
    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
    }

    setFeedbackVisible(false);

    if (questionIndex < TOTAL_QUESTIONS - 1) {
      setQuestionIndex(
        (previous) => previous + 1,
      );

      setTranscript('');
      setIsCorrect(null);
      setIsSubmitted(false);
      setChecking(false);

      return;
    }

    router.back();
  }

  // =====================================================
  // RETRY
  // =====================================================

  function handleRetry() {
    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
    }

    setFeedbackVisible(false);
    setTranscript('');
    setIsCorrect(null);
    setIsSubmitted(false);
    setChecking(false);
  }

  // =====================================================
  // LOADING
  // =====================================================

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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ImageBackground
      source={require('../../../assets/images/lessons/positive-degree-background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <SkillHeader
          title="Speaking"
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
          {/* PROGRESS */}

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {questionIndex + 1} of{' '}
              {TOTAL_QUESTIONS}
            </Text>

            <StarProgress
              totalStars={TOTAL_QUESTIONS}
              earnedStars={earnedStars}
            />
          </View>

          {/* ERROR */}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <View style={styles.content}>
            {/* QUESTION */}

            <QuestionCard
              question={currentQuestion as any}
              questionNumber={questionIndex + 1}
              totalQuestions={TOTAL_QUESTIONS}
            />

            {/* SPEAKING */}

            <View style={styles.speakingCard}>
              <View
                style={styles.speakingCardHeader}
              >
                <View style={styles.speakingIcon}>
                  <Ionicons
                    name="mic"
                    size={22}
                    color="#2563EB"
                  />
                </View>

                <View
                  style={styles.speakingHeaderText}
                >
                  <Text
                    style={styles.speakingTitle}
                  >
                    Say the sentence
                  </Text>

                  <Text
                    style={styles.speakingSubtitle}
                  >
                    Speak clearly and confidently.
                  </Text>
                </View>
              </View>

              <View style={styles.sentenceBox}>
                <Text
                  style={styles.sentenceText}
                >
                  {currentQuestion.sentence}
                </Text>
              </View>

              <View
                style={styles.microphoneSection}
              >
                <Pressable
                  onPress={mulaiRekam}
                  disabled={
                    checking || isSubmitted
                  }
                  style={({ pressed }) => [
                    styles.microphoneButton,

                    isRecording &&
                      styles.microphoneButtonRecording,

                    pressed &&
                      styles.microphoneButtonPressed,

                    (checking ||
                      isSubmitted) &&
                      styles.microphoneButtonDisabled,
                  ]}
                >
                  <Ionicons
                    name={
                      isRecording
                        ? 'stop'
                        : 'mic'
                    }
                    size={38}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Text
                  style={
                    styles.microphoneButtonText
                  }
                >
                  {isRecording
                    ? 'Tap to stop'
                    : 'Tap to speak'}
                </Text>

                <Text
                  style={
                    styles.microphoneDescription
                  }
                >
                  {isRecording
                    ? 'Listening... Say the sentence clearly.'
                    : 'Press the microphone and say the sentence out loud.'}
                </Text>
              </View>
            </View>

            {/* TRANSCRIPT */}

            {transcript ? (
              <View style={styles.transcriptBox}>
                <View
                  style={styles.transcriptHeader}
                >
                  <Ionicons
                    name="chatbubble"
                    size={18}
                    color="#2563EB"
                  />

                  <Text
                    style={styles.transcriptLabel}
                  >
                    Your answer
                  </Text>
                </View>

                <Text
                  style={styles.transcriptText}
                >
                  "{transcript}"
                </Text>
              </View>
            ) : null}

            {/* CHECKING */}

            {checking || saving ? (
              <View style={styles.savingRow}>
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

                <Text
                  style={styles.savingText}
                >
                  {saving
                    ? 'Saving progress...'
                    : 'Checking your answer...'}
                </Text>
              </View>
            ) : null}

            {/* ACTION BUTTON */}

            {!isSubmitted ? (
              <Pressable
                onPress={handleCheckAnswer}
                disabled={
                  !transcript.trim() ||
                  checking ||
                  saving
                }
                style={[
                  styles.actionButton,

                  (!transcript.trim() ||
                    checking ||
                    saving) &&
                    styles.disabledButton,
                ]}
              >
                <Text
                  style={styles.actionButtonText}
                >
                  Check Answer
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNextQuestion}
                disabled={saving}
                style={[
                  styles.actionButton,
                  saving &&
                    styles.disabledButton,
                ]}
              >
                <Text
                  style={styles.actionButtonText}
                >
                  {questionIndex ===
                  TOTAL_QUESTIONS - 1
                    ? 'Finish Speaking'
                    : 'Next Question'}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        {/* FEEDBACK */}

        <FeedbackSheet
          visible={feedbackVisible}
          isCorrect={isCorrect === true}
          message={
            isCorrect === true
              ? currentQuestion.explanation ??
                'Nice work practicing! Correct!'
              : 'Not quite. Listen to the sentence and try speaking it again.'
          }
          onClose={() =>
            setFeedbackVisible(false)
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

// =====================================================
// STYLE
// =====================================================

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

  speakingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 18,
  },

  speakingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  speakingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },

  speakingHeaderText: {
    flex: 1,
  },

  speakingTitle: {
    color: '#334155',
    fontSize: 17,
    fontWeight: '800',
  },

  speakingSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 3,
  },

  sentenceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  sentenceText: {
    color: '#334155',
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    textAlign: 'center',
  },

  microphoneSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  microphoneButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    elevation: 4,
    shadowColor: '#1D4ED8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  microphoneButtonRecording: {
    backgroundColor: '#DC2626',
  },

  microphoneButtonDisabled: {
    opacity: 0.55,
  },

  microphoneButtonPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.88,
  },

  microphoneButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 9,
  },

  microphoneDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },

  transcriptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },

  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  transcriptLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
  },

  transcriptText: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
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