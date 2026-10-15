import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  createStudent,
  getCurrentProfile,
  getStudentProgressById,
  getTeacherStudents,
  resetStudentPassword,
  signOut,
  updateTeacherProfile,
} from '../services/auth/authService';

type Student = {
  id: string;
  full_name: string;
  username: string;
  role: string;
  grade: number | null;
  class_name: string | null;
  must_change_password: boolean;
  created_at: string;
};

type CreatedStudent = {
  full_name: string;
  username: string;
  temporary_password: string;
  grade: number;
  class_name: string;
};

type StudentProgress = {
  id: string;
  student_id: string;
  level_number: number;
  best_score: number;
  total_points: number;
  attempts: number;
  completed: boolean;
  unlocked: boolean;
  last_attempt_at: string | null;
};

type SelectedStudent = {
  student: Student;
  progress: StudentProgress[];
};

export default function TeacherScreen() {
  const [profile, setProfile] =
    useState<any>(null);

  const [teacherName, setTeacherName] =
    useState('');

  const [students, setStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [name, setName] =
    useState('');

  const [grade, setGrade] =
    useState(5);

  const [className, setClassName] =
    useState('A');

  const [createdStudent, setCreatedStudent] =
    useState<CreatedStudent | null>(null);

  /*
   * Filter kelas.
   */
  const [selectedClass, setSelectedClass] =
    useState('ALL');

  /*
   * Detail siswa.
   */
  const [
    selectedStudent,
    setSelectedStudent,
  ] =
    useState<SelectedStudent | null>(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    detailVisible,
    setDetailVisible,
  ] = useState(false);

  /*
   * Password hasil reset.
   */
  const [
    resetPasswordResult,
    setResetPasswordResult,
  ] = useState<string | null>(null);

  const [
    resettingPassword,
    setResettingPassword,
  ] = useState(false);

  const loadDashboard =
    useCallback(async () => {
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
          'teacher'
        ) {
          router.replace('/student');
          return;
        }

        setProfile(currentProfile);

        setTeacherName(
          currentProfile.full_name || ''
        );

        const studentData =
          await getTeacherStudents();

        setStudents(studentData);
      } catch (error) {
        console.error(
          'Teacher dashboard error:',
          error
        );

        Alert.alert(
          'Gagal',
          error instanceof Error
            ? error.message
            : 'Gagal memuat dashboard.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
   * ==========================================
   * FILTER KELAS
   * ==========================================
   */

  const classGroups =
    useMemo(() => {
      const groups =
        new Set<string>();

      students.forEach((student) => {
        if (
          student.grade !== null &&
          student.class_name
        ) {
          groups.add(
            `${student.grade}${student.class_name}`
          );
        }
      });

      return Array.from(groups).sort(
        (a, b) => {
          const gradeA =
            Number(a.match(/\d+/)?.[0] || 0);

          const gradeB =
            Number(b.match(/\d+/)?.[0] || 0);

          if (gradeA !== gradeB) {
            return gradeA - gradeB;
          }

          return a.localeCompare(b);
        }
      );
    }, [students]);

  const filteredStudents =
    useMemo(() => {
      if (
        selectedClass === 'ALL'
      ) {
        return students;
      }

      return students.filter(
        (student) =>
          `${student.grade}${student.class_name}` ===
          selectedClass
      );
    }, [
      students,
      selectedClass,
    ]);

  /*
   * ==========================================
   * PROFILE
   * ==========================================
   */

  async function handleSaveProfile() {
    const cleanName =
      teacherName.trim();

    if (!cleanName) {
      Alert.alert(
        'Nama belum diisi',
        'Silakan masukkan nama guru.'
      );

      return;
    }

    try {
      setSavingProfile(true);

      const updatedProfile =
        await updateTeacherProfile(
          cleanName
        );

      setProfile(updatedProfile);

      setTeacherName(
        updatedProfile.full_name || ''
      );

      Alert.alert(
        'Berhasil',
        'Nama guru berhasil disimpan.'
      );
    } catch (error) {
      console.error(
        'Update teacher profile error:',
        error
      );

      Alert.alert(
        'Gagal',
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan nama guru.'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  /*
   * ==========================================
   * CREATE STUDENT
   * ==========================================
   */

  async function handleCreateStudent() {
    const studentName =
      name.trim();

    if (!studentName) {
      Alert.alert(
        'Data belum lengkap',
        'Silakan masukkan nama siswa.'
      );

      return;
    }

    try {
      setCreating(true);

      setCreatedStudent(null);

      const result =
        await createStudent({
          name: studentName,
          grade,
          class_name: className,
        });

      setCreatedStudent({
        full_name:
          result.student.full_name,

        username:
          result.student.username,

        temporary_password:
          result.temporary_password,

        grade:
          result.student.grade,

        class_name:
          result.student.class_name,
      });

      setName('');

      await loadDashboard();

      /*
       * Otomatis pindah ke kelas
       * siswa yang baru dibuat.
       */
      setSelectedClass(
        `${result.student.grade}${result.student.class_name}`
      );

      Alert.alert(
        'Berhasil',
        `${result.student.full_name} berhasil ditambahkan.`
      );
    } catch (error) {
      console.error(
        'Create student error:',
        error
      );

      Alert.alert(
        'Gagal membuat siswa',
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan.'
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * ==========================================
   * OPEN STUDENT DETAIL
   * ==========================================
   */

  async function handleOpenStudent(
    student: Student
  ) {
    try {
      setDetailLoading(true);

      setResetPasswordResult(null);

      setDetailVisible(true);

      const progress =
        await getStudentProgressById(
          student.id
        );

      setSelectedStudent({
        student,
        progress,
      });
    } catch (error) {
      console.error(
        'Load student detail error:',
        error
      );

      setDetailVisible(false);

      Alert.alert(
        'Gagal',
        error instanceof Error
          ? error.message
          : 'Gagal mengambil detail siswa.'
      );
    } finally {
      setDetailLoading(false);
    }
  }

  /*
   * ==========================================
   * RESET PASSWORD
   * ==========================================
   */

  function handleResetPasswordConfirm() {
    if (!selectedStudent) {
      return;
    }

    Alert.alert(
      'Reset Password',
      `Password ${selectedStudent.student.full_name} akan diganti dengan password sementara baru.`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Reset Password',
          style: 'destructive',
          onPress:
            handleResetPassword,
        },
      ]
    );
  }

  async function handleResetPassword() {
    if (!selectedStudent) {
      return;
    }

    try {
      setResettingPassword(true);

      setResetPasswordResult(null);

      const result =
        await resetStudentPassword(
          selectedStudent.student.id
        );

      setResetPasswordResult(
        result.temporary_password
      );
    } catch (error) {
      console.error(
        'Reset student password error:',
        error
      );

      Alert.alert(
        'Gagal',
        error instanceof Error
          ? error.message
          : 'Gagal mereset password siswa.'
      );
    } finally {
      setResettingPassword(false);
    }
  }

  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  async function handleLogout() {
    try {
      await signOut();

      router.replace(
        '/(auth)/login'
      );
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error
          ? error.message
          : 'Gagal logout.'
      );
    }
  }

  /*
   * ==========================================
   * TOTAL XP STUDENT
   * ==========================================
   */

  function getTotalPoints(
    progress: StudentProgress[]
  ) {
    return progress.reduce(
      (total, item) =>
        total +
        (item.total_points || 0),
      0
    );
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#172B4D"
        />

        <Text
          style={styles.loadingText}
        >
          Memuat dashboard...
        </Text>
      </View>
    );
  }

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.badge}>
          MY NEXT ADVENTURE
        </Text>

        <Text style={styles.title}>
          Teacher Dashboard
        </Text>

        <Text style={styles.subtitle}>
          Selamat datang,
        </Text>

        <Text
          style={styles.teacherName}
        >
          {profile?.full_name ||
            'Guru'}
        </Text>

        {/* ==================================
            PROFILE
        ================================== */}

        <View style={styles.card}>
          <Text
            style={styles.cardTitle}
          >
            Profil Guru
          </Text>

          <Text
            style={styles.label}
          >
            Nama Guru
          </Text>

          <TextInput
            value={teacherName}
            onChangeText={
              setTeacherName
            }
            placeholder="Masukkan nama guru"
            placeholderTextColor="#9A8B6A"
            style={styles.input}
            autoCapitalize="words"
          />

          <Pressable
            onPress={
              handleSaveProfile
            }
            disabled={
              savingProfile
            }
            style={[
              styles.profileButton,
              savingProfile &&
                styles.buttonDisabled,
            ]}
          >
            {savingProfile ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.profileButtonText
                }
              >
                Simpan Nama
              </Text>
            )}
          </Pressable>
        </View>

        {/* ==================================
            SUMMARY
        ================================== */}

        <View
          style={styles.summaryCard}
        >
          <Text
            style={styles.cardLabel}
          >
            JUMLAH SISWA
          </Text>

          <Text
            style={
              styles.studentCount
            }
          >
            {students.length}
          </Text>

          <Text
            style={
              styles.cardDescription
            }
          >
            Siswa yang dibuat oleh akun
            guru ini.
          </Text>
        </View>

        {/* ==================================
            ADD STUDENT
        ================================== */}

        <View style={styles.card}>
          <Text
            style={styles.cardTitle}
          >
            Tambah Siswa
          </Text>

          <Text
            style={styles.label}
          >
            Nama Siswa
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Contoh: Nandi"
            placeholderTextColor="#9A8B6A"
            style={styles.input}
            autoCapitalize="words"
          />

          <Text
            style={styles.label}
          >
            Grade
          </Text>

          <View
            style={styles.optionRow}
          >
            {[1, 2, 3, 4, 5, 6].map(
              (item) => {
                const active =
                  grade === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() =>
                      setGrade(item)
                    }
                    style={[
                      styles.option,
                      active &&
                        styles.optionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active &&
                          styles.optionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <Text
            style={styles.label}
          >
            Class
          </Text>

          <View
            style={styles.optionRow}
          >
            {[
              'A',
              'B',
              'C',
              'D',
              'E',
              'F',
            ].map((item) => {
              const active =
                className === item;

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    setClassName(item)
                  }
                  style={[
                    styles.option,
                    active &&
                      styles.optionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      active &&
                        styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={
              handleCreateStudent
            }
            disabled={creating}
            style={[
              styles.primaryButton,
              creating &&
                styles.buttonDisabled,
            ]}
          >
            {creating ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                + Tambah Siswa
              </Text>
            )}
          </Pressable>
        </View>

        {/* ==================================
            CREATED ACCOUNT
        ================================== */}

        {createdStudent && (
          <View
            style={styles.successCard}
          >
            <Text
              style={
                styles.successTitle
              }
            >
              Akun Siswa Berhasil
              Dibuat
            </Text>

            <Text
              style={styles.successName}
            >
              {createdStudent.full_name}
            </Text>

            <Text
              style={
                styles.credentialLabel
              }
            >
              Kelas
            </Text>

            <Text
              style={styles.credential}
            >
              Grade {createdStudent.grade}
              {' • '}
              Kelas{' '}
              {createdStudent.class_name}
            </Text>

            <Text
              style={
                styles.credentialLabel
              }
            >
              Username
            </Text>

            <Text
              style={styles.credential}
            >
              {createdStudent.username}
            </Text>

            <Text
              style={
                styles.credentialLabel
              }
            >
              Password Sementara
            </Text>

            <Text
              style={styles.credential}
            >
              {createdStudent.temporary_password}
            </Text>

            <Text
              style={styles.infoText}
            >
              Simpan informasi ini dan
              berikan kepada siswa.
              Password akan diminta
              untuk diganti saat login
              pertama.
            </Text>
          </View>
        )}

        {/* ==================================
            STUDENT LIST
        ================================== */}

        <View style={styles.card}>
          <Text
            style={styles.cardTitle}
          >
            Daftar Siswa
          </Text>

          <Text
            style={styles.sectionDescription}
          >
            Pilih kelas untuk melihat
            siswa dengan lebih mudah.
          </Text>

          {/* CLASS FILTER */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={
              styles.classFilterScroll
            }
          >
            <View
              style={
                styles.classFilterRow
              }
            >

              <Pressable
                onPress={() =>
                  setSelectedClass(
                    'ALL'
                  )
                }
                style={[
                  styles.classFilter,
                  selectedClass ===
                    'ALL' &&
                    styles.classFilterActive,
                ]}
              >
                <Text
                  style={[
                    styles.classFilterText,
                    selectedClass ===
                      'ALL' &&
                      styles.classFilterTextActive,
                  ]}
                >
                  Semua
                </Text>
              </Pressable>

              {classGroups.map(
                (item) => (
                  <Pressable
                    key={item}
                    onPress={() =>
                      setSelectedClass(
                        item
                      )
                    }
                    style={[
                      styles.classFilter,
                      selectedClass ===
                        item &&
                        styles.classFilterActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.classFilterText,
                        selectedClass ===
                          item &&
                          styles.classFilterTextActive,
                      ]}
                    >
                      Kelas {item}
                    </Text>
                  </Pressable>
                )
              )}

            </View>
          </ScrollView>

          {/* CURRENT CLASS TITLE */}

          {selectedClass !==
            'ALL' && (
            <View
              style={
                styles.currentClassHeader
              }
            >
              <Text
                style={
                  styles.currentClassTitle
                }
              >
                Kelas {selectedClass}
              </Text>

              <Text
                style={
                  styles.currentClassCount
                }
              >
                {filteredStudents.length}{' '}
                siswa
              </Text>
            </View>
          )}

          {filteredStudents.length ===
          0 ? (
            <Text
              style={styles.emptyText}
            >
              Belum ada siswa di kelas
              ini.
            </Text>
          ) : (
            filteredStudents.map(
              (student) => (
                <View
                  key={student.id}
                  style={
                    styles.studentItem
                  }
                >
                  <View
                    style={
                      styles.studentInfo
                    }
                  >
                    <Text
                      style={
                        styles.studentName
                      }
                    >
                      {student.full_name}
                    </Text>

                    <Text
                      style={
                        styles.studentMeta
                      }
                    >
                      @{student.username}
                    </Text>

                    <Text
                      style={
                        styles.studentMeta
                      }
                    >
                      Grade{' '}
                      {student.grade}
                      {' • '}
                      Kelas{' '}
                      {student.class_name}
                    </Text>

                    {student.must_change_password && (
                      <Text
                        style={
                          styles.passwordWarning
                        }
                      >
                        Password sementara
                      </Text>
                    )}
                  </View>

                  <Pressable
                    onPress={() =>
                      handleOpenStudent(
                        student
                      )
                    }
                    style={
                      styles.detailButton
                    }
                  >
                    <Text
                      style={
                        styles.detailButtonText
                      }
                    >
                      Detail
                    </Text>
                  </Pressable>
                </View>
              )
            )
          )}
        </View>

        {/* ==================================
            LOGOUT
        ================================== */}

        <Pressable
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text
            style={
              styles.logoutButtonText
            }
          >
            Logout
          </Text>
        </Pressable>

      </ScrollView>

      {/* ====================================
          STUDENT DETAIL MODAL
      ==================================== */}

      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setDetailVisible(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.detailModal}
          >

            <View
              style={
                styles.detailHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.detailTitle
                  }
                >
                  Detail Siswa
                </Text>

                {selectedStudent && (
                  <Text
                    style={
                      styles.detailStudentName
                    }
                  >
                    {
                      selectedStudent
                        .student
                        .full_name
                    }
                  </Text>
                )}
              </View>

              <Pressable
                onPress={() =>
                  setDetailVisible(
                    false
                  )
                }
                style={
                  styles.closeButton
                }
              >
                <Text
                  style={
                    styles.closeButtonText
                  }
                >
                  ×
                </Text>
              </Pressable>
            </View>

            {detailLoading ? (
              <View
                style={
                  styles.detailLoading
                }
              >
                <ActivityIndicator
                  size="large"
                  color="#172B4D"
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Memuat data siswa...
                </Text>
              </View>
            ) : selectedStudent ? (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >

                {/* STUDENT INFO */}

                <View
                  style={
                    styles.detailInfoCard
                  }
                >
                  <Text
                    style={
                      styles.detailInfoLabel
                    }
                  >
                    USERNAME
                  </Text>

                  <Text
                    style={
                      styles.detailInfoValue
                    }
                  >
                    @
                    {
                      selectedStudent
                        .student
                        .username
                    }
                  </Text>

                  <Text
                    style={
                      styles.detailInfoLabel
                    }
                  >
                    KELAS
                  </Text>

                  <Text
                    style={
                      styles.detailInfoValue
                    }
                  >
                    Grade{' '}
                    {
                      selectedStudent
                        .student
                        .grade
                    }
                    {' • '}
                    Kelas{' '}
                    {
                      selectedStudent
                        .student
                        .class_name
                    }
                  </Text>
                </View>

                {/* TOTAL XP */}

                <View
                  style={
                    styles.xpCard
                  }
                >
                  <Text
                    style={
                      styles.xpLabel
                    }
                  >
                    TOTAL XP
                  </Text>

                  <Text
                    style={
                      styles.xpValue
                    }
                  >
                    {getTotalPoints(
                      selectedStudent.progress
                    )}
                  </Text>

                  <Text
                    style={
                      styles.xpUnit
                    }
                  >
                    XP
                  </Text>
                </View>

                {/* LEVEL PROGRESS */}

                <Text
                  style={
                    styles.progressTitle
                  }
                >
                  Progress Level
                </Text>

                {[1, 2, 3, 4, 5].map(
                  (level) => {
                    const item =
                      selectedStudent.progress.find(
                        (progress) =>
                          progress.level_number ===
                          level
                      );

                    return (
                      <View
                        key={level}
                        style={
                          styles.levelProgressCard
                        }
                      >
                        <View
                          style={
                            styles.levelProgressHeader
                          }
                        >
                          <Text
                            style={
                              styles.levelName
                            }
                          >
                            Level {level}
                          </Text>

                          <Text
                            style={
                              item?.completed
                                ? styles.completedText
                                : styles.notCompletedText
                            }
                          >
                            {item?.completed
                              ? 'Selesai'
                              : item?.unlocked
                                ? 'Terbuka'
                                : 'Terkunci'}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.scoreRow
                          }
                        >
                          <View
                            style={
                              styles.scoreBox
                            }
                          >
                            <Text
                              style={
                                styles.scoreLabel
                              }
                            >
                              Nilai Terbaik
                            </Text>

                            <Text
                              style={
                                styles.scoreValue
                              }
                            >
                              {item?.best_score ??
                                0}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.scoreBox
                            }
                          >
                            <Text
                              style={
                                styles.scoreLabel
                              }
                            >
                              XP
                            </Text>

                            <Text
                              style={
                                styles.scoreValue
                              }
                            >
                              {item?.total_points ??
                                0}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.scoreBox
                            }
                          >
                            <Text
                              style={
                                styles.scoreLabel
                              }
                            >
                              Percobaan
                            </Text>

                            <Text
                              style={
                                styles.scoreValue
                              }
                            >
                              {item?.attempts ??
                                0}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  }
                )}

                {/* PASSWORD */}

                <View
                  style={
                    styles.passwordCard
                  }
                >
                  <Text
                    style={
                      styles.passwordTitle
                    }
                  >
                    Password Akun
                  </Text>

                  <Text
                    style={
                      styles.passwordDescription
                    }
                  >
                    Password lama tidak dapat
                    ditampilkan. Jika siswa
                    lupa password, guru dapat
                    membuat password sementara
                    baru.
                  </Text>

                  {resetPasswordResult && (
                    <View
                      style={
                        styles.newPasswordBox
                      }
                    >
                      <Text
                        style={
                          styles.newPasswordLabel
                        }
                      >
                        PASSWORD BARU
                      </Text>

                      <Text
                        style={
                          styles.newPasswordValue
                        }
                      >
                        {
                          resetPasswordResult
                        }
                      </Text>

                      <Text
                        style={
                          styles.newPasswordInfo
                        }
                      >
                        Berikan password ini
                        kepada siswa. Siswa
                        akan diminta menggantinya
                        setelah login.
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={
                      handleResetPasswordConfirm
                    }
                    disabled={
                      resettingPassword
                    }
                    style={[
                      styles.resetPasswordButton,
                      resettingPassword &&
                        styles.buttonDisabled,
                    ]}
                  >
                    {resettingPassword ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.resetPasswordButtonText
                        }
                      >
                        Reset Password Siswa
                      </Text>
                    )}
                  </Pressable>
                </View>

              </ScrollView>
            ) : null}

          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4E7C1',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4E7C1',
  },

  loadingText: {
    marginTop: 12,
    color: '#6E5A35',
    fontSize: 14,
  },

  badge: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#8A6A32',
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#172B4D',
  },

  subtitle: {
    marginTop: 20,
    fontSize: 15,
    color: '#6E5A35',
  },

  teacherName: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
    color: '#172B4D',
  },

  card: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },

  summaryCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },

  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#8A6A32',
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 6,
  },

  studentCount: {
    marginTop: 6,
    fontSize: 46,
    fontWeight: '900',
    color: '#172B4D',
  },

  cardDescription: {
    marginTop: 2,
    color: '#6E5A35',
    fontSize: 14,
  },

  sectionDescription: {
    marginTop: 2,
    color: '#8A7A5A',
    fontSize: 13,
    lineHeight: 19,
  },

  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#6E5A35',
  },

  input: {
    borderWidth: 1,
    borderColor: '#E1D5B7',
    borderRadius: 12,
    backgroundColor: '#FFFDF7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#172B4D',
  },

  profileButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9CCAD',
    backgroundColor: '#FFFDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionActive: {
    backgroundColor: '#172B4D',
    borderColor: '#172B4D',
  },

  optionText: {
    color: '#6E5A35',
    fontSize: 15,
    fontWeight: '700',
  },

  optionTextActive: {
    color: '#FFFFFF',
  },

  primaryButton: {
    marginTop: 24,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  successCard: {
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFF8D9',
    borderWidth: 1,
    borderColor: '#E8CC67',
  },

  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B541D',
  },

  successName: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
    color: '#172B4D',
  },

  credentialLabel: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6A32',
  },

  credential: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#172B4D',
  },

  infoText: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 19,
    color: '#6E5A35',
  },

  // ==================================
  // CLASS FILTER
  // ==================================

  classFilterScroll: {
    marginTop: 16,
  },

  classFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
  },

  classFilter: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#D9CCAD',
    backgroundColor: '#FFFDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  classFilterActive: {
    backgroundColor: '#172B4D',
    borderColor: '#172B4D',
  },

  classFilterText: {
    color: '#6E5A35',
    fontSize: 13,
    fontWeight: '700',
  },

  classFilterTextActive: {
    color: '#FFFFFF',
  },

  currentClassHeader: {
    marginTop: 20,
    marginBottom: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE6D2',
  },

  currentClassTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#172B4D',
  },

  currentClassCount: {
    marginTop: 3,
    fontSize: 13,
    color: '#8A7A5A',
  },

  // ==================================
  // STUDENT
  // ==================================

  emptyText: {
    marginTop: 16,
    color: '#8A7A5A',
    fontSize: 14,
  },

  studentItem: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFE6D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  studentInfo: {
    flex: 1,
    paddingRight: 12,
  },

  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172B4D',
  },

  studentMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#7B6C4E',
  },

  passwordWarning: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF0C2',
    color: '#8A6A32',
    fontSize: 11,
    fontWeight: '700',
  },

  detailButton: {
    minWidth: 72,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // ==================================
  // DETAIL MODAL
  // ==================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  detailModal: {
    maxHeight: '92%',
    minHeight: '60%',
    backgroundColor: '#F4E7C1',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 30,
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  detailTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8A6A32',
  },

  detailStudentName: {
    marginTop: 3,
    fontSize: 25,
    fontWeight: '900',
    color: '#172B4D',
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    marginTop: -3,
    fontSize: 30,
    lineHeight: 34,
    color: '#172B4D',
  },

  detailLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },

  detailInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  detailInfoLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8A6A32',
  },

  detailInfoValue: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: '800',
    color: '#172B4D',
  },

  // ==================================
  // XP
  // ==================================

  xpCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 20,
    backgroundColor: '#172B4D',
    alignItems: 'center',
  },

  xpLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#D9C99D',
  },

  xpValue: {
    marginTop: 4,
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  xpUnit: {
    marginTop: -4,
    fontSize: 12,
    fontWeight: '800',
    color: '#D9C99D',
  },

  // ==================================
  // PROGRESS
  // ==================================

  progressTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '900',
    color: '#172B4D',
  },

  levelProgressCard: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  levelName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172B4D',
  },

  completedText: {
    color: '#4B7F35',
    fontSize: 12,
    fontWeight: '800',
  },

  notCompletedText: {
    color: '#9A8B6A',
    fontSize: 12,
    fontWeight: '700',
  },

  scoreRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },

  scoreBox: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFF8E6',
    padding: 10,
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A7A5A',
    textAlign: 'center',
  },

  scoreValue: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: '900',
    color: '#172B4D',
  },

  // ==================================
  // PASSWORD
  // ==================================

  passwordCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  passwordTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#172B4D',
  },

  passwordDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: '#7B6C4E',
  },

  newPasswordBox: {
    marginTop: 15,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF8D9',
    borderWidth: 1,
    borderColor: '#E8CC67',
  },

  newPasswordLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#8A6A32',
  },

  newPasswordValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '900',
    color: '#172B4D',
    letterSpacing: 1,
  },

  newPasswordInfo: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#6E5A35',
  },

  resetPasswordButton: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#B45F3C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetPasswordButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // ==================================
  // LOGOUT
  // ==================================

  logoutButton: {
    marginTop: 20,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B9A77C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButtonText: {
    color: '#6E5A35',
    fontSize: 15,
    fontWeight: '700',
  },
});