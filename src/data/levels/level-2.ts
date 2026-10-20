import type { SkillLesson } from '../types';

export const listeningLevel2: SkillLesson = {
  level: 2,
  skill: 'listening',
  title: 'Comparative Degree',

  questions: [
    {
      id: 'listening-2-easy',
      difficulty: 'easy',
      instruction: 'Listen, then choose the correct phrase.',
      question: 'Which phrase is correct?',

      audio: require('../../../assets/audio/level-2/listening/easy-level2.wav'),

      options: [
        {
          id: 'more-delicious-than',
          text: 'more delicious than',
        },
        {
          id: 'less-delicious-than',
          text: 'less delicious than',
        },
        {
          id: 'the-most-delicious',
          text: 'the most delicious',
        },
        {
          id: 'delicious',
          text: 'delicious',
        },
      ],

      correctAnswer: 'more-delicious-than',

      explanation:
        'The correct comparative phrase is "more delicious than".',
    },

    {
      id: 'listening-2-medium',
      difficulty: 'medium',
      instruction:
        'Look at the picture, listen, then choose True or False.',
      question: 'Is the sentence you heard true?',

      audio: require('../../../assets/audio/level-2/listening/medium-level2.wav'),

      options: [
        {
          id: 'true',
          text: 'True',
        },
        {
          id: 'false',
          text: 'False',
        },
      ],

      correctAnswer: 'false',

      explanation:
        'The correct answer is False. Listen carefully and compare the two things in the picture.',
    },

    {
      id: 'listening-2-hard',
      difficulty: 'hard',
      instruction:
        'Listen, then choose the TRUE sentence.',
      question:
        'Which sentence matches the audio?',

      audio: require('../../../assets/audio/level-2/listening/hard-level2.wav'),

      options: [
        {
          id: 'mother-older-brother',
          text: 'My mother is older than my brother.',
        },
        {
          id: 'sister-older-me',
          text: 'My sister is older than me.',
        },
        {
          id: 'brother-younger-me',
          text: 'My brother is younger than me.',
        },
        {
          id: 'mother-younger-sister',
          text: 'My mother is younger than my sister.',
        },
      ],

      correctAnswer: 'mother-older-brother',

      explanation:
        'The correct sentence is "My mother is older than my brother."',
    },
  ],
};