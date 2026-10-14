import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  getCurrentProfile,
  signIn,
  signOut,
} from '../../services/auth/authService';

type LoginRole = 'teacher' | 'student';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();

  const [role, setRole] = useState<LoginRole>('teacher');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const popupOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const popupTranslateY = useRef(
    new Animated.Value(30)
  ).current;

  // Animasi untuk Role Selector
  const slideAnimation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: role === 'teacher' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [role, slideAnimation]);

  // =========================
  // RESPONSIVE SCREEN
  // =========================

  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  const horizontalPadding = isPhone
    ? Math.min(Math.max(width * 0.07, 20), 30)
    : isTablet
      ? 40
      : 30;

  const topPadding = isPhone
    ? height < 700
      ? 30
      : 50
    : isTablet
      ? 60
      : 80;

  const titleSize = isPhone
    ? 24
    : isTablet
      ? 28
      : 24;

  // Interpolasi warna teks (Teacher)
  const teacherTextColor =
    slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFFFFF', '#333333'],
    });

  // Interpolasi background (Teacher)
  const teacherBgColor =
    slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#F58220', '#FFFFFF'],
    });

  // Interpolasi warna teks (Student)
  const studentTextColor =
    slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#333333', '#FFFFFF'],
    });

  // Interpolasi background (Student)
  const studentBgColor =
    slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFFFFF', '#F58220'],
    });

  function showPopup(
    title: string,
    message: string
  ) {
    setPopupTitle(title);
    setPopupMessage(message);
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

  function closePopup() {
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
    });
  }

  function handleRoleChange(
    selectedRole: LoginRole
  ) {
    if (role === selectedRole) return;

    setRole(selectedRole);
    setIdentifier('');
    setPassword('');
  }

  function handleIdentifierChange(
    value: string
  ) {
    setIdentifier(value);
  }

  function handlePasswordChange(
    value: string
  ) {
    setPassword(value);
  }

  async function handleLogin() {
    const cleanIdentifier =
      identifier.trim();

    if (!cleanIdentifier) {
      showPopup(
        'Data belum lengkap',
        role === 'teacher'
          ? 'Silakan masukkan email Guru.'
          : 'Silakan masukkan username Siswa.'
      );
      return;
    }

    if (!password) {
      showPopup(
        'Data belum lengkap',
        'Silakan masukkan password.'
      );
      return;
    }

    if (role === 'teacher') {
      const emailRegex =
        /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;

      if (
        !emailRegex.test(
          cleanIdentifier.toLowerCase()
        )
      ) {
        showPopup(
          'Email tidak valid',
          'Email Guru harus menggunakan @gmail.com atau @yahoo.com.'
        );
        return;
      }
    }

    try {
      setLoading(true);

      await signIn(
        cleanIdentifier.toLowerCase(),
        password
      );

      const profile =
        await getCurrentProfile();

      if (!profile) {
        await signOut();

        showPopup(
          'Login gagal',
          'Profile pengguna belum ditemukan.'
        );

        return;
      }

      if (
        role === 'teacher' &&
        profile.role !== 'teacher'
      ) {
        await signOut();

        showPopup(
          'Login gagal',
          'Akun ini bukan akun Guru.'
        );

        return;
      }

      if (
        role === 'student' &&
        profile.role !== 'student'
      ) {
        await signOut();

        showPopup(
          'Login gagal',
          'Akun ini bukan akun Siswa.'
        );

        return;
      }

      if (profile.role === 'teacher') {
        router.replace({
          pathname: '/post-login',
          params: {
            role: 'teacher',
          },
        });
      } else {
        if (profile.must_change_password) {
          router.replace('./change-password');
        } else {
          router.replace({
            pathname: '/post-login',
            params: {
              role: 'student',
            },
          });
        }
      }
      
    } catch (error: any) {
      console.error(
        'Login error:',
        error
      );

      const message =
        error?.message
          ?.toLowerCase?.() ?? '';

      if (
        message.includes(
          'invalid login credentials'
        ) ||
        message.includes(
          'invalid credentials'
        )
      ) {
        showPopup(
          'Login gagal',
          role === 'teacher'
            ? 'Email atau password salah.'
            : 'Username atau password salah.'
        );

        return;
      }

      showPopup(
        'Terjadi kesalahan',
        error?.message ??
          'Tidak dapat masuk ke akun.'
      );
    } finally {
      setLoading(false);
    }
  }

  const isTeacher =
    role === 'teacher';

  // =========================
  // BACKGROUND
  // =========================

  const backgroundImage =
  Platform.OS === 'web'
    ? require('../../../assets/images/login-web.png')
    : require('../../../assets/images/login-mobile.png');

  return (
    <>
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={
              styles.scrollContent
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.topSection,
                {
                  paddingHorizontal:
                    horizontalPadding,
                  paddingTop:
                    topPadding,
                  maxWidth: isDesktop
                    ? 620
                    : undefined,
                },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    fontSize:
                      titleSize,
                  },
                ]}
              >
                Welcome Back
              </Text>

              {/* ROLE SELECTOR */}
              <View
                style={
                  styles.roleContainer
                }
              >
                <Pressable
                  onPress={() =>
                    handleRoleChange(
                      'teacher'
                    )
                  }
                  style={
                    styles.pressableArea
                  }
                >
                  <Animated.View
                    style={[
                      styles.roleAnimatedBackground,
                      {
                        backgroundColor:
                          teacherBgColor,
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.roleButtonTextAnimated,
                        {
                          color:
                            teacherTextColor,
                        },
                      ]}
                    >
                      Teacher
                    </Animated.Text>
                  </Animated.View>
                </Pressable>

                <View
                  style={
                    styles.roleGap
                  }
                />

                <Pressable
                  onPress={() =>
                    handleRoleChange(
                      'student'
                    )
                  }
                  style={
                    styles.pressableArea
                  }
                >
                  <Animated.View
                    style={[
                      styles.roleAnimatedBackground,
                      {
                        backgroundColor:
                          studentBgColor,
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.roleButtonTextAnimated,
                        {
                          color:
                            studentTextColor,
                        },
                      ]}
                    >
                      Student
                    </Animated.Text>
                  </Animated.View>
                </Pressable>
              </View>

              {/* IDENTIFIER */}
              <View
                style={
                  styles.inputWrapper
                }
              >
                <Text
                  style={
                    styles.label
                  }
                >
                  {isTeacher
                    ? 'Email / Username'
                    : 'Username'}
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  value={
                    identifier
                  }
                  onChangeText={
                    handleIdentifierChange
                  }
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  keyboardType={
                    isTeacher
                      ? 'email-address'
                      : 'default'
                  }
                />
              </View>

              {/* PASSWORD */}
              <View
                style={
                  styles.inputWrapper
                }
              >
                <Text
                  style={
                    styles.label
                  }
                >
                  Password
                </Text>

                <View
                  style={
                    styles.passwordContainer
                  }
                >
                  <TextInput
                    style={
                      styles.passwordInput
                    }
                    value={
                      password
                    }
                    onChangeText={
                      handlePasswordChange
                    }
                    secureTextEntry={
                      !showPassword
                    }
                    autoCapitalize="none"
                  />

                  <Pressable
                    style={
                      styles.eyeIcon
                    }
                    onPress={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-outline'
                          : 'eye-off-outline'
                      }
                      size={
                        isPhone
                          ? 20
                          : 22
                      }
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              </View>

              {/* LOGIN BUTTON */}
              <View
                style={
                  styles.buttonContainer
                }
              >
                <Pressable
                  style={[
                    styles.button,
                    {
                      width: isPhone
                        ? '100%'
                        : 240,
                    },
                    loading &&
                      styles.buttonDisabled,
                  ]}
                  onPress={
                    handleLogin
                  }
                  disabled={
                    loading
                  }
                >
                  {loading ? (
                    <ActivityIndicator
                      color="#000000"
                    />
                  ) : (
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Sign In
                    </Text>
                  )}
                </Pressable>
              </View>

              {/* TEACHER REGISTER */}
              {isTeacher && (
                <Pressable
                  style={
                    styles.registerContainer
                  }
                  onPress={() =>
                    router.push(
                      '/(auth)/register'
                    )
                  }
                >
                  <Text
                    style={
                      styles.registerLink
                    }
                  >
                    Belum punya akun Guru?
                    {' '}
                    Daftar di sini
                  </Text>
                </Pressable>
              )}
            </View>

            {/* BOTTOM ILLUSTRATION */}
            <View
              style={
                styles.illustrationWrapper
              }
            >
              {/*
              <Image
                source={require('../../assets/images/illustration.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
              */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* CUSTOM ERROR POPUP */}
      <Modal
        visible={popupVisible}
        transparent
        animationType="none"
        onRequestClose={
          closePopup
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
              style={
                styles.popupIcon
              }
            >
              <Text
                style={
                  styles.popupIconText
                }
              >
                !
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
              onPress={
                closePopup
              }
              style={
                styles.popupButton
              }
            >
              <Text
                style={
                  styles.popupButtonText
                }
              >
                OK
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  topSection: {
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 30,
    zIndex: 2,
  },

  title: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 30,
  },

  // =========================
  // ROLE SELECTOR
  // =========================

  roleContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    height: 48,
    alignItems: 'center',
  },

  pressableArea: {
    flex: 1,
    height: '100%',
  },

  roleAnimatedBackground: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  roleButtonTextAnimated: {
    fontSize: 16,
    fontWeight: '600',
  },

  roleGap: {
    width: 10,
  },

  // =========================
  // INPUTS
  // =========================

  inputWrapper: {
    marginBottom: 20,
    width: '100%',
  },

  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 2,
  },

  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },

  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingRight: 12,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },

  eyeIcon: {
    padding: 4,
  },

  // =========================
  // BUTTON & LINKS
  // =========================

  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },

  button: {
    maxWidth: 320,
    backgroundColor: '#8DC63F',
    borderRadius: 10,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },

  registerLink: {
    fontSize: 13,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  // =========================
  // ILLUSTRATION
  // =========================

  illustrationWrapper: {
    flex: 1,
    minHeight: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
  },

  illustration: {
    width: '100%',
    height: '100%',
    maxHeight: 350,
  },

  // =========================
  // POPUP
  // =========================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(23, 43, 77, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  popup: {
    width: '100%',
    maxWidth: 380,
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F4E7C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  popupIconText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8A6A32',
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

  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});