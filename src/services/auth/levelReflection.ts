import { supabase } from '../../lib/supabase';

export type ReflectionMood =
  | 'great'
  | 'okay'
  | 'difficult';

export type LevelReflection = {
  id?: string;
  student_id?: string;
  level_number: number;
  mood: ReflectionMood;
  hardest_part: string;
  proud_of: string;
  important_learning: string;
  lesson_note: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
};

// =====================================================
// MENGAMBIL REFLECTION SISWA
// =====================================================

export async function ambilReflection(
  levelNumber: number,
): Promise<LevelReflection | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error('Siswa belum login.');
  }

  const { data, error } = await supabase
    .from('student_level_reflections')
    .select(
      `
        id,
        student_id,
        level_number,
        mood,
        hardest_part,
        proud_of,
        important_learning,
        lesson_note,
        completed,
        created_at,
        updated_at
      `,
    )
    .eq('student_id', user.id)
    .eq('level_number', levelNumber)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as LevelReflection | null;
}

// =====================================================
// MENYIMPAN / UPDATE REFLECTION
// =====================================================

export async function simpanReflection(
  reflection: Omit<
    LevelReflection,
    | 'id'
    | 'student_id'
    | 'created_at'
    | 'updated_at'
  >,
): Promise<LevelReflection> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error('Siswa belum login.');
  }

  const { data, error } = await supabase
    .from('student_level_reflections')
    .upsert(
      {
        student_id: user.id,
        level_number: reflection.level_number,
        mood: reflection.mood,
        hardest_part: reflection.hardest_part.trim(),
        proud_of: reflection.proud_of.trim(),
        important_learning:
          reflection.important_learning.trim(),
        lesson_note: reflection.lesson_note.trim(),
        completed: reflection.completed,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'student_id,level_number',
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as LevelReflection;
}

// =====================================================
// CEK APAKAH REFLECTION SUDAH SELESAI
// =====================================================

export async function apakahReflectionSelesai(
  levelNumber: number,
): Promise<boolean> {
  const reflection = await ambilReflection(levelNumber);

  return reflection?.completed === true;
}