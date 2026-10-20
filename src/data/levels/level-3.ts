import type { SkillLesson } from '../types';

export const listeningLevel3: SkillLesson = {
  level: 3,
  skill: 'listening',
  title: 'Materi Level 3',

  questions: [
    {
      id: 'L3-LISTENING-001',
      difficulty: 'easy',
      instruction: 'Listen, then choose the correct phrase.',
      question: '',

      audio: require('../../../assets/audio/level-3/listening/easy-level3.wav'),

      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' },
        { id: 'D', text: 'Option D' },
      ],

      correctAnswer: 'A',
      explanation: 'The correct answer is A.',
    },

    {
      id: 'L3-LISTENING-002',
      difficulty: 'medium',
      instruction: 'Listen, then choose the correct phrase.',
      question: '',

      audio: require('../../../assets/audio/level-3/listening/medium-level3.wav'),

      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' },
        { id: 'D', text: 'Option D' },
      ],

      correctAnswer: 'D',
      explanation: 'The correct answer is D.',
    },

    {
      id: 'L3-LISTENING-003',
      difficulty: 'hard',
      instruction: 'Listen, then choose the TRUE sentence.',
      question: '',

      audio: require('../../../assets/audio/level-3/listening/hard-level3.wav'),

      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' },
        { id: 'D', text: 'Option D' },
      ],

      correctAnswer: 'C',
      explanation: 'The correct answer is C.',
    },
  ],
};