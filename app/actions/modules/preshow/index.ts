import { preshowAcknowledgeAction } from './acknowledge'
import { preshowCoreAnswerAction } from './core-answer'
import { preshowTrivialAnswerAction } from './trivial-answer'

export const preshowActionHash = {
  'preshow-start-performance': () => console.log('START'),
  'preshow-acknowledge': preshowAcknowledgeAction,
  'preshow-core-answer': preshowCoreAnswerAction,
  'preshow-trivial-answer': preshowTrivialAnswerAction
}

const coreQuestions: ICoreQuestion[] = [
  {
    column: 'new_people',
    text: 'How do you feel about meeting new people?',
    responseType: 'multiple-choice',
    choices: ['Great', 'Good', 'Fine', 'No thanks']
  }
]

const trivialQuestions: IQuestion[] = [
  {
    text: 'Where were you born?',
    responseType: 'text',
    buttonText: 'More or less'
  }
]

export const initializeAnswered = () => {
  return {
    core: coreQuestions.map(() => false),
    trivial: trivialQuestions.map(() => false)
  }
}

export const chooseNextQuestion = (answered: { core: boolean[], trivial: boolean[] }) => {
  if (answered.core.includes(false)) {
    const chosenQuestion = getARemainingQuestion(answered.core, 'core')
    return { ...chosenQuestion, core: true }
  }
  return getARemainingQuestion(answered.trivial, 'trivial')
}

const getARemainingQuestion = (answered: boolean[], questionType: string) => {
  const questionArr = questionType === 'core' ? coreQuestions : trivialQuestions
  const remainingQuestions = answered.reduce((pre, a, i) => {
    if (!a) pre.push(questionArr[i])
    return pre
  }, [] as any[])
  const index = Math.floor(Math.random() * remainingQuestions.length)

  // This mutation of the actual object is a little hinky but is good enough for now
  answered[index] = true
  return remainingQuestions[index]
}

interface IQuestion {
  core?: boolean
  text: string
  responseType: string
  buttonText?: string
  choices?: string[]
}

interface ICoreQuestion extends IQuestion {
  column: string
}