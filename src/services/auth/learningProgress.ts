import { supabase } from '../../lib/supabase';
import type { SkillId } from '../../data/types';
export type LearningProgress = {
  completedQuestions: string[];
};

// Mengambil progress siswa yang sedang login.
export async function ambilProgress(
  level: number,
  skill: SkillId,
): Promise<LearningProgress> {
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
    .from('student_skill_question_progress')
    .select('question_id')
    .eq('student_id', user.id)
    .eq('level_number', level)
    .eq('skill', skill);

  if (error) {
    throw error;
  }

  return {
    completedQuestions: (data ?? []).map(
      (item) => item.question_id,
    ),
  };
}

// Menyimpan soal yang berhasil dijawab benar.
// Soal yang sudah tercatat tidak akan menambah bintang lagi.
export async function tandaiSoalSelesai(
  level: number,
  skill: SkillId,
  questionId: string,
): Promise<void> {
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

  const { error } = await supabase
    .from('student_skill_question_progress')
    .upsert(
      {
        student_id: user.id,
        level_number: level,
        skill,
        question_id: questionId,
      },
      {
        onConflict: 'student_id,question_id',
        ignoreDuplicates: true,
      },
    );

  if (error) {
    throw error;
  }
}

// Menghitung bintang berdasarkan soal yang sudah selesai.
export function hitungBintang(
  progress: LearningProgress,
  questionIds: string[],
): number {
  return questionIds.filter((id) =>
    progress.completedQuestions.includes(id),
  ).length;
}
