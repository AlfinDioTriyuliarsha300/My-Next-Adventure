
import type { SkillLesson } from '../types';

export const listeningLevel1: SkillLesson = {
  level: 1,
  skill: 'listening',
  title: 'Positive Degree',
  questions: [
    {
      id: 'listening-1-easy',
      difficulty: 'easy',
      instruction: 'Listen, then choose the correct picture.',
      question: 'Which animal is big?',
      image: require('../../../assets/images/lessons/gajah-question.png'),
      audio: require('../../../assets/audio/level-1/listening/easy-level1.wav'),
      options: [
        { id: 'elephant', text: '🐘' },
        { id: 'mouse', text: '🐭' },
        { id: 'rabbit', text: '🐇' },
        { id: 'cat', text: '🐈' },
      ],
      correctAnswer: 'elephant',
      explanation: 'The animal you heard is an elephant.',
    },
    {
      id: 'listening-1-medium',
      difficulty: 'medium',
      instruction: 'Listen, then choose the animal that is fast.',
      question: 'The rabbit is fast.',
      audio: require('../../../assets/audio/level-1/listening/medium-level1.wav'),
      options: [
        { id: 'rabbit', text: '🐇' },
        { id: 'turtle', text: '🐢' },
        { id: 'elephant', text: '🐘' },
        { id: 'snail', text: '🐌' },
      ],
      correctAnswer: 'rabbit',
      explanation: 'A rabbit can run fast.',
    },
    {
      id: 'listening-1-hard',
      difficulty: 'hard',
      instruction: 'Listen, then choose the TRUE sentence.',
      question: 'Which sentence matches the audio?',
      audio: require('../../../assets/audio/level-1/listening/hard-level1.wav'),
      options: [
        {
          id: 'dina-taller',
          text: 'Dina is taller than Rani.',
        },
        {
          id: 'same-height',
          text: 'Dina is as tall as Rani.',
        },
        {
          id: 'rani-shorter',
          text: 'Rani is shorter than Dina.',
        },
        {
          id: 'dina-tallest',
          text: 'Dina is the tallest.',
        },
      ],
      correctAnswer: 'same-height',
      explanation: 'Dina and Rani are the same height.',
    },
  ],
};
