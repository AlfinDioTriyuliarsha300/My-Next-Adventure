import { StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>EXPLORE</Text>
      <Text style={styles.title}>Jelajahi petualangan</Text>
      <Text style={styles.subtitle}>
        Fitur Explore sedang siap dikembangkan.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4E7C1',
    paddingHorizontal: 24,
  },
  badge: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#8A6A32',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172B4D',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    color: '#6E5A35',
    fontSize: 16,
  },
});
