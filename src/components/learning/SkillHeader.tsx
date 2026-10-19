
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

type SkillHeaderProps = {
  title: string;
  onBack?: () => void;
};

export default function SkillHeader({
  title,
  onBack,
}: SkillHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack ?? (() => router.back())}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#1E293B',
    fontSize: 32,
    lineHeight: 36,
  },
  title: {
    color: '#172554',
    fontSize: 21,
    fontWeight: '700',
  },
  rightPlaceholder: {
    width: 42,
  },
});
