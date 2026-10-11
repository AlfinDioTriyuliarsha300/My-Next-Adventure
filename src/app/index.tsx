import { useEffect } from 'react';

import {
  Image,
  Platform,
  StyleSheet,
} from 'react-native';

import { router } from 'expo-router';

import {
  getCurrentProfile,
  getCurrentSession,
} from '../services/auth/authService';

export default function Index() {
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 4000)
        );

        if (!mounted) return;

        const session =
          await getCurrentSession();

        if (!session) {
          router.replace('/(auth)/login');
          return;
        }

        const profile =
          await getCurrentProfile();

        if (!profile) {
          router.replace('/(auth)/login');
          return;
        }

        if (profile.role === 'teacher') {
          router.replace('/teacher');
        } else {
          router.replace('/student');
        }
      } catch (error) {
        console.error(
          'Initialization error:',
          error
        );

        if (mounted) {
          router.replace('/(auth)/login');
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const splashImage =
    Platform.OS === 'web'
      ? require('../../assets/images/splash-web.png')
      : require('../../assets/images/splash-mobile.png');

  return (
    <Image
      source={splashImage}
      style={styles.image}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});