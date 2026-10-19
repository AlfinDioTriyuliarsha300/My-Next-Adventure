
import { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FeedbackSheetProps = {
  visible: boolean;
  isCorrect: boolean;
  message: string;
  onClose: () => void;
};

export default function FeedbackSheet({
  visible,
  isCorrect,
  message,
  onClose,
}: FeedbackSheetProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close feedback"
      />

      <View style={styles.sheet}>
        <View
          style={[
            styles.iconContainer,
            isCorrect ? styles.correctIcon : styles.wrongIcon,
          ]}
        >
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : 'close-circle'}
            size={34}
            color={isCorrect ? '#27964B' : '#D94343'}
          />
        </View>

        <View style={styles.messageContainer}>
          <Text
            style={[
              styles.title,
              isCorrect ? styles.correctTitle : styles.wrongTitle,
            ]}
          >
            {isCorrect ? 'Excellent!' : 'Not quite!'}
          </Text>

          <Text style={styles.message}>{message}</Text>
        </View>

        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Continue learning"
        >
          <Text style={styles.closeButtonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctIcon: {
    backgroundColor: '#EAF8EE',
  },
  wrongIcon: {
    backgroundColor: '#FFF0F0',
  },
  messageContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  correctTitle: {
    color: '#20763B',
  },
  wrongTitle: {
    color: '#C52F2F',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#2783D7',
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
