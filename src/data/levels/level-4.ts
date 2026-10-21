import type { SkillLesson } from '../types';

export const listeningLevel4: SkillLesson = {
  level: 4,
  skill: 'listening',
  title: 'Materi Level 4',

  questions: [
    {
      id: 'L4-LISTENING-001',
      difficulty: 'easy',
      instruction: 'Listen, then choose the safest animal.',
      question: '',

      audio: require('../../../assets/audio/level-4/listening/easy-level4.wav'),

      options: [
        {
          id: 'A',
          text: 'Wolf',
          image: '🐺',
        },
        {
          id: 'B',
          text: 'Sheep',
          image: '🐑',
        },
        {
          id: 'C',
          text: 'Tiger',
          image: '🐯',
        },
      ],

      correctAnswer: 'B',
      explanation: 'The correct answer is B: Sheep.',
    },

    {
      id: 'L4-LISTENING-002',
      difficulty: 'medium',
      instruction: 'Listen, then choose True or False.',
      question: '',

      audio: require('../../../assets/audio/level-4/listening/medium-level4.wav'),

      options: [
        {
          id: 'A',
          text: 'True',
        },
        {
          id: 'B',
          text: 'False',
        },
      ],

      correctAnswer: 'A',
      explanation: 'The correct answer is A: True.',
    },

    {
      id: 'L4-LISTENING-003',
      difficulty: 'hard',
      instruction: 'Listen, then choose the correct answer.',
      question: '',

      audio: require('../../../assets/audio/level-4/listening/hard-level4.wav'),

      options: [
        {
          id: 'A',
          text: 'Option A',
        },
        {
          id: 'B',
          text: 'Option B',
        },
        {
          id: 'C',
          text: 'Option C',
        },
      ],

      correctAnswer: 'C',
      explanation: 'The correct answer is C.',
    },
  ],
};