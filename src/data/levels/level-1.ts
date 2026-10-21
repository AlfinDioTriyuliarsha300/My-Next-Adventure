
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
      audio: require('../../../assets/audio/level-1/listening/easy-level1.wav'),

      options: [
        {
          id: 'elephant',
          text: 'Elephant',
          image: '🐘',
        },
        {
          id: 'mouse',
          text: 'Mouse',
          image: '🐭',
        },
        {
          id: 'rabbit',
          text: 'Rabbit',
          image: '🐇',
        },
        {
          id: 'cat',
          text: 'Cat',
          image: '🐈',
        },
      ],

      correctAnswer: 'elephant',
      explanation: 'The animal you heard is an elephant.',
    },
    {
      id: 'listening-1-medium',
      difficulty: 'medium',
      instruction: '',
      question: 'Listen to the sentence, then choose the correct phrase.',
      audio: require('../../../assets/audio/level-1/listening/medium-level1.wav'),
      options: [
        { id: 'as pretty as', text: 'as pretty as' },
        { id: 'prettier than', text: 'prettier than' },
        { id: 'the prettiest', text: 'the prettiest' },
        { id: 'pretty', text: 'pretty' },
      ],
      correctAnswer: 'as pretty as',
      explanation: 'as pretty as',
    },
    {
      id: 'listening-1-hard',
      difficulty: 'hard',
      instruction: '',
      question: 'Listen, then choose the TRUE sentence.',
      audio: require('../../../assets/audio/level-1/listening/hard-level1.wav'),
      options: [
        {
          id: 'dina-taller',
          text: 'Dina is more beautiful than Rani.',
        },
        {
          id: 'same-height',
          text: 'Dina is as beautiful as Rani.',
        },
        {
          id: 'rani-shorter',
          text: 'Rani is beautiful than Dina.',
        },
        {
          id: 'dina-tallest',
          text: 'Dina is the beutifulest.',
        },
      ],
      correctAnswer: 'same-height',
      explanation: 'Dina and Rani are the same height.',
    },
  ],
};
