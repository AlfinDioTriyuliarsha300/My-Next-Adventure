import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        SAVANA QUEST
      </Text>

      <Text style={styles.subtitle}>
        Welcome, Explorer!
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
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172B4D',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 18,
    color: '#8A6A32',
  },
});