import { supabase } from '../../lib/supabase';

const STUDENT_AUTH_DOMAIN =
  '@student.savanaquest.local';

/**
 * =========================================================
 * LOGIN
 * =========================================================
 *
 * Guru:
 *   login menggunakan email
 *
 * Siswa:
 *   login menggunakan username
 *
 * Username siswa akan dikonversi menjadi:
 * username@student.savanaquest.local
 */
export async function signIn(
  identifier: string,
  password: string
) {
  const value = identifier.trim();

  if (!value) {
    throw new Error(
      'Email atau username wajib diisi.'
    );
  }

  if (!password) {
    throw new Error(
      'Password wajib diisi.'
    );
  }

  const email = value.includes('@')
    ? value
    : `${value}${STUDENT_AUTH_DOMAIN}`;

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * =========================================================
 * LOGOUT
 * =========================================================
 */
export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * =========================================================
 * CURRENT SESSION
 * =========================================================
 */
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * =========================================================
 * CURRENT PROFILE
 * =========================================================
 *
 * Mengambil profile berdasarkan user yang sedang login.
 */
export async function getCurrentProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data, error } =
    await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * =========================================================
 * TEACHER - GET STUDENTS
 * =========================================================
 *
 * Mengambil semua siswa yang dibuat oleh
 * guru yang sedang login.
 */
export async function getTeacherStudents() {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    throw new Error(
      'Guru belum login.'
    );
  }

  const { data, error } =
    await supabase
      .from('profiles')
      .select(
        `
        id,
        full_name,
        username,
        role,
        grade,
        class_name,
        must_change_password,
        created_at
        `
      )
      .eq('role', 'student')
      .eq(
        'created_by',
        session.user.id
      )
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * =========================================================
 * TEACHER - CREATE STUDENT
 * =========================================================
 *
 * Memanggil Edge Function:
 *
 * create-student
 *
 * Edge Function akan:
 * - membuat akun Auth siswa
 * - membuat username
 * - membuat password sementara
 * - membuat profile siswa
 * - menghubungkan siswa dengan guru
 */
export async function createStudent(input: {
  name: string;
  grade: number;
  class_name: string;
}) {
  const session =
    await getCurrentSession();

  if (!session?.access_token) {
    throw new Error(
      'Session guru tidak ditemukan.'
    );
  }

  const studentName =
    input.name.trim();

  if (!studentName) {
    throw new Error(
      'Nama siswa wajib diisi.'
    );
  }

  if (
    input.grade < 1 ||
    input.grade > 6
  ) {
    throw new Error(
      'Grade siswa harus antara 1 sampai 6.'
    );
  }

  const validClasses = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];

  if (
    !validClasses.includes(
      input.class_name
    )
  ) {
    throw new Error(
      'Class siswa tidak valid.'
    );
  }

  const { data, error } =
    await supabase.functions.invoke(
      'create-student',
      {
        body: {
          name: studentName,
          grade: input.grade,
          class_name:
            input.class_name,
        },
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
      }
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        'Gagal membuat akun siswa.'
    );
  }

  return data;
}

/**
 * =========================================================
 * TEACHER - UPDATE PROFILE
 * =========================================================
 */
