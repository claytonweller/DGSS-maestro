import { IActionElements } from '../../';
import { trollyQuestionAction, ITrollyQuestionParams, ITrollyQuestion } from './question';
import { lockedMadnessQuestions, randomMadnessQuestions } from './madness-questions';
import { IMessagePayload } from '../../messager';
import { ModuleInstance } from '../../../../db';
import { IModuleInstance } from '../../../../db/module_instances';

export async function trollyMadnessAction(actionElements: IActionElements) {
  const { event, messager, sockets } = actionElements;
  const payload: IMessagePayload = {
    action: 'trolly-madness-begins',
    params: {},
  };
  messager.sendToSender({ event, payload }, sockets);

  await askLockedQuestions(actionElements);
  await askRandomQuestions(actionElements);

  // If it makes it through all questions it should activate the finish function

  // NOTE: It doesn't send out any messages of its own at the end.
}

async function askLockedQuestions(actionElements: IActionElements) {
  await askQuestions(lockedMadnessQuestions, actionElements);
}

async function askRandomQuestions(actionElements: IActionElements) {
  const randomizedQuestions = shuffleArray(randomMadnessQuestions);
  await askQuestions(randomizedQuestions, actionElements);
}

async function askQuestions(questions: ITrollyQuestion[], actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, currentModule } = body.params;

  // Cannot use a forEach with async... otherwise it sends off all the promoses at the same time.
  for (let i = 0; i < questions.length; i++) {
    const newParams: ITrollyQuestionParams = {
      performance_id,
      options: {
        question: questions[i],
        timer: 2000,
      },
      currentModule,
    };
    const newElements: IActionElements = {
      event,
      messager,
      sockets,
      body: { action: 'trolly-madness', params: newParams },
    };
    const moduleInstances: IModuleInstance[] = await ModuleInstance.getByParam({ id: currentModule.instance.id });
    if (moduleInstances[0].is_active) {
      await trollyQuestionAction(newElements, moduleInstances);
    } else {
      // stop asking questions
      i = questions.length;
    }
  }
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return shuffled;
}
