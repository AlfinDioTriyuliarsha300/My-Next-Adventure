import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { changeStudentPassword } from '../../services/auth/authService';

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleChangePassword() {
    if (loading) return;

    const password =
      newPassword.trim();

    const confirmation =
      confirmPassword.trim();

    // =========================
    // VALIDASI
    // =========================

    if (!password) {
      Alert.alert(
        'Password Wajib Diisi',
        'Silakan masukkan password baru.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Password Terlalu Pendek',
        'Password baru minimal 6 karakter.'
      );
      return;
    }

    if (!confirmation) {
      Alert.alert(
        'Konfirmasi Password',
        'Silakan masukkan ulang password baru.'
      );
      return;
    }

    if (password !== confirmation) {
      Alert.alert(
        'Password Tidak Sama',
        'Password baru dan konfirmasi password harus sama.'
      );
      return;
    }

    try {
      setLoading(true);

      await changeStudentPassword(
        password
      );

      Alert.alert(
        'Password Berhasil Diubah',
        'Password kamu berhasil diperbarui. Sekarang kamu bisa masuk ke MY NEXT ADVENTURE.',
        [
          {
            text: 'Mulai',
            onPress: () => {
              router.replace({
                pathname: '/post-login',
                params: {
                  role: 'student',
                },
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'CHANGE PASSWORD ERROR:',
        error
      );

      Alert.alert(
        'Gagal Mengubah Password',
        error?.message ||
          'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.content}>
        {/* =========================
            HEADER
        ========================= */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Buat Password Baru
          </Text>

          <Text style={styles.description}>
            Untuk keamanan akunmu, kamu perlu
            mengganti password sementara yang
            diberikan oleh gurumu.
          </Text>
        </View>

        {/* =========================
            FORM
        ========================= */}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Password Baru
            </Text>

            <TextInput
              value={newPassword}
              onChangeText={
                setNewPassword
              }
              placeholder="Masukkan password baru"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Konfirmasi Password
            </Text>

            <TextInput
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
              placeholder="Masukkan kembali password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              editable={!loading}
              onSubmitEditing={
                handleChangePassword
              }
              returnKeyType="done"
            />
          </View>

          {/* =========================
              PASSWORD INFO
          ========================= */}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              Tips membuat password
            </Text>

            <Text style={styles.infoText}>
              • Minimal 6 karakter
            </Text>

            <Text style={styles.infoText}>
              • Gunakan password yang mudah kamu
              ingat
            </Text>

            <Text style={styles.infoText}>
              • Jangan berikan password kepada
              orang lain
            </Text>
          </View>

          {/* =========================
              BUTTON
          ========================= */}

          <Pressable
            onPress={
              handleChangePassword
            }
            disabled={loading}
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Simpan Password
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4E7C1',
  },

  content: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  header: {
    marginBottom: 32,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5F6B7A',
  },

  form: {
    width: '100%',
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    height: 54,
    borderWidth: 1,
    borderColor: '#D8CDAA',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#172B4D',
  },

  infoBox: {
    marginTop: 4,
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFF8DD',
    borderWidth: 1,
    borderColor: '#E9D99A',
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#687386',
  },

  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});