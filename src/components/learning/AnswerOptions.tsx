import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import type { AnswerOption } from '../../data/types';

type AnswerOptionsProps = {
  options: AnswerOption[];
  selectedAnswer: string | null;
  correctAnswer?: string;
  isSubmitted: boolean;
  onSelect: (answerId: string) => void;
};

export default function AnswerOptions({
  options,
  selectedAnswer,
  correctAnswer,
  isSubmitted,
  onSelect,
}: AnswerOptionsProps) {
  const { width } = useWindowDimensions();

  // Dua kolom pada layar yang cukup lebar,
  // satu kolom pada layar yang sangat sempit.
  const isCompact = width < 340;

  function getOptionStyle(answerId: string) {
    if (!isSubmitted) {
      return selectedAnswer === answerId
        ? styles.selectedOption
        : styles.option;
    }

    if (answerId === correctAnswer) {
      return styles.correctOption;
    }

    if (answerId === selectedAnswer) {
      return styles.wrongOption;
    }

    return styles.option;
  }

  function getTextStyle(answerId: string) {
    if (isSubmitted && answerId === correctAnswer) {
      return styles.correctText;
    }

    if (
      isSubmitted &&
      answerId === selectedAnswer &&
      answerId !== correctAnswer
    ) {
      return styles.wrongText;
    }

    if (selectedAnswer === answerId) {
      return styles.selectedText;
    }

    return styles.optionText;
  }

  return (
    <View
      style={[
        styles.container,
        isCompact && styles.compactContainer,
      ]}
    >
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option.id;
        const isCorrect = option.id === correctAnswer;

        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            disabled={isSubmitted}
            accessibilityRole="button"
            accessibilityState={{
              selected: isSelected,
              disabled: isSubmitted,
            }}
            style={({ pressed }) => [
              styles.option,
              isCompact && styles.compactOption,
              getOptionStyle(option.id),
              pressed && !isSubmitted && styles.pressedOption,
            ]}
          >
            <View style={styles.optionHeader}>
              <View
                style={[
                  styles.optionLabel,
                  isSelected && !isSubmitted && styles.selectedLabel,
                  isSubmitted && isCorrect && styles.correctLabel,
                  isSubmitted &&
                    isSelected &&
                    !isCorrect &&
                    styles.wrongLabel,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabelText,
                    isSelected && !isSubmitted && styles.selectedLabelText,
                    isSubmitted && isCorrect && styles.correctLabelText,
                    isSubmitted &&
                      isSelected &&
                      !isCorrect &&
                      styles.wrongLabelText,
                  ]}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              {isSubmitted && isCorrect && (
                <Text style={styles.statusIcon}>✓</Text>
              )}

              {isSubmitted && isSelected && !isCorrect && (
                <Text style={styles.wrongIcon}>✕</Text>
              )}
            </View>

            <View style={styles.answerContent}>
              <Text
                style={[
                  styles.optionText,
                  getTextStyle(option.id),
                ]}
                numberOfLines={3}
              >
                {option.text}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  compactContainer: {
    justifyContent: 'center',
  },

  option: {
    width: '48.5%',
    minHeight: 120,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EDF5',
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },

  compactOption: {
    width: '100%',
    minHeight: 76,
  },

  selectedOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2783D7',
    borderWidth: 1.5,
  },

  correctOption: {
    backgroundColor: '#F0FDF4',
    borderColor: '#27964B',
    borderWidth: 1.5,
  },

  wrongOption: {
    backgroundColor: '#FEF2F2',
    borderColor: '#D94343',
    borderWidth: 1.5,
  },

  pressedOption: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionLabel: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
  },

  selectedLabel: {
    backgroundColor: '#2783D7',
  },

  correctLabel: {
    backgroundColor: '#27964B',
  },

  wrongLabel: {
    backgroundColor: '#D94343',
  },

  optionLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },

  selectedLabelText: {
    color: '#FFFFFF',
  },

  correctLabelText: {
    color: '#FFFFFF',
  },

  wrongLabelText: {
    color: '#FFFFFF',
  },

  answerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingHorizontal: 2,
  },

  optionText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#334155',
    fontWeight: '700',
    textAlign: 'center',
  },

  selectedText: {
    color: '#1769AA',
  },

  correctText: {
    color: '#20763B',
  },

  wrongText: {
    color: '#C52F2F',
  },

  statusIcon: {
    color: '#27964B',
    fontSize: 18,
    fontWeight: '800',
  },

  wrongIcon: {
    color: '#D94343',
    fontSize: 18,
    fontWeight: '800',
  },
});
