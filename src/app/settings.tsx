import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { router } from 'expo-router';

import {
    getCurrentProfile,
    signOut,
} from '../services/auth/authService';

type StudentProfile = {
  full_name: string | null;
  username: string | null;
  role: string;
  grade: number | null;
  class_name: string | null;
};

export default function SettingsScreen() {
  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const backgroundImage =
    Platform.OS === 'web'
      ? require('../../assets/images/settings-web.png')
      : require('../../assets/images/settings-mobile.png');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
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
    } catch (error) {
      console.error(
        'Load settings profile error:',
        error
      );

      Alert.alert(
        'Gagal',
        error instanceof Error
          ? error.message
          : 'Gagal memuat profil siswa.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await signOut();

      router.replace(
        '/(auth)/login'
      );
    } catch (error) {
      console.error(
        'Settings logout error:',
        error
      );

      Alert.alert(
        'Gagal Logout',
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat logout.'
      );
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        resizeMode="cover"
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
          />

          <Text
            style={styles.loadingText}
          >
            Memuat pengaturan...
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
        {/* BACK */}

        <Pressable
          onPress={() =>
            router.replace('/student')
          }
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ←
          </Text>
        </Pressable>

        {/* TITLE */}

        <Text style={styles.title}>
          Settings
        </Text>

        {/* PROFILE */}

        <View
          style={styles.profileCard}
        >
          <Text
            style={styles.sectionTitle}
          >
            Explorer Profile
          </Text>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Name
            </Text>

            <Text
              style={styles.infoValue}
            >
              {profile?.full_name ||
                '-'}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Username
            </Text>

            <Text
              style={styles.infoValue}
            >
              {profile?.username ||
                '-'}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Grade
            </Text>

            <Text
              style={styles.infoValue}
            >
              {profile?.grade ||
                '-'}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Class
            </Text>

            <Text
              style={styles.infoValue}
            >
              {profile?.class_name ||
                '-'}
            </Text>
          </View>
        </View>

        {/* LOGOUT */}

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={[
            styles.logoutButton,
            loggingOut &&
              styles.buttonDisabled,
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.logoutText
              }
            >
              Logout
            </Text>
          )}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(0,0,0,0.15)',
  },

  loadingText: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  backButton: {
    position: 'absolute',
    top: 30,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      'rgba(23, 43, 77, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },

  profileCard: {
    width: '100%',
    maxWidth: 450,
    padding: 24,
    borderRadius: 22,
    backgroundColor:
      'rgba(255,255,255,0.94)',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 18,
  },

  infoRow: {
    marginTop: 12,
  },

  infoLabel: {
    fontSize: 13,
    color: '#8A6A32',
    fontWeight: '600',
  },

  infoValue: {
    marginTop: 3,
    fontSize: 17,
    color: '#172B4D',
    fontWeight: '700',
  },

  logoutButton: {
    width: '100%',
    maxWidth: 450,
    minHeight: 52,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: '#C94A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});