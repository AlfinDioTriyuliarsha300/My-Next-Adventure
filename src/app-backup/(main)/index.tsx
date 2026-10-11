import { StyleSheet, Text, View } from 'react-native';

export default function MainScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savana Quest</Text>

      <Text style={styles.subtitle}>
        Welcome to your next adventure!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4E7C1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#172B4D',
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#172B4D',
    textAlign: 'center',
  },
});