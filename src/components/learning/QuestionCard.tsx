
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { LearningQuestion } from '../../data/types';
import AudioButton from './AudioButton';

type QuestionCardProps = {
  question: LearningQuestion;
  questionNumber: number;
  totalQuestions: number;
};

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.questionCount}>
          Question {questionNumber} of {totalQuestions}
        </Text>

        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            {question.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        {question.instruction}
      </Text>

      <Text style={styles.question}>
        {question.question}
      </Text>

      {question.image ? (
        <Image
            source={question.image}
            style={styles.questionImage}
            resizeMode="contain"
        />
        ) : null}

      {question.audio !== undefined && (
        <View style={styles.audioContainer}>
          <AudioButton audio={question.audio} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 26,
  paddingHorizontal: 24,
  paddingVertical: 24,
  borderWidth: 1,
  borderColor: '#E8EEF5',
  elevation: 3,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 12,
},

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 13,
    color: '#777777',
    fontWeight: '600',
  },
  difficultyBadge: {
    backgroundColor: '#F0F5FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2783D7',
  },
  instruction: {
  fontSize: 16,
  lineHeight: 25,
  color: '#64748B',
  marginTop: 20,
},
  question: {
  fontSize: 25,
  lineHeight: 34,
  fontWeight: '800',
  color: '#172033',
  marginTop: 16,
  marginBottom: 24,
},
  audioContainer: {
    marginTop: 4,
  },
  questionImage: {
  width: '100%',
  height: 160,
  marginTop: 12,
  marginBottom: 16,
  borderRadius: 18,
  backgroundColor: '#F1F7FC',
},
});
