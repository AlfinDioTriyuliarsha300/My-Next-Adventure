
export type Difficulty = 'easy' | 'medium' | 'hard';

export type SkillId =
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing';

export type AnswerOption = {
  id: string;
  text: string;
  image?: number;
};

export type LearningQuestion = {
  id: string;
  difficulty: Difficulty;
  instruction: string;
  question: string;
  options: AnswerOption[];
  correctAnswer: string;
  audio?: number;
  image?: number;
  explanation?: string;
};

export type SkillLesson = {
  level: number;
  skill: SkillId;
  title: string;
  questions: LearningQuestion[];
};
