
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StarProgressProps = {
  totalStars: number;
  earnedStars: number;
};

export default function StarProgress({
  totalStars,
  earnedStars,
}: StarProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: totalStars }, (_, index) => {
          const isEarned = index < earnedStars;

          return (
            <Ionicons
              key={index}
              name={isEarned ? 'star' : 'star-outline'}
              size={30}
              color={isEarned ? '#F1A72A' : '#333333'}
            />
          );
        })}
      </View>

      <Text style={styles.progressText}>
        {earnedStars} / {totalStars} Stars
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  progressText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '600',
  },
});
