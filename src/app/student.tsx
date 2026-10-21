import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { router } from 'expo-router';

import { getCurrentProfile } from '../services/auth/authService';

import {
  ambilProgress,
  hitungBintang,
} from '../services/auth/learningProgress';

type StudentProfile = {
  full_name: string | null;
  username: string | null;
  role: string;
  grade: number | null;
  class_name: string | null;
};

export default function StudentScreen() {
  const { width, height } =
    useWindowDimensions();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [totalStars, setTotalStars] =
    useState(0);

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    try {
      setLoading(true);

      const currentProfile =
        await getCurrentProfile();

      if (!currentProfile) {
        router.replace(
          '/(auth)/login'
        );
        return;
      }

      if (
        currentProfile.role !==
        'student'
      ) {
        router.replace('/teacher');
        return;
      }

      setProfile(currentProfile);

      /*
      * =========================
      * LOAD TOTAL STARS
      * =========================
      */

      try {
        let totalStarsStudent = 0;

        for (let level = 1; level <= 4; level++) {
          const [
            listeningProgress,
            speakingProgress,
            readingProgress,
            writingProgress,
          ] = await Promise.all([
            ambilProgress(level, 'listening'),
            ambilProgress(level, 'speaking'),
            ambilProgress(level, 'reading'),
            ambilProgress(level, 'writing'),
          ]);

          const listeningStars = Math.min(
            hitungBintang(
              listeningProgress,
              listeningProgress.completedQuestions,
            ),
            3,
          );

          const speakingStars = Math.min(
            hitungBintang(
              speakingProgress,
              speakingProgress.completedQuestions,
            ),
            3,
          );

          const readingStars = Math.min(
            hitungBintang(
              readingProgress,
              readingProgress.completedQuestions,
            ),
            3,
          );

          const writingStars = Math.min(
            hitungBintang(
              writingProgress,
              writingProgress.completedQuestions,
            ),
            3,
          );

          totalStarsStudent +=
            listeningStars +
            speakingStars +
            readingStars +
            writingStars;
        }

        setTotalStars(totalStarsStudent);
      } catch (starsError) {
        console.error(
          'Load student stars error:',
          starsError
        );

        setTotalStars(0);
      }
    } catch (error) {
      console.error(
        'Load student profile error:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // RESPONSIVE
  // =========================

  const isPhone = width < 600;

  const isTablet =
    width >= 600 && width < 1024;

  const isDesktop =
    width >= 1024;

  // Ukuran tombol
  const buttonSize = isPhone
    ? 85
    : isTablet
      ? 110
      : 130;

  // Jarak antar tombol
  const buttonGap = isPhone
    ? 20
    : isTablet
      ? 30
      : 40;

  const backgroundImage =
    Platform.OS === 'web'
      ? require('../../assets/images/home-web.png')
      : require('../../assets/images/home-mobile.png');

  // =========================
  // POINT BADGE SIZE
  // =========================

  const pointsWidth = isPhone
    ? 120
    : isTablet
      ? 145
      : 165;

  const pointsHeight = isPhone
    ? 48
    : isTablet
      ? 56
      : 64;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.loadingContainer}
        resizeMode="cover"
      >
        <View
          style={
            styles.loadingOverlay
          }
        >
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Memuat petualangan...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        {/* =========================
            POINTS / XP
        ========================= */}

        <View
          style={[
            styles.pointsContainer,
            {
              width: pointsWidth,
              height: pointsHeight,
            },
          ]}
        >
          <Text
            style={[
              styles.pointsIcon,
              {
                fontSize: isPhone
                  ? 18
                  : isTablet
                    ? 21
                    : 24,
              },
            ]}
          >
            ⭐
          </Text>

          <View
            style={styles.pointsTextContainer}
          >
            <Text
              style={[
                styles.pointsValue,
                {
                  fontSize: isPhone
                    ? 17
                    : isTablet
                      ? 20
                      : 23,
                },
              ]}
            >
              {totalStars}
            </Text>

            <Text
              style={[
                styles.pointsLabel,
                {
                  fontSize: isPhone
                    ? 9
                    : isTablet
                      ? 10
                      : 11,
                },
              ]}
            >
              STARS
            </Text>
          </View>
        </View>

        {/* =========================
            MENU BUTTONS
        ========================= */}

        <View
          style={[
            styles.menuContainer,
            {
              gap: buttonGap,
            },
          ]}
        >

          {/* =========================
              SETTING
          ========================= */}

          <Pressable
            onPress={() =>
              router.push('/settings')
            }
            style={({ pressed }) => [
              styles.buttonWrapper,
              {
                width: buttonSize,
                height: buttonSize,
                transform: [
                  {
                    scale: pressed
                      ? 0.92
                      : 1,
                  },
                ],
              },
            ]}
          >
            <Image
              source={require('../../assets/images/buttons/setting.png')}
              style={styles.buttonImage}
              resizeMode="contain"
            />
          </Pressable>

          {/* =========================
              PLAY
          ========================= */}

          <Pressable
            onPress={() =>
              router.push('/describing-things')
            }
            style={({ pressed }) => [
              styles.buttonWrapper,
              {
                width: buttonSize,
                height: buttonSize,
                transform: [
                  {
                    scale: pressed
                      ? 0.92
                      : 1,
                  },
                ],
              },
            ]}
          >
            <Image
              source={require('../../assets/images/buttons/play.png')}
              style={styles.buttonImage}
              resizeMode="contain"
            />
          </Pressable>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  // =========================
  // MAIN
  // =========================

  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },

  // =========================
  // POINTS
  // =========================

  pointsContainer: {
    position: 'absolute',

    top: 24,
    right: 24,

    zIndex: 20,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 12,

    borderRadius: 30,

    backgroundColor:
      'rgba(255, 255, 255, 0.94)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,

    elevation: 5,
  },

  pointsIcon: {
    marginRight: 7,
  },

  pointsTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  pointsValue: {
    color: '#5A3A1A',
    fontWeight: '900',
  },

  pointsLabel: {
    marginLeft: 3,
    color: '#8B6B45',
    fontWeight: '800',
  },

  // =========================
  // MENU
  // =========================

  menuContainer: {
    position: 'absolute',

    top: '35%',

    width: '100%',

    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',

    paddingHorizontal: 20,
  },

  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonImage: {
    width: '100%',
    height: '100%',
  },

  // =========================
  // LOADING
  // =========================

  loadingContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  loadingOverlay: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(0, 0, 0, 0.15)',
  },

  loadingText: {
    marginTop: 12,

    color: '#FFFFFF',

    fontSize: 14,
    fontWeight: '600',
  },
});