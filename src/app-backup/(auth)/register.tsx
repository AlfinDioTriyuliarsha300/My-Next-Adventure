import { StyleSheet, Text, View } from 'react-native';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>
        Halaman pendaftaran akan segera tersedia.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F4E7C1',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172B4D',
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    color: '#172B4D',
  },
});