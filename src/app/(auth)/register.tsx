import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { signUpTeacher } from '../../services/auth/authService';

type PopupType = 'success' | 'error';
type PopupAction = 'none' | 'dashboard' | 'login';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [loading, setLoading] = useState(false);

  // =========================
  // PASSWORD VISIBILITY
  // =========================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================
  // POPUP STATE
  // =========================

  const [popupVisible, setPopupVisible] =
    useState(false);

  const [popupType, setPopupType] =
    useState<PopupType>('error');

  const [popupTitle, setPopupTitle] =
    useState('');

  const [popupMessage, setPopupMessage] =
    useState('');

  const [popupAction, setPopupAction] =
    useState<PopupAction>('none');

  const popupOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const popupTranslateY = useRef(
    new Animated.Value(30)
  ).current;

  function showPopup(
    type: PopupType,
    title: string,
    message: string,
    action: PopupAction = 'none'
  ) {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupAction(action);
    setPopupVisible(true);

    popupOpacity.setValue(0);
    popupTranslateY.setValue(30);

    Animated.parallel([
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(popupTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closePopup(
    action: PopupAction = popupAction
  ) {
    Animated.parallel([
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(popupTranslateY, {
        toValue: 20,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPopupVisible(false);

      if (action === 'dashboard') {
        router.replace('/teacher');
      }

      if (action === 'login') {
        router.replace('/(auth)/login');
      }
    });
  }

  async function handleRegister() {
    const cleanName = fullName.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    // =========================
    // VALIDASI NAMA
    // =========================

    if (!cleanName) {
      showPopup(
        'error',
        'Data belum lengkap',
        'Silakan masukkan nama lengkap Guru.'
      );
      return;
    }

    // =========================
    // VALIDASI EMAIL
    // =========================

    if (!cleanEmail) {
      showPopup(
        'error',
        'Data belum lengkap',
        'Silakan masukkan email Guru.'
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;

    if (!emailRegex.test(cleanEmail)) {
      showPopup(
        'error',
        'Email tidak valid',
        'Email Guru harus menggunakan @gmail.com atau @yahoo.com.'
      );
      return;
    }

    // =========================
    // VALIDASI PASSWORD
    // =========================

    if (!password) {
      showPopup(
        'error',
        'Data belum lengkap',
        'Silakan masukkan password.'
      );
      return;
    }

    if (password.length < 6) {
      showPopup(
        'error',
        'Password tidak valid',
        'Password minimal 6 karakter.'
      );
      return;
    }

    if (password !== confirmPassword) {
      showPopup(
        'error',
        'Password tidak cocok',
        'Konfirmasi password harus sama dengan password.'
      );
      return;
    }

    // =========================
    // REGISTER
    // =========================

    try {
      setLoading(true);

      const result =
        await signUpTeacher({
          fullName: cleanName,
          email: cleanEmail,
          password,
        });

      // =========================
      // CEK SESSION
      // =========================

      if (!result.session) {
        throw new Error(
          'Akun berhasil dibuat, tetapi session belum tersedia. Pastikan Confirm Email di Supabase sudah OFF.'
        );
      }

      // =========================
      // REGISTER BERHASIL
      // =========================

      showPopup(
        'success',
        'Registrasi Berhasil!',
        `Selamat datang di Savana Quest, ${cleanName}. Akun Guru kamu berhasil dibuat.`,
        'dashboard'
      );
    } catch (error: any) {
      console.error(
        'Teacher registration error:',
        error
      );

      const errorMessage =
        error?.message
          ?.toLowerCase?.() ?? '';

      // =========================
      // EMAIL SUDAH TERDAFTAR
      // =========================

      if (
        errorMessage.includes(
          'user already registered'
        ) ||
        errorMessage.includes(
          'email already exists'
        ) ||
        errorMessage.includes(
          'user_already_exists'
        )
      ) {
        showPopup(
          'error',
          'Email Sudah Terdaftar',
          'Email ini sudah digunakan oleh akun Guru. Silakan gunakan email lain atau masuk menggunakan akun tersebut.',
          'login'
        );

        return;
      }

      // =========================
      // ERROR LAIN
      // =========================

      showPopup(
        'error',
        'Registrasi Gagal',
        error?.message ??
          'Terjadi kesalahan saat membuat akun Guru.'
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // BACKGROUND IMAGE
  // =========================

  const backgroundImage =
    Platform.OS === 'web'
      ? require('../../../assets/images/register-web.png')
      : require('../../../assets/images/register-mobile.png');

  return (
    <>
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
          style={styles.keyboardContainer}
        >
          <View style={styles.content}>
            <Text style={styles.title}>
              Register as a Teacher
            </Text>

            <Text style={styles.subtitle}>
              Create a teacher account to
              manage{'\n'}
              students in Savana Quest.
            </Text>

            <View style={styles.form}>
              {/* NAMA */}

              <Text style={styles.label}>
                Full Name
              </Text>

              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                style={styles.input}
                value={fullName}
              />

              {/* EMAIL */}

              <Text style={styles.label}>
                Email Address
              </Text>

              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="nama@gmail.com"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                style={styles.input}
                value={email}
              />

              <Text
                style={styles.helperText}
              >
                Please use a Gmail or Yahoo
                email address
              </Text>

              {/* PASSWORD */}

              <Text style={styles.label}>
                Password
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={
                    setPassword
                  }
                  placeholder="At least 6 characters"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  secureTextEntry={
                    !showPassword
                  }
                  style={[
                    styles.input,
                    styles.passwordInput,
                  ]}
                  value={password}
                />

                <Pressable
                  style={
                    styles.passwordToggle
                  }
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={21}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              {/* KONFIRMASI PASSWORD */}

              <Text style={styles.label}>
                Confirm Password
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={
                    setConfirmPassword
                  }
                  placeholder="Re-enter your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  style={[
                    styles.input,
                    styles.passwordInput,
                  ]}
                  value={
                    confirmPassword
                  }
                />

                <Pressable
                  style={
                    styles.passwordToggle
                  }
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={21}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              {/* REGISTER BUTTON */}

              <Pressable
                disabled={loading}
                onPress={
                  handleRegister
                }
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
                    Register as a Teacher
                  </Text>
                )}
              </Pressable>

              {/* LOGIN */}

              <Pressable
                onPress={() =>
                  router.replace(
                    '/(auth)/login'
                  )
                }
                disabled={loading}
              >
                <Text
                  style={styles.backText}
                >
                  Already have an account?{' '}
                  <Text
                    style={
                      styles.backBold
                    }
                  >
                    Login
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* =========================
          POPUP
      ========================= */}

      <Modal
        animationType="none"
        transparent
        visible={popupVisible}
        onRequestClose={() =>
          closePopup('none')
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Animated.View
            style={[
              styles.popup,
              {
                opacity:
                  popupOpacity,
                transform: [
                  {
                    translateY:
                      popupTranslateY,
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.popupIcon,
                popupType ===
                  'success' &&
                  styles.popupIconSuccess,
              ]}
            >
              <Text
                style={[
                  styles.popupIconText,
                  popupType ===
                    'success' &&
                    styles.popupIconTextSuccess,
                ]}
              >
                {popupType ===
                'success'
                  ? '✓'
                  : '!'}
              </Text>
            </View>

            <Text
              style={
                styles.popupTitle
              }
            >
              {popupTitle}
            </Text>

            <Text
              style={
                styles.popupMessage
              }
            >
              {popupMessage}
            </Text>

            <Pressable
              onPress={() =>
                closePopup()
              }
              style={[
                styles.popupButton,
                popupType ===
                  'success' &&
                  styles.popupButtonSuccess,
              ]}
            >
              <Text
                style={
                  styles.popupButtonText
                }
              >
                {popupAction ===
                'dashboard'
                  ? 'Masuk ke Dashboard'
                  : popupAction ===
                      'login'
                    ? 'Ke Login'
                    : 'OK'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // =========================
  // MAIN CONTAINER
  // =========================

  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  form: {
    marginTop: 20,
  },

  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 15,
    color: '#FFFFFF',
  },

  // =========================
  // INPUT
  // =========================

  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },

  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },

  passwordInput: {
    paddingRight: 50,
  },

  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: '#E01717',
  },

  // =========================
  // BUTTON
  // =========================

  button: {
    marginTop: 28,
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#83B345',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  backText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 14,
  },

  backBold: {
    color: '#FBC02D',
    fontWeight: 'bold',
  },

  // =========================
  // POPUP
  // =========================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(23, 43, 77, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  popup: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFDF7',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',

    shadowColor: '#172B4D',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  popupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F4E7C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  popupIconSuccess: {
    backgroundColor: '#E5F3E1',
  },

  popupIconText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8A6A32',
  },

  popupIconTextSuccess: {
    color: '#4D8B45',
  },

  popupTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#172B4D',
    textAlign: 'center',
  },

  popupMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#6E5A35',
    textAlign: 'center',
  },

  popupButton: {
    width: '100%',
    marginTop: 22,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  popupButtonSuccess: {
    backgroundColor: '#4D8B45',
  },

  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});