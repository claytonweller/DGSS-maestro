import { ITrollyQuestion } from './question';

export const lockedMadnessQuestions: ITrollyQuestion[] = [
  // { default: { text: '1 old person' }, alternative: { text: '1 baby' } },
  // { default: { text: '1 adult' }, alternative: { text: '2 old people' } },
  // { default: { text: '1 baby' }, alternative: { text: '3 adults' } },
  // { default: { text: 'Your mom' }, alternative: { text: '10 people' } },
  // { default: { text: '10 people' }, alternative: { text: 'The Dalai Lama' } },
  { default: { text: 'A mother' }, alternative: { text: 'Her child' } },
];

export const randomMadnessQuestions: ITrollyQuestion[] = [
  {
    default: { text: 'A person who will live in terrible pain for many years' },
    alternative: { text: 'A terminally ill patient with only a month left to live' },
  },
  // { default: { text: 'A person with no regrets' }, alternative: { text: 'A person with many regrets' } },
  // {
  //   default: { text: 'A person who knows a terrible secret about you' },
  //   alternative: { text: 'A person who you know a terrible secret about' },
  // },
  // { default: { text: 'A puppy' }, alternative: { text: 'A kitten' } },
  // { default: { text: '100 puppies' }, alternative: { text: '1 old person' } },
  // { default: { text: 'Your car' }, alternative: { text: 'A kitten' } },
  // { default: { text: 'The last panda' }, alternative: { text: 'The last polar bear' } },
  // { default: { text: 'The Mona Lisa' }, alternative: { text: 'Some person looking at the Mona Lisa' } },
  { default: { text: '1 person who killed 10 children' }, alternative: { text: '10 people who killed 1 child each' } },
  // { default: { text: 'The state of Georgia' }, alternative: { text: 'The country of Georgia' } },
  // { default: { text: 'Everyone under the age of 10' }, alternative: { text: 'Everyone over the age of 10' } },
  // { default: { text: 'Americans named Clayton' }, alternative: { text: 'The Panera Bread Company' } },
  // { default: { text: 'The best sandwich' }, alternative: { text: 'Every other sandwich' } },
  // { default: { text: 'Zombie' }, alternative: { text: 'Zombie' } },
  // { default: { text: 'All Mosquitos' }, alternative: { text: 'Malaria' } },
  // { default: { text: 'All human beings' }, alternative: { text: 'All other intelligent life in the universe' } },
  // { default: { text: 'The written word' }, alternative: { text: 'Agriculture' } },
  // { default: { text: 'The internet' }, alternative: { text: 'Airplanes' } },
  // {
  //   default: { text: 'A time traveling version of you from the future' },
  //   alternative: { text: 'A time traveling version of you from the past', cannotSelect: true },
  // },
];
