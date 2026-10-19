import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { ReflectionMood } from '../../services/auth/levelReflection';

// =====================================================
// TYPE
// =====================================================

export type ReflectionFormData = {
  mood: ReflectionMood;
  hardestPart: string;
  proudOf: string;
  importantLearning: string;
  lessonNote: string;
};

type ReflectionModalProps = {
  visible: boolean;
  onSubmit: (data: ReflectionFormData) => void | Promise<void>;
};

// =====================================================
// KOMPONEN
// =====================================================

export default function ReflectionModal({
  visible,
  onSubmit,
}: ReflectionModalProps) {
  const [mood, setMood] = useState<ReflectionMood | null>(null);
  const [hardestPart, setHardestPart] = useState('');
  const [proudOf, setProudOf] = useState('');
  const [importantLearning, setImportantLearning] =
    useState('');
  const [lessonNote, setLessonNote] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // RESET FORM SAAT MODAL DIBUKA
  // =====================================================

  useEffect(() => {
    if (!visible) return;

    setMood(null);
    setHardestPart('');
    setProudOf('');
    setImportantLearning('');
    setLessonNote('');
    setSubmitting(false);
  }, [visible]);

  // =====================================================
  // VALIDASI
  // =====================================================

  const isFormValid =
    mood !== null &&
    hardestPart.trim().length > 0 &&
    proudOf.trim().length > 0 &&
    importantLearning.trim().length > 0 &&
    lessonNote.trim().length > 0;

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit() {
    if (!isFormValid || !mood || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        mood,
        hardestPart: hardestPart.trim(),
        proudOf: proudOf.trim(),
        importantLearning: importantLearning.trim(),
        lessonNote: lessonNote.trim(),
      });
    } catch (error) {
      console.error(
        'Gagal mengirim reflection:',
        error,
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <View style={styles.reflectionLabel}>
              <Text style={styles.reflectionLabelText}>
                REFLEKSI SISWA
              </Text>
            </View>

            <Text style={styles.title}>
              My Reflection
            </Text>

            <Text style={styles.subtitle}>
              Think about your learning journey today!
            </Text>

            {/* =================================================
                QUESTION 1
            ================================================= */}

            <View style={styles.questionCard}>
              <Text style={styles.questionTitle}>
                1. How did you feel during this lesson?
              </Text>

              <View style={styles.moodGrid}>
                <MoodButton
                  emoji="😊"
                  label="Great!"
                  selected={mood === 'great'}
                  onPress={() => setMood('great')}
                />

                <MoodButton
                  emoji="🙂"
                  label="Okay"
                  selected={mood === 'okay'}
                  onPress={() => setMood('okay')}
                />

                <MoodButton
                  emoji="😟"
                  label="Difficult"
                  selected={mood === 'difficult'}
                  onPress={() =>
                    setMood('difficult')
                  }
                />
              </View>
            </View>

            {/* =================================================
                QUESTION 2
            ================================================= */}

            <ReflectionQuestion
              number="2."
              question="What was the hardest part for you?"
              value={hardestPart}
              onChangeText={setHardestPart}
              placeholder="Type your answer..."
            />

            {/* =================================================
                QUESTION 3
            ================================================= */}

            <ReflectionQuestion
              number="3."
              question="What are you proud of today?"
              value={proudOf}
              onChangeText={setProudOf}
              placeholder="Type your answer..."
            />

            {/* =================================================
                QUESTION 4
            ================================================= */}

            <ReflectionQuestion
              number="4."
              question="What is one important thing you learned?"
              value={importantLearning}
              onChangeText={setImportantLearning}
              placeholder="Type your answer..."
            />

            {/* =================================================
                QUESTION 5
            ================================================= */}

            <ReflectionQuestion
              number="5."
              question="Write one word or sentence about today's lesson!"
              value={lessonNote}
              onChangeText={setLessonNote}
              placeholder="Type your answer..."
              multiline
            />

            {/* =================================================
                SUBMIT
            ================================================= */}

            <Pressable
              onPress={handleSubmit}
              disabled={!isFormValid || submitting}
              style={({ pressed }) => [
                styles.submitButton,
                !isFormValid &&
                  styles.submitButtonDisabled,
                pressed &&
                  isFormValid &&
                  styles.submitButtonPressed,
              ]}
            >
              {submitting ? (
                <Text style={styles.submitText}>
                  Saving Reflection...
                </Text>
              ) : (
                <>
                  <Text style={styles.submitText}>
                    Submit My Reflection
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>

            {!isFormValid && (
              <Text style={styles.requiredText}>
                Please answer all questions before
                submitting.
              </Text>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// =====================================================
// MOOD BUTTON
// =====================================================

type MoodButtonProps = {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

function MoodButton({
  emoji,
  label,
  selected,
  onPress,
}: MoodButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.moodButton,
        selected && styles.moodButtonSelected,
      ]}
    >
      <Text style={styles.moodEmoji}>
        {emoji}
      </Text>

      <Text
        style={[
          styles.moodText,
          selected && styles.moodTextSelected,
        ]}
      >
        {label}
      </Text>

      {selected && (
        <View style={styles.selectedCheck}>
          <Ionicons
            name="checkmark"
            size={13}
            color="#FFFFFF"
          />
        </View>
      )}
    </Pressable>
  );
}

// =====================================================
// REFLECTION QUESTION
// =====================================================

type ReflectionQuestionProps = {
  number: string;
  question: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
};

function ReflectionQuestion({
  number,
  question,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: ReflectionQuestionProps) {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionTitle}>
        {number} {question}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A59A8C"
        multiline={multiline}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        style={[
          styles.answerInput,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

// =====================================================
// STYLE
// =====================================================

const styles = StyleSheet.create({
  // ===================================================
  // OVERLAY
  // ===================================================

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 38, 29, 0.48)',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 18,
  },

  // ===================================================
  // MODAL
  // ===================================================

  modalContainer: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: '#FFF9ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4C87A',
    overflow: 'hidden',
  },

  scrollView: {
    width: '100%',
  },

  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 14,
  },

  // ===================================================
  // HEADER
  // ===================================================

  reflectionLabel: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7B62D',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 5,
  },

  reflectionLabelText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  title: {
    color: '#38414A',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
  },

  subtitle: {
    color: '#817567',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 1,
    marginBottom: 8,
  },

  // ===================================================
  // QUESTION CARD
  // ===================================================

  questionCard: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: '#E4B83D',
    borderRadius: 11,
    padding: 8,
    marginBottom: 7,
  },

  questionTitle: {
    color: '#594B3A',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  // ===================================================
  // MOOD
  // ===================================================

  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  moodButton: {
    width: '48.5%',
    minHeight: 35,
    borderWidth: 1,
    borderColor: '#E6D9BC',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    position: 'relative',
    paddingHorizontal: 6,
  },

  moodButtonSelected: {
    borderColor: '#E0AD28',
    backgroundColor: '#FFF3C8',
  },

  moodEmoji: {
    fontSize: 12,
  },

  moodText: {
    color: '#594F43',
    fontSize: 9,
    fontWeight: '800',
  },

  moodTextSelected: {
    color: '#765B12',
  },

  selectedCheck: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#E0AD28',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ===================================================
  // INPUT
  // ===================================================

  answerInput: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#E4D7BB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 7,
    color: '#40382F',
    fontSize: 10,
    lineHeight: 14,
  },

  multilineInput: {
    minHeight: 48,
    paddingTop: 8,
  },

  // ===================================================
  // SUBMIT
  // ===================================================

  submitButton: {
    minHeight: 38,
    borderRadius: 9,
    backgroundColor: '#469A65',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 1,
    paddingHorizontal: 12,
  },

  submitButtonDisabled: {
    backgroundColor: '#B9B9B9',
  },

  submitButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  requiredText: {
    textAlign: 'center',
    color: '#9A8875',
    fontSize: 8,
    lineHeight: 11,
    marginTop: 5,
  },
});