export async function updateTeacherProfile(
  fullName: string
) {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    throw new Error(
      'Guru belum login.'
    );
  }

  const cleanName =
    fullName.trim();

  if (!cleanName) {
    throw new Error(
      'Nama guru wajib diisi.'
    );
  }

  const { data, error } =
    await supabase
      .from('profiles')
      .update({
        full_name: cleanName,
      })
      .eq(
        'id',
        session.user.id
      )
      .eq(
        'role',
        'teacher'
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * =========================================================
 * TEACHER - REGISTER
 * =========================================================
 *
 * Aturan:
 * - Email wajib Gmail atau Yahoo
 * - Password minimal 6 karakter
 * - Tidak menggunakan OTP
 *
 * Supabase:
 * Confirm Email harus OFF
 */
export async function signUpTeacher(
  input: {
    fullName: string;
    email: string;
    password: string;
  }
) {
  const fullName =
    input.fullName.trim();

  const email =
    input.email
      .trim()
      .toLowerCase();

  const password =
    input.password;

  if (!fullName) {
    throw new Error(
      'Nama lengkap wajib diisi.'
    );
  }

  if (!email) {
    throw new Error(
      'Email wajib diisi.'
    );
  }

  const emailRegex =
    /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;

  if (!emailRegex.test(email)) {
    throw new Error(
      'Email harus menggunakan @gmail.com atau @yahoo.com.'
    );
  }

  if (!password) {
    throw new Error(
      'Password wajib diisi.'
    );
  }

  if (password.length < 6) {
    throw new Error(
      'Password minimal 6 karakter.'
    );
  }

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name:
            fullName,

          signup_role:
            'teacher',
        },
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * =========================================================
 * LEGACY STUDENT PROGRESS
 * =========================================================
 *
 * Fungsi ini masih dipertahankan sementara
 * karena mungkin masih digunakan oleh bagian
 * aplikasi lama.
 *
 * Sistem Level 1-5 baru menggunakan:
 * - student_level_progress
 * - student_level_attempts
 */
export async function getStudentProgress() {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    throw new Error(
      'Siswa belum login.'
    );
  }

  const { data, error } =
    await supabase
      .from('student_progress')
      .select(
        `
        student_id,
        total_points,
        current_level,
        completed_levels,
        updated_at
        `
      )
      .eq(
        'student_id',
        session.user.id
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * =========================================================
 * LEGACY POINT SYSTEM
 * =========================================================
 *
 * Sistem ini masih dipertahankan sementara.
 */
export async function awardStudentPoints(
  input: {
    eventType:
      | 'lesson_complete'
      | 'practice_correct'
      | 'challenge_correct'
      | 'level_complete'
      | 'achievement';

    eventKey: string;

    levelId?: number;
  }
) {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    throw new Error(
      'Siswa belum login.'
    );
  }

  const { data, error } =
    await supabase.rpc(
      'award_student_points',
      {
        p_event_type:
          input.eventType,

        p_event_key:
          input.eventKey,

        p_level_id:
          input.levelId ??
          null,
      }
    );

  if (error) {
    throw error;
  }

  return data as number;
}

/**
 * =========================================================
 * LEVEL - SAVE RESULT
 * =========================================================
 *
 * Menyimpan hasil pengerjaan Level.
 *
 * Contoh Level 1:
 *
 * 5 soal
 * 4 benar
 * score = 80
 * points = 80
 *
 * Supabase RPC:
 * save_level_result
 */
export async function saveLevelResult(
  input: {
    levelNumber: number;

    score: number;

    totalQuestions: number;

    correctAnswers: number;

    pointsEarned: number;
  }
) {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    throw new Error(
      'Siswa belum login.'
    );
  }

  if (
    input.levelNumber < 1 ||
    input.levelNumber > 5
  ) {
    throw new Error(
      'Level harus berada antara 1 sampai 5.'
    );
  }

  if (
    input.score < 0 ||
    input.score > 100
  ) {
    throw new Error(
      'Score harus berada antara 0 sampai 100.'
    );
  }

  if (
    input.totalQuestions <= 0
  ) {
    throw new Error(
      'Jumlah soal harus lebih dari 0.'
    );
  }

  if (
    input.correctAnswers < 0 ||
    input.correctAnswers >
      input.totalQuestions
  ) {
    throw new Error(
      'Jumlah jawaban benar tidak valid.'
    );
  }

  if (
    input.pointsEarned < 0
  ) {
    throw new Error(
      'Point tidak boleh negatif.'
    );
  }

  const { data, error } =
    await supabase.rpc(
      'save_level_result',
      {
        p_level_number:
          input.levelNumber,

        p_score:
          input.score,

        p_total_questions:
          input.totalQuestions,

        p_correct_answers:
          input.correctAnswers,

        p_points_earned:
          input.pointsEarned,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}

/**
 * =========================================================
 * STUDENT - GET LEVEL PROGRESS
 * =========================================================
 *
 * Digunakan oleh halaman:
 *
 * /levels
 *
 * untuk mengetahui:
 * - Level mana yang sudah terbuka
 * - Best score
 * - Total point
 * - Attempts
 * - Completed
 */
export async function getStudentLevelProgress() {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    throw new Error(
      'Siswa belum login.'
    );
  }

  const { data, error } =
    await supabase
      .from(
        'student_level_progress'
      )
      .select(
        `
        level_number,
        best_score,
        total_points,
        attempts,
        completed,
        unlocked,
        last_attempt_at
        `
      )
      .eq(
        'student_id',
        session.user.id
      )
      .order(
        'level_number',
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getStudentTotalPoints() {
  const session = await getCurrentSession();

  if (!session?.user) {
    throw new Error('Siswa belum login.');
  }

  const { data, error } = await supabase
    .from('student_level_progress')
    .select('total_points')
    .eq('student_id', session.user.id);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce(
    (total, item) => total + (item.total_points ?? 0),
    0
  );
}

/**
 * =========================================================
 * TEACHER - GET STUDENT LEVEL PROGRESS
 * =========================================================
 *
 * Mengambil progress Level siswa
 * yang berada di bawah guru yang sedang login.
 *
 * RLS database akan memastikan guru
 * hanya dapat melihat siswa miliknya.
 */
export async function getTeacherStudentProgress() {
  const session =
    await getCurrentSession();

  if (!session?.user) {
    throw new Error(
      'Guru belum login.'
    );
  }

  const { data, error } =
    await supabase
      .from(
        'student_level_progress'
      )
      .select(
        `
        id,
        student_id,
        level_number,
        best_score,
        total_points,
        attempts,
        completed,
        unlocked,
        last_attempt_at
        `
      )
      .order(
        'level_number',
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getStudentProgressById(
  studentId: string
) {
  const session = await getCurrentSession();

  if (!session?.user) {
    throw new Error('Guru belum login.');
  }

  const { data, error } = await supabase
    .from('student_level_progress')
    .select(`
      id,
      student_id,
      level_number,
      best_score,
      total_points,
      attempts,
      completed,
      unlocked,
      last_attempt_at
    `)
    .eq('student_id', studentId)
    .order('level_number', {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function resetStudentPassword(
  studentId: string
) {
  const session = await getCurrentSession();

  if (!session?.access_token) {
    throw new Error(
      'Session guru tidak ditemukan.'
    );
  }

  const { data, error } =
    await supabase.functions.invoke(
      'reset-student-password',
      {
        body: {
          student_id: studentId,
        },
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
      }
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
      'Gagal mereset password siswa.'
    );
  }

  return data;
}

/*
 * =========================================================
 * TEACHER - UPDATE STUDENT
 * =========================================================
 *
 * Guru dapat mengubah:
 * - nama siswa
 * - grade
 * - class
 *
 * Username siswa tidak diubah karena digunakan
 * sebagai identitas login siswa.
 */
export async function updateStudent(
  input: {
    studentId: string;
    fullName: string;
    grade: number;
    class_name: string;
  }
) {
  const session = await getCurrentSession();

  if (!session?.user) {
    throw new Error('Guru belum login.');
  }

  const fullName = input.fullName.trim();

  if (!fullName) {
    throw new Error('Nama siswa wajib diisi.');
  }

  if (
    input.grade < 1 ||
    input.grade > 6
  ) {
    throw new Error(
      'Grade siswa harus antara 1 sampai 6.'
    );
  }

  const validClasses = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];

  if (
    !validClasses.includes(
      input.class_name
    )
  ) {
    throw new Error(
      'Class siswa tidak valid.'
    );
  }

  const { data, error } =
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        grade: input.grade,
        class_name: input.class_name,
      })
      .eq('id', input.studentId)
      .eq('role', 'student')
      .eq(
        'created_by',
        session.user.id
      )
      .select(
        `
        id,
        full_name,
        username,
        role,
        grade,
        class_name,
        must_change_password,
        created_at
        `
      )
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/*
 * =========================================================
 * TEACHER - DELETE STUDENT
 * =========================================================
 *
 * Penghapusan dilakukan melalui Edge Function
 * agar akun:
 *
 * - Supabase Auth
 * - profiles
 *
 * dapat dihapus dengan benar.
 */
export async function deleteStudent(
  studentId: string
) {
  const session = await getCurrentSession();

  if (!session?.access_token) {
    throw new Error(
      'Session guru tidak ditemukan.'
    );
  }

  if (!studentId) {
    throw new Error(
      'ID siswa tidak ditemukan.'
    );
  }

  const { data, error } =
    await supabase.functions.invoke(
      'delete-student',
      {
        body: {
          student_id: studentId,
        },
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
      }
    );

  if (error) {
    console.error(
      'Delete student Functions error:',
      error
    );

    if ('context' in error && error.context) {
      try {
        const errorBody =
          await error.context.json();

        console.error(
          'Delete student server response:',
          errorBody
        );

        throw new Error(
          errorBody?.error ||
          'Gagal menghapus siswa.'
        );
      } catch (parseError) {
        if (
          parseError instanceof Error &&
          parseError.message !==
            'Gagal menghapus siswa.'
        ) {
          throw parseError;
        }
      }
    }

    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
      'Gagal menghapus siswa.'
    );
  }

  return data;
}