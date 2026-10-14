import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Image
        source={require('../../assets/images/splash-mobile.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4E7C1',
  },

  image: {
    width: '100%',
    height: '100%',
  },
});