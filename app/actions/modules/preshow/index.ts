import { preshowAcknowledgeAction } from './acknowledge';
import { preshowCoreAnswerAction } from './core-answer';
import { preshowTrivialAnswerAction } from './trivial-answer';
import { coreQuestions, trivialQuestions } from './questions';

export const preshowActionHash = {
  'preshow-start-performance': () => console.log('START'),
  'preshow-acknowledge': preshowAcknowledgeAction,
  'preshow-core-answer': preshowCoreAnswerAction,
  'preshow-trivial-answer': preshowTrivialAnswerAction,
};

export const initializeAnswered = () => {
  return {
    core: coreQuestions.map(() => false),
    trivial: trivialQuestions.map(() => false),
  };
};

export const chooseNextQuestion = (answered: { core: boolean[]; trivial: boolean[] }) => {
  if (answered.core.includes(false)) {
    const chosenQuestion = getARemainingQuestion(answered.core, 'core');
    return { ...chosenQuestion, core: true };
  }
  if (answered.trivial.includes(false)) {
    return getARemainingQuestion(answered.trivial, 'trivial');
  }
  return {
    text: 'You answered all the questions! Got another one we should ask next time?',
    responseType: 'text',
    buttonText: 'Good Question',
    display: '"_RESPONSE_?", _NAME_',
  };
};

const getARemainingQuestion = (answered: boolean[], questionType: string) => {
  const questionArr = questionType === 'core' ? coreQuestions : trivialQuestions;
  const remainingQuestions = answered.reduce((pre, a, i) => {
    if (!a) pre.push({ q: questionArr[i], i });
    return pre;
  }, [] as any[]);
  const index = Math.floor(Math.random() * remainingQuestions.length);

  // This mutation of the actual object is a little hinky but is good enough for now
  answered[remainingQuestions[index].i] = true;
  return remainingQuestions[index].q;
};
